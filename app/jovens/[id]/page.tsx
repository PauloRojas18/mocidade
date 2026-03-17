'use client'
// LOCALIZAÇÃO: app/jovens/[id]/page.tsx

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
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
type FreqRow        = { jovem_id: number; total: number; presentes: number }

// Tipo para presenças retornadas pela API /api/presencas-praticas
type PresencaPratica = {
  id: number
  presente: boolean
  data: string
  jovem_id: number
  pratica_id: number
  jovem_nome: string
  pratica_nome: string
}

export default function JovemPage() {
  const params = useParams()
  const id = params?.id as string

  const [jovem,         setJovem]         = useState<Jovem | null>(null)
  const [todosJovens,   setTodosJovens]   = useState<TodosJovens[]>([])
  const [presencas,     setPresencas]     = useState<PresencaAula[]>([])
  const [chamadaDia,    setChamadaDia]    = useState<ChamadaDiaItem[]>([])
  const [cursos,        setCursos]        = useState<Curso[]>([])
  const [praticas,      setPraticas]      = useState<Pratica[]>([])
  const [loading,       setLoading]       = useState(true)
  const [naoEncontrado, setNaoEncontrado] = useState(false)
  const [totalGlobal,   setTotalGlobal]   = useState(0)
  const [presentesGlobal, setPresentesGlobal] = useState(0)

  const [editando,     setEditando]     = useState(false)
  const [salvandoEdit, setSalvandoEdit] = useState(false)
  const [cursoEdit,    setCursoEdit]    = useState('')
  const [praticaEdit,  setPraticaEdit]  = useState('')
  const [emailEdit,    setEmailEdit]    = useState('')
  const [telefoneEdit, setTelefoneEdit] = useState('')

  useEffect(() => {
    if (!id) return

    const fetchData = async () => {
      try {
        // Buscar dados do jovem
        const jovemRes = await fetch(`/api/jovens/${id}`)
        if (!jovemRes.ok) {
          setNaoEncontrado(true)
          setLoading(false)
          return
        }
        const jovemData = await jovemRes.json()
        setJovem(jovemData)

        // Buscar todos os jovens (sidebar)
        const todosRes = await fetch('/api/jovens')
        const todosData = await todosRes.json()
        setTodosJovens(Array.isArray(todosData) ? todosData : [])

        // Buscar presenças em aulas
        const aulasRes = await fetch(`/api/presencas/jovem?jovemId=${id}`)
        let aulasData: PresencaAula[] = []
        if (aulasRes.ok) {
          const data = await aulasRes.json()
          aulasData = Array.isArray(data) ? data : (data.aulas || [])
        }

        // Buscar presenças em práticas
        const praticasRes = await fetch(`/api/presencas-praticas?jovemId=${id}`)
        let praticasData: PresencaPratica[] = []
        if (praticasRes.ok) {
          praticasData = await praticasRes.json()
        }

        // Converter práticas para o formato PresencaAula
        const praticasConvertidas: PresencaAula[] = praticasData.map(p => ({
          id: p.id,
          presente: p.presente,
          aulas: {
            id: p.pratica_id,
            curso_nome: p.pratica_nome,
            data: p.data,
            descricao: 'Chamada de prática'
          }
        }))

        // Combinar aulas e práticas
        setPresencas([...aulasData, ...praticasConvertidas])

        // Buscar cursos e práticas (para selects de edição)
        const cursosRes = await fetch('/api/cursos')
        const cursosData = await cursosRes.json()
        setCursos(Array.isArray(cursosData) ? cursosData : [])

        const praticasListRes = await fetch('/api/praticas')
        const praticasListData = await praticasListRes.json()
        setPraticas(Array.isArray(praticasListData) ? praticasListData : [])

        // Buscar frequência global
        const todasPresRes = await fetch('/api/presencas/todas')
        if (todasPresRes.ok) {
          const todasPresData = await todasPresRes.json()
          const meuRow = todasPresData.find((r: FreqRow) => r.jovem_id === Number(id))
          setTotalGlobal(meuRow?.total ?? 0)
          setPresentesGlobal(meuRow?.presentes ?? 0)
        }

        // Buscar chamada do dia do jovem
        const chamadaRes = await fetch(`/api/chamada-dia?jovemId=${id}`)
        if (chamadaRes.ok) {
          const chamadaData = await chamadaRes.json()
          setChamadaDia(Array.isArray(chamadaData) ? chamadaData.sort((a, b) => b.data.localeCompare(a.data)) : [])
        }

        setLoading(false)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const abrirEdicao = () => {
    if (!jovem) return
    setCursoEdit(jovem.curso_atual ?? '')
    setPraticaEdit(jovem.pratica_atual ?? '')
    setEmailEdit(jovem.email ?? '')
    setTelefoneEdit(jovem.telefone ?? '')
    setEditando(true)
  }

  const cancelarEdicao = () => {
    setEditando(false)
    setCursoEdit(''); setPraticaEdit('')
    setEmailEdit(''); setTelefoneEdit('')
  }

  const salvarEdicao = async () => {
    if (!jovem) return
    setSalvandoEdit(true)
    const res = await fetch(`/api/jovens/${jovem.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        curso_atual:   cursoEdit   || null,
        pratica_atual: praticaEdit || null,
        email:         emailEdit   || null,
        telefone:      telefoneEdit || null,
      }),
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

  if (loading) return <div className="flex items-center justify-center h-full p-10"><p className="text-sm text-slate-400">Carregando...</p></div>
  if (naoEncontrado || !jovem) return (
    <div className="flex flex-col items-center justify-center h-full p-10 gap-3">
      <p className="text-sm text-slate-500">Jovem não encontrado</p>
      <Link href="/jovens" className="text-xs" style={{ color: '#4B7BF5' }}>← Voltar</Link>
    </div>
  )

  const initials = jovem.nome.split(' ').map((n: string) => n[0]).slice(0, 2).join('')

  // Frequência da chamada do dia
  const freqPct   = totalGlobal > 0 ? Math.round((presentesGlobal / totalGlobal) * 100) : 100
  const temAlerta = totalGlobal > 0 && freqPct < 75

  // Presenças em aulas e práticas (agora já mescladas no estado `presencas`)
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

            {/* Header do jovem — frequência da chamada do dia */}
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
                <div>
                  <p className="text-xs text-slate-400 mb-1.5">E-mail</p>
                  {editando ? (
                    <input
                      type="email"
                      value={emailEdit}
                      onChange={e => setEmailEdit(e.target.value)}
                      placeholder="sem e-mail"
                      className="w-full text-xs px-3 py-2 rounded-lg outline-none"
                      style={{ border: '0.5px solid #CBD5E1', background: '#F8FAFC' }}
                    />
                  ) : (
                    <p className="text-sm font-medium text-slate-800">{jovem.email ?? '—'}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1.5">Telefone</p>
                  {editando ? (
                    <input
                      type="tel"
                      value={telefoneEdit}
                      onChange={e => setTelefoneEdit(e.target.value)}
                      placeholder="sem telefone"
                      className="w-full text-xs px-3 py-2 rounded-lg outline-none"
                      style={{ border: '0.5px solid #CBD5E1', background: '#F8FAFC' }}
                    />
                  ) : (
                    <p className="text-sm font-medium text-slate-800">{jovem.telefone ?? '—'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Presenças em aulas e práticas (lista individual) */}
            {presencas.length > 0 && (
              <div className="bg-white rounded-xl overflow-hidden mb-4" style={{ border: '0.5px solid #E2E8F0' }}>
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Presenças em aulas e práticas
                  </p>
                </div>
                <div className="divide-y divide-slate-50 overflow-y-auto" style={{ maxHeight: 240 }}>
                  {presencas
                    .filter(p => p.aulas)
                    .sort((a, b) => (b.aulas?.data || '').localeCompare(a.aulas?.data || ''))
                    .map(p => {
                      const data = p.aulas?.data ? new Date(p.aulas.data + 'T00:00') : null
                      const dataStr = data
                        ? data.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
                        : 'Data desconhecida'
                      const tipo = p.aulas?.descricao === 'Chamada de prática' ? 'prática' : 'curso'
                      return (
                        <div key={p.id} className="flex items-center justify-between px-4 py-2.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs text-slate-700 truncate max-w-[100px]">{dataStr}</span>
                            <span
                              className="text-xs px-1.5 py-0.5 rounded flex-shrink-0"
                              style={{
                                background: tipo === 'prática' ? '#FBEAF0' : '#EEF2FF',
                                color: tipo === 'prática' ? '#D4537E' : '#4B7BF5',
                                fontSize: 10,
                              }}
                            >
                              {tipo}
                            </span>
                            <span className="text-xs text-slate-500 truncate max-w-[120px]">
                              {p.aulas?.curso_nome}
                            </span>
                          </div>
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ml-2"
                            style={{
                              background: p.presente ? '#E1F5EE' : '#FEF2F2',
                              color: p.presente ? '#085041' : '#991B1B',
                            }}
                          >
                            {p.presente ? 'Presente' : 'Ausente'}
                          </span>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}

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