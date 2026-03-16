// LOCALIZAÇÃO: app/api/praticas/membros/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { praticaId, jovemId } = await req.json()
  const { error } = await supabase
    .from('pratica_membros')
    .insert({ pratica_id: praticaId, jovem_id: jovemId, semestre: '1º sem / 2025' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const { praticaId, jovemId } = await req.json()
  const { error } = await supabase
    .from('pratica_membros')
    .delete()
    .eq('pratica_id', praticaId)
    .eq('jovem_id', jovemId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}