import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Production Tracking",
  description: "AI-powered production tracking system",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <script
          src="https://accounts.google.com/gsi/client"
          async
          defer
        ></script>
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}

