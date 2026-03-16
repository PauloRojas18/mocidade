// LOCALIZAÇÃO: app/api/presencas/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const aulaId = req.nextUrl.searchParams.get('aulaId')
  if (!aulaId) return NextResponse.json({ error: 'aulaId obrigatório' }, { status: 400 })
  const { data, error } = await supabase.from('presencas').select('*').eq('aula_id', aulaId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { aulaId, presencas } = body

  if (!aulaId) return NextResponse.json({ error: 'aulaId obrigatório' }, { status: 400 })
  if (!presencas?.length) return NextResponse.json({ ok: true })

  // Upsert: insere ou atualiza se já existe o par (aula_id, jovem_id)
  const linhas = presencas.map(({ jovemId, presente }: { jovemId: number; presente: boolean }) => ({
    aula_id:  Number(aulaId),
    jovem_id: Number(jovemId),
    presente: Boolean(presente),
  }))

  const { error } = await supabase
    .from('presencas')
    .upsert(linhas, { onConflict: 'aula_id,jovem_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}