# MiniMax M-2 Setup Guide

This project now supports **MiniMax M-2** AI model integration. The system automatically detects and uses MiniMax M-2 if configured, otherwise falls back to OpenAI.

## Quick Setup

### 1. Get Your MiniMax API Key

1. Visit the [MiniMax Developer Platform](https://platform.minimax.io/)
2. Sign up or log in to your account
3. Click **"Create new secret key"** button
4. Enter a project name to create a new API key
5. **Copy and save the API key securely** - it's shown only once!

### 2. Configure Environment Variables

Add your MiniMax API key to your `.env.local` file:

```bash
MINIMAX_API_KEY="your-minimax-api-key-here"
```

**Note:** If you have both `MINIMAX_API_KEY` and `OPENAI_API_KEY` set, the system will prioritize MiniMax M-2.

### 3. Restart Your Development Server

After updating `.env.local`, restart your Next.js development server:

```bash
npm run dev
```

## How It Works

The project uses a unified AI service (`src/lib/ai-service.ts`) that:

- **Automatically detects** which API key is available
- **Prioritizes MiniMax M-2** if both keys are present
- **Falls back to OpenAI** if only OpenAI key is configured
- Uses the **OpenAI-compatible API format** (MiniMax M-2 supports this)

## API Endpoints Updated

The following endpoints now support MiniMax M-2:

- `/api/openai` - Main chat completion endpoint
- `/api/generate-title` - Chat title generation endpoint

## Verification

To verify MiniMax M-2 is working:

1. Check your server logs - you should see API calls to `https://api.minimax.io/v1`
2. Send a message in the chat interface
3. The response should come from MiniMax M-2 model

## Troubleshooting

### API Error: "Cannot read properties of undefined (reading 'map')"

If you encounter this error:

1. ✅ Verify the API key is correctly set in `.env.local`
2. ✅ Ensure you've restarted your development server
3. ✅ Check that the API key format is correct (no extra spaces or quotes)
4. ✅ Verify you haven't exceeded rate limits

### Still Using OpenAI Instead of MiniMax?

- Check that `MINIMAX_API_KEY` is set in your `.env.local` file
- Ensure there are no typos in the environment variable name
- Restart your development server completely
- Clear any cached environment variables

## Resources

- [MiniMax Platform Documentation](https://platform.minimax.io/docs/guides/text-ai-coding-tools)
- [MiniMax API Reference](https://platform.minimax.io/docs)

## Support

If you encounter issues:
- Check the [MiniMax troubleshooting guide](https://platform.minimax.io/docs/guides/text-ai-coding-tools#troubleshooting)
- Contact MiniMax support: **api@minimax.io**
















