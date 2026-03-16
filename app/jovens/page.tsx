'use client'
// LOCALIZAÇÃO: app/jovens/page.tsx

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, X, User, Mail, Phone, ExternalLink } from 'lucide-react'
import { CustomSelect } from '@/components/CustomSelect'

type Jovem = {
  id: number; nome: string; email: string | null; telefone: string | null
  ano_entrada: number; curso_atual: string | null; pratica_atual: string | null
}
type Curso        = { id: number; nome: string }
type Pratica      = { id: number; nome: string }
type PresencaItem = { id: number; presente: boolean; aulas: { curso_nome: string; data: string } | null }
type FreqJovem    = { total: number; presentes: number; pct: number }
type PresencaRow  = { jovem_id: number; presente: boolean }

export default function JovensPage() {
  const [jovens,    setJovens]    = useState<Jovem[]>([])
  const [cursos,    setCursos]    = useState<Curso[]>([])
  const [praticas,  setPraticas]  = useState<Pratica[]>([])
  const [loading,   setLoading]   = useState(true)
  const [busca,     setBusca]     = useState('')
  const [filtro,    setFiltro]    = useState<'todos'|'alerta'|'ok'>('todos')
  const [modal,     setModal]     = useState(false)
  const [salvando,  setSalvando]  = useState(false)
  const [freqMap,   setFreqMap]   = useState<Record<number, FreqJovem>>({})
  const [selecionado,      setSelecionado]      = useState<Jovem | null>(null)
  const [presencasJovem,   setPresencasJovem]   = useState<PresencaItem[]>([])
  const [loadingPresencas, setLoadingPresencas] = useState(false)
  const [sheetAberto,      setSheetAberto]      = useState(false)

  // Form
  const [nome,         setNome]         = useState('')
  const [email,        setEmail]        = useState('')
  const [telefone,     setTelefone]     = useState('')
  const [anoEntrada,   setAnoEntrada]   = useState(String(new Date().getFullYear()))
  const [cursoAtual,   setCursoAtual]   = useState('')
  const [praticaAtual, setPraticaAtual] = useState('')
  const [erroNome,     setErroNome]     = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/jovens').then(r => r.json()),
      fetch('/api/cursos').then(r => r.json()),
      fetch('/api/praticas').then(r => r.json()),
      fetch('/api/presencas/todas').then(r => r.ok ? r.json() : []),
    ]).then(([j, c, p, pres]) => {
      setJovens(Array.isArray(j) ? j : [])
      setCursos(Array.isArray(c) ? c : [])
      setPraticas(Array.isArray(p) ? p : [])
      const map: Record<number, FreqJovem> = {}
      if (Array.isArray(pres)) {
        pres.forEach((row: PresencaRow) => {
          const id = row.jovem_id
          if (!map[id]) map[id] = { total: 0, presentes: 0, pct: 100 }
          map[id].total++
          if (row.presente) map[id].presentes++
        })
        Object.keys(map).forEach(id => {
          const f = map[Number(id)]
          f.pct = f.total > 0 ? Math.round((f.presentes / f.total) * 100) : 100
        })
      }
      setFreqMap(map)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const selecionarJovem = async (j: Jovem) => {
    setSelecionado(j)
    setSheetAberto(true)
    setPresencasJovem([])
    setLoadingPresencas(true)
    const res  = await fetch(`/api/presencas/jovem?jovemId=${j.id}`)
    const data = res.ok ? await res.json() : { aulas: [] }
    setPresencasJovem(Array.isArray(data) ? data : (data.aulas ?? []))
    setLoadingPresencas(false)
  }

  const fecharSheet = () => {
    setSheetAberto(false)
    setSelecionado(null)
    setPresencasJovem([])
  }

  const fecharModal = () => {
    setModal(false); setNome(''); setEmail(''); setTelefone('')
    setAnoEntrada(String(new Date().getFullYear()))
    setCursoAtual(''); setPraticaAtual(''); setErroNome(false)
  }

  const salvarJovem = async () => {
    if (!nome.trim()) { setErroNome(true); return }
    setSalvando(true)
    const res = await fetch('/api/jovens', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: nome.trim(), email: email || null, telefone: telefone || null, ano_entrada: Number(anoEntrada), curso_atual: cursoAtual || null, pratica_atual: praticaAtual || null }),
    })
    if (res.ok) {
      const novo = await res.json() as Jovem
      setJovens(prev => [...prev, novo].sort((a, b) => a.nome.localeCompare(b.nome)))
      fecharModal()
    } else {
      const err = await res.json() as { error?: string }
      alert('Erro: ' + (err.error ?? 'Falha ao salvar'))
    }
    setSalvando(false)
  }

  let filtrado = busca ? jovens.filter(j => j.nome.toLowerCase().includes(busca.toLowerCase())) : jovens
  if (filtro === 'alerta') filtrado = filtrado.filter(j => { const f = freqMap[j.id]; return f && f.total > 0 && f.pct < 75 })
  if (filtro === 'ok')     filtrado = filtrado.filter(j => { const f = freqMap[j.id]; return !f || f.total === 0 || f.pct >= 75 })

  const alertaCount = jovens.filter(j => { const f = freqMap[j.id]; return f && f.total > 0 && f.pct < 75 }).length

  // Dados calculados do selecionado
  const freqPct   = selecionado ? (freqMap[selecionado.id]?.pct ?? 100) : 100
  const temAlerta = selecionado ? (freqMap[selecionado.id]?.total ?? 0) > 0 && freqPct < 75 : false
  const porCurso: Record<string, { total: number; presentes: number }> = {}
  presencasJovem.forEach(p => {
    if (!p.aulas) return
    const n = p.aulas.curso_nome
    if (!porCurso[n]) porCurso[n] = { total: 0, presentes: 0 }
    porCurso[n].total++
    if (p.presente) porCurso[n].presentes++
  })

  // JSX do painel de detalhe — inline, sem sub-componente
  const detalheJSX = selecionado ? (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-4 border-b border-slate-200" style={{ background: '#F8FAFC' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
            style={{ background: temAlerta ? '#FCEBEB' : '#EEF2FF', color: temAlerta ? '#A32D2D' : '#4B7BF5' }}>
            {selecionado.nome.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900 truncate">{selecionado.nome}</p>
            <p className="text-xs text-slate-500 mt-0.5">Mocidade desde {selecionado.ano_entrada}</p>
          </div>
        </div>
        {(freqMap[selecionado.id]?.total ?? 0) > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#E2E8F0' }}>
              <div className="h-full rounded-full" style={{ background: temAlerta ? '#E24B4A' : '#1D9E75', width: `${freqPct}%` }} />
            </div>
            <span className="text-xs font-bold flex-shrink-0" style={{ color: temAlerta ? '#E24B4A' : '#1D9E75' }}>{freqPct}%</span>
          </div>
        )}
      </div>

      {/* Alerta */}
      {temAlerta && (
        <div className="mx-4 mt-3 px-3 py-2.5 rounded-lg flex-shrink-0" style={{ background: '#FCEBEB', border: '0.5px solid #F09595' }}>
          <p className="text-xs font-semibold" style={{ color: '#A32D2D' }}>Atenção — frequência insuficiente</p>
          <p className="text-xs mt-0.5" style={{ color: '#793F3F' }}>{freqPct}% de presença. Mínimo: 75%.</p>
        </div>
      )}

      {/* Corpo */}
      <div className="flex-1 overflow-y-auto">
        {(selecionado.email || selecionado.telefone) && (
          <div className="px-4 py-3 border-b border-slate-100 flex flex-col gap-1.5">
            {selecionado.email && (
              <a href={`mailto:${selecionado.email}`} className="flex items-center gap-2 text-xs" style={{ color: '#4B7BF5', textDecoration: 'none' }}>
                <Mail size={11} /><span className="truncate">{selecionado.email}</span>
              </a>
            )}
            {selecionado.telefone && (
              <span className="flex items-center gap-2 text-xs text-slate-500"><Phone size={11} />{selecionado.telefone}</span>
            )}
          </div>
        )}

        <div className="px-4 py-3 border-b border-slate-100 grid grid-cols-2 gap-2">
          <div className="rounded-lg p-2.5" style={{ background: '#fff', border: '0.5px solid #E2E8F0' }}>
            <p className="text-xs text-slate-400 mb-0.5">Curso</p>
            <p className="text-xs font-medium text-slate-800 truncate">{selecionado.curso_atual ?? '—'}</p>
          </div>
          <div className="rounded-lg p-2.5" style={{ background: '#fff', border: '0.5px solid #E2E8F0' }}>
            <p className="text-xs text-slate-400 mb-0.5">Prática</p>
            <p className="text-xs font-medium text-slate-800 truncate">{selecionado.pratica_atual ?? '—'}</p>
          </div>
        </div>

        <div className="px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2.5">Histórico</p>
          {loadingPresencas ? (
            <p className="text-xs text-slate-400">Carregando...</p>
          ) : Object.keys(porCurso).length === 0 ? (
            <p className="text-xs text-slate-400">Nenhuma chamada registrada</p>
          ) : (
            <div className="flex flex-col gap-1">
              {Object.entries(porCurso).map(([nomeCurso, dados]) => {
                const pct = Math.round((dados.presentes / dados.total) * 100)
                return (
                  <div key={nomeCurso} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                    <div className="min-w-0 mr-2">
                      <p className="text-xs text-slate-800 truncate">{nomeCurso}</p>
                      <p className="text-xs text-slate-400">{dados.presentes}/{dados.total} aulas</p>
                    </div>
                    <span className="text-xs flex-shrink-0 px-2 py-0.5 rounded-full font-medium"
                      style={{ background: pct < 75 ? '#FCEBEB' : '#EAF3DE', color: pct < 75 ? '#A32D2D' : '#3B6D11' }}>
                      {pct < 75 ? 'em risco' : 'Presente'}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Botão */}
      <div className="flex-shrink-0 p-3 border-t border-slate-200" style={{ background: '#F8FAFC' }}>
        <Link href={`/jovens/${selecionado.id}`}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-semibold hover:opacity-90"
          style={{ background: '#4B7BF5', color: '#fff', textDecoration: 'none' }}>
          <ExternalLink size={13} /> Ver análise completa
        </Link>
      </div>
    </div>
  ) : null

  if (loading) return (
    <div className="flex items-center justify-center h-full p-10">
      <p className="text-sm text-slate-400">Carregando jovens...</p>
    </div>
  )

  return (
    <div className="flex flex-col h-full md:h-screen overflow-hidden">
      {/* Topbar */}
      <div className="flex-shrink-0 px-4 md:px-5 py-3 bg-white border-b border-slate-200 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-900">Jovens cadastrados</span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: '#EEF2FF', color: '#4B7BF5' }}>
            {filtrado.length} jovens
          </span>
          <button onClick={() => setModal(true)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg hover:opacity-90"
            style={{ background: '#4B7BF5', color: '#fff' }}>
            <Plus size={13} strokeWidth={2.5} /> Novo jovem
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Lista */}
        <div className="flex-1 flex flex-col overflow-hidden p-3 md:p-4 min-w-0">
          <div className="flex gap-2 mb-3 flex-wrap flex-shrink-0">
            {([
              { key: 'todos',  label: `Todos (${jovens.length})` },
              { key: 'alerta', label: alertaCount > 0 ? `Com alerta (${alertaCount})` : 'Com alerta' },
              { key: 'ok',     label: 'Frequência ok' },
            ] as { key: typeof filtro; label: string }[]).map(f => (
              <button key={f.key} onClick={() => setFiltro(f.key)}
                className="text-xs px-3 py-1.5 rounded-full border transition-colors"
                style={{
                  background:  filtro === f.key ? '#EEF2FF' : 'transparent',
                  color:       filtro === f.key ? '#4B7BF5' : '#64748B',
                  borderColor: filtro === f.key ? '#4B7BF5' : '#CBD5E1',
                }}>
                {f.label}
              </button>
            ))}
          </div>

          <div className="mb-3 flex-shrink-0">
            <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar pelo nome..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white outline-none focus:border-blue-400"
              style={{ color: '#1A2340' }} />
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-0.5">
            {filtrado.map(j => {
              const freq     = freqMap[j.id]
              const pct      = freq?.pct ?? 100
              const temFalta = (freq?.total ?? 0) > 0 && pct < 75
              const ativo    = selecionado?.id === j.id
              return (
                <button key={j.id} onClick={() => selecionarJovem(j)} className="w-full text-left">
                  <div className="bg-white rounded-xl p-3 transition-all"
                    style={{
                      border:       ativo ? '1.5px solid #4B7BF5' : '0.5px solid #E2E8F0',
                      borderLeft:   temFalta ? '3px solid #E24B4A' : ativo ? '3px solid #4B7BF5' : '3px solid #E2E8F0',
                      borderRadius: '0 10px 10px 0',
                      background:   ativo ? '#F5F8FF' : '#fff',
                    }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                          style={{
                            background: temFalta ? '#FCEBEB' : ativo ? '#4B7BF5' : '#EEF2FF',
                            color:      temFalta ? '#A32D2D' : ativo ? '#fff'    : '#4B7BF5',
                          }}>
                          {j.nome.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{j.nome}</p>
                          <p className="text-xs text-slate-400 truncate">{j.curso_atual ?? '—'}</p>
                        </div>
                      </div>
                      {temFalta && (
                        <span className="flex-shrink-0 ml-2 px-2 py-0.5 rounded-full"
                          style={{ background: '#FCEBEB', color: '#A32D2D', fontSize: 10 }}>
                          Frequência baixa
                        </span>
                      )}
                    </div>
                    {(freq?.total ?? 0) > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs" style={{ color: '#64748B', minWidth: 28, textAlign: 'right' }}>{pct}%</span>
                        <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: '#F1F5F9', maxWidth: 80 }}>
                          <div className="h-full rounded-full" style={{ background: pct >= 75 ? '#1D9E75' : '#E24B4A', width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-slate-400">frequência</span>
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
            {filtrado.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <User size={18} className="text-slate-400" />
                </div>
                <p className="text-sm text-slate-500">Nenhum jovem encontrado</p>
              </div>
            )}
          </div>
        </div>

        {/* Painel lateral — desktop only */}
        <div className="hidden lg:flex flex-col w-72 xl:w-80 border-l border-slate-200 flex-shrink-0 overflow-hidden" style={{ background: '#F8FAFC' }}>
          {selecionado ? detalheJSX : (
            <div className="flex flex-col items-center justify-center h-full px-6 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                <User size={20} className="text-slate-400" />
              </div>
              <p className="text-xs text-slate-400 text-center leading-relaxed">Selecione um jovem para ver o resumo aqui</p>
              <button onClick={() => setModal(true)}
                className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg"
                style={{ background: '#EEF2FF', color: '#4B7BF5', border: '0.5px solid #B5D4F4' }}>
                <Plus size={13} /> Novo jovem
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom sheet — mobile only */}
      {sheetAberto && selecionado && (
        <>
          <div
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: 'rgba(15,23,42,0.5)' }}
            onClick={fecharSheet}
          />
          <div
            className="fixed bottom-0 left-0 right-0 z-50 lg:hidden rounded-t-2xl overflow-hidden flex flex-col"
            style={{ background: '#F8FAFC', maxHeight: '85vh', boxShadow: '0 -4px 24px rgba(0,0,0,0.18)' }}
          >
            <div className="flex-shrink-0 pt-3 pb-2 px-4 flex flex-col items-center gap-2" style={{ background: '#F8FAFC' }}>
              <div className="w-10 h-1 rounded-full" style={{ background: '#CBD5E1' }} />
              <div className="w-full flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Detalhes</p>
                <button onClick={fecharSheet} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-200">
                  <X size={15} />
                </button>
              </div>
            </div>
            {detalheJSX}
          </div>
        </>
      )}

      {/* Modal cadastro */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(15,23,42,0.45)' }}
          onClick={e => { if (e.target === e.currentTarget) fecharModal() }}>
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden" style={{ border: '0.5px solid #E2E8F0' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <p className="text-sm font-semibold text-slate-900">Cadastrar novo jovem</p>
                <p className="text-xs text-slate-400 mt-0.5">Preencha os dados abaixo</p>
              </div>
              <button onClick={fecharModal} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100"><X size={15} /></button>
            </div>
            <div className="px-5 py-4 flex flex-col gap-4 overflow-y-auto" style={{ maxHeight: '65vh' }}>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1.5 block">Nome completo <span style={{ color: '#E24B4A' }}>*</span></label>
                <input autoFocus value={nome} onChange={e => { setNome(e.target.value); setErroNome(false) }} placeholder="Ex: Maria Silva"
                  className="w-full px-3 py-2.5 text-sm border rounded-lg bg-white outline-none"
                  style={{ borderColor: erroNome ? '#E24B4A' : '#E2E8F0', color: '#1A2340' }} />
                {erroNome && <p className="text-xs mt-1" style={{ color: '#E24B4A' }}>Nome é obrigatório</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1.5 block">E-mail</label>
                  <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="email@exemplo.com"
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white outline-none" style={{ color: '#1A2340' }} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1.5 block">Telefone</label>
                  <input value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(67) 9 9999-0000"
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white outline-none" style={{ color: '#1A2340' }} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1.5 block">Ano de entrada</label>
                <input value={anoEntrada} onChange={e => setAnoEntrada(e.target.value)} type="number" min="2010" max="2035"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white outline-none" style={{ color: '#1A2340' }} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1.5 block">Curso atual</label>
                <CustomSelect
                  value={cursoAtual}
                  onChange={v => setCursoAtual(String(v))}
                  placeholder="Sem curso"
                  options={cursos.map(c => ({ value: c.nome, label: c.nome }))}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1.5 block">Prática</label>
                <CustomSelect
                  value={praticaAtual}
                  onChange={v => setPraticaAtual(String(v))}
                  placeholder="Sem prática"
                  options={praticas.map(p => ({ value: p.nome, label: p.nome }))}
                />
              </div>
            </div>
            <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button onClick={fecharModal} className="text-xs font-medium px-4 py-2 rounded-lg border border-slate-200 text-slate-600">Cancelar</button>
              <button onClick={salvarJovem} disabled={salvando}
                className="text-xs font-medium px-5 py-2 rounded-lg"
                style={{ background: '#4B7BF5', color: '#fff', opacity: salvando ? 0.7 : 1 }}>
                {salvando ? 'Salvando...' : 'Cadastrar jovem'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}