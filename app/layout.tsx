// LOCALIZAÇÃO: app/layout.tsx
import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import MobileNav from '@/components/MobileNav'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = { title: 'Secretaria — Mocidade' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={geist.className} style={{ background: '#F4F6FB', minHeight: '100vh' }}>
        {/* Desktop */}
        <div className="hidden md:flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-hidden" style={{ background: '#F4F6FB' }}>
            {children}
          </main>
        </div>
        {/* Mobile */}
        <div className="md:hidden flex flex-col min-h-screen">
          <MobileNav />
          <main className="flex-1 overflow-y-auto pb-20" style={{ background: '#F4F6FB' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}