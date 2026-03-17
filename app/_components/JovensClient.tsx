// LOCALIZAÇÃO: app/jovens/page.tsx
// Server Component — busca dados no servidor

import JovensClient from '../_components/JovensClient'

const BASE = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

function getHoje() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

async function getData() {
  const hoje = getHoje()
  const [jovens, cursos, praticas, pres, chamadaHoje] = await Promise.all([
    fetch(`${BASE}/api/jovens`,                    { next: { revalidate: 60 } }).then(r => r.ok ? r.json() : []),
    fetch(`${BASE}/api/cursos`,                    { next: { revalidate: 60 } }).then(r => r.ok ? r.json() : []),
    fetch(`${BASE}/api/praticas`,                  { next: { revalidate: 60 } }).then(r => r.ok ? r.json() : []),
    fetch(`${BASE}/api/presencas/todas`,           { next: { revalidate: 30 } }).then(r => r.ok ? r.json() : []),
    fetch(`${BASE}/api/chamada-dia?data=${hoje}`,  { cache: 'no-store' }).then(r => r.ok ? r.json() : []),
  ])
  return {
    jovens:       Array.isArray(jovens)       ? jovens       : [],
    cursos:       Array.isArray(cursos)       ? cursos       : [],
    praticas:     Array.isArray(praticas)     ? praticas     : [],
    pres:         Array.isArray(pres)         ? pres         : [],
    chamadaHoje:  Array.isArray(chamadaHoje)  ? chamadaHoje  : [],
    hoje,
  }
}

export default async function JovensPage() {
  const data = await getData()
  return <JovensClient {...data} />
}