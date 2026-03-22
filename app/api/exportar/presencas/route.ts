// app/api/exportar/presencas/route.ts

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import ExcelJS from 'exceljs'

// ─── Tipos internos ────────────────────────────────────────────────────────────

type JovemRow    = { id: number; nome: string; telefone: string | null }
type ChamadaRow  = { jovem_id: number; data: string; presente: boolean }
type AulaRow     = { id: number; curso_nome: string; data: string; descricao: string }
type PresencaRow = { jovem_id: number; aula_id: number; presente: boolean }
type PraticaRow  = { id: number; nome: string }
type PresencaPraticaRow = { jovem_id: number; pratica_id: number; data: string; presente: boolean }

// ─── Cores do modelo ───────────────────────────────────────────────────────────

const COR = {
  sem1_header:  'FFB4A7D6',  // roxo claro  — cabeçalho 1º Semestre
  sem2_header:  'FFD5A6BD',  // rosa claro  — cabeçalho 2º Semestre
  date_header:  'FFCFE2F3',  // azul claro  — linha de datas e info geral
  sum_blue:     'FF0B5394',  // azul escuro — 1º SEM. / 2º SEM.
  sum_purple:   'FF9900FF',  // roxo        — ANUAL
  totals_row:   'FF4A86E8',  // azul médio  — linha de totais por data
  section_tab:  'FF434343',  // cinza escuro — aba de seção (Chamadas / Aulas / Práticas)
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function colLetter(n: number): string {
  let r = ''
  while (n > 0) { const rem = (n - 1) % 26; r = String.fromCharCode(65 + rem) + r; n = Math.floor((n - 1) / 26) }
  return r
}

function solidFill(argb: string): ExcelJS.Fill {
  return { type: 'pattern', pattern: 'solid', fgColor: { argb } }
}

function border(): Partial<ExcelJS.Borders> {
  const s = { style: 'thin' as const }
  return { top: s, left: s, bottom: s, right: s }
}

function buildSheet(
  wb: ExcelJS.Workbook,
  sheetName: string,
  jovens: JovemRow[],
  datasOrdenadas: string[],          // 'YYYY-MM-DD' ordenadas
  presMap: Record<number, Record<string, boolean | null>>, // jovemId → data → true/false/null
  sem1Datas: string[],
  sem2Datas: string[],
) {
  const ws = wb.addWorksheet(sheetName, {
    views: [{ state: 'frozen', xSplit: 1, ySplit: 2 }],
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
  })

  const NUM_FIXAS = 1          // só coluna A = Nome (simplificado)
  const NUM_DATAS = datasOrdenadas.length
  const COL_SEM1  = NUM_FIXAS + 1
  const COL_SEM2  = NUM_FIXAS + sem1Datas.length + 1
  const COL_AZ    = NUM_FIXAS + NUM_DATAS + 1   // 1º SEM.
  const COL_BA    = COL_AZ + 1                  // 2º SEM.
  const COL_BB    = COL_BA + 1                  // ANUAL

  // Larguras
  ws.getColumn(1).width = 30
  for (let c = 2; c <= COL_BB; c++) ws.getColumn(c).width = c >= COL_AZ ? 8 : 5

  // ── Linha 1: semestres ──────────────────────────────────────────────────────

  ws.getCell(1, 1).fill   = solidFill(COR.date_header)
  ws.getCell(1, 1).border = border()

  if (sem1Datas.length > 0) {
    ws.mergeCells(1, COL_SEM1, 1, COL_SEM1 + sem1Datas.length - 1)
    const c = ws.getCell(1, COL_SEM1)
    c.value = '1º SEMESTRE'; c.fill = solidFill(COR.sem1_header)
    c.font = { bold: true, name: 'Arial', size: 10 }; c.alignment = { horizontal: 'center', vertical: 'middle' }; c.border = border()
    for (let i = COL_SEM1 + 1; i <= COL_SEM1 + sem1Datas.length - 1; i++) ws.getCell(1, i).border = border()
  }

  if (sem2Datas.length > 0) {
    ws.mergeCells(1, COL_SEM2, 1, COL_SEM2 + sem2Datas.length - 1)
    const c = ws.getCell(1, COL_SEM2)
    c.value = '2º SEMESTRE'; c.fill = solidFill(COR.sem2_header)
    c.font = { bold: true, name: 'Arial', size: 10 }; c.alignment = { horizontal: 'center', vertical: 'middle' }; c.border = border()
    for (let i = COL_SEM2 + 1; i <= COL_SEM2 + sem2Datas.length - 1; i++) ws.getCell(1, i).border = border()
  }

  // Células de total na linha 1
  for (const col of [COL_AZ, COL_BA, COL_BB]) {
    const c = ws.getCell(1, col)
    c.fill = solidFill(col === COL_BB ? COR.sum_purple : COR.sum_blue); c.border = border()
  }

  // ── Linha 2: cabeçalhos ─────────────────────────────────────────────────────

  // Nome
  const h1 = ws.getCell(2, 1)
  h1.value = 'NOME DO JOVEM'; h1.font = { bold: true, name: 'Arial', size: 10 }
  h1.fill = solidFill(COR.date_header); h1.border = border()

  // Datas
  datasOrdenadas.forEach((data, idx) => {
    const col = NUM_FIXAS + 1 + idx
    const [, mes, dia] = data.split('-')
    const c = ws.getCell(2, col)
    c.value = `${dia}/${mes}`; c.font = { bold: true, name: 'Arial', size: 10 }
    c.fill = solidFill(COR.date_header); c.alignment = { horizontal: 'center', vertical: 'middle' }; c.border = border()
  })

  // 1º SEM / 2º SEM / ANUAL
  const summaryLabels: Record<number, string> = { [COL_AZ]: '1º SEM.', [COL_BA]: '2º SEM.', [COL_BB]: 'ANUAL' }
  for (const col of [COL_AZ, COL_BA, COL_BB]) {
    const c = ws.getCell(2, col)
    c.value = summaryLabels[col]
    c.font = { bold: true, color: { argb: 'FFFFFFFF' }, name: 'Arial', size: 10 }
    c.fill = solidFill(col === COL_BB ? COR.sum_purple : COR.sum_blue)
    c.alignment = { horizontal: 'center', vertical: 'middle' }; c.border = border()
  }

  // ── Linhas de dados ─────────────────────────────────────────────────────────

  const DATA_START = 3
  jovens.forEach((jovem, idx) => {
    const row  = DATA_START + idx
    const pMap = presMap[jovem.id] ?? {}

    // Nome
    const cNome = ws.getCell(row, 1)
    cNome.value = jovem.nome; cNome.font = { name: 'Arial', size: 10 }; cNome.border = border()

    // Presenças
    datasOrdenadas.forEach((data, dIdx) => {
      const col  = NUM_FIXAS + 1 + dIdx
      const cell = ws.getCell(row, col)
      const val  = pMap[data]
      if (val !== null && val !== undefined) cell.value = val ? '.' : 'F'
      cell.alignment = { horizontal: 'center' }; cell.border = border()
      cell.font = { name: 'Arial', size: 10 }
    })

    // Fórmulas de total — idênticas ao modelo original
    if (sem1Datas.length > 0) {
      const s = colLetter(COL_SEM1); const e = colLetter(COL_SEM1 + sem1Datas.length - 1)
      const c = ws.getCell(row, COL_AZ)
      c.value = { formula: `COUNTIF(${s}${row}:${e}${row},".")` }
      c.alignment = { horizontal: 'center' }; c.border = border(); c.font = { name: 'Arial', size: 10 }
    }

    if (sem2Datas.length > 0) {
      const s = colLetter(COL_SEM2); const e = colLetter(COL_SEM2 + sem2Datas.length - 1)
      const c = ws.getCell(row, COL_BA)
      c.value = { formula: `COUNTIF(${s}${row}:${e}${row},".")` }
      c.alignment = { horizontal: 'center' }; c.border = border(); c.font = { name: 'Arial', size: 10 }
    }

    const cAnual = ws.getCell(row, COL_BB)
    cAnual.value = { formula: `${colLetter(COL_AZ)}${row}+${colLetter(COL_BA)}${row}` }
    cAnual.alignment = { horizontal: 'center' }; cAnual.border = border(); cAnual.font = { name: 'Arial', size: 10 }
  })

  // ── Linha de totais (azul, COUNTIF por coluna) ──────────────────────────────

  const TOTAL_ROW = DATA_START + jovens.length

  ws.getCell(TOTAL_ROW, 1).fill = solidFill(COR.totals_row); ws.getCell(TOTAL_ROW, 1).border = border()

  datasOrdenadas.forEach((_, dIdx) => {
    const col = NUM_FIXAS + 1 + dIdx
    const ltr = colLetter(col)
    const c   = ws.getCell(TOTAL_ROW, col)
    c.value = { formula: `COUNTIF(${ltr}${DATA_START}:${ltr}${TOTAL_ROW - 1},".")` }
    c.fill = solidFill(COR.totals_row)
    c.font = { color: { argb: 'FFFFFFFF' }, name: 'Arial', size: 10 }
    c.alignment = { horizontal: 'center' }; c.border = border()
  })

  for (const col of [COL_AZ, COL_BA, COL_BB]) {
    const ltr = colLetter(col)
    const c   = ws.getCell(TOTAL_ROW, col)
    c.value = { formula: `SUM(${ltr}${DATA_START}:${ltr}${TOTAL_ROW - 1})` }
    c.fill = solidFill(COR.totals_row)
    c.font = { color: { argb: 'FFFFFFFF' }, name: 'Arial', size: 10 }
    c.alignment = { horizontal: 'center' }; c.border = border()
  }

  return { ws, TOTAL_ROW, COL_AZ, COL_BA, COL_BB, datasOrdenadas }
}

// ─── Handler ────────────────────────────────────────────────────────────────────

export async function GET() {
  // 1. Buscar dados
  const [
    { data: jovensRaw },
    { data: chamadas },
    { data: todasAulas },
    { data: presencasAulas },
    { data: todasPraticas },
    { data: presencasPraticas },
  ] = await Promise.all([
    supabase.from('jovens').select('id, nome, telefone').order('nome'),
    supabase.from('chamada_dia').select('jovem_id, data, presente'),
    supabase.from('aulas').select('id, curso_nome, data, descricao'),
    supabase.from('presencas').select('jovem_id, aula_id, presente'),
    supabase.from('praticas').select('id, nome'),
    supabase.from('presencas_praticas').select('jovem_id, pratica_id, data, presente'),
  ])

  const jovens      = (jovensRaw        ?? []) as JovemRow[]
  const chamRows    = (chamadas          ?? []) as ChamadaRow[]
  const aulasArr    = (todasAulas        ?? []) as AulaRow[]
  const presAulas   = (presencasAulas    ?? []) as PresencaRow[]
  const praticasArr = (todasPraticas     ?? []) as PraticaRow[]
  const presPrat    = (presencasPraticas ?? []) as PresencaPraticaRow[]

  const wb = new ExcelJS.Workbook()
  wb.creator = 'Sistema Mocidade'
  wb.created = new Date()

  // ── Helper: montar presMap e listas de datas a partir de um conjunto de registros ──

  function buildPresMap(entries: { jovem_id: number; data: string; presente: boolean }[]) {
    const datasSet = new Set<string>()
    const map: Record<number, Record<string, boolean>> = {}
    entries.forEach(({ jovem_id, data, presente }) => {
      if (!data) return
      datasSet.add(data)
      if (!map[jovem_id]) map[jovem_id] = {}
      map[jovem_id][data] = presente
    })
    const todas = Array.from(datasSet).sort()
    const sem1  = todas.filter(d => parseInt(d.split('-')[1], 10) <= 6)
    const sem2  = todas.filter(d => parseInt(d.split('-')[1], 10) > 6)
    return { presMap: map, datasOrdenadas: [...sem1, ...sem2], sem1Datas: sem1, sem2Datas: sem2 }
  }

  // ── 1. Aba: Chamadas Gerais ─────────────────────────────────────────────────

  {
    const entries = chamRows.map(c => ({ jovem_id: c.jovem_id, data: c.data, presente: c.presente }))
    const { presMap, datasOrdenadas, sem1Datas, sem2Datas } = buildPresMap(entries)

    if (datasOrdenadas.length > 0) {
      buildSheet(wb, 'Chamadas Gerais', jovens, datasOrdenadas, presMap, sem1Datas, sem2Datas)
    } else {
      // Aba vazia com aviso
      const ws = wb.addWorksheet('Chamadas Gerais')
      ws.getCell('A1').value = 'Nenhuma chamada registrada'
    }
  }

  // ── 2. Aba: Aulas (uma por curso) ───────────────────────────────────────────

  // Agrupar aulas por curso
  const aulasMap = new Map<number, AulaRow>()
  aulasArr.forEach(a => aulasMap.set(a.id, a))

  const cursos = [...new Set(aulasArr.map(a => a.curso_nome).filter(Boolean))]

  if (cursos.length === 0) {
    const ws = wb.addWorksheet('Aulas')
    ws.getCell('A1').value = 'Nenhuma aula registrada'
  } else {
    cursos.forEach(curso => {
      // Aulas desse curso
      const aulasDosCurso = aulasArr.filter(a => a.curso_nome === curso)
      const idsAulas = new Set(aulasDosCurso.map(a => a.id))

      // Presenças filtradas para este curso
      const entries = presAulas
        .filter(p => idsAulas.has(p.aula_id))
        .map(p => {
          const aula = aulasMap.get(p.aula_id)!
          return { jovem_id: p.jovem_id, data: aula.data, presente: p.presente }
        })

      const { presMap, datasOrdenadas, sem1Datas, sem2Datas } = buildPresMap(entries)

      // Nome da aba limitado a 31 caracteres (limite do Excel)
      const nomePlanilha = curso.slice(0, 31)
      buildSheet(wb, nomePlanilha, jovens, datasOrdenadas, presMap, sem1Datas, sem2Datas)
    })
  }

  // ── 3. Aba: Práticas ────────────────────────────────────────────────────────

  const praticasMap = new Map<number, PraticaRow>()
  praticasArr.forEach(p => praticasMap.set(p.id, p))

  const praticasNomes = [...new Set(praticasArr.map(p => p.nome).filter(Boolean))]

  if (praticasNomes.length === 0) {
    const ws = wb.addWorksheet('Práticas')
    ws.getCell('A1').value = 'Nenhuma prática registrada'
  } else {
    praticasNomes.forEach(nomePratica => {
      const pratica = praticasArr.find(p => p.nome === nomePratica)!
      const entries = presPrat
        .filter(p => p.pratica_id === pratica.id)
        .map(p => ({ jovem_id: p.jovem_id, data: p.data, presente: p.presente }))

      const { presMap, datasOrdenadas, sem1Datas, sem2Datas } = buildPresMap(entries)

      const nomePlanilha = `Prática - ${nomePratica}`.slice(0, 31)
      buildSheet(wb, nomePlanilha, jovens, datasOrdenadas, presMap, sem1Datas, sem2Datas)
    })
  }

  // ── 4. Aba: Média Mensal (referencia todas as outras abas) ──────────────────

  const wsMM = wb.addWorksheet('Média Mensal')
  wsMM.getColumn(1).width = 20
  wsMM.getColumn(2).width = 14

  const hA = wsMM.getCell(1, 1); hA.value = 'Planilha / Mês'; hA.font = { bold: true }; hA.border = border()
  const hB = wsMM.getCell(1, 2); hB.value = 'Média presenças'; hB.font = { bold: true }; hB.border = border()

  const nomeMeses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  let mmRow = 2

  wb.worksheets
    .filter(s => s.name !== 'Média Mensal')
    .forEach(sheet => {
      // Para cada aba, descobrir as colunas de data e construir referências de AVERAGE
      // Linha 2 contém os cabeçalhos de data (DD/MM)
      const row2 = sheet.getRow(2).values as (string | null)[]
      const totalRow = sheet.rowCount  // última linha preenchida (linha de totais)

      // Agrupar colunas por mês
      const mesCols: Record<number, number[]> = {}
      row2.forEach((val, colIdx) => {
        if (typeof val === 'string' && /^\d{2}\/\d{2}$/.test(val)) {
          const mes = parseInt(val.split('/')[1], 10)
          if (!mesCols[mes]) mesCols[mes] = []
          mesCols[mes].push(colIdx)  // colIdx em ExcelJS é 1-based no getRow().values
        }
      })

      Object.entries(mesCols).sort(([a], [b]) => parseInt(a) - parseInt(b)).forEach(([mesStr, cols]) => {
        const mes = parseInt(mesStr, 10)
        const cLabel = wsMM.getCell(mmRow, 1)
        cLabel.value = `${sheet.name} — ${nomeMeses[mes - 1]}`
        cLabel.font  = { name: 'Arial', size: 10 }
        cLabel.border = border()

        const refs = cols.map(c => `'${sheet.name}'!${colLetter(c)}${totalRow}`).join(',')
        const formula = cols.length === 1 ? `'${sheet.name}'!${colLetter(cols[0])}${totalRow}` : `AVERAGE(${refs})`
        const cMedia = wsMM.getCell(mmRow, 2)
        cMedia.value = { formula }
        cMedia.numFmt = '0.0'
        cMedia.alignment = { horizontal: 'center' }
        cMedia.border = border()
        cMedia.font  = { name: 'Arial', size: 10 }

        mmRow++
      })
    })

  // ── Serializar e retornar ────────────────────────────────────────────────────

  const buffer = await wb.xlsx.writeBuffer()
  const uint8 = new Uint8Array(buffer)

  return new NextResponse(uint8, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="frequencia_completa_${new Date().getFullYear()}.xlsx"`,
    },
  })
}