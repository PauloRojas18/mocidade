// app/api/presencas-praticas/route.ts

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json() as { presencas: { praticaId: number; jovemId: number; presente: boolean; data: string }[] }
    
    if (!body.presencas || !Array.isArray(body.presencas) || body.presencas.length === 0) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    // Validar dados
    for (const p of body.presencas) {
      if (!p.praticaId || !p.jovemId || !p.data) {
        return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
      }
    }

    // Inserir todas as presenças
    const { data, error } = await supabase
      .from('presencas_praticas')
      .insert(
        body.presencas.map(p => ({
          pratica_id: p.praticaId,
          jovem_id: p.jovemId,
          presente: p.presente,
          data: p.data
        }))
      )
      .select()

    if (error) {
      console.error('Erro ao salvar presenças:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Erro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const praticaId = searchParams.get('praticaId')
    const data = searchParams.get('data')
    const jovemId = searchParams.get('jovemId')

    let query = supabase
      .from('presencas_praticas')
      .select(`
        id,
        presente,
        data,
        jovem_id,
        pratica_id,
        jovens!inner (
          nome
        ),
        praticas!inner (
          nome
        )
      `)
      .order('data', { ascending: false })

    if (praticaId) {
      query = query.eq('pratica_id', parseInt(praticaId))
    }

    if (data) {
      query = query.eq('data', data)
    }

    if (jovemId) {
      query = query.eq('jovem_id', parseInt(jovemId))
    }

    const { data: presencas, error } = await query

    if (error) {
      console.error('Erro ao buscar presenças:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Formatar os dados para ficar mais fácil de usar no frontend
    const formatted = presencas.map(p => ({
      id: p.id,
      presente: p.presente,
      data: p.data,
      jovem_id: p.jovem_id,
      pratica_id: p.pratica_id,
      jovem_nome: p.jovens?.[0]?.nome || '',
      pratica_nome: p.praticas?.[0]?.nome || ''
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Erro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}