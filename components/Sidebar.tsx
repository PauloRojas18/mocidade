// LOCALIZAÇÃO: components/Sidebar.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, CalendarCheck, BookOpen, MapPin, LayoutDashboard, FileBarChart2 } from 'lucide-react'
import clsx from 'clsx'

const links = [
  { href: '/',           label: 'Inicio',  icon: LayoutDashboard },
  { href: '/jovens',     label: 'Jovens',      icon: Users           },
  { href: '/frequencia', label: 'Chamada',  icon: CalendarCheck   },
  { href: '/cursos',     label: 'Cursos',      icon: BookOpen        },
  { href: '/praticas',   label: 'Práticas',    icon: MapPin          },
  { href: '/relatorios', label: 'Relatórios',  icon: FileBarChart2   },
]

export default function Sidebar() {
  const path = usePathname()
  return (
    <aside className="w-48 flex-shrink-0 flex flex-col" style={{ background: '#1E2028' }}>
      {/* Logo */}
      <div className="px-4 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center font-semibold text-xs text-white flex-shrink-0"
            style={{ background: '#4B7BF5' }}>M</div>
          <div>
            <p className="text-xs font-semibold text-white leading-tight">Mocidade</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10 }}>Secretaria</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? path === '/' : path.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all',
                active ? 'text-white' : 'hover:text-white'
              )}
              style={active
                ? { background: '#4B7BF5' }
                : { color: 'rgba(255,255,255,0.45)' }
              }
            >
              <Icon size={13} strokeWidth={active ? 2.2 : 1.8} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Semestre */}
      <div className="px-2 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Semestre ativo
          </p>
          <p className="text-xs font-medium mt-0.5" style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>
            1º sem / 2026  
          </p>
        </div>
      </div>
    </aside>
  )
}