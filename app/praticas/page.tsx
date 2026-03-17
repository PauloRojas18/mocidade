'use client'
// LOCALIZAÇÃO: app/praticas/page.tsx

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Jovem = { id: number; nome: string }

type Pratica = {
  id: number
  nome: string
  descricao: string | null
  pratica_membros?: { jovem_id: number; jovens: Jovem }[]
}

const COLORS = [
  { header: '#D4537E', light: '#FBEAF0', text: '#72243E', border: '#F4C0D1' },
  { header: '#BA7517', light: '#FAEEDA', text: '#633806', border: '#FAC775' },
  { header: '#7F77DD', light: '#EEEDFE', text: '#3C3489', border: '#CECBF6' },
  { header: '#1D9E75', light: '#E1F5EE', text: '#085041', border: '#9FE1CB' },
]

export default function PraticasPage() {
  const [praticas, setPraticas] = useState<Pratica[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/praticas')
      .then(r => r.json())
      .then(p => {
        setPraticas(Array.isArray(p) ? p : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading)
    return (
      <div className="flex items-center justify-center h-full p-10">
        <p className="text-sm text-slate-400">Carregando práticas...</p>
      </div>
    )

  return (
    <div className="flex flex-col h-full md:h-screen overflow-hidden">
      
      <div className="flex-shrink-0 px-4 md:px-5 py-3 bg-white border-b border-slate-200 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-900">
          Práticas
        </span>

        <span
          className="text-xs font-medium px-2.5 py-1 rounded-full"
          style={{ background: '#EEF2FF', color: '#4B7BF5' }}
        >
          1º sem / 2026
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 md:p-5">
        {praticas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-sm text-slate-500">
              Nenhuma prática cadastrada
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {[...praticas]
              .sort(
                (a, b) =>
                  (b.pratica_membros?.length ?? 0) -
                  (a.pratica_membros?.length ?? 0)
              )
              .map((p, i) => {
              const color = COLORS[i % COLORS.length]

              const alunos =
                p.pratica_membros?.map(m => m.jovens).filter(Boolean) ?? []

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-xl overflow-hidden"
                  style={{ border: `0.5px solid ${color.border}` }}
                >
                  <div className="p-4" style={{ background: color.header }}>
                    <p className="text-sm font-semibold text-white">
                      {p.nome}
                    </p>

                    <p
                      className="text-xs mt-0.5"
                      style={{ color: 'rgba(255,255,255,0.65)' }}
                    >
                      1º sem / 2026
                    </p>

                    {p.descricao && (
                      <p
                        className="text-xs mt-2 leading-relaxed"
                        style={{ color: 'rgba(255,255,255,0.75)' }}
                      >
                        {p.descricao}
                      </p>
                    )}
                  </div>

                  <div className="p-3.5">
                    <div className="mb-3">
                      <span
                        className="text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{
                          background: color.light,
                          color: color.text
                        }}
                      >
                        {alunos.length} jovem
                        {alunos.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {alunos.length > 0 && (
                      <div className={`flex flex-col gap-1 ${
                            alunos.length > 8 ? 'max-h-40 overflow-y-auto pr-1' : ''
                          }`}
                        >
                        {alunos.map(j => (
                          <Link
                            key={j.id}
                            href={`/jovens/${j.id}`}
                            className="flex items-center gap-2 py-1 rounded-lg px-1 hover:bg-slate-50 transition-colors"
                            style={{ textDecoration: 'none' }}
                          >
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                              style={{
                                background: color.light,
                                color: color.text,
                                fontSize: 9
                              }}
                            >
                              {j.nome
                                .split(' ')
                                .map((n: string) => n[0])
                                .slice(0, 2)
                                .join('')}
                            </div>

                            <span className="text-xs text-slate-700 truncate">
                              {j.nome}
                            </span>
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
    </div>
  )
}