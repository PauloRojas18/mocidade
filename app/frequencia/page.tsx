// LOCALIZAÇÃO: app/frequencia/page.tsx
// Server Component — pré-carrega dados estáticos no servidor
// A lógica interativa (chamada, toggles, modais) permanece no Client Component

import FrequenciaClient from '../_components/FrequenciaClient'

const BASE = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

function getHoje() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

async function getData() {
  const hoje = getHoje()
  const [aulasRes, praticasRes, jovensRes, chamadaRes, cursosRes] = await Promise.all([
    fetch(`${BASE}/api/aulas`,                   { next: { revalidate: 30 } }).then(r => r.ok ? r.json() : []),
    fetch(`${BASE}/api/praticas`,                { next: { revalidate: 60 } }).then(r => r.ok ? r.json() : []),
    fetch(`${BASE}/api/jovens`,                  { next: { revalidate: 60 } }).then(r => r.ok ? r.json() : []),
    fetch(`${BASE}/api/chamada-dia?data=${hoje}`,{ cache: 'no-store' }).then(r => r.ok ? r.json() : []),
    fetch(`${BASE}/api/cursos`,                  { next: { revalidate: 60 } }).then(r => r.ok ? r.json() : []),
  ])
  return {
    aulasInit:    Array.isArray(aulasRes)    ? aulasRes    : [],
    praticasInit: Array.isArray(praticasRes) ? praticasRes : [],
    jovensInit:   Array.isArray(jovensRes)   ? jovensRes   : [],
    chamadaInit:  Array.isArray(chamadaRes)  ? chamadaRes  : [],
    cursosInit:   Array.isArray(cursosRes)   ? cursosRes   : [],
    hoje,
  }
}

export default async function FrequenciaPage() {
  const data = await getData()
  return <FrequenciaClient {...data} />
}