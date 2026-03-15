// LOCALIZAÇÃO: app/relatorios/page.tsx
// NOTA: Os botões de exportação chamam rotas de API que você deve criar.
// Exemplo de rota: app/api/exportar/chamada/route.ts
// Use a lib 'xlsx' ou 'csv-writer' para gerar os arquivos.

import { jovens, cursos, praticas } from '@/lib/mock'
import Link from 'next/link'

export default function RelatoriosPage() {
  const alertas    = jovens.filter(j => j.faltas >= 3)
  const semFaltas  = jovens.filter(j => j.faltas === 0)
  const mediaFaltas = +(jovens.reduce((a, j) => a + j.faltas, 0) / jovens.length).toFixed(1)

  // Exportações disponíveis
  const exportacoes = [
    {
      titulo:   'Lista de chamada — todos os cursos',
      descricao: `${cursos.length} cursos · ${jovens.length} alunos`,
      href:      '/api/exportar/chamada',
      cor:       '#4B7BF5',
      bg:        '#EEF2FF',
    },
    {
      titulo:   'Frequência por aluno',
      descricao: 'Nome, curso, faltas e % de presença',
      href:      '/api/exportar/frequencia',
      cor:       '#1D9E75',
      bg:        '#E1F5EE',
    },
    {
      titulo:   'Alunos com alerta de falta',
      descricao: `${alertas.length} aluno${alertas.length !== 1 ? 's' : ''} acima de 3 faltas`,
      href:      '/api/exportar/alertas',
      cor:       '#E24B4A',
      bg:        '#FCEBEB',
    },
    {
      titulo:   'Lista por prática',
      descricao: `${praticas.length} práticas · ${praticas.reduce((a, p) => a + p.jovens.length, 0)} jovens`,
      href:      '/api/exportar/praticas',
      cor:       '#D4537E',
      bg:        '#FBEAF0',
    },
  ]

  const freqCursos = [
    { nome: 'Escola de Líderes',    pct: 92 },
    { nome: 'Discipulado Avançado', pct: 64 },
    { nome: 'Fundamentos da Fé',    pct: 71 },
    { nome: 'Formação Básica',      pct: 58 },
  ]

  const ranking = [...jovens]
    .map(j => ({ ...j, pct: Math.round(100 - j.faltas * 12.5) }))
    .sort((a, b) => b.pct - a.pct)

  return (
    <div className="flex flex-col h-full md:h-screen overflow-hidden">
      {/* Topbar */}
      <div className="flex-shrink-0 px-4 md:px-5 py-3 bg-white border-b border-slate-200
                      flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-900">Relatórios</span>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full"
          style={{ background: '#EEF2FF', color: '#4B7BF5' }}>1º sem / 2026</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-5">

        {/* Resumo compacto */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Total de jovens',   value: jovens.length,    color: '#4B7BF5' },
            { label: 'Frequência plena',  value: semFaltas.length,  color: '#1D9E75' },
            { label: 'Com alertas',        value: alertas.length,   color: '#E24B4A' },
            { label: 'Média de faltas',    value: mediaFaltas,      color: '#BA7517' },
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
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
            Exportar listas
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {exportacoes.map(e => (
              <a key={e.titulo} href={e.href}
                className="flex items-center gap-3 px-4 py-3.5 bg-white rounded-xl
                           hover:shadow-sm transition-all"
                style={{ border: '0.5px solid #E2E8F0', textDecoration: 'none' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: e.bg }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke={e.cor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{e.titulo}</p>
                  <p className="text-xs text-slate-400 truncate">{e.descricao}</p>
                </div>
                <svg className="flex-shrink-0 ml-auto" width="14" height="14" viewBox="0 0 24 24"
                  fill="none" stroke="#CBD5E1" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Frequência por curso */}
          <div className="bg-white rounded-xl overflow-hidden" style={{ border: '0.5px solid #E2E8F0' }}>
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-xs font-semibold text-slate-800">Frequência por curso</p>
            </div>
            <div className="p-4 flex flex-col gap-4">
              {freqCursos.map(c => (
                <div key={c.nome}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-slate-700 truncate mr-2">{c.nome}</span>
                    <span className="text-xs font-semibold flex-shrink-0"
                      style={{ color: c.pct >= 75 ? '#1D9E75' : '#E24B4A' }}>{c.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
                    <div className="h-full rounded-full"
                      style={{ background: c.pct >= 75 ? '#1D9E75' : '#E24B4A', width: `${c.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ranking */}
          <div className="bg-white rounded-xl overflow-hidden" style={{ border: '0.5px solid #E2E8F0' }}>
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-800">Ranking de frequência</p>
              <span className="text-xs text-slate-400">todos</span>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 260 }}>
              {ranking.map((j, i) => (
                <Link key={j.id} href={`/jovens/${j.id}`}
                  className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 transition-colors"
                  style={{
                    borderBottom: i < ranking.length - 1 ? '0.5px solid #F8FAFC' : 'none',
                    textDecoration: 'none',
                  }}>
                  <span className="text-xs font-semibold flex-shrink-0 w-5 text-right"
                    style={{ color: i < 3 ? '#4B7BF5' : '#CBD5E1' }}>#{i + 1}</span>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center
                                  text-xs font-semibold flex-shrink-0"
                    style={{
                      background: j.faltas >= 3 ? '#FCEBEB' : '#EEF2FF',
                      color:      j.faltas >= 3 ? '#A32D2D' : '#4B7BF5',
                      fontSize:   9,
                    }}>
                    {j.nome.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                  </div>
                  <p className="text-xs text-slate-800 truncate flex-1">{j.nome}</p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="hidden sm:block w-14 h-1.5 rounded-full overflow-hidden"
                      style={{ background: '#F1F5F9' }}>
                      <div className="h-full rounded-full"
                        style={{
                          background: j.pct >= 75 ? '#1D9E75' : '#E24B4A',
                          width: `${j.pct}%`,
                        }} />
                    </div>
                    <span className="text-xs font-semibold"
                      style={{ color: j.pct >= 75 ? '#1D9E75' : '#E24B4A', minWidth: 32 }}>
                      {j.pct}%
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}