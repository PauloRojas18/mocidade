'use client'
// LOCALIZAÇÃO: app/frequencia/page.tsx

import { useState } from 'react'
import { aulasIniciais, jovens as todosJovens, praticas as todasPraticas, type Aula } from '@/lib/mock'
import { Check, Plus, X, ArrowLeft } from 'lucide-react'

type Tab  = 'cursos' | 'praticas' | 'dia'
type View = 'lista' | 'chamada'

const COLORS = [
  { header: '#4B7BF5', light: '#EEF2FF', text: '#185FA5', pill: '#B5D4F4' },
  { header: '#7F77DD', light: '#EEEDFE', text: '#3C3489', pill: '#CECBF6' },
  { header: '#1D9E75', light: '#E1F5EE', text: '#085041', pill: '#9FE1CB' },
  { header: '#BA7517', light: '#FAEEDA', text: '#633806', pill: '#FAC775' },
  { header: '#D4537E', light: '#FBEAF0', text: '#72243E', pill: '#F4C0D1' },
  { header: '#378ADD', light: '#E6F1FB', text: '#0C447C', pill: '#85B7EB' },
]
const PRATICA_COLORS = [
  { header: '#D4537E', light: '#FBEAF0', text: '#72243E', pill: '#F4C0D1' },
  { header: '#BA7517', light: '#FAEEDA', text: '#633806', pill: '#FAC775' },
]

