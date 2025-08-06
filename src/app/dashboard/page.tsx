'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import EmailComposer from '@/components/EmailComposer'
import { Button } from '@/components/ui/button'
import { LogOut, User, Mail } from 'lucide-react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (!session) {
      router.push('/login')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  AI Email Generator
                </h1>
                <p className="text-sm text-gray-500 hidden sm:block">
                  Welcome back, {session.user?.name || session.user?.email}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{session.user?.name || session.user?.email}</span>
              </div>
              <Button
                variant="outline"
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center gap-2 text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <EmailComposer />
      </main>
    </div>
  )
}
