# Magic Healer Production Tracking

A Next.js chat application for warehouse production tracking. Workers log in with Google, use slash commands to open forms, submit data to N8N webhooks, and receive confirmations.

## Features

- 🔐 Google OAuth authentication with NextAuth.js
- 💬 Chat interface with slash commands
- 📝 Production tracking forms
- 🔗 N8N webhook integration
- 📱 Responsive design with Tailwind CSS
- ⚡ Real-time chat experience

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- NextAuth.js v4 for Google OAuth
- shadcn/ui components
- Tailwind CSS
- Zustand for state management

## Getting Started

### 1. Environment Setup

Copy the environment variables template:

```bash
cp env.example .env.local
```

Fill in your environment variables in `.env.local`:

```env
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# N8N Webhook Configuration
N8N_WEBHOOK_URL=your-n8n-webhook-url

# Optional: Restrict to specific email domain
ALLOWED_EMAIL_DOMAIN=mymagichealer.com
```

### 2. Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create OAuth 2.0 Client IDs
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
6. Copy the Client ID and Client Secret to your `.env.local` file

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

### Authentication

1. Visit the landing page
2. Click "Sign in with Google"
3. Complete Google OAuth flow
4. Get redirected to the chat interface

### Chat Commands

Use these slash commands in the chat:

- `/production` - Open production form
- `/inventory` - Open inventory check form
- `/quality` - Open quality check form
- `/maintenance` - Open maintenance form
- `/help` - Show available commands

### Quick Commands

Click the quick command buttons for instant access to forms.

## Project Structure

```
src/
├── app/
│   ├── api/auth/[...nextauth]/route.ts  # NextAuth.js API routes
│   ├── chat/page.tsx                    # Chat interface
│   ├── layout.tsx                       # Root layout
│   └── page.tsx                         # Landing page
├── components/
│   ├── providers.tsx                    # Session provider
│   └── ui/                              # shadcn/ui components
├── lib/
│   ├── auth.ts                          # NextAuth.js configuration
│   └── utils.ts                         # Utility functions
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXTAUTH_URL` | Your app's URL | Yes |
| `NEXTAUTH_SECRET` | Random secret for JWT signing | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | Yes |
| `N8N_WEBHOOK_URL` | N8N webhook endpoint | Yes |
| `ALLOWED_EMAIL_DOMAIN` | Restrict access to specific domain | No |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details