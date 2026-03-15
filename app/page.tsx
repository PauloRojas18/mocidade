// LOCALIZAÇÃO: app/page.tsx
import { jovens, cursos, praticas, aulasIniciais } from '@/lib/mock'
import Link from 'next/link'

export default function DashboardPage() {
  const alertas     = jovens.filter(j => j.faltas >= 3)
  const semFaltas   = jovens.filter(j => j.faltas === 0)
  const mediaFaltas = +(jovens.reduce((a, j) => a + j.faltas, 0) / jovens.length).toFixed(1)
  const aulaHoje    = aulasIniciais.length

  const stats = [
    { label: 'Jovens ativos',    value: jovens.length,   color: '#4B7BF5', bg: '#EEF2FF'  },
    { label: 'Cursos ativos',    value: cursos.length,   color: '#7F77DD', bg: '#EEEDFE'  },
    { label: 'Práticas ativas',  value: praticas.length, color: '#1D9E75', bg: '#E1F5EE'  },
    { label: 'Alertas de falta', value: alertas.length,  color: '#E24B4A', bg: '#FCEBEB'  },
  ]

  // Frequência média por curso (mock)
  const freqCursos = [
    { nome: 'TESTE1',    pct: 92 },
    { nome: 'TESTE2', pct: 64 },
    { nome: 'TESTE3',    pct: 71 },
    { nome: 'TESTE4',      pct: 58 },
  ]

  return (
    <div className="flex flex-col h-full md:h-screen overflow-hidden">
      {/* Topbar */}
      <div className="flex-shrink-0 px-5 md:px-6 py-3 bg-white border-b border-slate-200 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-slate-900">Dashboard</h1>
          <p className="text-xs text-slate-400 mt-0.5">1º semestre / 2026</p>
        </div>
        <Link href="/frequencia"
          className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors hover:opacity-90"
          style={{ background: '#4B7BF5', color: '#fff' }}>
          + Marcar chamada
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {stats.map((s, i) => (
            <div key={s.label} className="bg-white rounded-xl p-4"
              style={{ border: '0.5px solid #E2E8F0' }}>
              <div className="w-7 h-0.5 rounded-full mb-3" style={{ background: s.color }} />
              <p className="text-2xl font-semibold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Segunda linha: mini-stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-white rounded-xl p-4" style={{ border: '0.5px solid #E2E8F0' }}>
            <p className="text-xs text-slate-400 mb-1">Frequência plena</p>
            <p className="text-xl font-semibold" style={{ color: '#1D9E75' }}>{semFaltas.length}</p>
            <p className="text-xs text-slate-400 mt-1">sem nenhuma falta</p>
          </div>
          <div className="bg-white rounded-xl p-4" style={{ border: '0.5px solid #E2E8F0' }}>
            <p className="text-xs text-slate-400 mb-1">Média de faltas</p>
            <p className="text-xl font-semibold text-slate-900">{mediaFaltas}</p>
            <p className="text-xs text-slate-400 mt-1">por jovem</p>
          </div>
          <div className="bg-white rounded-xl p-4" style={{ border: '0.5px solid #E2E8F0' }}>
            <p className="text-xs text-slate-400 mb-1">Aulas registradas</p>
            <p className="text-xl font-semibold text-slate-900">{aulaHoje}</p>
            <p className="text-xs text-slate-400 mt-1">este semestre</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Frequência por curso */}
          <div className="lg:col-span-1 bg-white rounded-xl overflow-hidden" style={{ border: '0.5px solid #E2E8F0' }}>
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-800">Frequência por curso</p>
              <Link href="/relatorios" className="text-xs" style={{ color: '#4B7BF5' }}>Ver mais</Link>
            </div>
            <div className="p-4 flex flex-col gap-4">
              {freqCursos.map(c => (
                <div key={c.nome}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-slate-700 truncate mr-2" style={{ maxWidth: '75%' }}>{c.nome}</span>
                    <span className="text-xs font-semibold flex-shrink-0"
                      style={{ color: c.pct >= 75 ? '#1D9E75' : '#E24B4A' }}>{c.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
                    <div className="h-full rounded-full transition-all"
                      style={{ background: c.pct >= 75 ? '#1D9E75' : '#E24B4A', width: `${c.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alertas de falta */}
          <div className="lg:col-span-1 bg-white rounded-xl overflow-hidden" style={{ border: '0.5px solid #E2E8F0' }}>
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-800">Alertas de falta</p>
              {alertas.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: '#FCEBEB', color: '#A32D2D' }}>{alertas.length}</span>
              )}
            </div>
            {alertas.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-xs text-slate-400">Nenhum alerta no momento 🎉</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {alertas.map(j => (
                  <Link key={j.id} href={`/jovens/${j.id}`}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                        style={{ background: '#FCEBEB', color: '#A32D2D' }}>
                        {j.nome.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-800 truncate">{j.nome}</p>
                        <p className="text-xs text-slate-400 truncate">{j.cursoAtual}</p>
                      </div>
                    </div>
                    <span className="text-xs flex-shrink-0 ml-2 px-2 py-0.5 rounded-full font-medium"
                      style={{ background: '#FCEBEB', color: '#A32D2D' }}>
                      {j.faltas} falta{j.faltas > 1 ? 's' : ''}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Cursos rápido */}
          <div className="lg:col-span-1 bg-white rounded-xl overflow-hidden" style={{ border: '0.5px solid #E2E8F0' }}>
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-800">Cursos deste semestre</p>
              <Link href="/cursos" className="text-xs" style={{ color: '#4B7BF5' }}>Ver todos</Link>
            </div>
            <div className="divide-y divide-slate-100">
              {cursos.map((c, i) => {
                const colors = ['#4B7BF5', '#7F77DD', '#1D9E75', '#BA7517']
                return (
                  <div key={c.id} className="flex items-center gap-3 px-4 py-2.5">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: colors[i % colors.length] }} />
                    <p className="text-xs text-slate-700 flex-1 truncate">{c.nome}</p>
                    <span className="text-xs text-slate-400 flex-shrink-0">{c.matriculados}</span>
                  </div>
                )
              })}
            </div>
            {/* Práticas */}
            <div className="px-4 py-3 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-800 mb-2">Práticas</p>
              {praticas.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 py-1.5">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: i === 0 ? '#D4537E' : '#BA7517' }} />
                  <p className="text-xs text-slate-700 flex-1 truncate">{p.nome}</p>
                  <span className="text-xs text-slate-400 flex-shrink-0">{p.jovens.length}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}