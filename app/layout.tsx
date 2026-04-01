// import type { Metadata } from 'next'
// import './globals.css'

// export const metadata: Metadata = {
//   title: 'MoodSpend',
//   description: 'Understand your emotional spending patterns',
// }

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en">
//       <body>{children}</body>
//     </html>
//   )
// }

import type { Metadata } from 'next'
import { Instrument_Sans, DM_Serif_Display } from 'next/font/google'
import './globals.css'

const instrumentSans = Instrument_Sans({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Mira — Understand your emotional spending',
  description: 'Track how you feel, scan your receipts, discover patterns.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={instrumentSans.variable}>
      <body>{children}</body>
    </html>
  )
}