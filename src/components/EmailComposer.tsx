'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Loader2, 
  Send, 
  Wand2, 
  X, 
  Plus, 
  Mail, 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  Trash2,
  RefreshCw
} from 'lucide-react'

interface EmailDraft {
  id: string
  subject: string
  content: string
  recipients: string[]
}

interface ToastMessage {
  type: 'success' | 'error' | 'info'
  message: string
  id: string
}

export default function EmailComposer() {
  const { data: session } = useSession()
  
  // Form state
  const [recipients, setRecipients] = useState<string[]>([])
  const [currentRecipient, setCurrentRecipient] = useState('')
  const [prompt, setPrompt] = useState('')
  const [emailDraft, setEmailDraft] = useState<EmailDraft | null>(null)
  
  // UI state
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  
  // Refs
  const recipientInputRef = useRef<HTMLInputElement>(null)

  // Toast management
  const addToast = (type: ToastMessage['type'], message: string) => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { type, message, id }])
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, 5000)
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  // Email validation
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email.trim())
  }

  // Recipient management
  const addRecipient = () => {
    const email = currentRecipient.trim()
    if (email && isValidEmail(email) && !recipients.includes(email)) {
      setRecipients(prev => [...prev, email])
      setCurrentRecipient('')
      recipientInputRef.current?.focus()
    } else if (!isValidEmail(email)) {
      addToast('error', 'Please enter a valid email address')
    } else if (recipients.includes(email)) {
      addToast('error', 'Email already added')
    }
  }

  const removeRecipient = (emailToRemove: string) => {
    setRecipients(prev => prev.filter(email => email !== emailToRemove))
  }

  const handleRecipientKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addRecipient()
    } else if (e.key === 'Backspace' && currentRecipient === '' && recipients.length > 0) {
      setRecipients(prev => prev.slice(0, -1))
    }
  }

  // Email generation
  const handleGenerateEmail = async (isRegenerate = false) => {
    if (!prompt.trim()) {
      addToast('error', 'Please enter a prompt for the email')
      return
    }

    if (recipients.length === 0) {
      addToast('error', 'Please add at least one recipient')
      return
    }

    const invalidEmails = recipients.filter(email => !isValidEmail(email))
    if (invalidEmails.length > 0) {
      addToast('error', `Invalid email addresses: ${invalidEmails.join(', ')}`)
      return
    }

    if (isRegenerate) {
      setIsRegenerating(true)
    } else {
      setIsGenerating(true)
    }

    try {
      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          recipients,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate email')
      }

      setEmailDraft(data)
      addToast('success', isRegenerate ? 'Email regenerated successfully!' : 'Email generated successfully!')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate email'
      addToast('error', errorMessage)
    } finally {
      setIsGenerating(false)
      setIsRegenerating(false)
    }
  }

  // Email sending
  const handleSendEmail = async () => {
    if (!emailDraft) return

    if (!emailDraft.subject.trim()) {
      addToast('error', 'Please enter a subject')
      return
    }

    if (!emailDraft.content.trim()) {
      addToast('error', 'Please enter email content')
      return
    }

    setIsSending(true)

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: emailDraft.subject,
          content: emailDraft.content,
          recipients: emailDraft.recipients,
          draftId: emailDraft.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email')
      }

      addToast('success', `Email sent successfully to ${emailDraft.recipients.length} recipient(s)!`)
      
      // Reset form after successful send
      setPrompt('')
      setRecipients([])
      setEmailDraft(null)
      setCurrentRecipient('')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send email'
      addToast('error', errorMessage)
    } finally {
      setIsSending(false)
    }
  }

  const updateEmailContent = (field: 'subject' | 'content', value: string) => {
    if (emailDraft) {
      setEmailDraft({
        ...emailDraft,
        [field]: value,
      })
    }
  }

  const clearDraft = () => {
    setEmailDraft(null)
    setPrompt('')
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Welcome to AI Email Generator</CardTitle>
            <p className="text-muted-foreground">Please sign in to continue</p>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/login'} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Alert 
            key={toast.id}
            className={`w-96 ${
              toast.type === 'success' ? 'border-green-200 bg-green-50' : 
              toast.type === 'error' ? 'border-red-200 bg-red-50' : 
              'border-blue-200 bg-blue-50'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
            {toast.type === 'error' && <XCircle className="h-4 w-4 text-red-600" />}
            {toast.type === 'info' && <Mail className="h-4 w-4 text-blue-600" />}
            <AlertDescription className={
              toast.type === 'success' ? 'text-green-800' :
              toast.type === 'error' ? 'text-red-800' :
              'text-blue-800'
            }>
              {toast.message}
            </AlertDescription>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-6 w-6 p-0"
              onClick={() => removeToast(toast.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Alert>
        ))}
      </div>

      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AI Email Generator
          </h1>
          <p className="text-lg text-gray-600">
            Create professional emails with the power of AI
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="space-y-8">
              {/* Recipients Section */}
              <div>
                <Label htmlFor="recipients" className="text-lg font-semibold text-gray-900 mb-3 block">
                  Who do you want to email?
                </Label>
                
                <div className="flex flex-wrap gap-2 p-3 border-2 border-dashed border-gray-200 rounded-lg min-h-[60px] focus-within:border-blue-400 transition-colors">
                  {recipients.map((recipient) => (
                    <Badge
                      key={recipient}
                      variant="secondary"
                      className="bg-blue-100 text-blue-800 px-3 py-1 text-sm flex items-center gap-2"
                    >
                      <Mail className="w-3 h-3" />
                      {recipient}
                      <button
                        onClick={() => removeRecipient(recipient)}
                        className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                        aria-label={`Remove ${recipient}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                  
                  <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                    <Input
                      ref={recipientInputRef}
                      type="email"
                      placeholder={recipients.length === 0 ? "Enter email addresses..." : "Add another email..."}
                      value={currentRecipient}
                      onChange={(e) => setCurrentRecipient(e.target.value)}
                      onKeyDown={handleRecipientKeyDown}
                      className="border-0 focus-visible:ring-0 shadow-none text-sm"
                    />
                    {currentRecipient && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={addRecipient}
                        className="shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 mt-2">
                  Press Enter or comma to add emails. Click × to remove.
                </p>
              </div>

              {/* Prompt Section */}
              <div>
                <Label htmlFor="prompt" className="text-lg font-semibold text-gray-900 mb-3 block">
                  What do you want to say?
                </Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe what you want the email to be about... 

Examples:
• Write a professional follow-up email for a job interview
• Create a thank you email for a client meeting
• Draft a project update for the team
• Write an invitation to a company event"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[120px] text-base resize-none"
                  disabled={isGenerating || isRegenerating}
                />
              </div>

              {/* Generate Button */}
              <div className="flex gap-3">
                <Button
                  onClick={() => handleGenerateEmail(false)}
                  disabled={isGenerating || isRegenerating || !prompt.trim() || recipients.length === 0}
                  className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating Email...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-5 w-5" />
                      Generate Email with AI
                    </>
                  )}
                </Button>

                {emailDraft && (
                  <Button
                    onClick={clearDraft}
                    variant="outline"
                    size="icon"
                    className="h-12 w-12"
                    title="Clear draft"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Generated Email Preview */}
              {emailDraft && (
                <Card className="border-2 border-blue-200 bg-blue-50/50">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl text-blue-900 flex items-center gap-2">
                        <Mail className="w-5 h-5" />
                        Your AI-Generated Email
                      </CardTitle>
                      <Button
                        onClick={() => handleGenerateEmail(true)}
                        disabled={isRegenerating || isGenerating}
                        variant="outline"
                        size="sm"
                      >
                        {isRegenerating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Regenerating...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Regenerate
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="subject" className="font-medium text-gray-900 mb-2 block">
                        Subject Line
                      </Label>
                      <Input
                        id="subject"
                        value={emailDraft.subject}
                        onChange={(e) => updateEmailContent('subject', e.target.value)}
                        className="text-base font-medium"
                        placeholder="Enter email subject..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="content" className="font-medium text-gray-900 mb-2 block">
                        Email Content
                      </Label>
                      <Textarea
                        id="content"
                        value={emailDraft.content}
                        onChange={(e) => updateEmailContent('content', e.target.value)}
                        className="min-h-[200px] text-base leading-relaxed resize-none"
                        placeholder="Enter email content..."
                      />
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Recipients ({emailDraft.recipients.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {emailDraft.recipients.map((recipient, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-gray-50 text-gray-700"
                          >
                            {recipient}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={handleSendEmail}
                      disabled={isSending || !emailDraft.subject.trim() || !emailDraft.content.trim()}
                      className="w-full h-12 text-base font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Sending Email...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-5 w-5" />
                          Send Email to {emailDraft.recipients.length} Recipient{emailDraft.recipients.length !== 1 ? 's' : ''}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
