// LOCALIZAÇÃO: app/api/presencas/todas/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  // 1. Todos os jovens
  const { data: jovens, error: e1 } = await supabase
    .from('jovens')
    .select('id')

  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 })

  // 2. Todos os registros de chamada_dia
  const { data: chamada, error: e2 } = await supabase
    .from('chamada_dia')
    .select('jovem_id, presente, data')

  if (e2) return NextResponse.json({ error: e2.message }, { status: 500 })

  // 3. Total de dias únicos com chamada realizada
  const diasRealizados = new Set((chamada ?? []).map(r => r.data)).size

  if (diasRealizados === 0) {
    return NextResponse.json(
      (jovens ?? []).map(j => ({ jovem_id: j.id, total: 0, presentes: 0 }))
    )
  }

  // 4. Agrupa presenças por jovem
  const map: Record<number, { total: number; presentes: number }> = {}
  for (const row of (chamada ?? [])) {
    const id = row.jovem_id
    if (!map[id]) map[id] = { total: 0, presentes: 0 }
    map[id].total++
    if (row.presente) map[id].presentes++
  }

  // 5. Preenche ausências implícitas para quem não foi registrado em algum dia
  const resultado = (jovens ?? []).map(j => {
    const reg = map[j.id] ?? { total: 0, presentes: 0 }
    const ausenciasImplicitas = Math.max(0, diasRealizados - reg.total)
    return {
      jovem_id:  j.id,
      total:     reg.total + ausenciasImplicitas,
      presentes: reg.presentes,
    }
  })

  return NextResponse.json(resultado)
}