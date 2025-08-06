# 🚀 AI Email Generator - Deployment Guide

This guide covers deploying the AI Email Generator to various platforms and environments.

## 🌟 Quick Deploy Options

### Option 1: Vercel (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/ai-email-generator)

### Option 2: Netlify
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/ai-email-generator)

### Option 3: Railway
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

---

## 🔧 Environment Setup

### Required Environment Variables

| Variable | Development | Production | Notes |
|----------|-------------|------------|-------|
| `DATABASE_URL` | `file:./dev.db` | PostgreSQL URL | Switch to PostgreSQL for production |
| `NEXTAUTH_URL` | `http://localhost:3000` | Your domain | Must match your deployed URL |
| `NEXTAUTH_SECRET` | Any string | Strong secret | Generate with `openssl rand -base64 32` |
| `GROQ_API_KEY` | Your API key | Your API key | Get from [console.groq.com](https://console.groq.com) |
| `RESEND_API_KEY` | Your API key | Your API key | Get from [resend.com](https://resend.com) |
| `FROM_EMAIL` | `onboarding@resend.dev` | Your verified domain | Must be verified in Resend |

### Generate Secure Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🌐 Vercel Deployment (Recommended)

### Step 1: Prepare Repository

```bash
# Ensure your code is in a Git repository
git init
git add .
git commit -m "Initial commit"

# Push to GitHub (create repository first)
git remote add origin https://github.com/your-username/ai-email-generator.git
git push -u origin main
```

### Step 2: Connect to Vercel

1. Visit [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings

### Step 3: Configure Environment Variables

In your Vercel project dashboard:

```bash
# Production Environment Variables
DATABASE_URL=postgresql://user:password@host:5432/dbname
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-generated-secret
GROQ_API_KEY=your-groq-api-key
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=noreply@yourdomain.com
```

### Step 4: Database Setup

```bash
# Deploy first, then run migrations
npx prisma db push
```

### Step 5: Custom Domain (Optional)

1. In Vercel dashboard, go to "Domains"
2. Add your custom domain
3. Configure DNS records as shown
4. Update `NEXTAUTH_URL` to your custom domain

---

## 🐘 PostgreSQL Database Setup

### Option 1: Vercel Postgres

```bash
# Install Vercel CLI
npm i -g vercel

# Create Postgres database
vercel postgres create

# Get connection string
vercel env pull .env.local
```

### Option 2: Supabase

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings > Database
4. Update `DATABASE_URL`

### Option 3: PlanetScale

1. Create account at [planetscale.com](https://planetscale.com)
2. Create database
3. Generate connection string
4. Update `DATABASE_URL`

### Option 4: Railway PostgreSQL

1. Create account at [railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL service
4. Copy connection string

---

## 🐳 Docker Deployment

### Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/ai_email
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=your-secret
      - GROQ_API_KEY=your-groq-key
      - RESEND_API_KEY=your-resend-key
      - FROM_EMAIL=noreply@yourdomain.com
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=ai_email
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Deploy with Docker

```bash
# Build and run
docker-compose up -d

# Run migrations
docker-compose exec app npx prisma db push
```

---

## ☁️ AWS Deployment

### AWS Amplify

1. Connect GitHub repository
2. Configure build settings:

```yaml
# amplify.yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
        - npx prisma generate
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### AWS ECS with Fargate

1. Build and push Docker image to ECR
2. Create ECS cluster
3. Create task definition
4. Create service
5. Configure load balancer

---

## 🌍 Google Cloud Platform

### Cloud Run

```bash
# Build and deploy
gcloud run deploy ai-email-generator \
  --image gcr.io/your-project/ai-email-generator \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### App Engine

```yaml
# app.yaml
runtime: nodejs18

env_variables:
  DATABASE_URL: "your-postgres-url"
  NEXTAUTH_URL: "https://your-app.appspot.com"
  NEXTAUTH_SECRET: "your-secret"
  GROQ_API_KEY: "your-groq-key"
  RESEND_API_KEY: "your-resend-key"
  FROM_EMAIL: "noreply@yourdomain.com"
```

---

## 📊 Monitoring & Analytics

### Vercel Analytics

```bash
# Install Vercel Analytics
npm install @vercel/analytics

# Add to layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Error Tracking with Sentry

```bash
# Install Sentry
npm install @sentry/nextjs

# Configure next.config.js
const { withSentryConfig } = require('@sentry/nextjs')

module.exports = withSentryConfig({
  // Your existing config
})
```

---

## 🛡️ Security Checklist

### Before Production

- [ ] All environment variables are secure
- [ ] Database has proper access controls
- [ ] HTTPS is enforced
- [ ] Rate limiting is configured
- [ ] Content Security Policy is set
- [ ] CORS is properly configured
- [ ] API keys have minimum required permissions

### Environment Variables Security

```bash
# Use secrets management for sensitive data
NEXTAUTH_SECRET=$(random-secure-string)
GROQ_API_KEY=$(secure-api-key)
RESEND_API_KEY=$(secure-api-key)
```

---

## 🔧 Post-Deployment Steps

### 1. Test Production Environment

```bash
# Run full test suite
npm run test

# Test API endpoints
curl https://your-app.vercel.app/api/health
```

### 2. Configure Monitoring

- Set up uptime monitoring
- Configure error alerting
- Monitor API usage and costs
- Set up performance tracking

### 3. Domain and Email Setup

- Configure custom domain
- Set up email DNS records
- Verify sender domain in Resend
- Test email delivery

### 4. Backup Strategy

- Set up database backups
- Configure automated snapshots
- Test restore procedures

---

## 📈 Scaling Considerations

### Performance Optimization

- Enable Next.js image optimization
- Configure CDN for static assets
- Implement caching strategies
- Monitor database performance

### Cost Optimization

- Monitor API usage costs (Groq, Resend)
- Set up billing alerts
- Optimize database queries
- Implement efficient caching

---

## 🚨 Troubleshooting

### Common Issues

**Build Fails**
- Check Node.js version compatibility
- Verify all environment variables are set
- Ensure Prisma client is generated

**Database Connection Errors**
- Verify DATABASE_URL format
- Check network connectivity
- Confirm database exists and is accessible

**Authentication Issues**
- Verify NEXTAUTH_URL matches deployed URL
- Check NEXTAUTH_SECRET is set
- Confirm session storage is working

**Email Sending Fails**
- Verify Resend API key
- Check FROM_EMAIL is verified
- Confirm recipient emails are valid

---

## 📞 Support Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [NextAuth.js Deployment](https://next-auth.js.org/deployment)

---

**Need Help?** Open an issue on GitHub or check the documentation for your specific deployment platform.
