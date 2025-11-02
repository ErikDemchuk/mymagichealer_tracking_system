# Cursor MiniMax M-2 Configuration Helper
# This script helps you configure MiniMax M-2 in Cursor IDE

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MiniMax M-2 Cursor IDE Setup Helper" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Your MiniMax API Key
$MINIMAX_API_KEY = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJHcm91cE5hbWUiOiJOSUNBUkUgKyIsIlVzZXJOYW1lIjoiTklDQVJFICsiLCJBY2NvdW50IjoiIiwiU3ViamVjdElEIjoiMTkzNTgzOTU2MDEyNjY5Nzk5OCIsIlBob25lIjoiIiwiR3JvdXBJRCI6IjE5MzU4Mzk1NjAxMjI1MDM2OTQiLCJQYWdlTmFtZSI6IiIsIk1haWwiOiJjb250YWN0QG5pY2FyZXBsdXMuY29tIiwiQ3JlYXRlVGltZSI6IjIwMjUtMTAtMzAgMjE6NTM6MDIiLCJUb2tlblR5cGUiOjEsImlzcyI6Im1pbmltYXgifQ.PHXdPXO7YbCg38SIjV4jTpKf1pColcTCm5xUzepf42gflAZ-riG61liay4Tlu4ZxXMTbxGfKV-pPt1yrRT0S14LOIKroUVvfRFJmFIrHVwPSn8zNW8wFT4Vh2tYI_fCWP_LcUptwrp_LhJs62VrSZCCOwlIoKp8fFBnjYIYxcYp7ZkAvJLaTlPL_UZTyo5tKieHuwOiCHHLccMENObGXFpjJ6upjhrvv2bP2bZdlcVGrCNvBZSpisN1-2TT2bRf2foJZHXn9RhW5PONn7nluNOzqi99Ey2BNi7KN7AugDZe5Cp__RJf3qmuhFtD2ZY6cyCQTs8QwZ3sXqSYizR8lwQ"
$MINIMAX_BASE_URL = "https://api.minimax.io/v1"
$MODEL_NAME = "MiniMax-M2"

Write-Host "Your Configuration:" -ForegroundColor Yellow
Write-Host "  Base URL: $MINIMAX_BASE_URL" -ForegroundColor White
Write-Host "  Model Name: $MODEL_NAME" -ForegroundColor White
Write-Host "  API Key: $($MINIMAX_API_KEY.Substring(0, 50))..." -ForegroundColor White
Write-Host ""

# Copy API key to clipboard
$MINIMAX_API_KEY | Set-Clipboard
Write-Host "✓ API Key copied to clipboard!" -ForegroundColor Green
Write-Host ""

Write-Host "Manual Steps:" -ForegroundColor Yellow
Write-Host "1. Open Cursor IDE" -ForegroundColor White
Write-Host "2. Press Ctrl+, to open Settings" -ForegroundColor White
Write-Host "3. Click 'Models' in the left sidebar" -ForegroundColor White
Write-Host ""
Write-Host "4. Configure API Keys:" -ForegroundColor Cyan
Write-Host "   - Expand 'API Keys' section" -ForegroundColor White
Write-Host "   - Enable 'Override OpenAI Base URL'" -ForegroundColor White
Write-Host "   - Base URL: $MINIMAX_BASE_URL" -ForegroundColor White
Write-Host "   - Paste API Key (already in clipboard): Ctrl+V" -ForegroundColor White
Write-Host "   - Click verify button and enable" -ForegroundColor White
Write-Host ""
Write-Host "5. Add Custom Model:" -ForegroundColor Cyan
Write-Host "   - Click 'View All Models'" -ForegroundColor White
Write-Host "   - Click 'Add Custom Model'" -ForegroundColor White
Write-Host "   - Enter: $MODEL_NAME" -ForegroundColor White
Write-Host "   - Click 'Add'" -ForegroundColor White
Write-Host ""
Write-Host "6. Enable Model:" -ForegroundColor Cyan
Write-Host "   - Find '$MODEL_NAME' in models list" -ForegroundColor White
Write-Host "   - Enable the toggle" -ForegroundColor White
Write-Host ""
Write-Host "7. Use It:" -ForegroundColor Cyan
Write-Host "   - Press Ctrl+L to open chat" -ForegroundColor White
Write-Host "   - Select '$MODEL_NAME' from dropdown" -ForegroundColor White
Write-Host ""

Write-Host "Would you like to open Cursor Settings now? (Y/N)" -ForegroundColor Yellow
$response = Read-Host
if ($response -eq 'Y' -or $response -eq 'y') {
    Write-Host "Opening Cursor..." -ForegroundColor Green
    # Try to open Cursor if it's in PATH
    $cursorPaths = @(
        "$env:LOCALAPPDATA\Programs\cursor\Cursor.exe",
        "$env:APPDATA\cursor\Cursor.exe",
        "cursor"
    )
    
    $opened = $false
    foreach ($path in $cursorPaths) {
        if (Test-Path $path) {
            Start-Process $path
            $opened = $true
            break
        }
    }
    
    if (-not $opened) {
        Write-Host "Could not auto-open Cursor. Please open it manually." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Setup complete! Check CURSOR_MINIMAX_SETUP.md for detailed guide." -ForegroundColor Green
Write-Host ""

















