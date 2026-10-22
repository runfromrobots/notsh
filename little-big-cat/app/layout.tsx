import type { Metadata, Viewport } from 'next'
import { DM_Sans, Fraunces } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '600', '800', '900'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
})

export const metadata: Metadata = {
  title: 'Little Big Cat',
  description:
    'Little Big Cat is an upcoming album, with the BedLunch EP coming first. Join the mailing list to hear them when they’re out.',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 120'><path d='M28 46 L24 12 L43 31 Q50 29 57 31 L76 12 L72 46 Q77 58 66 66 Q83 78 83 98 Q83 116 66 118 L34 118 Q17 116 17 98 Q17 78 34 66 Q23 58 28 46 Z' fill='%232b2237'/><ellipse cx='40' cy='47' rx='5' ry='7' fill='%23e4a83b'/><ellipse cx='60' cy='47' rx='5' ry='7' fill='%23e4a83b'/></svg>",
  },
}

export const viewport: Viewport = {
  themeColor: '#f4ede1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={[dmSans, fraunces].map((f) => f.variable).join(' ')}>
      <body>{children}</body>
    </html>
  )
}
