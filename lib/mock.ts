// LOCALIZAÇÃO: lib/mock.ts

export const semestre = '1º sem / 2026'

export const jovens = [
  { id: 1, nome: 'Paulo Otávio',   email: 'paulo@email.com',   telefone: '(67) 99999-0001', anoEntrada: 2021, cursoAtual: 'TESTE',    faltas: 1, praticaAtual: 'Chico Xavier'  },
  { id: 2, nome: 'Ana Beatriz',    email: 'ana@email.com',     telefone: '(67) 99999-0002', anoEntrada: 2022, cursoAtual: 'TESTE', faltas: 5, praticaAtual: 'Alta de Souza' },
  { id: 3, nome: 'Pedro Lucas',    email: 'pedro@email.com',   telefone: '(67) 99999-0003', anoEntrada: 2020, cursoAtual: 'TESTE',    faltas: 0, praticaAtual: 'Chico Xavier'  },
  { id: 4, nome: 'Mariana Souza',  email: 'mari@email.com',    telefone: '(67) 99999-0004', anoEntrada: 2023, cursoAtual: 'TESTE',    faltas: 4, praticaAtual: 'Alta de Souza' },
  { id: 5, nome: 'Lucas Ferreira', email: 'lucas@email.com',   telefone: '(67) 99999-0005', anoEntrada: 2022, cursoAtual: 'TESTE',      faltas: 2, praticaAtual: 'Chico Xavier'  },
  { id: 6, nome: 'Juliana Melo',   email: 'ju@email.com',      telefone: '(67) 99999-0006', anoEntrada: 2024, cursoAtual: 'TESTE',      faltas: 6, praticaAtual: 'Alta de Souza' },
  { id: 7, nome: 'Rafael Costa',   email: 'rafael@email.com',  telefone: '(67) 99999-0007', anoEntrada: 2021, cursoAtual: 'TESTE', faltas: 0, praticaAtual: 'Chico Xavier'  },
  { id: 8, nome: 'Camila Rocha',   email: 'camila@email.com',  telefone: '(67) 99999-0008', anoEntrada: 2023, cursoAtual: 'TESTE',    faltas: 2, praticaAtual: 'Alta de Souza' },
]

export const historicoJovens: Record<number, {
  cursos: { nome: string; semestre: string; presencas: number; totalAulas: number; faltas: number }[]
  praticas: { nome: string; semestre: string }[]
}> = {
  1: {
    cursos: [
      { nome: 'TESTE', semestre: '1º sem / 2026', presencas: 7,  totalAulas: 8,  faltas: 1 },
      { nome: 'TESTE', semestre: '2º sem / 2024', presencas: 10, totalAulas: 10, faltas: 0 },
      { nome: 'TESTE',   semestre: '1º sem / 2023', presencas: 9,  totalAulas: 10, faltas: 1 },
    ],
    praticas: [
      { nome: 'Alta de Souza', semestre: '1º sem / 2022' }, { nome: 'Alta de Souza', semestre: '2º sem / 2022' },
      { nome: 'Alta de Souza', semestre: '1º sem / 2023' }, { nome: 'Alta de Souza', semestre: '2º sem / 2023' },
      { nome: 'Alta de Souza', semestre: '1º sem / 2024' }, { nome: 'Chico Xavier',  semestre: '1º sem / 2026' },
    ],
  },
  2: {
    cursos: [
      { nome: 'TESTE', semestre: '1º sem / 2026', presencas: 3, totalAulas: 8,  faltas: 5 },
      { nome: 'TESTE',      semestre: '2º sem / 2022', presencas: 9, totalAulas: 10, faltas: 1 },
    ],
    praticas: [
      { nome: 'Alta de Souza', semestre: '1º sem / 2023' },
      { nome: 'Alta de Souza', semestre: '2º sem / 2024' },
      { nome: 'Alta de Souza', semestre: '1º sem / 2026' },
    ],
  },
  3: {
    cursos: [
      { nome: 'TESTE', semestre: '1º sem / 2026', presencas: 8,  totalAulas: 8,  faltas: 0 },
      { nome: 'Formação Avançada', semestre: '2º sem / 2023', presencas: 10, totalAulas: 10, faltas: 0 },
      { nome: 'TESTE', semestre: '1º sem / 2022', presencas: 10, totalAulas: 10, faltas: 0 },
      { nome: 'TESTE',   semestre: '1º sem / 2021', presencas: 9,  totalAulas: 10, faltas: 1 },
    ],
    praticas: [
      { nome: 'Chico Xavier', semestre: '2º sem / 2021' }, { nome: 'Chico Xavier', semestre: '1º sem / 2022' },
      { nome: 'Chico Xavier', semestre: '2º sem / 2022' }, { nome: 'Chico Xavier', semestre: '1º sem / 2026' },
    ],
  },
  4: {
    cursos: [
      { nome: 'TESTE', semestre: '1º sem / 2026', presencas: 4, totalAulas: 8,  faltas: 4 },
      { nome: 'TESTE',   semestre: '2º sem / 2023', presencas: 8, totalAulas: 10, faltas: 2 },
    ],
    praticas: [
      { nome: 'Alta de Souza', semestre: '2º sem / 2024' },
      { nome: 'Alta de Souza', semestre: '1º sem / 2026' },
    ],
  },
  5: {
    cursos: [
      { nome: 'TESTE', semestre: '1º sem / 2026', presencas: 6,  totalAulas: 8,  faltas: 2 },
      { nome: 'Introdução',      semestre: '1º sem / 2022', presencas: 10, totalAulas: 10, faltas: 0 },
    ],
    praticas: [
      { nome: 'Chico Xavier', semestre: '1º sem / 2023' },
      { nome: 'Chico Xavier', semestre: '2º sem / 2024' },
      { nome: 'Chico Xavier', semestre: '1º sem / 2026' },
    ],
  },
  6: {
    cursos: [{ nome: 'TESTE', semestre: '1º sem / 2026', presencas: 2, totalAulas: 8, faltas: 6 }],
    praticas: [{ nome: 'Alta de Souza', semestre: '1º sem / 2026' }],
  },
  7: {
    cursos: [
      { nome: 'TESTE', semestre: '1º sem / 2026', presencas: 8,  totalAulas: 8,  faltas: 0 },
      { nome: 'TESTE',    semestre: '2º sem / 2023', presencas: 10, totalAulas: 10, faltas: 0 },
      { nome: 'Formação Avançada',    semestre: '1º sem / 2022', presencas: 9,  totalAulas: 10, faltas: 1 },
      { nome: 'TESTE',    semestre: '2º sem / 2021', presencas: 10, totalAulas: 10, faltas: 0 },
      { nome: 'TESTE',      semestre: '1º sem / 2021', presencas: 10, totalAulas: 10, faltas: 0 },
    ],
    praticas: [
      { nome: 'Chico Xavier', semestre: '1º sem / 2022' },
      { nome: 'Chico Xavier', semestre: '2º sem / 2022' },
      { nome: 'Chico Xavier', semestre: '1º sem / 2026' },
    ],
  },
  8: {
    cursos: [
      { nome: 'TESTE', semestre: '1º sem / 2026', presencas: 6, totalAulas: 8,  faltas: 2 },
      { nome: 'TESTE',   semestre: '2º sem / 2023', presencas: 9, totalAulas: 10, faltas: 1 },
    ],
    praticas: [
      { nome: 'Alta de Souza', semestre: '1º sem / 2023' },
      { nome: 'Alta de Souza', semestre: '2º sem / 2024' },
      { nome: 'Alta de Souza', semestre: '1º sem / 2026' },
    ],
  },
}

