import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MoodSpend',
  description: 'Understand your emotional spending patterns',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}