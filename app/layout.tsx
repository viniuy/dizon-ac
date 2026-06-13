import type { Metadata } from 'next'
import { DM_Sans, Figtree } from 'next/font/google'
import './globals.css'

// DM Sans — clean geometric, excellent readability at all sizes,
// accessibility-friendly with clear letterforms and good weight range.
const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne',   // keeps existing class references working
  display: 'swap',
})

const figtree = Figtree({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-figtree',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Dizon Aircon & Refrigeration Services | Bambang, Taguig',
  description:
    'Professional AC installation, cleaning, repair, and maintenance in Bambang, Taguig and Metro Manila. Free check-up and estimate. Call 0917 780 0051.',
  keywords: [
    'aircon repair Taguig', 'AC cleaning Bambang', 'aircon installation Metro Manila',
    'Dizon aircon', 'AC maintenance', 'refrigeration services Philippines',
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${figtree.variable}`}>
      <head>
        {/*
          No-flash theme script — runs before React hydrates.
          Reads localStorage and applies .light class so there's
          no dark→light flicker on page load.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('dac-theme');if(t==='light')document.documentElement.classList.add('light');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="bg-dac-bg text-dac-text antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  )
}
