'use client'
// LOCALIZAÇÃO: app/_components/RelatoriosClient.tsx

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

type Jovem    = { id: number; nome: string; curso_atual: string | null }
type Curso    = { id: number; nome: string; matriculados: number }
type Pratica  = { id: number; nome: string; pratica_membros?: { jovem_id: number }[] }
type PresRow  = { jovem_id: number; presente: boolean; aulas: { curso_nome: string } | null }
type FreqRow  = { jovem_id: number; total: number; presentes: number }

type Props = {
  jovens:    Jovem[]
  cursos:    Curso[]
  praticas:  Pratica[]
  presencas: PresRow[]
  freqDia:   FreqRow[]
}

type TokenResponse = { access_token?: string }
type TokenClient   = { requestAccessToken: () => void }
type GoogleOAuth2  = { initTokenClient: (cfg: { client_id: string; scope: string; callback: (r: TokenResponse) => void }) => TokenClient }
type GoogleWindow  = { google: { accounts: { oauth2: GoogleOAuth2 } } }

const GOOGLE_CLIENT_ID = '313358596011-nge26to67475gneepri4ncgf20cm33fi.apps.googleusercontent.com'
const DRIVE_SCOPE      = 'https://www.googleapis.com/auth/drive'
const DRIVE_FOLDER_ID  = '1pYKYHg1KGKEYDbkhO07Ii2ZaCgxjCnSm'

