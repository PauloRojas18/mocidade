'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Jovem   = { id: number; nome: string; curso_atual: string | null }
type Curso   = { id: number; nome: string; matriculados: number }
type Pratica = { id: number; nome: string; pratica_membros?: { jovem_id: number }[] }
type PresRow = { jovem_id: number; presente: boolean; aulas: { curso_nome: string } | null }

export default function RelatoriosPage() {
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
      <p className="text-sm text-slate-400">Carregando relatórios...</p>
    </div>
  )

  // Faltas e aulas por jovem
  const faltasPorJovem: Record<number, number> = {}
  const aulasPorJovem:  Record<number, number> = {}
  presencas.forEach(p => {
    const id = p.jovem_id
    aulasPorJovem[id]  = (aulasPorJovem[id]  ?? 0) + 1
    if (!p.presente) faltasPorJovem[id] = (faltasPorJovem[id] ?? 0) + 1
  })

  const alertas    = jovens.filter(j => (faltasPorJovem[j.id] ?? 0) >= 3)
  const semFaltas  = jovens.filter(j => (aulasPorJovem[j.id] ?? 0) > 0 && (faltasPorJovem[j.id] ?? 0) === 0)
  const totalMembros = praticas.reduce((a, p) => a + (p.pratica_membros?.length ?? 0), 0)

  // Frequência por curso
  const freqMap: Record<string, { t: number; p: number }> = {}
  presencas.forEach(p => {
    const n = p.aulas?.curso_nome; if (!n) return
    if (!freqMap[n]) freqMap[n] = { t: 0, p: 0 }
    freqMap[n].t++
    if (p.presente) freqMap[n].p++
  })
  const freqCursos = cursos.map(c => ({
    id:  c.id,
    nome: c.nome,
    pct:  freqMap[c.nome] ? Math.round((freqMap[c.nome].p / freqMap[c.nome].t) * 100) : null,
  }))

  // Ranking de frequência por jovem
  const ranking = jovens
    .map(j => {
      const total     = aulasPorJovem[j.id]  ?? 0
      const faltas    = faltasPorJovem[j.id] ?? 0
      const presentes = total - faltas
      const pct = total > 0 ? Math.round((presentes / total) * 100) : 100
      return { ...j, pct, faltas }
    })
    .sort((a, b) => b.pct - a.pct)

  const exportacoes = [
    { titulo: 'Lista de jovens',     descricao: `${jovens.length} jovens cadastrados`,              href: '/api/exportar/jovens',    cor: '#4B7BF5', bg: '#EEF2FF' },
    { titulo: 'Lista por curso',      descricao: `${cursos.length} cursos`,                         href: '/api/exportar/cursos',    cor: '#1D9E75', bg: '#E1F5EE' },
    { titulo: 'Lista por prática',    descricao: `${praticas.length} práticas · ${totalMembros} jovens`, href: '/api/exportar/praticas', cor: '#D4537E', bg: '#FBEAF0' },
    { titulo: 'Chamadas registradas', descricao: 'Frequência por aluno e aula',                     href: '/api/exportar/presencas', cor: '#BA7517', bg: '#FAEEDA' },
  ]

  return (
    <div className="flex flex-col h-full md:h-screen overflow-hidden">
      <div className="flex-shrink-0 px-4 md:px-5 py-3 bg-white border-b border-slate-200 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-900">Relatórios</span>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: '#EEF2FF', color: '#4B7BF5' }}>1º sem / 2026</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-5">

        {/* Resumo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Total de jovens',  value: jovens.length,    color: '#4B7BF5' },
            { label: 'Frequência plena', value: semFaltas.length,  color: '#1D9E75' },
            { label: 'Com alertas',      value: alertas.length,   color: '#E24B4A' },
            { label: 'Membros práticas', value: totalMembros,     color: '#BA7517' },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-xl p-4" style={{ border: '0.5px solid #E2E8F0' }}>
              <div className="w-7 h-0.5 rounded-full mb-2.5" style={{ background: c.color }} />
              <p className="text-2xl font-semibold text-slate-900">{c.value}</p>
              <p className="text-xs text-slate-400 mt-1">{c.label}</p>
            </div>
          ))}
        </div>

        {/* Exportações */}
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Exportar listas</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {exportacoes.map(e => (
              <a key={e.titulo} href={e.href} target="_blank" rel="noreferrer"
                className="flex items-center gap-3 px-4 py-3.5 bg-white rounded-xl hover:shadow-sm transition-all"
                style={{ border: '0.5px solid #E2E8F0', textDecoration: 'none' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: e.bg }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={e.cor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{e.titulo}</p>
                  <p className="text-xs text-slate-400 truncate">{e.descricao}</p>
                </div>
                <svg className="flex-shrink-0 ml-auto" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Frequência por curso */}
          <div className="bg-white rounded-xl overflow-hidden" style={{ border: '0.5px solid #E2E8F0' }}>
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-800">Frequência por curso</p>
              <Link href="/cursos" className="text-xs" style={{ color: '#4B7BF5' }}>Ver cursos</Link>
            </div>
            {freqCursos.filter(c => c.pct !== null).length === 0 ? (
              <div className="px-4 py-6 text-center"><p className="text-xs text-slate-400">Nenhuma chamada registrada ainda</p></div>
            ) : (
              <div className="p-4 flex flex-col gap-4">
                {freqCursos.map(c => c.pct !== null && (
                  <div key={c.id}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs text-slate-700 truncate mr-2">{c.nome}</span>
                      <span className="text-xs font-semibold flex-shrink-0"
                        style={{ color: (c.pct ?? 0) >= 75 ? '#1D9E75' : '#E24B4A' }}>{c.pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
                      <div className="h-full rounded-full"
                        style={{ background: (c.pct ?? 0) >= 75 ? '#1D9E75' : '#E24B4A', width: `${c.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ranking de frequência */}
          <div className="bg-white rounded-xl overflow-hidden" style={{ border: '0.5px solid #E2E8F0' }}>
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-800">Ranking de frequência</p>
              <span className="text-xs text-slate-400">todos</span>
            </div>
            {ranking.length === 0 ? (
              <div className="px-4 py-6 text-center"><p className="text-xs text-slate-400">Nenhuma chamada ainda</p></div>
            ) : (
              <div className="overflow-y-auto" style={{ maxHeight: 260 }}>
                {ranking.map((j, i) => (
                  <Link key={j.id} href={`/jovens/${j.id}`}
                    className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 transition-colors"
                    style={{ borderBottom: i < ranking.length - 1 ? '0.5px solid #F8FAFC' : 'none', textDecoration: 'none' }}>
                    <span className="text-xs font-semibold flex-shrink-0 w-5 text-right"
                      style={{ color: i < 3 ? '#4B7BF5' : '#CBD5E1' }}>#{i + 1}</span>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                      style={{ background: j.faltas >= 3 ? '#FCEBEB' : '#EEF2FF', color: j.faltas >= 3 ? '#A32D2D' : '#4B7BF5', fontSize: 9 }}>
                      {j.nome.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                    </div>
                    <p className="text-xs text-slate-800 truncate flex-1">{j.nome}</p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="hidden sm:block w-14 h-1.5 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
                        <div className="h-full rounded-full" style={{ background: j.pct >= 75 ? '#1D9E75' : '#E24B4A', width: `${j.pct}%` }} />
                      </div>
                      <span className="text-xs font-semibold" style={{ color: j.pct >= 75 ? '#1D9E75' : '#E24B4A', minWidth: 32 }}>
                        {j.pct}%
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}