export default function FrequenciaPage() {
  const [aba,       setAba]       = useState<Tab>('cursos')
  const [view,      setView]      = useState<View>('lista')
  const [aulas,     setAulas]     = useState<Aula[]>(aulasIniciais)
  const [aulaAtiva, setAulaAtiva] = useState<Aula | null>(null)
  const [presencas, setPresencas] = useState<Record<number, boolean>>({})
  const [salvou,    setSalvou]    = useState(false)
  const [gerenc,    setGerenc]    = useState<number | null>(null)

  // Nova aula
  const [criando,   setCriando]   = useState(false)
  const [novoNome,  setNovoNome]  = useState('')
  const [novaData,  setNovaData]  = useState('')
  const [novoDesc,  setNovoDesc]  = useState('')
  const [alunosSel, setAlunosSel] = useState<number[]>([])

  // Práticas — membros editáveis por prática
  type PraticaMembro = { praticaId: number; jovemId: number; jovemNome: string }
  const [membrosPratica, setMembrosPratica] = useState<PraticaMembro[]>(() =>
    todasPraticas.flatMap(p =>
      p.jovens.map(j => {
        const jv = todosJovens.find(jv => jv.nome === j.nome)
        return { praticaId: p.id, jovemId: jv?.id ?? 0, jovemNome: j.nome }
      })
    )
  )

  type PP = { praticaId: number; jovemNome: string; presente: boolean }
  const [presencasPratica, setPresencasPratica] = useState<PP[]>(() =>
    todasPraticas.flatMap(p => p.jovens.map(j => ({ praticaId: p.id, jovemNome: j.nome, presente: false })))
  )
  const [aulaAtivaP, setAulaAtivaP] = useState<typeof todasPraticas[0] | null>(null)
  const [viewP,      setViewP]      = useState<'lista' | 'chamada'>('lista')
  const [salvouP,    setSalvouP]    = useState(false)
  const [gerencP,    setGerencP]    = useState<number | null>(null)

  const removerMembroPratica = (praticaId: number, jovemId: number) => {
    setMembrosPratica(prev => prev.filter(m => !(m.praticaId === praticaId && m.jovemId === jovemId)))
    setPresencasPratica(prev => prev.filter(p => !(p.praticaId === praticaId && p.jovemNome === todosJovens.find(j => j.id === jovemId)?.nome)))
  }
  const adicionarMembroPratica = (praticaId: number, jovemId: number) => {
    const jv = todosJovens.find(j => j.id === jovemId)
    if (!jv || membrosPratica.find(m => m.praticaId === praticaId && m.jovemId === jovemId)) return
    setMembrosPratica(prev => [...prev, { praticaId, jovemId, jovemNome: jv.nome }])
    setPresencasPratica(prev => [...prev, { praticaId, jovemNome: jv.nome, presente: false }])
  }

  // Chamada do dia
  const [chamadaDia, setChamadaDia] = useState(() =>
    todosJovens.map(j => ({ id: j.id, nome: j.nome, presente: false }))
  )
  const [salvouDia, setSalvouDia] = useState(false)
  const [dataHoje] = useState(() =>
    new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
  )

  // ── Helpers cursos ──────────────────────────────────────────────────────
  const abrirChamada = (aula: Aula) => {
    const init: Record<number, boolean> = {}
    aula.alunos.forEach(a => { init[a.id] = false })
    setAulaAtiva(aula); setPresencas(init); setSalvou(false); setView('chamada')
  }
  const toggle = (id: number) => setPresencas(p => ({ ...p, [id]: !p[id] }))
  const marcarTodos = () => {
    if (!aulaAtiva) return
    const todos = aulaAtiva.alunos.every(a => presencas[a.id])
    const novo: Record<number, boolean> = {}
    aulaAtiva.alunos.forEach(a => { novo[a.id] = !todos })
    setPresencas(novo)
  }
  const salvar = () => {
    setSalvou(true)
    setTimeout(() => { setView('lista'); setAulaAtiva(null) }, 1400)
  }
  const criarAula = () => {
    if (!novoNome || !novaData) return
    const nova: Aula = {
      id: Date.now(), cursoNome: novoNome, data: novaData,
      descricao: novoDesc || 'Aula', colorIdx: aulas.length % COLORS.length,
      alunos: todosJovens.filter(j => alunosSel.includes(j.id)).map(j => ({ id: j.id, nome: j.nome })),
    }
    setAulas(prev => [...prev, nova])
    setNovoNome(''); setNovaData(''); setNovoDesc(''); setAlunosSel([]); setCriando(false)
  }
  const removerAluno = (aulaId: number, alunoId: number) =>
    setAulas(prev => prev.map(a =>
      a.id === aulaId ? { ...a, alunos: a.alunos.filter(al => al.id !== alunoId) } : a
    ))
  const adicionarAluno = (aulaId: number, alunoId: number) => {
    const j = todosJovens.find(jv => jv.id === alunoId); if (!j) return
    setAulas(prev => prev.map(a => {
      if (a.id !== aulaId || a.alunos.find(al => al.id === alunoId)) return a
      return { ...a, alunos: [...a.alunos, { id: j.id, nome: j.nome }] }
    }))
  }

  // ── Helpers práticas ────────────────────────────────────────────────────
  const toggleP = (praticaId: number, nome: string) =>
    setPresencasPratica(prev => prev.map(p =>
      p.praticaId === praticaId && p.jovemNome === nome ? { ...p, presente: !p.presente } : p
    ))
  const marcarTodosP = () => {
    if (!aulaAtivaP) return
    const alunos = presencasPratica.filter(p => p.praticaId === aulaAtivaP.id)
    const todos  = alunos.every(a => a.presente)
    setPresencasPratica(prev => prev.map(p =>
      p.praticaId === aulaAtivaP.id ? { ...p, presente: !todos } : p
    ))
  }

  const presentesDia = chamadaDia.filter(j => j.presente).length

  // ════ TELA DE CHAMADA — CURSOS ══════════════════════════════════════════
  if (view === 'chamada' && aulaAtiva) {
    const c         = COLORS[aulaAtiva.colorIdx % COLORS.length]
    const presentes = aulaAtiva.alunos.filter(a => presencas[a.id]).length
    const total     = aulaAtiva.alunos.length
    const pct       = total > 0 ? Math.round((presentes / total) * 100) : 0

    return (
      <div className="flex flex-col h-full md:h-screen overflow-hidden">
        <div className="flex-shrink-0 px-4 md:px-5 py-3 bg-white border-b border-slate-200 flex items-center gap-3">
          <button onClick={() => setView('lista')}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <ArrowLeft size={15} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{aulaAtiva.cursoNome}</p>
            <p className="text-xs text-slate-400">{aulaAtiva.descricao} · {new Date(aulaAtiva.data + 'T00:00').toLocaleDateString('pt-BR')}</p>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0"
            style={{ background: c.light, color: c.text }}>{presentes}/{total}</span>
        </div>

        <div className="flex-1 overflow-y-auto p-3 md:p-5">
          <div className="max-w-lg mx-auto">
            {/* Card de progresso */}
            <div className="bg-white rounded-2xl p-4 mb-4" style={{ border: `0.5px solid ${c.pill}` }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-2xl font-bold" style={{ color: c.header }}>{presentes}</p>
                  <p className="text-xs text-slate-400">de {total} presente{total !== 1 ? 's' : ''}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900">{pct}%</p>
                  <p className="text-xs text-slate-400">frequência</p>
                </div>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ background: c.header, width: `${pct}%` }} />
              </div>
            </div>

            {/* Controles */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Alunos</p>
              <button onClick={marcarTodos}
                className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                style={{ background: c.light, color: c.text }}>
                {aulaAtiva.alunos.every(a => presencas[a.id]) ? 'Desmarcar todos' : 'Marcar todos'}
              </button>
            </div>

            {/* Cards clicáveis por aluno */}
            <div className="flex flex-col gap-2 mb-5">
              {aulaAtiva.alunos.map(aluno => {
                const presente = presencas[aluno.id]
                return (
                  <button key={aluno.id} onClick={() => toggle(aluno.id)}
                    className="flex items-center justify-between px-4 py-3.5 rounded-2xl w-full text-left transition-all"
                    style={{
                      border:     presente ? `2px solid ${c.header}` : '0.5px solid #E2E8F0',
                      background: presente ? c.light : '#fff',
                    }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all"
                        style={{ background: presente ? c.header : '#F1F5F9', color: presente ? '#fff' : '#64748B' }}>
                        {aluno.nome.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: presente ? c.text : '#1A2340' }}>{aluno.nome}</p>
                        <p className="text-xs" style={{ color: presente ? c.text : '#94A3B8', opacity: 0.8 }}>
                          {presente ? 'Presente ✓' : 'Toque para marcar'}
                        </p>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ border: presente ? `2px solid ${c.header}` : '1.5px solid #CBD5E1', background: presente ? c.header : 'transparent' }}>
                      {presente && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                    </div>
                  </button>
                )
              })}
            </div>

            {salvou ? (
              <div className="w-full py-3.5 rounded-2xl text-center text-sm font-semibold"
                style={{ background: '#E1F5EE', color: '#085041' }}>✓ Frequência salva!</div>
            ) : (
              <button onClick={salvar}
                className="w-full py-3.5 rounded-2xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: c.header }}>
                Salvar chamada · {presentes} presente{presentes !== 1 ? 's' : ''}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ════ TELA DE CHAMADA — PRÁTICAS ════════════════════════════════════════
  if (viewP === 'chamada' && aulaAtivaP) {
    const pi        = todasPraticas.findIndex(p => p.id === aulaAtivaP.id)
    const c         = PRATICA_COLORS[pi % PRATICA_COLORS.length]
    // usa membrosPratica para refletir adições/remoções feitas pelo +/-
    const membros   = membrosPratica.filter(m => m.praticaId === aulaAtivaP.id)
    const alunos    = membros.map(m => ({
      jovemNome: m.jovemNome,
      presente:  presencasPratica.find(p => p.praticaId === aulaAtivaP.id && p.jovemNome === m.jovemNome)?.presente ?? false,
    }))
    const presentes = alunos.filter(a => a.presente).length
    const total     = alunos.length
    const pct       = total > 0 ? Math.round((presentes / total) * 100) : 0

    return (
      <div className="flex flex-col h-full md:h-screen overflow-hidden">
        <div className="flex-shrink-0 px-4 md:px-5 py-3 bg-white border-b border-slate-200 flex items-center gap-3">
          <button onClick={() => setViewP('lista')}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
            <ArrowLeft size={15} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900">{aulaAtivaP.nome}</p>
            <p className="text-xs text-slate-400">Chamada de presença</p>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full"
            style={{ background: c.light, color: c.text }}>{presentes}/{total}</span>
        </div>

        <div className="flex-1 overflow-y-auto p-3 md:p-5">
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-2xl p-4 mb-4" style={{ border: `0.5px solid ${c.pill}` }}>
              <div className="flex items-center justify-between mb-3">
                <div><p className="text-2xl font-bold" style={{ color: c.header }}>{presentes}</p><p className="text-xs text-slate-400">de {total}</p></div>
                <div className="text-right"><p className="text-2xl font-bold text-slate-900">{pct}%</p><p className="text-xs text-slate-400">frequência</p></div>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ background: c.header, width: `${pct}%` }} />
              </div>
            </div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Jovens</p>
              <button onClick={marcarTodosP} className="text-xs font-medium px-3 py-1.5 rounded-lg"
                style={{ background: c.light, color: c.text }}>
                {alunos.every(a => a.presente) ? 'Desmarcar todos' : 'Marcar todos'}
              </button>
            </div>
            <div className="flex flex-col gap-2 mb-5">
              {alunos.map(aluno => (
                <button key={aluno.jovemNome} onClick={() => toggleP(aulaAtivaP.id, aluno.jovemNome)}
                  className="flex items-center justify-between px-4 py-3.5 rounded-2xl w-full text-left transition-all"
                  style={{ border: aluno.presente ? `2px solid ${c.header}` : '0.5px solid #E2E8F0', background: aluno.presente ? c.light : '#fff' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: aluno.presente ? c.header : '#F1F5F9', color: aluno.presente ? '#fff' : '#64748B' }}>
                      {aluno.jovemNome.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: aluno.presente ? c.text : '#1A2340' }}>{aluno.jovemNome}</p>
                      <p className="text-xs" style={{ color: aluno.presente ? c.text : '#94A3B8', opacity: 0.8 }}>{aluno.presente ? 'Presente ✓' : 'Toque para marcar'}</p>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ border: aluno.presente ? `2px solid ${c.header}` : '1.5px solid #CBD5E1', background: aluno.presente ? c.header : 'transparent' }}>
                    {aluno.presente && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                  </div>
                </button>
              ))}
            </div>
            {salvouP ? (
              <div className="w-full py-3.5 rounded-2xl text-center text-sm font-semibold"
                style={{ background: '#E1F5EE', color: '#085041' }}>✓ Frequência salva!</div>
            ) : (
              <button onClick={() => { setSalvouP(true); setTimeout(() => { setViewP('lista'); setAulaAtivaP(null) }, 1400) }}
                className="w-full py-3.5 rounded-2xl text-white text-sm font-semibold hover:opacity-90"
                style={{ background: c.header }}>
                Salvar chamada · {presentes} presente{presentes !== 1 ? 's' : ''}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ════ LISTA PRINCIPAL ════════════════════════════════════════════════════
  return (
    <div className="flex flex-col h-full md:h-screen overflow-hidden">
      {/* Topbar */}
      <div className="flex-shrink-0 px-4 md:px-5 py-3 bg-white border-b border-slate-200 flex items-center justify-between">
        <div>
          <span className="text-sm font-semibold text-slate-900">Frequência</span>
          <p className="text-xs text-slate-400 mt-0.5">1º sem / 2026</p>
        </div>
        {aba === 'cursos' && (
          <button onClick={() => setCriando(true)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg hover:opacity-90"
            style={{ background: '#4B7BF5', color: '#fff' }}>
            <Plus size={12} strokeWidth={2.5} /> Nova aula
          </button>
        )}
      </div>

      {/* Abas */}
      <div className="flex-shrink-0 flex border-b border-slate-200 bg-white px-4 md:px-5">
        {([
          { key: 'cursos',   label: 'Cursos'        },
          { key: 'praticas', label: 'Práticas'       },
          { key: 'dia',      label: 'Chamada do Dia' },
        ] as { key: Tab; label: string }[]).map(t => (
          <button key={t.key} onClick={() => setAba(t.key)}
            className="text-xs font-medium px-4 py-3 border-b-2 transition-colors -mb-px"
            style={{ borderBottomColor: aba === t.key ? '#4B7BF5' : 'transparent', color: aba === t.key ? '#4B7BF5' : '#64748B' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 md:p-4">

        {/* ── CURSOS ── */}
        {aba === 'cursos' && (
          <>
            {/* Modal nova aula */}
            {criando && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ background: 'rgba(15,23,42,0.45)' }}
                onClick={e => { if (e.target === e.currentTarget) setCriando(false) }}>
                <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden" style={{ border: '0.5px solid #E2E8F0' }}>
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-900">Nova aula</p>
                    <button onClick={() => setCriando(false)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
                      <X size={15} />
                    </button>
                  </div>
                  <div className="px-5 py-4 flex flex-col gap-4 overflow-y-auto" style={{ maxHeight: '65vh' }}>
                    <div>
                      <label className="text-xs font-medium text-slate-700 mb-1.5 block">Nome do curso</label>
                      <input value={novoNome} onChange={e => setNovoNome(e.target.value)} placeholder="Ex: Escola de Líderes"
                        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white outline-none focus:border-blue-400 transition-colors"
                        style={{ color: '#1A2340' }} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-slate-700 mb-1.5 block">Data</label>
                        <input type="date" value={novaData} onChange={e => setNovaData(e.target.value)}
                          className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white outline-none focus:border-blue-400 transition-colors"
                          style={{ color: '#1A2340' }} />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-700 mb-1.5 block">Descrição</label>
                        <input value={novoDesc} onChange={e => setNovoDesc(e.target.value)} placeholder="Ex: Aula 3"
                          className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white outline-none focus:border-blue-400 transition-colors"
                          style={{ color: '#1A2340' }} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 mb-2 block">Alunos</label>
                      <div className="flex flex-col gap-1.5 max-h-44 overflow-y-auto rounded-lg border border-slate-100 p-1">
                        {todosJovens.map(j => {
                          const sel = alunosSel.includes(j.id)
                          return (
                            <button key={j.id}
                              onClick={() => setAlunosSel(prev => sel ? prev.filter(id => id !== j.id) : [...prev, j.id])}
                              className="flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors w-full text-left"
                              style={{ border: sel ? '0.5px solid #4B7BF5' : '0.5px solid transparent', background: sel ? '#EEF2FF' : '#F8FAFC', color: sel ? '#185FA5' : '#1A2340' }}>
                              <div className="flex items-center gap-2.5">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                                  style={{ background: sel ? '#4B7BF5' : '#E2E8F0', color: sel ? '#fff' : '#64748B' }}>
                                  {j.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                </div>
                                {j.nome}
                              </div>
                              {sel && <Check size={13} strokeWidth={2.5} style={{ color: '#4B7BF5', flexShrink: 0 }} />}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="px-5 py-3.5 border-t border-slate-100 flex gap-2.5 justify-end">
                    <button onClick={() => setCriando(false)}
                      className="text-xs font-medium px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                      Cancelar
                    </button>
                    <button onClick={criarAula} disabled={!novoNome || !novaData}
                      className="text-xs font-medium px-5 py-2 rounded-lg transition-opacity"
                      style={{ background: novoNome && novaData ? '#4B7BF5' : '#E2E8F0', color: novoNome && novaData ? '#fff' : '#94A3B8', cursor: novoNome && novaData ? 'pointer' : 'not-allowed' }}>
                      Criar aula
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Grid de cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {aulas.map(aula => {
                const c         = COLORS[aula.colorIdx % COLORS.length]
                const isGerenc  = gerenc === aula.id
                const disponiveis = todosJovens.filter(j => !aula.alunos.find(a => a.id === j.id))

                return (
                  <div key={aula.id} className="bg-white rounded-2xl overflow-hidden"
                    style={{ border: `0.5px solid ${c.pill}` }}>

                    {/* Header colorido */}
                    <div className="p-4" style={{ background: c.header }}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">{aula.cursoNome}</p>
                          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.65)' }}>
                            {new Date(aula.data + 'T00:00').toLocaleDateString('pt-BR')} · {aula.descricao}
                          </p>
                        </div>
                        <button onClick={() => setAulas(prev => prev.filter(a => a.id !== aula.id))}
                          className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                          style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                          <X size={12} />
                        </button>
                      </div>
                      <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.65)' }}>
                        {aula.alunos.length} aluno{aula.alunos.length !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Pills de alunos */}
                    <div className="px-3.5 pt-3 pb-1 min-h-12">
                      <div className="flex flex-wrap gap-1.5">
                        {aula.alunos.map(a => (
                          <span key={a.id} className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                            style={{ background: c.light, color: c.text }}>
                            {a.nome.split(' ')[0]}
                            {isGerenc && (
                              <button onClick={() => removerAluno(aula.id, a.id)}
                                className="ml-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-red-100 transition-colors"
                                style={{ color: c.text }}>
                                <X size={9} />
                              </button>
                            )}
                          </span>
                        ))}
                        {aula.alunos.length === 0 && <span className="text-xs text-slate-400">Nenhum aluno</span>}
                      </div>
                      {isGerenc && disponiveis.length > 0 && (
                        <div className="mt-2.5 pt-2.5 border-t border-slate-100">
                          <p className="text-xs text-slate-400 mb-1.5">Adicionar:</p>
                          <div className="flex flex-wrap gap-1">
                            {disponiveis.map(j => (
                              <button key={j.id} onClick={() => adicionarAluno(aula.id, j.id)}
                                className="text-xs px-2.5 py-1 rounded-full transition-colors"
                                style={{ background: '#F1F5F9', color: '#64748B', border: '0.5px solid #E2E8F0' }}>
                                + {j.nome.split(' ')[0]}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Ações */}
                    <div className="flex gap-2 px-3.5 pb-3.5 pt-2">
                      <button onClick={() => abrirChamada(aula)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90"
                        style={{ background: c.header }}>
                        <Check size={13} strokeWidth={2.5} />
                        Fazer chamada
                      </button>
                      <button onClick={() => setGerenc(isGerenc ? null : aula.id)}
                        className="px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors"
                        style={{ background: isGerenc ? c.light : '#F8FAFC', color: isGerenc ? c.text : '#64748B', border: isGerenc ? `0.5px solid ${c.pill}` : '0.5px solid #E2E8F0' }}>
                        +/−
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* ── PRÁTICAS ── */}
        {aba === 'praticas' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {todasPraticas.map((pratica, pi) => {
              const c           = PRATICA_COLORS[pi % PRATICA_COLORS.length]
              const membros     = membrosPratica.filter(m => m.praticaId === pratica.id)
              const isGerencP   = gerencP === pratica.id
              const disponiveis = todosJovens.filter(j => !membros.find(m => m.jovemId === j.id))
              return (
                <div key={pratica.id} className="bg-white rounded-2xl overflow-hidden"
                  style={{ border: `0.5px solid ${c.pill}` }}>
                  <div className="p-4" style={{ background: c.header }}>
                    <p className="text-sm font-bold text-white">{pratica.nome}</p>
                    <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.65)' }}>{pratica.descricao}</p>
                    <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.65)' }}>
                      {membros.length} jovem{membros.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="px-3.5 pt-3 pb-1 min-h-12">
                    <div className="flex flex-wrap gap-1.5">
                      {membros.map(m => (
                        <span key={m.jovemId}
                          className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                          style={{ background: c.light, color: c.text }}>
                          {m.jovemNome.split(' ')[0]}
                          {isGerencP && (
                            <button
                              onClick={() => removerMembroPratica(pratica.id, m.jovemId)}
                              className="ml-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-red-100 transition-colors"
                              style={{ color: c.text }}>
                              <X size={9} />
                            </button>
                          )}
                        </span>
                      ))}
                      {membros.length === 0 && <span className="text-xs text-slate-400">Nenhum jovem</span>}
                    </div>
                    {isGerencP && disponiveis.length > 0 && (
                      <div className="mt-2.5 pt-2.5 border-t border-slate-100">
                        <p className="text-xs text-slate-400 mb-1.5">Adicionar:</p>
                        <div className="flex flex-wrap gap-1">
                          {disponiveis.map(j => (
                            <button key={j.id}
                              onClick={() => adicionarMembroPratica(pratica.id, j.id)}
                              className="text-xs px-2.5 py-1 rounded-full transition-colors"
                              style={{ background: '#F1F5F9', color: '#64748B', border: '0.5px solid #E2E8F0' }}>
                              + {j.nome.split(' ')[0]}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 px-3.5 pb-3.5 pt-2">
                    <button onClick={() => { setAulaAtivaP(pratica); setSalvouP(false); setViewP('chamada') }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ background: c.header }}>
                      <Check size={13} strokeWidth={2.5} />
                      Fazer chamada
                    </button>
                    <button
                      onClick={() => setGerencP(isGerencP ? null : pratica.id)}
                      className="px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors"
                      style={{
                        background: isGerencP ? c.light  : '#F8FAFC',
                        color:      isGerencP ? c.text   : '#64748B',
                        border:     isGerencP ? `0.5px solid ${c.pill}` : '0.5px solid #E2E8F0',
                      }}>
                      +/−
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── CHAMADA DO DIA ── */}
        {aba === 'dia' && (
          <div className="max-w-lg mx-auto">
            {/* Card do dia */}
            <div className="rounded-2xl overflow-hidden mb-4" style={{ border: '0.5px solid #B5D4F4' }}>
              <div className="px-5 py-4 flex items-center justify-between"
                style={{ background: 'linear-gradient(135deg, #4B7BF5 0%, #3b2ecd 100%)' }}>
                <div>
                  <p className="text-sm font-semibold text-white capitalize">{dataHoje}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>Chamada geral do dia</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white">{presentesDia}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>presentes</p>
                </div>
              </div>
              <div className="grid grid-cols-3 divide-x divide-slate-100 bg-white">
                {[
                  { label: 'Total',     value: chamadaDia.length,                  color: '#4B7BF5' },
                  { label: 'Presentes', value: presentesDia,                        color: '#1D9E75' },
                  { label: 'Ausentes',  value: chamadaDia.length - presentesDia,    color: '#E24B4A' },
                ].map(s => (
                  <div key={s.label} className="px-4 py-3 text-center">
                    <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-xs text-slate-400">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 mb-3">
              <button onClick={() => setChamadaDia(prev => prev.map(j => ({ ...j, presente: true })))}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                style={{ background: '#E1F5EE', color: '#085041', border: '0.5px solid #9FE1CB' }}>
                <Check size={12} strokeWidth={2.5} /> Marcar todos
              </button>
              <button onClick={() => setChamadaDia(prev => prev.map(j => ({ ...j, presente: false })))}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                style={{ background: '#F8FAFC', color: '#64748B', border: '0.5px solid #E2E8F0' }}>
                <X size={12} /> Limpar
              </button>
            </div>
            <div className="bg-white rounded-2xl overflow-hidden mb-4" style={{ border: '0.5px solid #E2E8F0' }}>
              {chamadaDia.map((jovem, i) => (
                <button key={jovem.id}
                  onClick={() => setChamadaDia(prev => prev.map(j => j.id === jovem.id ? { ...j, presente: !j.presente } : j))}
                  className="flex items-center justify-between px-4 py-3.5 w-full text-left transition-all"
                  style={{
                    borderBottom: i < chamadaDia.length - 1 ? '0.5px solid #F1F5F9' : 'none',
                    background:   jovem.presente ? '#F0F7FF' : '#fff',
                  }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all"
                      style={{ background: jovem.presente ? '#4B7BF5' : '#F1F5F9', color: jovem.presente ? '#fff' : '#64748B' }}>
                      {jovem.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <p className="text-sm font-medium" style={{ color: jovem.presente ? '#185FA5' : '#1A2340' }}>
                      {jovem.nome}
                    </p>
                  </div>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ border: jovem.presente ? '2px solid #4B7BF5' : '1.5px solid #CBD5E1', background: jovem.presente ? '#4B7BF5' : 'transparent' }}>
                    {jovem.presente && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                  </div>
                </button>
              ))}
            </div>

            {salvouDia ? (
              <div className="w-full py-3.5 rounded-2xl text-center text-sm font-semibold"
                style={{ background: '#E1F5EE', color: '#085041' }}>✓ Chamada do dia salva!</div>
            ) : (
              <button onClick={() => { setSalvouDia(true); setTimeout(() => setSalvouDia(false), 3000) }}
                className="w-full py-3.5 rounded-2xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #4B7BF5, #3b2ecd)' }}>
                Salvar chamada · {presentesDia} presente{presentesDia !== 1 ? 's' : ''}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}