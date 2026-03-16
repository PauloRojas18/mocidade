'use client'
// LOCALIZAÇÃO: app/page.tsx

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Jovem   = { id: number; nome: string; curso_atual: string | null }
type Curso   = { id: number; nome: string; matriculados: number }
type Pratica = { id: number; nome: string; pratica_membros?: { jovem_id: number }[] }
type PresRow = { jovem_id: number; presente: boolean; aulas: { curso_nome: string } | null }

export default function DashboardPage() {
  const [jovens,    setJovens]    = useState<Jovem[]>([])
  const [cursos,    setCursos]    = useState<Curso[]>([])
  const [praticas,  setPraticas]  = useState<Pratica[]>([])
  const [presencas, setPresencas] = useState<PresRow[]>([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/jovens').then(r => r.json()),
      fetch('/api/cursos').then(r => r.json()),
      fetch('/api/praticas').then(r => r.json()),
      fetch('/api/presencas/todas').then(r => r.ok ? r.json() : []),
    ]).then(([j, c, p, pr]) => {
      setJovens(Array.isArray(j) ? j : [])
      setCursos(Array.isArray(c) ? c : [])
      setPraticas(Array.isArray(p) ? p : [])
      setPresencas(Array.isArray(pr) ? pr : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-full p-10">
      <p className="text-sm text-slate-400">Carregando...</p>
    </div>
  )

  // Faltas por jovem
  const faltasPorJovem: Record<number, number> = {}
  const aulasPorJovem:  Record<number, number> = {}
  presencas.forEach(p => {
    const id = p.jovem_id
    aulasPorJovem[id]  = (aulasPorJovem[id]  ?? 0) + 1
    if (!p.presente) faltasPorJovem[id] = (faltasPorJovem[id] ?? 0) + 1
  })

  const alertas   = jovens.filter(j => (faltasPorJovem[j.id] ?? 0) >= 3)
  const semFaltas = jovens.filter(j => (aulasPorJovem[j.id] ?? 0) > 0 && (faltasPorJovem[j.id] ?? 0) === 0)

  // Frequência por curso
  const freqMap: Record<string, { t: number; p: number }> = {}
  presencas.forEach(p => {
    const n = p.aulas?.curso_nome; if (!n) return
    if (!freqMap[n]) freqMap[n] = { t: 0, p: 0 }
    freqMap[n].t++
    if (p.presente) freqMap[n].p++
  })
  const freqCursos = cursos
    .map(c => ({ nome: c.nome, pct: freqMap[c.nome] ? Math.round((freqMap[c.nome].p / freqMap[c.nome].t) * 100) : null }))
    .filter(c => c.pct !== null)

  const totalMembros = praticas.reduce((a, p) => a + (p.pratica_membros?.length ?? 0), 0)
  const CURSO_COLORS   = ['#4B7BF5', '#7F77DD', '#1D9E75', '#BA7517']
  const PRATICA_COLORS = ['#D4537E', '#BA7517']

  return (
    <div className="flex flex-col h-full md:h-screen overflow-hidden">
      <div className="flex-shrink-0 px-5 md:px-6 py-3 bg-white border-b border-slate-200 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-slate-900">Dashboard</h1>
          <p className="text-xs text-slate-400 mt-0.5">1º semestre / </p>
        </div>
        <Link href="/frequencia" className="text-xs font-medium px-3 py-1.5 rounded-lg hover:opacity-90"
          style={{ background: '#4B7BF5', color: '#fff' }}>
          + Marcar chamada
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">

        {/* Stats principais */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Jovens ativos',    value: jovens.length,   color: '#4B7BF5' },
            { label: 'Cursos ativos',    value: cursos.length,   color: '#7F77DD' },
            { label: 'Práticas ativas',  value: praticas.length, color: '#1D9E75' },
            { label: 'Alertas de falta', value: alertas.length,  color: '#E24B4A' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-4" style={{ border: '0.5px solid #E2E8F0' }}>
              <div className="w-7 h-0.5 rounded-full mb-3" style={{ background: s.color }} />
              <p className="text-2xl font-semibold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-white rounded-xl p-4" style={{ border: '0.5px solid #E2E8F0' }}>
            <p className="text-xs text-slate-400 mb-1">Frequência plena</p>
            <p className="text-xl font-semibold" style={{ color: '#1D9E75' }}>{semFaltas.length}</p>
            <p className="text-xs text-slate-400 mt-1">sem nenhuma falta</p>
          </div>
          <div className="bg-white rounded-xl p-4" style={{ border: '0.5px solid #E2E8F0' }}>
            <p className="text-xs text-slate-400 mb-1">Membros nas práticas</p>
            <p className="text-xl font-semibold text-slate-900">{totalMembros}</p>
            <p className="text-xs text-slate-400 mt-1">total</p>
          </div>
          <div className="bg-white rounded-xl p-4" style={{ border: '0.5px solid #E2E8F0' }}>
            <p className="text-xs text-slate-400 mb-1">Com alertas</p>
            <p className="text-xl font-semibold" style={{ color: '#E24B4A' }}>{alertas.length}</p>
            <p className="text-xs text-slate-400 mt-1">≥ 3 faltas</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Frequência por curso */}
          <div className="bg-white rounded-xl overflow-hidden" style={{ border: '0.5px solid #E2E8F0' }}>
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-800">Frequência por curso</p>
              <Link href="/relatorios" className="text-xs" style={{ color: '#4B7BF5' }}>Ver mais</Link>
            </div>
            {freqCursos.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-xs text-slate-400">Nenhuma chamada registrada ainda</p>
              </div>
            ) : (
              <div className="p-4 flex flex-col gap-4">
                {freqCursos.map(c => (
                  <div key={c.nome}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs text-slate-700 truncate mr-2" style={{ maxWidth: '75%' }}>{c.nome}</span>
                      <span className="text-xs font-semibold flex-shrink-0"
                        style={{ color: (c.pct ?? 0) >= 75 ? '#1D9E75' : '#E24B4A' }}>{c.pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
                      <div className="h-full rounded-full transition-all"
                        style={{ background: (c.pct ?? 0) >= 75 ? '#1D9E75' : '#E24B4A', width: `${c.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Alertas de falta */}
          <div className="bg-white rounded-xl overflow-hidden" style={{ border: '0.5px solid #E2E8F0' }}>
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
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors"
                    style={{ textDecoration: 'none' }}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                        style={{ background: '#FCEBEB', color: '#A32D2D' }}>
                        {j.nome.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-800 truncate">{j.nome}</p>
                        <p className="text-xs text-slate-400 truncate">{j.curso_atual ?? '—'}</p>
                      </div>
                    </div>
                    <span className="text-xs flex-shrink-0 ml-2 px-2 py-0.5 rounded-full font-medium"
                      style={{ background: '#FCEBEB', color: '#A32D2D' }}>
                      {faltasPorJovem[j.id]} falta{(faltasPorJovem[j.id] ?? 0) > 1 ? 's' : ''}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Cursos + Práticas */}
          <div className="bg-white rounded-xl overflow-hidden" style={{ border: '0.5px solid #E2E8F0' }}>
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-800">Cursos deste semestre</p>
              <Link href="/cursos" className="text-xs" style={{ color: '#4B7BF5' }}>Ver todos</Link>
            </div>
            {cursos.length === 0 ? (
              <div className="px-4 py-4 text-center">
                <p className="text-xs text-slate-400">Nenhum curso ainda</p>
                <Link href="/cursos" className="text-xs mt-1 inline-block font-medium" style={{ color: '#4B7BF5' }}>Criar →</Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {cursos.map((c, i) => (
                  <div key={c.id} className="flex items-center gap-3 px-4 py-2.5">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: CURSO_COLORS[i % CURSO_COLORS.length] }} />
                    <p className="text-xs text-slate-700 flex-1 truncate">{c.nome}</p>
                    <span className="text-xs text-slate-400 flex-shrink-0">{c.matriculados}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="px-4 py-3 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-800 mb-2">Práticas</p>
              {praticas.length === 0 ? (
                <p className="text-xs text-slate-400">Nenhuma prática ainda</p>
              ) : (
                praticas.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3 py-1.5">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: PRATICA_COLORS[i % PRATICA_COLORS.length] }} />
                    <p className="text-xs text-slate-700 flex-1 truncate">{p.nome}</p>
                    <span className="text-xs text-slate-400 flex-shrink-0">{p.pratica_membros?.length ?? 0}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}