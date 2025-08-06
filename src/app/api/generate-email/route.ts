import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateEmailSchema } from '@/lib/validations'
import { rateLimiter } from '@/lib/rate-limit'
import { prisma } from '@/lib/prisma'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database to get the ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Rate limiting
    const identifier = user.id
    const limit = parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE || '10')
    
    if (!rateLimiter(identifier, limit)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const validatedData = generateEmailSchema.parse(body)

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      )
    }

    // Generate subject line first
    const subjectCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a professional email writer. Generate only a concise, professional email subject line based on the user's prompt. 
                   Return only the subject line text, no quotes, no formatting, no additional text.`
        },
        {
          role: 'user',
          content: `Generate a subject line for: ${validatedData.prompt}`
        }
      ],
      model: 'llama3-8b-8192',
      temperature: 0.5,
      max_tokens: 100,
    })

    // Generate email content
    const contentCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a professional email writer. Generate a well-structured, professional email body based on the user's prompt. 
                   Write only the email content, no subject line, no JSON formatting.
                   Use proper paragraph breaks and professional tone.
                   Include appropriate greetings and closing.`
        },
        {
          role: 'user',
          content: `Generate email content for: ${validatedData.prompt}`
        }
      ],
      model: 'llama3-8b-8192',
      temperature: 0.7,
      max_tokens: 1000,
    })

    const subjectResponse = subjectCompletion.choices[0]?.message?.content?.trim()
    const contentResponse = contentCompletion.choices[0]?.message?.content?.trim()
    
    if (!subjectResponse || !contentResponse) {
      return NextResponse.json(
        { error: 'Failed to generate email' },
        { status: 500 }
      )
    }

    const emailData = {
      subject: subjectResponse,
      content: contentResponse
    }

    // Save draft to database
    const draft = await prisma.emailDraft.create({
      data: {
        prompt: validatedData.prompt,
        subject: emailData.subject,
        content: emailData.content,
        recipients: JSON.stringify(validatedData.recipients),
        userId: user.id,
        status: 'draft'
      }
    })

    return NextResponse.json({
      id: draft.id,
      subject: emailData.subject,
      content: emailData.content,
      recipients: validatedData.recipients
    })

  } catch (error) {
    console.error('Generate email error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
