// app/api/exportar/presencas/route.ts

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

type ExportRow = {
  Tipo: string
  Aluno: string
  Curso: string
  Data: string
  Descrição: string
  Presente: string
}

async function toFile(rows: ExportRow[], nome: string) {
  const XLSX = await import('xlsx')
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, nome)
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${nome}.xlsx"`
    }
  })
}

export async function GET() {
  const rows: ExportRow[] = []

  // Buscar todos os jovens para mapear IDs -> nomes
  const { data: todosJovens } = await supabase
    .from('jovens')
    .select('id, nome')
  
  const jovensMap = new Map()
  if (todosJovens) {
    todosJovens.forEach(j => jovensMap.set(j.id, j.nome))
  }

  // 1. CHAMADAS GERAIS
  const { data: chamadas } = await supabase
    .from('chamada_dia')
    .select('*')
    .order('data', { ascending: false })

  if (chamadas) {
    for (const c of chamadas) {
      rows.push({
        Tipo: 'Chamada Geral',
        Aluno: jovensMap.get(c.jovem_id) || `ID: ${c.jovem_id}`,
        Curso: '',
        Data: c.data || '',
        Descrição: 'Chamada do dia',
        Presente: c.presente ? 'Sim' : 'Não'
      })
    }
  }

  // 2. AULAS
  const { data: presencasAulas } = await supabase
    .from('presencas')
    .select('*')

  const { data: todasAulas } = await supabase
    .from('aulas')
    .select('*')

  const aulasMap = new Map()
  if (todasAulas) {
    todasAulas.forEach(a => aulasMap.set(a.id, a))
  }

  if (presencasAulas) {
    for (const p of presencasAulas) {
      const aula = aulasMap.get(p.aula_id)
      if (aula) {
        rows.push({
          Tipo: 'Aula',
          Aluno: jovensMap.get(p.jovem_id) || `ID: ${p.jovem_id}`,
          Curso: aula.curso_nome || '',
          Data: aula.data || '',
          Descrição: aula.descricao || 'Aula',
          Presente: p.presente ? 'Sim' : 'Não'
        })
      }
    }
  }

  // 3. PRÁTICAS
  const { data: presencasPraticas } = await supabase
    .from('presencas_praticas')
    .select('*')

  const { data: todasPraticas } = await supabase
    .from('praticas')
    .select('*')

  const praticasMap = new Map()
  if (todasPraticas) {
    todasPraticas.forEach(p => praticasMap.set(p.id, p))
  }

  if (presencasPraticas) {
    for (const p of presencasPraticas) {
      const pratica = praticasMap.get(p.pratica_id)
      if (pratica) {
        rows.push({
          Tipo: 'Prática',
          Aluno: jovensMap.get(p.jovem_id) || `ID: ${p.jovem_id}`,
          Curso: pratica.nome || '',
          Data: p.data || '',
          Descrição: 'Presença na prática',
          Presente: p.presente ? 'Sim' : 'Não'
        })
      }
    }
  }

  // Ordenar por data (mais recente primeiro)
  rows.sort((a, b) => {
    if (!a.Data) return 1
    if (!b.Data) return -1
    return new Date(b.Data).getTime() - new Date(a.Data).getTime()
  })

  return toFile(rows, 'frequencia_completa')
}