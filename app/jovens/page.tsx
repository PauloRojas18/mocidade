'use client'
// LOCALIZAÇÃO: app/jovens/page.tsx

import { useState } from 'react'
import { jovens as jovensIniciais, cursos, praticas } from '@/lib/mock'
import Link from 'next/link'
import { X, Plus, User } from 'lucide-react'

type Jovem = typeof jovensIniciais[0]

const FILTROS = [
  { key: 'todos',  label: 'Todos'         },
  { key: 'alerta', label: 'Com alerta'    },
  { key: 'ok',     label: 'Frequência ok' },
]

export default function JovensPage() {
  const [jovens, setJovens]   = useState<Jovem[]>(jovensIniciais)
  const [busca, setBusca]     = useState('')
  const [filtro, setFiltro]   = useState('todos')
  const [modal, setModal]     = useState(false)

  // Form state
  const [nome, setNome]               = useState('')
  const [email, setEmail]             = useState('')
  const [telefone, setTelefone]       = useState('')
  const [anoEntrada, setAnoEntrada]   = useState(String(new Date().getFullYear()))
  const [cursoAtual, setCursoAtual]   = useState(cursos[0]?.nome ?? '')
  const [praticaAtual, setPraticaAtual] = useState(praticas[0]?.nome ?? '')
  const [erroNome, setErroNome]       = useState(false)

  const fecharModal = () => {
    setModal(false)
    setNome(''); setEmail(''); setTelefone('')
    setAnoEntrada(String(new Date().getFullYear()))
    setCursoAtual(cursos[0]?.nome ?? '')
    setPraticaAtual(praticas[0]?.nome ?? '')
    setErroNome(false)
  }

  const salvarJovem = () => {
    if (!nome.trim()) { setErroNome(true); return }
    const novoJovem: Jovem = {
      id:          jovens.length + 1,
      nome:        nome.trim(),
      email:       email.trim(),
      telefone:    telefone.trim(),
      anoEntrada:  Number(anoEntrada),
      cursoAtual,
      praticaAtual,
      faltas:      0,
    }
    setJovens(prev => [...prev, novoJovem])
    fecharModal()
  }

  const alertaCount = jovens.filter(j => j.faltas >= 3).length

  let filtrado = busca
    ? jovens.filter(j => j.nome.toLowerCase().includes(busca.toLowerCase()))
    : jovens
  if (filtro === 'alerta') filtrado = filtrado.filter(j => j.faltas >= 3)
  if (filtro === 'ok')     filtrado = filtrado.filter(j => j.faltas < 3)

  const counts: Record<string, number> = {
    todos:  jovens.length,
    alerta: alertaCount,
    ok:     jovens.length - alertaCount,
  }

  return (
    <div className="flex flex-col h-full md:h-screen overflow-hidden">
      {/* Topbar */}
      <div className="flex-shrink-0 px-4 md:px-5 py-3 bg-white border-b border-slate-200
                      flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-900">Jovens cadastrados</span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full"
            style={{ background: '#EEF2FF', color: '#4B7BF5' }}>
            {filtrado.length} jovens
          </span>
          <button
            onClick={() => setModal(true)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg
                       transition-opacity hover:opacity-90"
            style={{ background: '#4B7BF5', color: '#fff' }}>
            <Plus size={13} strokeWidth={2.5} />
            Novo jovem
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Lista */}
        <div className="flex-1 flex flex-col overflow-hidden p-3 md:p-4">

          {/* Filtros */}
          <div className="flex gap-2 mb-3 flex-wrap flex-shrink-0">
            {FILTROS.map(f => (
              <button
                key={f.key}
                onClick={() => setFiltro(f.key)}
                className="text-xs px-3 py-1.5 rounded-full border flex items-center gap-1.5 transition-colors"
                style={{
                  background:  filtro === f.key ? '#4B7BF5' : '#fff',
                  color:       filtro === f.key ? '#fff'    : '#64748B',
                  borderColor: filtro === f.key ? '#4B7BF5' : '#CBD5E1',
                }}>
                {f.label}
                <span className="opacity-60">{counts[f.key]}</span>
              </button>
            ))}
          </div>

          {/* Busca */}
          <div className="mb-3 flex-shrink-0">
            <input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar pelo nome..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white outline-none
                         focus:border-blue-400 transition-colors"
              style={{ color: '#1A2340' }} />
          </div>

          {/* Lista com scroll */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-0.5">
            {filtrado.map(j => {
              const freqPct   = Math.round(100 - j.faltas * 12.5)
              const temAlerta = j.faltas >= 3
              return (
                <Link key={j.id} href={`/jovens/${j.id}`} style={{ textDecoration: 'none' }}>
                  <div
                    className="bg-white rounded-xl p-3 hover:shadow-sm transition-all"
                    style={{
                      border:       '0.5px solid #E2E8F0',
                      borderLeft:   temAlerta ? '3px solid #E24B4A' : '3px solid #4B7BF5',
                      borderRadius: '0 10px 10px 0',
                    }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center
                                     text-xs font-semibold flex-shrink-0"
                          style={{
                            background: temAlerta ? '#FCEBEB' : '#EEF2FF',
                            color:      temAlerta ? '#A32D2D' : '#4B7BF5',
                          }}>
                          {j.nome.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{j.nome}</p>
                          <p className="text-xs text-slate-400 truncate">{j.cursoAtual}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        {temAlerta && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: '#FCEBEB', color: '#A32D2D' }}>
                            {j.faltas} faltas
                          </span>
                        )}
                        <div className="hidden sm:flex items-center gap-1.5">
                          <div className="w-14 h-1.5 rounded-full overflow-hidden" style={{ background: '#E2E8F0' }}>
                            <div className="h-full rounded-full"
                              style={{
                                background: temAlerta ? '#E24B4A' : '#1D9E75',
                                width: `${freqPct}%`,
                              }} />
                          </div>
                          <span className="text-xs font-medium"
                            style={{ color: temAlerta ? '#E24B4A' : '#1D9E75', minWidth: 28 }}>
                            {freqPct}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}

            {filtrado.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <User size={18} className="text-slate-400" />
                </div>
                <p className="text-sm text-slate-500">Nenhum jovem encontrado</p>
                {busca && (
                  <button onClick={() => setBusca('')} className="text-xs mt-2" style={{ color: '#4B7BF5' }}>
                    Limpar busca
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Painel direito — desktop */}
        <div className="hidden lg:flex w-60 xl:w-64 flex-col items-center justify-center
                        border-l border-slate-200 bg-white flex-shrink-0">
          <div className="w-10 h-10 rounded-full mb-3 flex items-center justify-center"
            style={{ background: '#F1F5F9' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.8">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <p className="text-xs text-slate-400 text-center px-6 leading-relaxed">
            Selecione um jovem para ver o histórico completo
          </p>
          <button
            onClick={() => setModal(true)}
            className="mt-5 flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg
                       transition-opacity hover:opacity-90"
            style={{ background: '#EEF2FF', color: '#4B7BF5', border: '0.5px solid #B5D4F4' }}>
            <Plus size={13} />
            Cadastrar novo jovem
          </button>
        </div>
      </div>

      {/* ── MODAL CADASTRO ── */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(15,23,42,0.45)' }}
          onClick={e => { if (e.target === e.currentTarget) fecharModal() }}>

          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            style={{ border: '0.5px solid #E2E8F0' }}>

            {/* Header modal */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <p className="text-sm font-semibold text-slate-900">Cadastrar novo jovem</p>
                <p className="text-xs text-slate-400 mt-0.5">Preencha os dados abaixo</p>
              </div>
              <button
                onClick={fecharModal}
                className="w-7 h-7 rounded-lg flex items-center justify-center
                           text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <X size={15} />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-4 flex flex-col gap-4 overflow-y-auto" style={{ maxHeight: '65vh' }}>

              {/* Nome */}
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1.5 block">
                  Nome completo <span style={{ color: '#E24B4A' }}>*</span>
                </label>
                <input
                  autoFocus
                  value={nome}
                  onChange={e => { setNome(e.target.value); setErroNome(false) }}
                  placeholder="Ex: Maria Silva"
                  className="w-full px-3 py-2.5 text-sm border rounded-lg bg-white outline-none transition-colors"
                  style={{
                    borderColor: erroNome ? '#E24B4A' : '#E2E8F0',
                    color: '#1A2340',
                  }} />
                {erroNome && (
                  <p className="text-xs mt-1" style={{ color: '#E24B4A' }}>Nome é obrigatório</p>
                )}
              </div>

              {/* Email + Telefone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1.5 block">E-mail</label>
                  <input
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    type="email"
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white
                               outline-none focus:border-blue-400 transition-colors"
                    style={{ color: '#1A2340' }} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1.5 block">Telefone</label>
                  <input
                    value={telefone}
                    onChange={e => setTelefone(e.target.value)}
                    placeholder="(67) 9 9999-0000"
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white
                               outline-none focus:border-blue-400 transition-colors"
                    style={{ color: '#1A2340' }} />
                </div>
              </div>

              {/* Ano de entrada */}
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1.5 block">Ano de entrada</label>
                <input
                  value={anoEntrada}
                  onChange={e => setAnoEntrada(e.target.value)}
                  type="number"
                  min="2010"
                  max="2030"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white
                             outline-none focus:border-blue-400 transition-colors"
                  style={{ color: '#1A2340' }} />
              </div>

              {/* Curso atual */}
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1.5 block">Curso atual</label>
                <select
                  value={cursoAtual}
                  onChange={e => setCursoAtual(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white
                             outline-none focus:border-blue-400 transition-colors"
                  style={{ color: '#1A2340' }}>
                  {cursos.map(c => (
                    <option key={c.id} value={c.nome}>{c.nome}</option>
                  ))}
                </select>
              </div>

              {/* Prática */}
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1.5 block">Prática</label>
                <select
                  value={praticaAtual}
                  onChange={e => setPraticaAtual(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white
                             outline-none focus:border-blue-400 transition-colors"
                  style={{ color: '#1A2340' }}>
                  {praticas.map(p => (
                    <option key={p.id} value={p.nome}>{p.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                onClick={fecharModal}
                className="text-xs font-medium px-4 py-2 rounded-lg border border-slate-200
                           text-slate-600 hover:bg-slate-50 transition-colors">
                Cancelar
              </button>
              <button
                onClick={salvarJovem}
                className="text-xs font-medium px-5 py-2 rounded-lg transition-opacity hover:opacity-90"
                style={{ background: '#4B7BF5', color: '#fff' }}>
                Cadastrar jovem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}