import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SOS - Island Survival',
  description: 'A turn-based island survival fog-of-war game',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
