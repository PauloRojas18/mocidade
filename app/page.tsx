// LOCALIZAÇÃO: app/page.tsx
// Server Component — busca dados no servidor, sem spinner, sem waterfall

import DashboardClient from './_components/DashboardClient'

const BASE = process.env.NEXT_PUBLIC_SITE_URL
  ?? process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'

async function getData() {
  const [jovens, cursos, praticas, freqDia, presAulas] = await Promise.all([
    fetch(`${BASE}/api/jovens`,              { next: { revalidate: 60 } }).then(r => r.ok ? r.json() : []),
    fetch(`${BASE}/api/cursos`,              { next: { revalidate: 60 } }).then(r => r.ok ? r.json() : []),
    fetch(`${BASE}/api/praticas`,            { next: { revalidate: 60 } }).then(r => r.ok ? r.json() : []),
    fetch(`${BASE}/api/presencas/todas`,     { next: { revalidate: 30 } }).then(r => r.ok ? r.json() : []),
    fetch(`${BASE}/api/presencas/relatorio`, { next: { revalidate: 30 } }).then(r => r.ok ? r.json() : []),
  ])
  return {
    jovens:    Array.isArray(jovens)    ? jovens    : [],
    cursos:    Array.isArray(cursos)    ? cursos    : [],
    praticas:  Array.isArray(praticas)  ? praticas  : [],
    freqDia:   Array.isArray(freqDia)   ? freqDia   : [],
    presAulas: Array.isArray(presAulas) ? presAulas : [],
  }
}

export default async function DashboardPage() {
  const data = await getData()
  return <DashboardClient {...data} />
}