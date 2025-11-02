# Configuring MiniMax M-2 in Cursor IDE

This guide will help you set up MiniMax M-2 as an AI model in Cursor IDE so you can use it for coding assistance.

## Step-by-Step Setup

### 1. Open Cursor Settings

1. Open Cursor IDE
2. Click the **"Settings"** button (gear icon) in the top-right corner
3. Or use keyboard shortcut: `Ctrl+,` (Windows/Linux) or `Cmd+,` (Mac)

### 2. Navigate to Models

1. In the left sidebar, click **"Models"**
2. This opens the model configuration page

### 3. Configure API Keys

1. Expand the **"API Keys"** section
2. Enable **"Override OpenAI Base URL"** checkbox
3. In the **Base URL** field, enter:
   ```
   https://api.minimax.io/v1
   ```
4. In the **OpenAI API Key** field, paste your MiniMax API key:
   ```
   eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJHcm91cE5hbWUiOiJOSUNBUkUgKyIsIlVzZXJOYW1lIjoiTklDQVJFICsiLCJBY2NvdW50IjoiIiwiU3ViamVjdElEIjoiMTkzNTgzOTU2MDEyNjY5Nzk5OCIsIlBob25lIjoiIiwiR3JvdXBJRCI6IjE5MzU4Mzk1NjAxMjI1MDM2OTQiLCJQYWdlTmFtZSI6IiIsIk1haWwiOiJjb250YWN0QG5pY2FyZXBsdXMuY29tIiwiQ3JlYXRlVGltZSI6IjIwMjUtMTAtMzAgMjE6NTM6MDIiLCJUb2tlblR5cGUiOjEsImlzcyI6Im1pbmltYXgifQ.PHXdPXO7YbCg38SIjV4jTpKf1pColcTCm5xUzepf42gflAZ-riG61liay4Tlu4ZxXMTbxGfKV-pPt1yrRT0S14LOIKroUVvfRFJmFIrHVwPSn8zNW8wFT4Vh2tYI_fCWP_LcUptwrp_LhJs62VrSZCCOwlIoKp8fFBnjYIYxcYp7ZkAvJLaTlPL_UZTyo5tKieHuwOiCHHLccMENObGXFpjJ6upjhrvv2bP2bZdlcVGrCNvBZSpisN1-2TT2bRf2foJZHXn9RhW5PONn7nluNOzqi99Ey2BNi7KN7AugDZe5Cp__RJf3qmuhFtD2ZY6cyCQTs8QwZ3sXqSYizR8lwQ
   ```
5. Click the button on the right side of the **"OpenAI API Key"** field (usually a checkmark or verify button)
6. Click **"Enable OpenAI API Key"** in the pop-up window to complete verification

### 4. Add MiniMax-M2 Model

1. In the **Models** section, click **"View All Models"** button
2. Click **"Add Custom Model"** button
3. Enter the model name: **`MiniMax-M2`** (exactly as shown)
4. Click **"Add"** button

### 5. Enable MiniMax-M2

1. Find **"MiniMax-M2"** in your models list
2. Enable the toggle/checkbox next to it
3. **MiniMax-M2** is now available for use in Cursor!

### 6. Select MiniMax-M2 in Chat

1. Open the chat panel in Cursor (usually `Ctrl+L` or `Cmd+L`)
2. In the chat panel, click on the model selector dropdown
3. Select **"MiniMax-M2"** from the list
4. You can now chat with MiniMax M-2 for coding assistance!

## Visual Guide

The configuration should look like this:

```
API Keys Section:
├── ✅ Override OpenAI Base URL
├── Base URL: https://api.minimax.io/v1
└── OpenAI API Key: [your-minimax-api-key] ✅

Models Section:
└── Custom Models:
    └── ✅ MiniMax-M2 [Enabled]
```

## Verification

To verify MiniMax M-2 is working:

1. Open a chat in Cursor (`Ctrl+L` or `Cmd+L`)
2. Select **"MiniMax-M2"** from the model dropdown
3. Ask a coding question (e.g., "Explain this code")
4. You should receive responses from MiniMax M-2

## Troubleshooting

### Model Not Appearing

- Make sure you entered the model name exactly as **"MiniMax-M2"** (case-sensitive)
- Try refreshing Cursor or restarting the application

### API Key Not Working

- Verify the API key is correct (no extra spaces)
- Make sure "Override OpenAI Base URL" is enabled
- Check that the base URL is exactly: `https://api.minimax.io/v1`

### Connection Errors

- Ensure your internet connection is stable
- Check if you've exceeded MiniMax API rate limits
- Verify the API key hasn't been revoked

## Security Note

⚠️ **Important:** Since you've shared your API key publicly, consider:
1. Regenerating a new API key from [MiniMax Platform](https://platform.minimax.io/)
2. Revoking the old key for security
3. Using the new key in Cursor settings

## Resources

- [MiniMax Cursor Setup Guide](https://platform.minimax.io/docs/guides/text-ai-coding-tools#use-minimax-m2-in-cursor)
- [MiniMax API Documentation](https://platform.minimax.io/docs)















