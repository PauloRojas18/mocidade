// LOCALIZAÇÃO: app/praticas/page.tsx
import { praticas, jovens } from '@/lib/mock'
import Link from 'next/link'

const COLORS = [
  { header: '#D4537E', light: '#FBEAF0', text: '#72243E', border: '#F4C0D1' },
  { header: '#BA7517', light: '#FAEEDA', text: '#633806', border: '#FAC775' },
  { header: '#7F77DD', light: '#EEEDFE', text: '#3C3489', border: '#CECBF6' },
  { header: '#1D9E75', light: '#E1F5EE', text: '#085041', border: '#9FE1CB' },
]

export default function PraticasPage() {
  return (
    <div className="flex flex-col h-full md:h-screen overflow-hidden">
      {/* Topbar */}
      <div className="flex-shrink-0 px-4 md:px-5 py-3 bg-white border-b border-slate-200
                      flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-900">Práticas</span>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full"
          style={{ background: '#EEF2FF', color: '#4B7BF5' }}>1º sem / 2026</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 md:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {praticas.map((p, i) => {
            const color  = COLORS[i % COLORS.length]
            const alunos = jovens.filter(j => j.praticaAtual === p.nome)
            const alertas = alunos.filter(j => j.faltas >= 3)

            return (
              <div key={p.id} className="bg-white rounded-xl overflow-hidden"
                style={{ border: `0.5px solid ${color.border}` }}>
                {/* Header */}
                <div className="p-4" style={{ background: color.header }}>
                  <p className="text-sm font-semibold text-white">{p.nome}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>1º sem / 2026</p>
                  {p.descricao && (
                    <p className="text-xs mt-2 leading-relaxed"
                      style={{ color: 'rgba(255,255,255,0.75)' }}>{p.descricao}</p>
                  )}
                </div>

                {/* Body */}
                <div className="p-3.5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                      style={{ background: color.light, color: color.text }}>
                      {p.jovens.length} jovem{p.jovens.length !== 1 ? 's' : ''}
                    </span>
                    {alertas.length > 0 && (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ background: '#FCEBEB', color: '#A32D2D' }}>
                        {alertas.length} alerta{alertas.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Alunos */}
                  {alunos.length > 0 && (
                    <div className="flex flex-col gap-1">
                      {alunos.map(j => (
                        <Link key={j.id} href={`/jovens/${j.id}`}
                          className="flex items-center gap-2 py-1 rounded-lg px-1 hover:bg-slate-50 transition-colors"
                          style={{ textDecoration: 'none' }}>
                          <div className="w-5 h-5 rounded-full flex items-center justify-center
                                          text-xs font-semibold flex-shrink-0"
                            style={{
                              background: j.faltas >= 3 ? '#FCEBEB' : color.light,
                              color:      j.faltas >= 3 ? '#A32D2D' : color.text,
                              fontSize:   9,
                            }}>
                            {j.nome.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                          </div>
                          <span className="text-xs text-slate-700 truncate">{j.nome}</span>
                          {j.faltas >= 3 && (
                            <span className="text-xs ml-auto flex-shrink-0"
                              style={{ color: '#E24B4A' }}>{j.faltas}f</span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}