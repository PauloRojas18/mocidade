'use client'
// LOCALIZAÇÃO: app/_components/JovemDetalheClient.tsx

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Phone, Pencil, Check, X } from 'lucide-react'
import { CustomSelect } from '@/components/CustomSelect'

type Jovem = {
  id: number; nome: string; email: string | null; telefone: string | null
  ano_entrada: number; curso_atual: string | null; pratica_atual: string | null
}
type TodosJovens    = { id: number; nome: string; curso_atual: string | null }
type PresencaAula   = { id: number; presente: boolean; aulas: { id: number; curso_nome: string; data: string; descricao: string } | null }
type ChamadaDiaItem = { id: number; presente: boolean; data: string }
type Curso          = { id: number; nome: string }
type Pratica        = { id: number; nome: string }

type Props = {
  jovem:            Jovem
  todosJovens:      TodosJovens[]
  presencas:        PresencaAula[]
  chamadaDia:       ChamadaDiaItem[]
  cursos:           Curso[]
  praticas:         Pratica[]
  totalGlobal:      number
  presentesGlobal:  number
}

export default function JovemDetalheClient({
  jovem: jovemInit,
  todosJovens,
  presencas,
  chamadaDia,
  cursos,
  praticas,
  totalGlobal,
  presentesGlobal,
}: Props) {
  const [jovem,        setJovem]        = useState<Jovem>(jovemInit)
  const [editando,     setEditando]     = useState(false)
  const [salvandoEdit, setSalvandoEdit] = useState(false)
  const [cursoEdit,    setCursoEdit]    = useState('')
  const [praticaEdit,  setPraticaEdit]  = useState('')

  const abrirEdicao = () => {
    setCursoEdit(jovem.curso_atual ?? '')
    setPraticaEdit(jovem.pratica_atual ?? '')
    setEditando(true)
  }

  const cancelarEdicao = () => { setEditando(false); setCursoEdit(''); setPraticaEdit('') }

  const salvarEdicao = async () => {
    setSalvandoEdit(true)
    const res = await fetch(`/api/jovens/${jovem.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ curso_atual: cursoEdit || null, pratica_atual: praticaEdit || null }),
    })
    if (res.ok) {
      setJovem(await res.json() as Jovem)
      setEditando(false)
    } else {
      const err = await res.json() as { error?: string }
      alert('Erro ao salvar: ' + (err.error ?? 'tente novamente'))
    }
    setSalvandoEdit(false)
  }

  const initials  = jovem.nome.split(' ').map((n: string) => n[0]).slice(0, 2).join('')
  const freqPct   = totalGlobal > 0 ? Math.round((presentesGlobal / totalGlobal) * 100) : 100
  const temAlerta = totalGlobal > 0 && freqPct < 75

  const totalAulas = presencas.length
  const porCurso: Record<string, { nome: string; total: number; presentes: number; tipo: 'curso' | 'pratica' }> = {}
  presencas.forEach(p => {
    if (!p.aulas) return
    const nome = p.aulas.curso_nome
    const tipo: 'curso' | 'pratica' = p.aulas.descricao === 'Chamada de prática' ? 'pratica' : 'curso'
    const key = nome + tipo
    if (!porCurso[key]) porCurso[key] = { nome, total: 0, presentes: 0, tipo }
    porCurso[key].total++
    if (p.presente) porCurso[key].presentes++
  })

  const presentesDia = chamadaDia.filter(c => c.presente).length

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
            {/* Header */}
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
                  <p className="text-2xl font-semibold" style={{ color: temAlerta ? '#E24B4A' : '#1D9E75' }}>
                    {totalGlobal > 0 ? `${freqPct}%` : '—'}
                  </p>
                  <p className="text-xs text-slate-400">frequência</p>
                </div>
              </div>
              {temAlerta && (
                <div className="mt-3 px-3 py-2.5 rounded-lg" style={{ background: '#FCEBEB', border: '0.5px solid #F7C1C1' }}>
                  <p className="text-xs font-semibold" style={{ color: '#A32D2D' }}>Índice de frequência baixo — {presentesGlobal}/{totalGlobal} dias</p>
                  <p className="text-xs mt-0.5" style={{ color: '#793F3F' }}>Considere entrar em contato com {jovem.nome.split(' ')[0]}.</p>
                </div>
              )}
            </div>

            {/* Curso e prática */}
            <div className="bg-white rounded-xl overflow-hidden mb-4" style={{ border: '0.5px solid #E2E8F0' }}>
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Curso & Prática</p>
                {!editando ? (
                  <button onClick={abrirEdicao}
                    className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg hover:opacity-80"
                    style={{ background: '#EEF2FF', color: '#4B7BF5' }}>
                    <Pencil size={11} strokeWidth={2.5} /> Editar
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button onClick={cancelarEdicao}
                      className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg"
                      style={{ background: '#F1F5F9', color: '#64748B' }}>
                      <X size={11} /> Cancelar
                    </button>
                    <button onClick={salvarEdicao} disabled={salvandoEdit}
                      className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg hover:opacity-90"
                      style={{ background: '#1D9E75', color: '#fff', opacity: salvandoEdit ? 0.7 : 1 }}>
                      <Check size={11} strokeWidth={2.5} /> {salvandoEdit ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 p-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1.5">Curso atual</p>
                  {editando ? (
                    <CustomSelect value={cursoEdit} onChange={v => setCursoEdit(String(v))} placeholder="Sem curso"
                      options={cursos.map(c => ({ value: c.nome, label: c.nome }))} />
                  ) : (
                    <p className="text-sm font-medium text-slate-800">{jovem.curso_atual ?? '—'}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1.5">Prática atual</p>
                  {editando ? (
                    <CustomSelect value={praticaEdit} onChange={v => setPraticaEdit(String(v))} placeholder="Sem prática"
                      options={praticas.map(p => ({ value: p.nome, label: p.nome }))} />
                  ) : (
                    <p className="text-sm font-medium text-slate-800">{jovem.pratica_atual ?? '—'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Chamada do dia */}
            <div className="bg-white rounded-xl overflow-hidden mb-4" style={{ border: '0.5px solid #E2E8F0' }}>
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Chamada do dia</p>
                {totalGlobal > 0 && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{
                      background: presentesDia / totalGlobal < 0.75 ? '#FCEBEB' : '#E1F5EE',
                      color:      presentesDia / totalGlobal < 0.75 ? '#A32D2D' : '#085041',
                    }}>
                    {presentesDia}/{totalGlobal} dias
                  </span>
                )}
              </div>
              {chamadaDia.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-xs text-slate-400">Nenhum registro de chamada do dia</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50 overflow-y-auto" style={{ maxHeight: 240 }}>
                  {chamadaDia.map(c => (
                    <div key={c.id} className="flex items-center justify-between px-4 py-2.5">
                      <p className="text-xs text-slate-700">
                        {new Date(c.data + 'T00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </p>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ background: c.presente ? '#E1F5EE' : '#FEF2F2', color: c.presente ? '#085041' : '#991B1B' }}>
                        {c.presente ? 'Presente' : 'Ausente'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Presenças em aulas */}
            {totalAulas > 0 && (
              <div className="bg-white rounded-xl overflow-hidden mb-4" style={{ border: '0.5px solid #E2E8F0' }}>
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Presenças em aulas</p>
                </div>
                {Object.values(porCurso).map((c, i) => {
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
                })}
              </div>
            )}

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