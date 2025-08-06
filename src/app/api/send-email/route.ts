import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmailSchema } from '@/lib/validations'
import { rateLimiter } from '@/lib/rate-limit'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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
    const validatedData = sendEmailSchema.parse(body)

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }

    const fromEmail = process.env.FROM_EMAIL || 'noreply@localhost.com'

    // Send emails
    const emailPromises = validatedData.recipients.map(async (recipient) => {
      return resend.emails.send({
        from: fromEmail,
        to: recipient,
        subject: validatedData.subject,
        html: validatedData.content.replace(/\n/g, '<br>'),
      })
    })

    const results = await Promise.allSettled(emailPromises)
    
    // Check for failures
    const failures = results.filter(result => result.status === 'rejected')
    if (failures.length > 0) {
      console.error('Email sending failures:', failures)
      return NextResponse.json(
        { error: 'Some emails failed to send' },
        { status: 500 }
      )
    }

    // Save sent email record
    await prisma.sentEmail.create({
      data: {
        subject: validatedData.subject,
        content: validatedData.content,
        recipients: JSON.stringify(validatedData.recipients),
        userId: user.id
      }
    })

    // Update draft status if it exists
    const draftId = body.draftId
    if (draftId) {
      await prisma.emailDraft.update({
        where: { id: draftId, userId: user.id },
        data: { status: 'sent' }
      })
    }

    return NextResponse.json({
      success: true,
      message: `Email sent successfully to ${validatedData.recipients.length} recipient(s)`
    })

  } catch (error) {
    console.error('Send email error:', error)
    
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
