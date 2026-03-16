// LOCALIZAÇÃO: app/api/jovens/[id]/route.ts
import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params

  const { data, error } = await supabase
    .from('jovens')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params
  const body = await req.json() as { curso_atual?: string | null; pratica_atual?: string | null }

  const update: Record<string, string | null> = {}
  if ('curso_atual'   in body) update.curso_atual   = body.curso_atual   ?? null
  if ('pratica_atual' in body) update.pratica_atual = body.pratica_atual ?? null

  if (Object.keys(update).length === 0)
    return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 })

  const { data, error } = await supabase
    .from('jovens')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}