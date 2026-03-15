// LOCALIZAÇÃO: app/jovens/[id]/page.tsx
import { jovens, historicoJovens } from '@/lib/mock'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Mail, Phone} from 'lucide-react'

export default function JovemPage({ params }: { params: { id: string } }) {
  const jovem = jovens.find(j => j.id === Number(params.id))
  if (!jovem) notFound()

  const historico  = historicoJovens[jovem.id]
  const initials   = jovem.nome.split(' ').map((n: string) => n[0]).slice(0, 2).join('')
  const temAlerta  = jovem.faltas >= 3
  const freqPct    = Math.round(100 - jovem.faltas * 12.5)

  return (
    <div className="flex flex-col h-full md:h-screen overflow-hidden">
      {/* Topbar */}
      <div className="flex-shrink-0 px-4 md:px-5 py-3 bg-white border-b border-slate-200
                      flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-900">Jovens cadastrados</span>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full"
          style={{ background: '#EEF2FF', color: '#4B7BF5' }}>1º sem / 2025</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar da lista — desktop */}
        <div className="hidden lg:flex flex-col w-52 xl:w-60 border-r border-slate-200
                        flex-shrink-0 overflow-hidden" style={{ background: '#F8FAFC' }}>
          <div className="px-3 pt-3 pb-2 flex-shrink-0">
            <Link href="/jovens" className="text-xs font-medium flex items-center gap-1"
              style={{ color: '#4B7BF5', textDecoration: 'none' }}>
              ← Todos os jovens
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-3 flex flex-col gap-1">
            {jovens.map(j => (
              <Link key={j.id} href={`/jovens/${j.id}`} style={{ textDecoration: 'none' }}>
                <div className="rounded-lg p-2.5 transition-colors"
                  style={{
                    background:  j.id === jovem.id ? '#EEF2FF' : '#fff',
                    border:      j.id === jovem.id ? '0.5px solid #4B7BF5' : '0.5px solid #E2E8F0',
                  }}>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center
                                    text-xs font-semibold flex-shrink-0"
                      style={{
                        background: j.faltas >= 3 ? '#FCEBEB' : '#EEF2FF',
                        color:      j.faltas >= 3 ? '#A32D2D' : '#4B7BF5',
                      }}>
                      {j.nome.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-800 truncate">{j.nome}</p>
                      <p className="truncate" style={{ fontSize: 10, color: '#94A3B8' }}>{j.cursoAtual}</p>
                    </div>
                    {j.faltas >= 3 && (
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 ml-auto"
                        style={{ background: '#E24B4A' }} />
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Painel principal */}
        <div className="flex-1 overflow-y-auto">
          {/* Voltar mobile */}
          <div className="lg:hidden px-4 pt-4 flex-shrink-0">
            <Link href="/jovens" className="text-xs font-medium"
              style={{ color: '#4B7BF5', textDecoration: 'none' }}>← Voltar</Link>
          </div>

          <div className="p-4 md:p-5 max-w-2xl">
            {/* Header do jovem */}
            <div className="rounded-xl p-4 md:p-5 mb-4"
              style={{
                background: temAlerta ? '#FFF5F5' : '#F0F4FF',
                border:     temAlerta ? '0.5px solid #F7C1C1' : '0.5px solid #B5D4F4',
              }}>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center
                                text-sm font-bold flex-shrink-0"
                  style={{
                    background: temAlerta ? '#FCEBEB' : '#EEF2FF',
                    color:      temAlerta ? '#A32D2D' : '#4B7BF5',
                  }}>
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-base font-semibold text-slate-900 truncate">{jovem.nome}</h1>
                  <p className="text-xs text-slate-500 mt-0.5">Mocidade desde {jovem.anoEntrada}</p>

                  <div className="flex flex-wrap gap-3 mt-2.5">
                    {jovem.email && (
                      <a href={`mailto:${jovem.email}`}
                        className="flex items-center gap-1.5 text-xs"
                        style={{ color: '#4B7BF5', textDecoration: 'none' }}>
                        <Mail size={11} />{jovem.email}
                      </a>
                    )}
                    {jovem.telefone && (
                      <span className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Phone size={11} />{jovem.telefone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Frequência */}
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-semibold"
                    style={{ color: temAlerta ? '#E24B4A' : '#1D9E75' }}>{freqPct}%</p>
                  <p className="text-xs text-slate-400">frequência</p>
                </div>
              </div>

              {temAlerta && (
                <div className="mt-3 px-3 py-2.5 rounded-lg"
                  style={{ background: '#FCEBEB', border: '0.5px solid #F7C1C1' }}>
                  <p className="text-xs font-semibold" style={{ color: '#A32D2D' }}>
                    Índice de faltas alto — {jovem.faltas} falta{jovem.faltas > 1 ? 's' : ''} este semestre
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#793F3F' }}>
                    Considere entrar em contato com {jovem.nome.split(' ')[0]}.
                  </p>
                </div>
              )}
            </div>

            {/* Grade de cursos e práticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              {/* Cursos */}
              <div className="bg-white rounded-xl overflow-hidden" style={{ border: '0.5px solid #E2E8F0' }}>
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Histórico de cursos
                  </p>
                </div>
                {historico.cursos.map((c, i) => {
                  const pct     = Math.round((c.presencas / c.totalAulas) * 100)
                  const emRisco = c.faltas >= 3
                  return (
                    <div key={i} className="px-4 py-2.5"
                      style={{ borderBottom: i < historico.cursos.length - 1 ? '0.5px solid #F8FAFC' : 'none' }}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-800 truncate">{c.nome}</p>
                          <p className="text-xs text-slate-400">{c.semestre}</p>
                        </div>
                        <span className="text-xs flex-shrink-0 px-2 py-0.5 rounded-full font-medium"
                          style={{
                            background: emRisco ? '#FCEBEB' : '#EAF3DE',
                            color:      emRisco ? '#A32D2D' : '#2D6A0F',
                          }}>
                          {emRisco ? 'em risco' : 'concluído'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
                          <div className="h-full rounded-full"
                            style={{ background: emRisco ? '#E24B4A' : '#1D9E75', width: `${pct}%` }} />
                        </div>
                        <span className="text-xs flex-shrink-0" style={{ color: emRisco ? '#E24B4A' : '#1D9E75' }}>
                          {c.presencas}/{c.totalAulas}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Práticas */}
              <div className="bg-white rounded-xl overflow-hidden" style={{ border: '0.5px solid #E2E8F0' }}>
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Práticas</p>
                </div>
                {historico.praticas.map((p, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2.5"
                    style={{ borderBottom: i < historico.praticas.length - 1 ? '0.5px solid #F8FAFC' : 'none' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#4B7BF5' }} />
                      <p className="text-xs font-medium text-slate-800">{p.nome}</p>
                    </div>
                    <p className="text-xs text-slate-400 flex-shrink-0 ml-2">{p.semestre}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-2">
              {jovem.email && (
                <a href={`mailto:${jovem.email}`}
                  className="flex-1 text-center text-xs font-medium py-2.5 rounded-xl transition-colors hover:opacity-90"
                  style={{ background: '#EEF2FF', color: '#4B7BF5', textDecoration: 'none',
                           border: '0.5px solid #B5D4F4' }}>
                  Enviar e-mail
                </a>
              )}
              <Link href="/relatorios"
                className="flex-1 text-center text-xs font-medium py-2.5 rounded-xl transition-colors hover:opacity-90"
                style={{ background: '#F8FAFC', color: '#64748B', textDecoration: 'none',
                         border: '0.5px solid #E2E8F0' }}>
                Ver relatórios
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}