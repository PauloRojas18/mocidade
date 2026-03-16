// LOCALIZAÇÃO: app/api/exportar/jovens/route.ts
// npm install xlsx  (se ainda não instalou)
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('jovens')
    .select('nome, email, telefone, ano_entrada, curso_atual, pratica_atual')
    .order('nome')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  try {
    const XLSX = await import('xlsx')
    const ws   = XLSX.utils.json_to_sheet(data ?? [])
    const wb   = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Jovens')
    const buf  = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
    return new NextResponse(buf, {
      headers: {
        'Content-Type':        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="jovens.xlsx"',
      },
    })
  } catch {
    // xlsx não instalado — retorna CSV simples
    const csv = [
      'Nome,Email,Telefone,Ano de entrada,Curso,Prática',
      ...(data ?? []).map(j =>
        `"${j.nome}","${j.email ?? ''}","${j.telefone ?? ''}",${j.ano_entrada},"${j.curso_atual ?? ''}","${j.pratica_atual ?? ''}"`
      ),
    ].join('\n')
    return new NextResponse(csv, {
      headers: {
        'Content-Type':        'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="jovens.csv"',
      },
    })
  }
}