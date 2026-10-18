import type { Metadata, Viewport } from 'next'
import { Jost } from 'next/font/google'
import './globals.css'

const jost = Jost({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jost',
})

export const metadata: Metadata = {
  title: 'The Inaugural Yatesville Creek Paper Boat Race',
  description:
    'Spring 2027 in Sprakers, New York: a fleet of paper boats floats down Yatesville Creek to The Root. Sign up to hear when registration opens.',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><path d='M3 18h26l-5 8H8z' fill='%23f5f1e6' stroke='%231b1b1b' stroke-width='2'/><path d='M12 18l5-13 4 13z' fill='%23e0452b' stroke='%231b1b1b' stroke-width='2'/></svg>",
  },
}

export const viewport: Viewport = {
  themeColor: '#f5f1e6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={jost.variable}>
      <body>{children}</body>
    </html>
  )
}
