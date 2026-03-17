// LOCALIZAÇÃO: app/relatorios/page.tsx
// Server Component — busca dados no servidor

import RelatoriosClient from '../_components/RelatoriosClient'

const BASE = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

async function getData() {
  const [jovens, cursos, praticas, presencas, freqDia] = await Promise.all([
    fetch(`${BASE}/api/jovens`,              { next: { revalidate: 60 } }).then(r => r.ok ? r.json() : []),
    fetch(`${BASE}/api/cursos`,              { next: { revalidate: 60 } }).then(r => r.ok ? r.json() : []),
    fetch(`${BASE}/api/praticas`,            { next: { revalidate: 60 } }).then(r => r.ok ? r.json() : []),
    fetch(`${BASE}/api/presencas/relatorio`, { next: { revalidate: 30 } }).then(r => r.ok ? r.json() : []),
    fetch(`${BASE}/api/presencas/todas`,     { next: { revalidate: 30 } }).then(r => r.ok ? r.json() : []),
  ])
  return {
    jovens:    Array.isArray(jovens)    ? jovens    : [],
    cursos:    Array.isArray(cursos)    ? cursos    : [],
    praticas:  Array.isArray(praticas)  ? praticas  : [],
    presencas: Array.isArray(presencas) ? presencas : [],
    freqDia:   Array.isArray(freqDia)   ? freqDia   : [],
  }
}

export default async function RelatoriosPage() {
  const data = await getData()
  return <RelatoriosClient {...data} />
}