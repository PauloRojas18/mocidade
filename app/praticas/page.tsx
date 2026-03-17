// LOCALIZAÇÃO: app/praticas/page.tsx
// Server Component — busca dados no servidor

import PraticasClient from '../_components/PraticasClient'

const BASE = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

async function getData() {
  const praticas = await fetch(`${BASE}/api/praticas`, { next: { revalidate: 60 } })
    .then(r => r.ok ? r.json() : [])
  return { praticas: Array.isArray(praticas) ? praticas : [] }
}

export default async function PraticasPage() {
  const { praticas } = await getData()
  return <PraticasClient praticas={praticas} />
}