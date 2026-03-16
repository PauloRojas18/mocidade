// LOCALIZAÇÃO: app/api/exportar/cursos/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

async function toFile(rows: object[], nome: string) {
  try {
    const XLSX = await import('xlsx')
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, nome)
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${nome}.xlsx"`,
      },
    })
  } catch {
    const keys = Object.keys(rows[0] ?? {})
    const csv = [keys.join(','), ...rows.map(r => keys.map(k => `"${(r as any)[k] ?? ''}"`).join(','))].join('\n')
    return new NextResponse(csv, {
      headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${nome}.csv"` },
    })
  }
}

export async function GET() {
  const { data: cursos } = await supabase.from('cursos').select('nome, semestre').order('nome')
  const { data: jovens } = await supabase.from('jovens').select('nome, curso_atual').order('nome')
  const rows: object[] = []
  for (const c of cursos ?? []) {
    const alunos = (jovens ?? []).filter(j => j.curso_atual === c.nome)
    if (!alunos.length) rows.push({ Curso: c.nome, Semestre: c.semestre, Aluno: '—' })
    else alunos.forEach(a => rows.push({ Curso: c.nome, Semestre: c.semestre, Aluno: a.nome }))
  }
  return toFile(rows, 'cursos')
}