// LOCALIZAÇÃO: app/jovens/[id]/page.tsx
// Server Component — busca dados do jovem específico no servidor

import { notFound } from 'next/navigation'
import JovemDetalheClient from '../../_components/JovemDetalheClient'

const BASE = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

type Params = { id: string }

async function getData(id: string) {
  const [jovem, todosJovens, presData, cursos, praticas, todasPres, diasJovem] = await Promise.all([
    fetch(`${BASE}/api/jovens/${id}`,                { next: { revalidate: 60 } }).then(r => r.ok ? r.json() : null),
    fetch(`${BASE}/api/jovens`,                      { next: { revalidate: 60 } }).then(r => r.ok ? r.json() : []),
    fetch(`${BASE}/api/presencas/jovem?jovemId=${id}`, { next: { revalidate: 30 } }).then(r => r.ok ? r.json() : { aulas: [] }),
    fetch(`${BASE}/api/cursos`,                      { next: { revalidate: 60 } }).then(r => r.ok ? r.json() : []),
    fetch(`${BASE}/api/praticas`,                    { next: { revalidate: 60 } }).then(r => r.ok ? r.json() : []),
    fetch(`${BASE}/api/presencas/todas`,             { next: { revalidate: 30 } }).then(r => r.ok ? r.json() : []),
    fetch(`${BASE}/api/chamada-dia?jovemId=${id}`,   { cache: 'no-store' }).then(r => r.ok ? r.json() : []),
  ])
  return { jovem, todosJovens, presData, cursos, praticas, todasPres, diasJovem }
}

export default async function JovemPage({ params }: { params: Params }) {
  const { id } = params
  const { jovem, todosJovens, presData, cursos, praticas, todasPres, diasJovem } = await getData(id)

  if (!jovem) notFound()

  const presencas = Array.isArray(presData)
    ? presData
    : Array.isArray(presData?.aulas) ? presData.aulas : []

  const chamadaDia = Array.isArray(diasJovem)
    ? [...diasJovem].sort((a: { data: string }, b: { data: string }) => b.data.localeCompare(a.data))
    : []

  type FreqRow = { jovem_id: number; total: number; presentes: number }
  const meuRow = Array.isArray(todasPres)
    ? todasPres.find((r: FreqRow) => r.jovem_id === Number(id))
    : undefined

  return (
    <JovemDetalheClient
      jovem={jovem}
      todosJovens={Array.isArray(todosJovens) ? todosJovens : []}
      presencas={presencas}
      chamadaDia={chamadaDia}
      cursos={Array.isArray(cursos) ? cursos : []}
      praticas={Array.isArray(praticas) ? praticas : []}
      totalGlobal={meuRow?.total ?? 0}
      presentesGlobal={meuRow?.presentes ?? 0}
    />
  )
}