<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# AI Email Generator Project

This is a Next.js 14 application that allows users to generate and send emails using AI.

## Tech Stack
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS + ShadCN/UI components
- NextAuth.js for authentication
- Prisma ORM with SQLite database
- Groq AI for email generation
- Resend for email delivery
- Zod for validation

## Project Structure
- `/src/app` - Next.js App Router pages and API routes
- `/src/components` - React components including UI components
- `/src/lib` - Utility functions, database client, and configurations
- `/prisma` - Database schema and migrations

## Key Features
- User authentication (register/login)
- AI-powered email generation using Groq
- Rich text email editing
- Multi-recipient email sending
- Rate limiting and validation
- Responsive design

## Environment Variables Required
- `DATABASE_URL` - Database connection string
- `NEXTAUTH_URL` - NextAuth.js URL
- `NEXTAUTH_SECRET` - NextAuth.js secret
- `GROQ_API_KEY` - Groq AI API key
- `RESEND_API_KEY` - Resend email service API key
- `FROM_EMAIL` - Sender email address

## Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
