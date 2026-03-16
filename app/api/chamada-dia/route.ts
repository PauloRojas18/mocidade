// LOCALIZAÇÃO: app/api/chamada-dia/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const data = req.nextUrl.searchParams.get('data')
  if (!data) return NextResponse.json({ error: 'data obrigatória' }, { status: 400 })

  const { data: registros, error } = await supabase
    .from('chamada_dia')
    .select('jovem_id, presente, data')
    .eq('data', data)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(registros ?? [])
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { data: dia, presencas } = body

  if (!dia) return NextResponse.json({ error: 'data obrigatória' }, { status: 400 })
  if (!presencas?.length) return NextResponse.json({ ok: true })

  const linhas = presencas.map(({ jovemId, presente }: { jovemId: number; presente: boolean }) => ({
    jovem_id: Number(jovemId),
    data:     String(dia),
    presente: presente === true,
  }))

  // Deleta os registros do dia primeiro, depois insere (mais seguro que upsert com constraint)
  const { error: delErr } = await supabase
    .from('chamada_dia')
    .delete()
    .eq('data', String(dia))

  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 })

  const { error: insErr } = await supabase
    .from('chamada_dia')
    .insert(linhas)

  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}