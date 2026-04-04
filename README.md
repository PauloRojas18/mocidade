# ⛪ Mocidade — Sistema de Gestão de Grupo de Jovens

Sistema web desenvolvido para gerenciar as atividades de um **grupo de jovens**, contemplando controle de presença em aulas e práticas, cadastro de jovens, gerenciamento de cursos e exportação de dados.

---

## ✨ Funcionalidades

- **Gestão de jovens** — cadastro completo com histórico individual
- **Controle de frequência** — registro de presença por aula e por dia
- **Gerenciamento de cursos** — cadastro e listagem de cursos disponíveis
- **Práticas** — controle de membros por prática/atividade
- **Relatórios** — visão consolidada de frequência e participação
- **Exportação Excel** — download de listas de jovens, cursos, práticas e presenças

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 + React 19 |
| Linguagem | TypeScript |
| Banco de dados | MySQL (mysql2) |
| Estilização | Tailwind CSS v4 |
| Ícones | Lucide React |
| Exportação | ExcelJS |
| Hospedagem | Vercel |

---

## 📁 Estrutura do Projeto

```
app/
├── page.tsx              # Dashboard principal
├── jovens/               # Listagem e perfil de jovens
│   └── [id]/             # Detalhes do jovem
├── cursos/               # Gerenciamento de cursos
├── praticas/             # Controle de práticas
├── frequencia/           # Registro de frequência diária
└── relatorios/           # Relatórios gerais
api/
├── jovens/               # CRUD de jovens
├── aulas/                # Gerenciamento de aulas
├── cursos/               # CRUD de cursos
├── praticas/             # CRUD de práticas
├── presencas/            # Registro de presenças
├── chamada-dia/          # Chamada do dia
└── exportar/             # Exportação Excel (jovens, cursos, práticas, presenças)
```

---

## 📚 Aprendizados

- Conectar Next.js diretamente ao **MySQL** sem ORM, escrevendo queries com `mysql2` e gerenciando o pool de conexões manualmente em ambiente serverless
- Modelar entidades com múltiplos relacionamentos (jovem ↔ curso ↔ aula ↔ presença ↔ prática) e garantir consistência nas queries de exportação
- Gerar relatórios Excel complexos com **ExcelJS**, cruzando dados de diferentes tabelas num único arquivo com múltiplas abas
- Estruturar as rotas de exportação como endpoints independentes, permitindo download de qualquer subset de dados sem afetar o resto da aplicação

---

## 👤 Autor

**Paulo Otávio Câmara Rojas**  
[GitHub](https://github.com/PauloRojas18) • [LinkedIn](https://linkedin.com/in/paulo-rojas-b7b77a3a1/) • paulootaviogalala@gmail.com
