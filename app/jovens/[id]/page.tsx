'use client'
// LOCALIZAÇÃO: app/jovens/[id]/page.tsx

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Mail, Phone } from 'lucide-react'

type Jovem = {
  id: number; nome: string; email: string | null; telefone: string | null
  ano_entrada: number; curso_atual: string | null; pratica_atual: string | null
}
type TodosJovens  = { id: number; nome: string; curso_atual: string | null }
type PresencaAula = { id: number; presente: boolean; aulas: { id: number; curso_nome: string; data: string; descricao: string } | null }
type ChamadaDiaItem = { id: number; presente: boolean; data: string }

export default function JovemPage() {
  const params = useParams()
  const id = params?.id as string

  const [jovem,         setJovem]         = useState<Jovem | null>(null)
  const [todosJovens,   setTodosJovens]   = useState<TodosJovens[]>([])
  const [presencas,     setPresencas]     = useState<PresencaAula[]>([])
  const [chamadaDia,    setChamadaDia]    = useState<ChamadaDiaItem[]>([])
  const [loading,       setLoading]       = useState(true)
  const [naoEncontrado, setNaoEncontrado] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([
      fetch(`/api/jovens/${id}`).then(r => r.ok ? r.json() : null),
      fetch('/api/jovens').then(r => r.json()),
      fetch(`/api/presencas/jovem?jovemId=${id}`).then(r => r.ok ? r.json() : { aulas: [], chamadaDia: [] }),
    ]).then(([j, todos, presData]) => {
      if (!j) { setNaoEncontrado(true); setLoading(false); return }
      setJovem(j)
      setTodosJovens(Array.isArray(todos) ? todos : [])
      // suporta tanto o formato antigo (array) quanto o novo ({ aulas, chamadaDia })
      if (Array.isArray(presData)) {
        setPresencas(presData)
        setChamadaDia([])
      } else {
        setPresencas(Array.isArray(presData.aulas) ? presData.aulas : [])
        setChamadaDia(Array.isArray(presData.chamadaDia) ? presData.chamadaDia : [])
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex items-center justify-center h-full p-10"><p className="text-sm text-slate-400">Carregando...</p></div>
  if (naoEncontrado || !jovem) return (
    <div className="flex flex-col items-center justify-center h-full p-10 gap-3">
      <p className="text-sm text-slate-500">Jovem não encontrado</p>
      <Link href="/jovens" className="text-xs" style={{ color: '#4B7BF5' }}>← Voltar</Link>
    </div>
  )

  const initials   = jovem.nome.split(' ').map((n: string) => n[0]).slice(0, 2).join('')
  const totalAulas = presencas.length
  const presentes  = presencas.filter(p => p.presente).length
  const freqPct    = totalAulas > 0 ? Math.round((presentes / totalAulas) * 100) : 100
  const temAlerta  = totalAulas > 0 && freqPct < 75

  // Agrupa por curso/prática (ambos vão para presencas → aulas)
  const porCurso: Record<string, { nome: string; total: number; presentes: number; tipo: 'curso' | 'pratica' }> = {}
  presencas.forEach(p => {
    if (!p.aulas) return
    const nome = p.aulas.curso_nome
    const tipo: 'curso' | 'pratica' = p.aulas.descricao === 'Chamada de prática' ? 'pratica' : 'curso'
    if (!porCurso[nome + tipo]) porCurso[nome + tipo] = { nome, total: 0, presentes: 0, tipo }
    porCurso[nome + tipo].total++
    if (p.presente) porCurso[nome + tipo].presentes++
  })

  // Stats chamada do dia
  const totalDia     = chamadaDia.length
  const presentesDia = chamadaDia.filter(c => c.presente).length
  const freqDiaPct   = totalDia > 0 ? Math.round((presentesDia / totalDia) * 100) : null

  return (
    <div className="flex flex-col h-full md:h-screen overflow-hidden">
      <div className="flex-shrink-0 px-4 md:px-5 py-3 bg-white border-b border-slate-200 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-900">Jovens cadastrados</span>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: '#EEF2FF', color: '#4B7BF5' }}>1º sem / 2026</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar desktop */}
        <div className="hidden lg:flex flex-col w-52 xl:w-60 border-r border-slate-200 flex-shrink-0 overflow-hidden" style={{ background: '#F8FAFC' }}>
          <div className="px-3 pt-3 pb-2 flex-shrink-0">
            <Link href="/jovens" className="text-xs font-medium" style={{ color: '#4B7BF5', textDecoration: 'none' }}>← Todos os jovens</Link>
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-3 flex flex-col gap-1">
            {todosJovens.map(j => (
              <Link key={j.id} href={`/jovens/${j.id}`} style={{ textDecoration: 'none' }}>
                <div className="rounded-lg p-2.5 transition-colors"
                  style={{ background: j.id === jovem.id ? '#EEF2FF' : '#fff', border: j.id === jovem.id ? '0.5px solid #4B7BF5' : '0.5px solid #E2E8F0' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                      style={{ background: '#EEF2FF', color: '#4B7BF5' }}>
                      {j.nome.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-800 truncate">{j.nome}</p>
                      <p className="truncate" style={{ fontSize: 10, color: '#94A3B8' }}>{j.curso_atual ?? '—'}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="lg:hidden px-4 pt-4">
            <Link href="/jovens" className="text-xs font-medium" style={{ color: '#4B7BF5', textDecoration: 'none' }}>← Voltar</Link>
          </div>

          <div className="p-4 md:p-5 max-w-2xl">

            {/* Header do jovem */}
            <div className="rounded-xl p-4 md:p-5 mb-4"
              style={{ background: temAlerta ? '#FFF5F5' : '#F0F4FF', border: temAlerta ? '0.5px solid #F7C1C1' : '0.5px solid #B5D4F4' }}>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: temAlerta ? '#FCEBEB' : '#EEF2FF', color: temAlerta ? '#A32D2D' : '#4B7BF5' }}>
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-base font-semibold text-slate-900 truncate">{jovem.nome}</h1>
                  <p className="text-xs text-slate-500 mt-0.5">Mocidade desde {jovem.ano_entrada}</p>
                  <div className="flex flex-wrap gap-3 mt-2.5">
                    {jovem.email && (
                      <a href={`mailto:${jovem.email}`} className="flex items-center gap-1.5 text-xs" style={{ color: '#4B7BF5', textDecoration: 'none' }}>
                        <Mail size={11} />{jovem.email}
                      </a>
                    )}
                    {jovem.telefone && (
                      <span className="flex items-center gap-1.5 text-xs text-slate-500"><Phone size={11} />{jovem.telefone}</span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-semibold" style={{ color: temAlerta ? '#E24B4A' : '#1D9E75' }}>{freqPct}%</p>
                  <p className="text-xs text-slate-400">frequência</p>
                </div>
              </div>
              {temAlerta && (
                <div className="mt-3 px-3 py-2.5 rounded-lg" style={{ background: '#FCEBEB', border: '0.5px solid #F7C1C1' }}>
                  <p className="text-xs font-semibold" style={{ color: '#A32D2D' }}>Índice de frequência baixo — {presentes}/{totalAulas} aulas</p>
                  <p className="text-xs mt-0.5" style={{ color: '#793F3F' }}>Considere entrar em contato com {jovem.nome.split(' ')[0]}.</p>
                </div>
              )}
            </div>

            {/* Curso e prática */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white rounded-xl p-3.5" style={{ border: '0.5px solid #E2E8F0' }}>
                <p className="text-xs text-slate-400 mb-1">Curso atual</p>
                <p className="text-sm font-medium text-slate-800">{jovem.curso_atual ?? '—'}</p>
              </div>
              <div className="bg-white rounded-xl p-3.5" style={{ border: '0.5px solid #E2E8F0' }}>
                <p className="text-xs text-slate-400 mb-1">Prática atual</p>
                <p className="text-sm font-medium text-slate-800">{jovem.pratica_atual ?? '—'}</p>
              </div>
            </div>

            {/* Histórico de presenças em aulas (cursos + práticas) */}
            <div className="bg-white rounded-xl overflow-hidden mb-4" style={{ border: '0.5px solid #E2E8F0' }}>
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Presenças em aulas</p>
                {totalAulas > 0 && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ background: temAlerta ? '#FCEBEB' : '#E1F5EE', color: temAlerta ? '#A32D2D' : '#085041' }}>
                    {freqPct}%
                  </span>
                )}
              </div>
              {Object.values(porCurso).length === 0 ? (
                <div className="px-4 py-6 text-center"><p className="text-xs text-slate-400">Nenhuma chamada registrada ainda</p></div>
              ) : (
                Object.values(porCurso).map((c, i) => {
                  const pct = Math.round((c.presentes / c.total) * 100)
                  return (
                    <div key={c.nome + c.tipo} className="px-4 py-2.5"
                      style={{ borderBottom: i < Object.values(porCurso).length - 1 ? '0.5px solid #F8FAFC' : 'none' }}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-medium text-slate-800 truncate">{c.nome}</p>
                            <span className="text-xs px-1.5 py-0.5 rounded flex-shrink-0"
                              style={{ background: c.tipo === 'pratica' ? '#FBEAF0' : '#EEF2FF', color: c.tipo === 'pratica' ? '#D4537E' : '#4B7BF5', fontSize: 10 }}>
                              {c.tipo === 'pratica' ? 'prática' : 'curso'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{c.total} chamada{c.total !== 1 ? 's' : ''}</p>
                        </div>
                        <span className="text-xs flex-shrink-0 px-2 py-0.5 rounded-full font-medium"
                          style={{ background: pct < 75 ? '#FCEBEB' : '#EAF3DE', color: pct < 75 ? '#A32D2D' : '#2D6A0F' }}>
                          {pct < 75 ? 'em risco' : 'ok'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
                          <div className="h-full rounded-full" style={{ background: pct < 75 ? '#E24B4A' : '#1D9E75', width: `${pct}%` }} />
                        </div>
                        <span className="text-xs flex-shrink-0" style={{ color: pct < 75 ? '#E24B4A' : '#1D9E75' }}>{c.presentes}/{c.total}</span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Histórico chamada do dia */}
            <div className="bg-white rounded-xl overflow-hidden mb-4" style={{ border: '0.5px solid #E2E8F0' }}>
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Chamada do dia</p>
                {freqDiaPct !== null && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ background: freqDiaPct < 75 ? '#FCEBEB' : '#E1F5EE', color: freqDiaPct < 75 ? '#A32D2D' : '#085041' }}>
                    {presentesDia}/{totalDia} dias
                  </span>
                )}
              </div>
              {chamadaDia.length === 0 ? (
                <div className="px-4 py-6 text-center"><p className="text-xs text-slate-400">Nenhum registro de chamada do dia</p></div>
              ) : (
                <div className="divide-y divide-slate-50 overflow-y-auto" style={{ maxHeight: 200 }}>
                  {chamadaDia.map(c => (
                    <div key={c.id} className="flex items-center justify-between px-4 py-2.5">
                      <p className="text-xs text-slate-700">
                        {new Date(c.data + 'T00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </p>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ background: c.presente ? '#E1F5EE' : '#F1F5F9', color: c.presente ? '#085041' : '#94A3B8' }}>
                        {c.presente ? 'Presente' : 'Ausente'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ações */}
            <div className="flex gap-2">
              {jovem.email && (
                <a href={`mailto:${jovem.email}`}
                  className="flex-1 text-center text-xs font-medium py-2.5 rounded-xl hover:opacity-90"
                  style={{ background: '#EEF2FF', color: '#4B7BF5', textDecoration: 'none', border: '0.5px solid #B5D4F4' }}>
                  Enviar e-mail
                </a>
              )}
              <Link href="/relatorios"
                className="flex-1 text-center text-xs font-medium py-2.5 rounded-xl hover:opacity-90"
                style={{ background: '#F8FAFC', color: '#64748B', textDecoration: 'none', border: '0.5px solid #E2E8F0' }}>
                Ver relatórios
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}