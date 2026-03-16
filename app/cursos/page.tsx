'use client'
// LOCALIZAÇÃO: app/cursos/page.tsx

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, X } from 'lucide-react'

type Jovem = { id: number; nome: string; curso_atual: string | null }
type Curso  = { id: number; nome: string; semestre: string; descricao: string | null; color_idx: number; matriculados: number }

const COLORS = [
  { header: '#4B7BF5', light: '#EEF2FF', text: '#185FA5', border: '#B5D4F4' },
  { header: '#7F77DD', light: '#EEEDFE', text: '#3C3489', border: '#CECBF6' },
  { header: '#1D9E75', light: '#E1F5EE', text: '#085041', border: '#9FE1CB' },
  { header: '#BA7517', light: '#FAEEDA', text: '#633806', border: '#FAC775' },
]

export default function CursosPage() {
  const [cursos,   setCursos]   = useState<Curso[]>([])
  const [jovens,   setJovens]   = useState<Jovem[]>([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [nome,     setNome]     = useState('')
  const [semestre, setSemestre] = useState('1º sem / 2026')
  const [descricao,setDescricao]= useState('')
  const [erroNome, setErroNome] = useState(false)

  const carregar = () => Promise.all([
    fetch('/api/cursos').then(r => r.json()),
    fetch('/api/jovens').then(r => r.json()),
  ]).then(([c, j]) => {
    setCursos(Array.isArray(c) ? c : [])
    setJovens(Array.isArray(j) ? j : [])
    setLoading(false)
  }).catch(() => setLoading(false))

  useEffect(() => { carregar() }, [])

  const fecharModal = () => { setModal(false); setNome(''); setDescricao(''); setErroNome(false) }
  const salvarCurso = async () => {
    if (!nome.trim()) { setErroNome(true); return }
    setSalvando(true)
    const res = await fetch('/api/cursos', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: nome.trim(), semestre, descricao: descricao.trim() || null, color_idx: cursos.length % COLORS.length }),
    })
    if (res.ok) { await carregar(); fecharModal() }
    setSalvando(false)
  }

  if (loading) return <div className="flex items-center justify-center h-full p-10"><p className="text-sm text-slate-400">Carregando cursos...</p></div>

  return (
    <div className="flex flex-col h-full md:h-screen overflow-hidden">
      <div className="flex-shrink-0 px-4 md:px-5 py-3 bg-white border-b border-slate-200 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-900">Cursos</span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: '#EEF2FF', color: '#4B7BF5' }}>1º sem / 2026</span>
          <button onClick={() => setModal(true)} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg hover:opacity-90" style={{ background: '#4B7BF5', color: '#fff' }}>
            <Plus size={13} strokeWidth={2.5} /> Novo curso
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 md:p-5">
        {cursos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-sm text-slate-500">Nenhum curso cadastrado</p>
            <button onClick={() => setModal(true)} className="text-xs font-medium px-4 py-2 rounded-lg" style={{ background: '#EEF2FF', color: '#4B7BF5' }}>Criar primeiro curso</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {cursos.map((c, i) => {
              const color  = COLORS[i % COLORS.length]
              const alunos = jovens.filter(j => j.curso_atual === c.nome)
              return (
                <div key={c.id} className="bg-white rounded-xl overflow-hidden" style={{ border: `0.5px solid ${color.border}` }}>
                  <div className="p-4" style={{ background: color.header }}>
                    <p className="text-sm font-semibold text-white">{c.nome}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>{c.semestre}</p>
                    {c.descricao && <p className="text-xs mt-2 leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>{c.descricao}</p>}
                  </div>
                  <div className="p-3.5">
                    <div className="mb-3">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: color.light, color: color.text }}>
                        {c.matriculados} matriculado{c.matriculados !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {alunos.length > 0 && (
                      <div className="flex flex-col gap-1">
                        {alunos.map(j => (
                          <Link key={j.id} href={`/jovens/${j.id}`} className="flex items-center gap-2 py-1 rounded-lg px-1 hover:bg-slate-50 transition-colors" style={{ textDecoration: 'none' }}>
                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0" style={{ background: color.light, color: color.text, fontSize: 9 }}>
                              {j.nome.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                            </div>
                            <span className="text-xs text-slate-700 truncate">{j.nome}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.45)' }} onClick={e => { if (e.target === e.currentTarget) fecharModal() }}>
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden" style={{ border: '0.5px solid #E2E8F0' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div><p className="text-sm font-semibold text-slate-900">Novo curso</p><p className="text-xs text-slate-400 mt-0.5">Será adicionado à lista de cursos</p></div>
              <button onClick={fecharModal} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"><X size={15} /></button>
            </div>
            <div className="px-5 py-4 flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1.5 block">Nome do curso <span style={{ color: '#E24B4A' }}>*</span></label>
                <input autoFocus value={nome} onChange={e => { setNome(e.target.value); setErroNome(false) }} placeholder="Ex: Escola de Líderes"
                  className="w-full px-3 py-2.5 text-sm border rounded-lg bg-white outline-none transition-colors"
                  style={{ borderColor: erroNome ? '#E24B4A' : '#E2E8F0', color: '#1A2340' }} />
                {erroNome && <p className="text-xs mt-1" style={{ color: '#E24B4A' }}>Nome é obrigatório</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1.5 block">Semestre</label>
                <input value={semestre} onChange={e => setSemestre(e.target.value)} placeholder="Ex: 1º sem / 2026"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white outline-none focus:border-blue-400" style={{ color: '#1A2340' }} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1.5 block">Descrição</label>
                <textarea value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Breve descrição..." rows={2}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white outline-none focus:border-blue-400 resize-none" style={{ color: '#1A2340' }} />
              </div>
            </div>
            <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button onClick={fecharModal} className="text-xs font-medium px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button onClick={salvarCurso} disabled={salvando} className="text-xs font-medium px-5 py-2 rounded-lg hover:opacity-90" style={{ background: '#4B7BF5', color: '#fff', opacity: salvando ? 0.7 : 1 }}>
                {salvando ? 'Salvando...' : 'Criar curso'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}