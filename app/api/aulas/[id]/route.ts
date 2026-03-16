// LOCALIZAÇÃO: app/api/aulas/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data, error } = await supabase
    .from('aulas')
    .select('*, aula_alunos(jovem_id, jovens(id, nome))')
    .eq('id', id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { jovemId } = await req.json()

  const { error } = await supabase
    .from('aula_alunos')
    .insert({
      aula_id: Number(id),
      jovem_id: Number(jovemId),
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const { jovemId } = body

  if (jovemId) {
    const { error } = await supabase
      .from('aula_alunos')
      .delete()
      .eq('aula_id', Number(id))
      .eq('jovem_id', Number(jovemId))

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  }

  const { error } = await supabase
    .from('aulas')
    .delete()
    .eq('id', Number(id))

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}