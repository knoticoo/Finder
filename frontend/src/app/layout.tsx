import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VisiPakalpojumi - Visi Pakalpojumi Latvijā',
  description: 'Atrodiet uzticamus pakalpojumu sniedzējus Latvijā - tīrīšana, remonts, mācības un daudz kas cits.',
  keywords: 'pakalpojumi, Latvija, tīrīšana, remonts, mācības, handyman, services',
  authors: [{ name: 'VisiPakalpojumi Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'VisiPakalpojumi - Visi Pakalpojumi Latvijā',
    description: 'Atrodiet uzticamus pakalpojumu sniedzējus Latvijā',
    type: 'website',
    locale: 'lv_LV',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="lv" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
