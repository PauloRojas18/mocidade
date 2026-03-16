// LOCALIZAÇÃO: app/api/jovens/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase.from('jovens').select('*').order('nome')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { nome, email, telefone, ano_entrada, curso_atual, pratica_atual } = body
  if (!nome?.trim()) return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 })
  const { data, error } = await supabase
    .from('jovens')
    .insert({ nome: nome.trim(), email: email || null, telefone: telefone || null, ano_entrada: Number(ano_entrada) || new Date().getFullYear(), curso_atual: curso_atual || null, pratica_atual: pratica_atual || null })
    .select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}