// LOCALIZAÇÃO: app/api/jovens/[id]/route.ts
import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

type Params = { params: Promise<{ id: string }> }

interface JovemUpdate {
  curso_atual?:   string | null
  pratica_atual?: string | null
  email?:         string | null
  telefone?:      string | null
}

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
  const body = await req.json() as JovemUpdate

  const ALLOWED_FIELDS: (keyof JovemUpdate)[] = ['curso_atual', 'pratica_atual', 'email', 'telefone']
  const update: Partial<JovemUpdate> = {}

  for (const field of ALLOWED_FIELDS) {
    if (field in body) update[field] = body[field] ?? null
  }

  if (Object.keys(update).length === 0)
    return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 })

  const { data, error } = await supabase
    .from('jovens')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    const status = error.code === 'PGRST116' ? 404 : 500
    return NextResponse.json({ error: error.message }, { status })
  }

  const jovemId = Number(id)
  const semestre = '1º sem / 2026'

  // Sincroniza pratica_membros quando pratica_atual muda
  if ('pratica_atual' in update) {
    await supabase
      .from('pratica_membros')
      .delete()
      .eq('jovem_id', jovemId)
      .eq('semestre', semestre)

    if (update.pratica_atual) {
      const { data: pratica } = await supabase
        .from('praticas')
        .select('id')
        .eq('nome', update.pratica_atual)
        .single()

      if (pratica) {
        await supabase
          .from('pratica_membros')
          .insert({ pratica_id: pratica.id, jovem_id: jovemId, semestre })
      }
    }
  }

  // Sincroniza aula_alunos quando curso_atual muda
  if ('curso_atual' in update) {
    // Remove o jovem de todas as aulas que não são de prática
    const { data: aulasAnteriores } = await supabase
      .from('aulas')
      .select('id')
      .neq('descricao', 'Chamada de prática')

    if (aulasAnteriores && aulasAnteriores.length > 0) {
      await supabase
        .from('aula_alunos')
        .delete()
        .eq('jovem_id', jovemId)
        .in('aula_id', aulasAnteriores.map(a => a.id))
    }

    // Adiciona o jovem nas aulas do novo curso
    if (update.curso_atual) {
      const { data: aulasNovoCurso } = await supabase
        .from('aulas')
        .select('id')
        .eq('curso_nome', update.curso_atual)
        .neq('descricao', 'Chamada de prática')

      if (aulasNovoCurso && aulasNovoCurso.length > 0) {
        await supabase
          .from('aula_alunos')
          .upsert(
            aulasNovoCurso.map(aula => ({ aula_id: aula.id, jovem_id: jovemId })),
            { onConflict: 'aula_id,jovem_id' }
          )
      }
    }
  }

  return NextResponse.json(data)
}