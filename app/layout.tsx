import type { Metadata } from 'next'
import { Open_Sans } from 'next/font/google'
import 'lenis/dist/lenis.css'
import './globals.css'

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-open-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Dizon Aircon & Refrigeration Services | Bambang, Taguig',
  description:
    'Professional AC installation, cleaning, repair, and maintenance in Bambang, Taguig and Metro Manila. Free check-up and estimate. Call 0945 849 0554.',
  keywords: [
    'aircon repair Taguig', 'AC cleaning Bambang', 'aircon installation Metro Manila',
    'Dizon aircon', 'AC maintenance', 'refrigeration services Philippines',
  ],
}

/*
  Runs before first paint. Adds `motion` to <html> (enables the hidden
  pre-animation states in globals.css) unless the visitor prefers reduced
  motion, and `intro` on the first visit of the session (shows the preloader).
  If the motion code hasn't booted within 4s, both are removed so content
  can never stay hidden.
*/
const MOTION_BOOT = `(function(){var d=document.documentElement;
if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
d.classList.add('motion');
try{if(!sessionStorage.getItem('dac-intro'))d.classList.add('intro')}catch(e){}
setTimeout(function(){if(!window.__dacMotionReady)d.classList.remove('motion','intro')},4000)})()`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={openSans.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: MOTION_BOOT }} />
      </head>
      <body className="min-h-dvh overflow-x-clip bg-white font-sans text-dac-ink antialiased">
        {children}
      </body>
    </html>
  )
}