export default function RelatoriosClient({ jovens, cursos, praticas, presencas, freqDia }: Props) {
  const [driveToken,    setDriveToken]    = useState<string | null>(null)
  const [salvandoDrive, setSalvandoDrive] = useState<string | null>(null)
  const [savedDrive,    setSavedDrive]    = useState<Record<string, string>>({})
  const tokenClientRef   = useRef<TokenClient | null>(null)
  const pendingExportRef = useRef<string | null>(null)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = () => {
      const g = (window as unknown as GoogleWindow).google
      tokenClientRef.current = g.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: DRIVE_SCOPE,
        callback: (resp: TokenResponse) => {
          if (resp.access_token) {
            setDriveToken(resp.access_token)
            if (pendingExportRef.current) {
              const tipo = pendingExportRef.current
              pendingExportRef.current = null
              salvarNoDrive(tipo, resp.access_token)
            }
          }
        },
      })
    }
    document.body.appendChild(script)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const buildCSV = (tipo: string): { csv: string; nome: string } => {
    if (tipo === 'jovens') {
      const rows = jovens.map(j => `"${j.nome}","${j.curso_atual ?? ''}"`).join('\n')
      return { csv: `Nome,Curso\n${rows}`, nome: 'jovens' }
    }
    if (tipo === 'cursos') {
      const linhas: string[] = []
      cursos.forEach(c => {
        const alunos = jovens.filter(j => j.curso_atual === c.nome)
        if (!alunos.length) linhas.push(`"${c.nome}","—"`)
        else alunos.forEach(a => linhas.push(`"${c.nome}","${a.nome}"`))
      })
      return { csv: `Curso,Aluno\n${linhas.join('\n')}`, nome: 'cursos' }
    }
    if (tipo === 'praticas') {
      const linhas: string[] = []
      praticas.forEach(p => {
        const membros = p.pratica_membros ?? []
        if (!membros.length) linhas.push(`"${p.nome}","—"`)
        else membros.forEach((m: { jovem_id: number }) => {
          const j = jovens.find(x => x.id === m.jovem_id)
          linhas.push(`"${p.nome}","${j?.nome ?? ''}"`)
        })
      })
      return { csv: `Prática,Jovem\n${linhas.join('\n')}`, nome: 'praticas' }
    }
    const rows = jovens.map(j => {
      const f = freqDia.find(r => r.jovem_id === j.id)
      const pct = f && f.total > 0 ? Math.round((f.presentes / f.total) * 100) : 100
      return `"${j.nome}","${j.curso_atual ?? ''}","${f?.presentes ?? 0}","${f?.total ?? 0}","${pct}%"`
    }).join('\n')
    return { csv: `Nome,Curso,Presenças,Total de Chamadas,Frequência\n${rows}`, nome: 'presencas' }
  }

  const salvarNoDrive = async (tipo: string, token: string) => {
    setSalvandoDrive(tipo)
    try {
      const ano = new Date().getFullYear().toString()
      const searchRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${ano}' and mimeType='application/vnd.google-apps.folder' and '${DRIVE_FOLDER_ID}' in parents and trashed=false&fields=files(id,name)`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const searchData = await searchRes.json() as { files: { id: string; name: string }[] }
      let pastaAnoId: string
      if (searchData.files.length > 0) {
        pastaAnoId = searchData.files[0].id
      } else {
        const criarRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: ano, mimeType: 'application/vnd.google-apps.folder', parents: [DRIVE_FOLDER_ID] }),
        })
        const criarData = await criarRes.json() as { id: string }
        pastaAnoId = criarData.id
      }
      const { csv, nome } = buildCSV(tipo)
      const nomeArquivo = `mocidade_${nome}_${new Date().toISOString().split('T')[0]}.csv`
      const boundary = '-------mocidade_boundary'
      const metadata = JSON.stringify({ name: nomeArquivo, mimeType: 'text/csv', parents: [pastaAnoId] })
      const body = [
        `--${boundary}`, 'Content-Type: application/json; charset=UTF-8', '', metadata,
        `--${boundary}`, 'Content-Type: text/csv', '', csv, `--${boundary}--`,
      ].join('\r\n')
      const res = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink',
        { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': `multipart/related; boundary=${boundary}` }, body }
      )
      if (res.ok) {
        const data = await res.json() as { id: string; webViewLink: string }
        setSavedDrive(prev => ({ ...prev, [tipo]: data.webViewLink }))
      } else {
        const err = await res.json() as { error?: { message?: string } }
        if (res.status === 401) {
          setDriveToken(null)
          pendingExportRef.current = tipo
          tokenClientRef.current?.requestAccessToken()
        } else {
          alert('Erro ao salvar no Drive: ' + (err.error?.message ?? 'tente novamente'))
        }
      }
    } finally {
      setSalvandoDrive(null)
    }
  }

  const handleSalvarDrive = (tipo: string) => {
    if (driveToken) salvarNoDrive(tipo, driveToken)
    else { pendingExportRef.current = tipo; tokenClientRef.current?.requestAccessToken() }
  }

  const totalMembros = praticas.reduce((a, p) => a + (p.pratica_membros?.length ?? 0), 0)

  const freqCursoMap: Record<string, { t: number; p: number }> = {}
  presencas.forEach(p => {
    const n = p.aulas?.curso_nome
    if (!n) return
    if (!freqCursoMap[n]) freqCursoMap[n] = { t: 0, p: 0 }
    freqCursoMap[n].t++
    if (p.presente) freqCursoMap[n].p++
  })

  const ranking = jovens
    .map(j => {
      const f      = freqDia.find(r => r.jovem_id === j.id)
      const total  = f?.total     ?? 0
      const pres   = f?.presentes ?? 0
      const faltas = total - pres
      const pct    = total > 0 ? Math.round((pres / total) * 100) : 100
      return { ...j, pct, faltas, total }
    })
    .filter(j => j.total > 0)
    .sort((a, b) => b.pct - a.pct)

  const comAlerta = ranking.filter(j => j.pct < 75).length
  const semFaltas = ranking.filter(j => j.faltas === 0 && j.total > 0).length

  const exportacoes = [
    { tipo: 'jovens',    titulo: 'Lista de jovens',    descricao: `${jovens.length} jovens`,     href: '/api/exportar/jovens',    cor: '#4B7BF5', bg: '#EEF2FF' },
    { tipo: 'cursos',    titulo: 'Lista por curso',     descricao: `${cursos.length} cursos`,     href: '/api/exportar/cursos',    cor: '#1D9E75', bg: '#E1F5EE' },
    { tipo: 'praticas',  titulo: 'Lista por prática',   descricao: `${praticas.length} práticas`, href: '/api/exportar/praticas',  cor: '#D4537E', bg: '#FBEAF0' },
    { tipo: 'presencas', titulo: 'Frequência completa', descricao: 'Presenças por aluno',         href: '/api/exportar/presencas', cor: '#BA7517', bg: '#FAEEDA' },
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
            { label: 'Total de jovens',  value: jovens.length,   color: '#4B7BF5' },
            { label: 'Cursos ativos',    value: cursos.length,   color: '#7F77DD' },
            { label: 'Práticas',         value: praticas.length, color: '#D4537E' },
            { label: 'Membros práticas', value: totalMembros,    color: '#BA7517' },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-xl p-4" style={{ border: '0.5px solid #E2E8F0' }}>
              <div className="w-7 h-0.5 rounded-full mb-2.5" style={{ background: c.color }} />
              <p className="text-2xl font-semibold text-slate-900">{c.value}</p>
              <p className="text-xs text-slate-400 mt-1">{c.label}</p>
            </div>
          ))}
        </div>

        {/* Cards de frequência */}
        {ranking.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-white rounded-xl p-4" style={{ border: '0.5px solid #F4C0D1' }}>
              <div className="w-7 h-0.5 rounded-full mb-2.5" style={{ background: '#E24B4A' }} />
              <p className="text-2xl font-semibold text-slate-900">{comAlerta}</p>
              <p className="text-xs text-slate-400 mt-1">Alertas de falta</p>
              <p className="text-xs mt-0.5" style={{ color: '#E24B4A' }}>abaixo de 75%</p>
            </div>
            <div className="bg-white rounded-xl p-4" style={{ border: '0.5px solid #9FE1CB' }}>
              <div className="w-7 h-0.5 rounded-full mb-2.5" style={{ background: '#1D9E75' }} />
              <p className="text-2xl font-semibold text-slate-900">{semFaltas}</p>
              <p className="text-xs text-slate-400 mt-1">Frequência plena</p>
              <p className="text-xs mt-0.5" style={{ color: '#1D9E75' }}>sem nenhuma falta</p>
            </div>
          </div>
        )}

        {/* Exportações */}
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Exportar listas</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {exportacoes.map(e => (
              <div key={e.tipo} className="bg-white rounded-xl overflow-hidden" style={{ border: '0.5px solid #E2E8F0' }}>
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: e.bg }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={e.cor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-800">{e.titulo}</p>
                    <p className="text-xs text-slate-400">{e.descricao}</p>
                  </div>
                </div>
                <div className="flex border-t border-slate-100 divide-x divide-slate-100">
                  <a href={e.href} target="_blank" rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium hover:bg-slate-50 transition-colors"
                    style={{ color: '#64748B', textDecoration: 'none' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Baixar Excel
                  </a>
                  {savedDrive[e.tipo] ? (
                    <a href={savedDrive[e.tipo]} target="_blank" rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium hover:opacity-80"
                      style={{ color: '#1D9E75', textDecoration: 'none', background: '#F0FBF6' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      Abrir no Drive
                    </a>
                  ) : (
                    <button onClick={() => handleSalvarDrive(e.tipo)} disabled={salvandoDrive === e.tipo}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium hover:bg-slate-50"
                      style={{ color: salvandoDrive === e.tipo ? '#94A3B8' : '#4B7BF5' }}>
                      {salvandoDrive === e.tipo ? (
                        <><svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Salvando...</>
                      ) : (
                        <>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                            <polyline points="22 4 12 14.01 9 11.01"/>
                          </svg>
                          Salvar no Drive
                        </>
                      )}
                    </button>
                  )}
                </div>
                {savedDrive[e.tipo] && (
                  <div className="px-4 py-2 border-t border-slate-50" style={{ background: '#F0FBF6' }}>
                    <p className="text-xs text-slate-500 truncate">
                      ✓ Salvo em <strong>secretaria / {new Date().getFullYear()}</strong> — <a href={savedDrive[e.tipo]} target="_blank" rel="noreferrer" style={{ color: '#1D9E75' }}>abrir arquivo</a>
                    </p>
                  </div>
                )}
              </div>
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
            {Object.keys(freqCursoMap).length === 0 ? (
              <div className="px-4 py-6 text-center"><p className="text-xs text-slate-400">Nenhuma chamada de aula ainda</p></div>
            ) : (
              <div className="p-4 flex flex-col gap-4">
                {cursos.map(c => {
                  const f = freqCursoMap[c.nome]
                  if (!f) return null
                  const pct = Math.round((f.p / f.t) * 100)
                  return (
                    <div key={c.id}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs text-slate-700 truncate mr-2">{c.nome}</span>
                        <span className="text-xs font-semibold flex-shrink-0"
                          style={{ color: pct >= 75 ? '#1D9E75' : '#E24B4A' }}>{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
                        <div className="h-full rounded-full" style={{ background: pct >= 75 ? '#1D9E75' : '#E24B4A', width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Ranking */}
          <div className="bg-white rounded-xl overflow-hidden" style={{ border: '0.5px solid #E2E8F0' }}>
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-800">Ranking de frequência</p>
              <span className="text-xs text-slate-400">chamada do dia</span>
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
                      style={{ background: j.pct < 75 ? '#FCEBEB' : '#EEF2FF', color: j.pct < 75 ? '#A32D2D' : '#4B7BF5', fontSize: 9 }}>
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