export const aulaColors = [
  { bg: 'bg-blue-500',   light: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   ring: 'ring-blue-400'   },
  { bg: 'bg-violet-500', light: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', ring: 'ring-violet-400' },
  { bg: 'bg-emerald-500',light: 'bg-emerald-50',text: 'text-emerald-700',border: 'border-emerald-200',ring: 'ring-emerald-400'},
  { bg: 'bg-amber-500',  light: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  ring: 'ring-amber-400'  },
  { bg: 'bg-rose-500',   light: 'bg-rose-50',   text: 'text-rose-700',   border: 'border-rose-200',   ring: 'ring-rose-400'   },
  { bg: 'bg-cyan-500',   light: 'bg-cyan-50',   text: 'text-cyan-700',   border: 'border-cyan-200',   ring: 'ring-cyan-400'   },
]

export type Aula = {
  id: number
  cursoNome: string
  data: string
  descricao: string
  colorIdx: number
  alunos: { id: number; nome: string }[]
}

export const aulasIniciais: Aula[] = [
  {
    id: 1, cursoNome: 'TESTE', data: '2026-03-10', descricao: 'Aula 1', colorIdx: 0,
    alunos: [
      { id: 1, nome: 'Paulo Otávio' },
      { id: 3, nome: 'Pedro Lucas'  },
    ],
  },
  {
    id: 2, cursoNome: 'TESTE', data: '2026-03-11', descricao: 'Aula 1', colorIdx: 1,
    alunos: [
      { id: 2, nome: 'Ana Beatriz'  },
      { id: 7, nome: 'Rafael Costa' },
    ],
  },
  {
    id: 3, cursoNome: 'TESTE', data: '2026-03-12', descricao: 'Aula 1', colorIdx: 2,
    alunos: [
      { id: 4, nome: 'Mariana Souza' },
      { id: 8, nome: 'Camila Rocha'  },
    ],
  },
  {
    id: 4, cursoNome: 'TESTE', data: '2026-03-13', descricao: 'Aula 1', colorIdx: 3,
    alunos: [
      { id: 5, nome: 'Lucas Ferreira' },
      { id: 6, nome: 'Juliana Melo'   },
    ],
  },
]

export const cursos = [
  { id: 1, nome: 'TESTE',    semestre: '1º sem / 2026', matriculados: 2, descricao: 'TESTE TEXTO', colorIdx: 0 },
  { id: 2, nome: 'TESTE', semestre: '1º sem / 2026', matriculados: 2, descricao: 'TESTE TEXTO',                   colorIdx: 1 },
  { id: 3, nome: 'TESTE',   semestre: '1º sem / 2026', matriculados: 2, descricao: 'TESTE TEXTO',               colorIdx: 2 },
  { id: 4, nome: 'TESTE',      semestre: '1º sem / 2026', matriculados: 2, descricao: 'TESTE TEXTO',             colorIdx: 3 },
]

export const praticas = [
  {
    id: 1, nome: 'Alta de Souza', descricao: 'TESTE TEXTO',
    jovens: [
      { nome: 'Ana Beatriz',   semestre: '1º sem / 2026' },
      { nome: 'Mariana Souza', semestre: '1º sem / 2026' },
      { nome: 'Juliana Melo',  semestre: '1º sem / 2026' },
      { nome: 'Camila Rocha',  semestre: '1º sem / 2026' },
    ],
  },
  {
    id: 2, nome: 'Chico Xavier', descricao: 'TESTE TEXTO',
    jovens: [
      { nome: 'Paulo Otávio',   semestre: '1º sem / 2026' },
      { nome: 'Pedro Lucas',    semestre: '1º sem / 2026' },
      { nome: 'Lucas Ferreira', semestre: '1º sem / 2026' },
      { nome: 'Rafael Costa',   semestre: '1º sem / 2026' },
    ],
  },
]