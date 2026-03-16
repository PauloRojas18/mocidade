// LOCALIZAÇÃO: app/api/aulas/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const { jovemId } = await req.json()
  const { error } = await supabase
    .from('aula_alunos')
    .insert({ aula_id: Number(id), jovem_id: Number(jovemId) })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const body = await req.json().catch(() => ({}))
  const { jovemId } = body

  if (jovemId) {
    const { error } = await supabase
      .from('aula_alunos')
      .delete()
      .eq('aula_id', Number(id))
      .eq('jovem_id', Number(jovemId))
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  // Deletar aula inteira
  const { error } = await supabase.from('aulas').delete().eq('id', Number(id))
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}