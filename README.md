# 🚀 AI Email Generator - Production Ready

A modern, full-stack Next.js application that generates professional emails using AI and sends them to multiple recipients. Built with cutting-edge technologies and best practices.

![AI Email Generator](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)

## ✨ Features

### 🎯 Core Features
- **AI-Powered Email Generation**: Generate professional emails using Groq AI
- **Multi-Recipient Support**: Send emails to multiple recipients with validation
- **Rich Email Editor**: Edit subject and content with a user-friendly interface
- **Real-time Validation**: Inline email validation with visual feedback
- **Modern UI/UX**: Beautiful, responsive design with Tailwind CSS + ShadCN/UI

### 🔐 Security & Authentication
- **Secure Authentication**: NextAuth.js with JWT tokens
- **Rate Limiting**: API protection against abuse
- **Input Validation**: Comprehensive validation with Zod
- **CSRF Protection**: Built-in security measures

### 💾 Data Management
- **Database Integration**: Prisma ORM with SQLite (dev) / PostgreSQL (prod)
- **Email History**: Track sent emails and drafts
- **User Management**: Secure user registration and session management

### 🎨 UI/UX Excellence
- **Responsive Design**: Works perfectly on all devices
- **Accessibility**: WCAG compliant with proper ARIA labels
- **Loading States**: Smooth loading indicators and feedback
- **Error Handling**: User-friendly error messages and recovery
- **Toast Notifications**: Real-time feedback for all actions

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **ShadCN/UI** - Beautiful, accessible components
- **Lucide React** - Modern icon library

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **NextAuth.js** - Authentication and session management
- **Prisma ORM** - Type-safe database access
- **Zod** - Runtime type validation

