import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers/Providers'
import ServiceWorkerRegistration from '@/components/pwa/ServiceWorkerRegistration'
import PWAInstall from '@/components/pwa/PWAInstall'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VisiPakalpojumi - Visi Pakalpojumi Latvijā',
  description: 'Atrodiet uzticamus pakalpojumu sniedzējus Latvijā - tīrīšana, remonts, mācības un daudz kas cits.',
  keywords: 'pakalpojumi, Latvija, tīrīšana, remonts, mācības, handyman, services',
  authors: [{ name: 'VisiPakalpojumi Team' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  robots: 'index, follow',
  themeColor: '#2563eb',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'VisiPakalpojumi',
  },
  openGraph: {
    title: 'VisiPakalpojumi - Visi Pakalpojumi Latvijā',
    description: 'Atrodiet uzticamus pakalpojumu sniedzējus Latvijā',
    type: 'website',
    locale: 'lv_LV',
    url: 'https://visipakalpojumi.lv',
    siteName: 'VisiPakalpojumi',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VisiPakalpojumi - Visi Pakalpojumi Latvijā',
    description: 'Atrodiet uzticamus pakalpojumu sniedzējus Latvijā',
  },
  icons: {
    icon: [
      { url: '/icons/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="lv" className="h-full">
      <head>
        <meta name="application-name" content="VisiPakalpojumi" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="VisiPakalpojumi" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#2563eb" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} h-full bg-gray-50 antialiased`}>
        <Providers>
          {children}
          <ServiceWorkerRegistration />
          <PWAInstall />
        </Providers>
      </body>
    </html>
  )
}
