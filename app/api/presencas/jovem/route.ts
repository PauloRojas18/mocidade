// LOCALIZAÇÃO: app/api/presencas/jovem/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const jovemId = req.nextUrl.searchParams.get('jovemId')
  if (!jovemId) return NextResponse.json({ error: 'jovemId obrigatório' }, { status: 400 })

  // Presenças em aulas (cursos e práticas)
  const { data: presAulas, error: errAulas } = await supabase
    .from('presencas')
    .select('id, presente, aula_id, aulas(id, curso_nome, data, descricao)')
    .eq('jovem_id', jovemId)

  // Chamada do dia
  const { data: pressDia, error: errDia } = await supabase
    .from('chamada_dia')
    .select('id, presente, data')
    .eq('jovem_id', jovemId)
    .order('data', { ascending: false })

  if (errAulas) return NextResponse.json({ error: errAulas.message }, { status: 500 })
  if (errDia)   return NextResponse.json({ error: errDia.message },   { status: 500 })

  return NextResponse.json({
    aulas:     presAulas  ?? [],
    chamadaDia: pressDia  ?? [],
  })
}