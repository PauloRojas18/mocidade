// LOCALIZAÇÃO: app/api/aulas/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('aulas')
    .select('*, aula_alunos(jovem_id, jovens(id, nome))')
    .order('data', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const resultado = (data ?? []).map((a: any) => ({
    id:        a.id,
    cursoNome: a.curso_nome,
    data:      a.data,
    descricao: a.descricao,
    colorIdx:  a.color_idx,
    semestre:  a.semestre,
    alunos:    (a.aula_alunos ?? [])
      .map((aa: any) => aa.jovens ? { id: aa.jovens.id, nome: aa.jovens.nome } : null)
      .filter(Boolean),
  }))
  return NextResponse.json(resultado)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { cursoNome, data, descricao, colorIdx, semestre, alunoIds } = body
  if (!cursoNome || !data) return NextResponse.json({ error: 'cursoNome e data são obrigatórios' }, { status: 400 })

  const { data: aula, error } = await supabase
    .from('aulas')
    .insert({ curso_nome: cursoNome, data, descricao: descricao || 'Aula', color_idx: colorIdx ?? 0, semestre: semestre || '1º sem / 2025' })
    .select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (alunoIds?.length) {
    await supabase.from('aula_alunos').insert(
      alunoIds.map((jovemId: number) => ({ aula_id: aula.id, jovem_id: jovemId }))
    )
  }
  return NextResponse.json({ ...aula, alunos: [] }, { status: 201 })
}