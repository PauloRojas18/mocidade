// LOCALIZAÇÃO: components/MobileNav.tsx
'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, CalendarCheck, BookOpen, MapPin, FileBarChart2 } from 'lucide-react'

const links = [
  { href: '/',           label: 'Início',    icon: LayoutDashboard },
  { href: '/jovens',     label: 'Jovens',     icon: Users           },
  { href: '/frequencia', label: 'Chamada',    icon: CalendarCheck   },
  { href: '/cursos',     label: 'Cursos',     icon: BookOpen        },
  { href: '/praticas',   label: 'Práticas',   icon: MapPin          },
  { href: '/relatorios', label: 'Relatórios', icon: FileBarChart2   },
]

export default function MobileNav() {
  const path = usePathname()
  return (
    <>
      {/* Header mobile */}
      <div className="flex items-center justify-between px-4 py-3 sticky top-0 z-10"
        style={{ background: '#1E2028', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2.5">
          <div
            className="flex-shrink-0 flex items-center justify-center rounded-lg overflow-hidden"
            style={{ width: 28, height: 28, background: '#ffffff' }}
          >
            <Image
              src="/logo.png"
              alt="Logo Mocidade"
              width={24}
              height={24}
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
        </div>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(75,123,245,0.2)', color: '#7FA4F8', fontSize: 10 }}>
          1º sem / 2026
        </span>
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-10 flex"
        style={{ background: '#1E2028', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? path === '/' : path.startsWith(href)
          return (
            <Link key={href} href={href}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5"
              style={{ color: active ? '#4B7BF5' : 'rgba(255,255,255,0.35)' }}>
              <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
              <span style={{ fontSize: 9, fontWeight: active ? 600 : 400 }}>{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}