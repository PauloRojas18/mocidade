// LOCALIZAÇÃO: app/api/cursos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data: cursos, error } = await supabase.from('cursos').select('*').order('nome')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: jovens } = await supabase.from('jovens').select('curso_atual')
  const contagem = (jovens ?? []).reduce((acc, j) => {
    if (j.curso_atual) acc[j.curso_atual] = (acc[j.curso_atual] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  return NextResponse.json((cursos ?? []).map(c => ({ ...c, matriculados: contagem[c.nome] ?? 0 })))
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { nome, semestre, descricao, color_idx } = body
  if (!nome?.trim()) return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 })
  const { data, error } = await supabase
    .from('cursos')
    .insert({ nome: nome.trim(), semestre: semestre || '1º sem / 2025', descricao: descricao || null, color_idx: color_idx ?? 0 })
    .select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}