// LOCALIZAÇÃO: app/cursos/page.tsx
// Server Component — busca dados no servidor

import CursosClient from '../_components/CursosClient'

const BASE = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

async function getData() {
  const [cursos, jovens] = await Promise.all([
    fetch(`${BASE}/api/cursos`, { next: { revalidate: 60 } }).then(r => r.ok ? r.json() : []),
    fetch(`${BASE}/api/jovens`, { next: { revalidate: 60 } }).then(r => r.ok ? r.json() : []),
  ])
  return {
    cursos: Array.isArray(cursos) ? cursos : [],
    jovens: Array.isArray(jovens) ? jovens : [],
  }
}

export default async function CursosPage() {
  const data = await getData()
  return <CursosClient {...data} />
}