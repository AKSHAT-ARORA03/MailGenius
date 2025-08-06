import { z } from 'zod'

export const generateEmailSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(1000, 'Prompt too long'),
  recipients: z.array(z.string().email('Invalid email address')).min(1, 'At least one recipient is required'),
})

export const sendEmailSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject too long'),
  content: z.string().min(1, 'Content is required'),
  recipients: z.array(z.string().email('Invalid email address')).min(1, 'At least one recipient is required'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type GenerateEmailRequest = z.infer<typeof generateEmailSchema>
export type SendEmailRequest = z.infer<typeof sendEmailSchema>
export type RegisterRequest = z.infer<typeof registerSchema>
export type LoginRequest = z.infer<typeof loginSchema>