### Services
- **Groq AI** - Fast AI inference for email generation
- **Resend** - Reliable email delivery service
- **SQLite/PostgreSQL** - Database storage

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- A Groq AI API key ([Get one here](https://console.groq.com))
- A Resend API key ([Get one here](https://resend.com))

### 1. Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd ai-email-generator

# Install dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local
```

Update `.env.local` with your API keys:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# AI Provider (Groq)
GROQ_API_KEY="your-groq-api-key"

# Email Provider (Resend)
RESEND_API_KEY="your-resend-api-key"
FROM_EMAIL="onboarding@resend.dev"  # For development

# Rate Limiting
RATE_LIMIT_REQUESTS_PER_MINUTE="10"
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Create database and tables
npx prisma db push

# (Optional) View database in Prisma Studio
npx prisma studio
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/                     # Next.js App Router
│   ├── api/                 # API routes
│   │   ├── auth/            # NextAuth.js authentication
│   │   │   └── [...nextauth]/
│   │   ├── generate-email/  # AI email generation endpoint
│   │   ├── register/        # User registration endpoint
│   │   └── send-email/      # Email sending endpoint
│   ├── dashboard/           # Main application dashboard
│   ├── login/               # Login page
│   ├── register/            # Registration page
│   ├── globals.css          # Global styles with Tailwind
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Home page (redirects to dashboard)
│   └── providers.tsx        # Authentication providers
├── components/              # React components
│   ├── ui/                  # ShadCN/UI components
│   │   ├── alert.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── textarea.tsx
│   └── EmailComposer.tsx    # Main email composer component
└── lib/                     # Utility functions
    ├── auth.ts              # NextAuth.js configuration
    ├── prisma.ts            # Prisma client instance
    ├── rate-limit.ts        # Rate limiting utility
    ├── utils.ts             # General utilities
    └── validations.ts       # Zod validation schemas
```

## 🔧 API Endpoints

### Authentication
- `GET/POST /api/auth/*` - NextAuth.js authentication endpoints
- `POST /api/register` - User registration

### Email Operations
- `POST /api/generate-email` - Generate email using AI
- `POST /api/send-email` - Send email to recipients

### Request/Response Examples

#### Generate Email
```typescript
// Request
POST /api/generate-email
{
  "prompt": "Write a professional follow-up email for a job interview",
  "recipients": ["hiring@company.com"]
}

// Response
{
  "id": "draft_123",
  "subject": "Thank you for the interview opportunity",
  "content": "Dear Hiring Team,\n\nThank you for taking the time...",
  "recipients": ["hiring@company.com"]
}
```

#### Send Email
```typescript
// Request
POST /api/send-email
{
  "subject": "Thank you for the interview opportunity",
  "content": "Dear Hiring Team...",
  "recipients": ["hiring@company.com"],
  "draftId": "draft_123"
}

// Response
{
  "success": true,
  "message": "Email sent successfully to 1 recipient(s)"
}
```

## 🗄️ Database Schema

```prisma
model User {
  id          String    @id @default(cuid())
  name        String?
  email       String    @unique
  password    String?
  emailDrafts EmailDraft[]
  sentEmails  SentEmail[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model EmailDraft {
  id          String   @id @default(cuid())
  prompt      String
  subject     String?
  content     String
  recipients  String   // JSON array
  status      String   @default("draft")
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model SentEmail {
  id         String   @id @default(cuid())
  subject    String
  content    String
  recipients String   // JSON array
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  sentAt     DateTime @default(now())
}
```

## 🔐 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | Database connection string | ✅ | `file:./dev.db` |
| `NEXTAUTH_URL` | NextAuth.js URL | ✅ | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | NextAuth.js secret key | ✅ | - |
| `GROQ_API_KEY` | Groq AI API key | ✅ | - |
| `RESEND_API_KEY` | Resend email service API key | ✅ | - |
| `FROM_EMAIL` | Sender email address | ✅ | `onboarding@resend.dev` |
| `RATE_LIMIT_REQUESTS_PER_MINUTE` | API rate limit | ❌ | `10` |

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy automatically

3. **Configure Database**
   - For production, use PostgreSQL
   - Update `DATABASE_URL` to your PostgreSQL connection string
   - Run `npx prisma db push` to create tables

### Docker

```dockerfile
# Build and run with Docker
docker build -t ai-email-generator .
docker run -p 3000:3000 ai-email-generator
```

## 🧪 Testing

### Manual Testing Checklist

#### Authentication
- [ ] User registration works
- [ ] Login/logout functionality
- [ ] Session persistence
- [ ] Protected routes redirect properly

#### Email Generation
- [ ] AI generates emails from prompts
- [ ] Email drafts are editable
- [ ] Validation works for empty fields
- [ ] Error handling for API failures

#### Email Sending
- [ ] Emails send to multiple recipients
- [ ] Email validation works
- [ ] Success/error feedback displays
- [ ] Email history is saved

#### UI/UX
- [ ] Responsive design on mobile/desktop
- [ ] Loading states work properly
- [ ] Error messages are user-friendly
- [ ] Accessibility features work

## 🔧 Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
```

## 🛡️ Security Features

- **Rate Limiting**: API endpoints protected against abuse
- **Input Validation**: All inputs validated with Zod
- **Authentication**: Secure JWT-based authentication
- **CSRF Protection**: Built into NextAuth.js
- **Environment Variables**: Sensitive data stored securely
- **Error Handling**: No sensitive information leaked in errors

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface
- **Responsive Layout**: Works on all screen sizes
- **Loading States**: Clear feedback during operations
- **Error Handling**: User-friendly error messages
- **Accessibility**: WCAG compliant, keyboard navigation
- **Toast Notifications**: Real-time feedback
- **Form Validation**: Inline validation with visual cues

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [ShadCN/UI](https://ui.shadcn.com/) - Beautifully designed components
- [Prisma](https://prisma.io/) - Next-generation ORM for Node.js
- [NextAuth.js](https://next-auth.js.org/) - Complete authentication solution
- [Groq](https://groq.com/) - Fast AI inference
- [Resend](https://resend.com/) - Email delivery for developers

---

Built with ❤️ using Next.js 14, TypeScript, and modern web technologies.
