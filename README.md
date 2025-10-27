# Production Tracking System

A Next.js-based production tracking system with AI-powered chat interface.

## Features

- 💬 AI Chat Interface with OpenAI integration
- 📊 Production tracking forms
- 🗄️ MongoDB database for chat persistence
- 🔐 Simple session-based authentication

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: MongoDB with Mongoose
- **AI**: OpenAI API
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database (MongoDB Atlas recommended)
- OpenAI API key

### Environment Variables

Create a `.env.local` file:

```bash
STORAGE_MONGODB_URI="your-mongodb-connection-string"
OPENAI_API_KEY="your-openai-api-key"
```

### Installation

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── api/          # API routes
│   │   ├── auth/     # Authentication endpoints
│   │   ├── chats/    # Chat CRUD endpoints
│   │   └── openai/   # OpenAI integration
│   └── chat/         # Chat page
├── components/       # React components
├── hooks/           # Custom React hooks
└── lib/             # Utilities and services
    ├── mongodb.ts   # MongoDB connection
    ├── models/      # Mongoose schemas
    ├── session.ts   # Session management
    └── database-service.ts
```

## Deployment

Deploy to Vercel:

```bash
vercel deploy
```

Make sure to set environment variables in Vercel dashboard.

## License

MIT
