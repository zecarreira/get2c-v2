# Tech2C - Carbon Footprint Tracker 🌱

> **Challenge Tech2C**

---

## 📑 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Indicadores Calculados](#-indicadores-calculados)
- [Como Executar](#-como-executar)
- [Testes](#-testes)
- [Tech Stack](#️-tech-stack-e-justificação)
- [Arquitetura](#-arquitetura-do-projeto)
- [Estrutura do Excel](#-estrutura-do-ficheiro-excel-esperado)

---

## 📋 Sobre o Projeto

Este projeto foi desenvolvido como resposta ao desafio **Tech2C 2025**. A aplicação extrai indicadores relevantes de ficheiros Excel com dados energéticos da DGEG e apresenta-os numa interface web intuitiva com gráficos interativos.

---

## ✨ Funcionalidades

### Core

- ✅ **Upload de ficheiros Excel** - Drag-and-drop com suporte para .xlsx e .xls
- ✅ **Validação robusta** - Validação de ficheiros e dados com Zod
- ✅ **Rate limiting** - Proteção contra abuso (10 requests/minuto)
- ✅ **Cálculo de indicadores** - Processamento automático de dados de emissões

### Visualização

- ✅ **Dashboard interativo** - Cards de KPIs com totais e médias
- ✅ **Gráficos animados** - Barras, linhas, áreas e pie charts com Recharts
- ✅ **Filtros avançados** - Filtrar por ano e/ou setor com recálculo de todos os indicadores
- ✅ **Análise de tendências** - Evolução temporal com variação percentual

### Funcionalidades Avançadas

- ✅ **Intensidade Carbónica** - Métricas de eficiência por setor (t CO₂/MWh)
- ✅ **Rankings** - Top emissores, maiores reduções e empresas mais eficientes
- ✅ **Previsão de emissões** - Forecast 3 anos com regressão linear e intervalo de confiança
- ✅ **Exportar PDF** - Relatório completo com indicadores

### UX/UI

- ✅ **Dark/Light mode** - Tema claro e escuro com persistência
- ✅ **Internacionalização** - Suporte completo PT/EN
- ✅ **Histórico de uploads** - Últimos ficheiros processados (localStorage)
- ✅ **Skeletons** - Loading states durante processamento
- ✅ **Empty state** - Guia visual para novos utilizadores
- ✅ **Responsivo** - Adaptado para mobile, tablet e desktop

### DevOps

- ✅ **Testes unitários** - 24 testes com Vitest
- ✅ **Docker** - Pronto para deploy em containers
- ✅ **Sentry** - Monitorização de erros em produção (opcional)
- ✅ **TypeScript** - 100% tipado

---

## 📊 Indicadores Calculados

| Indicador                 | Descrição                                   |
| ------------------------- | ------------------------------------------- |
| **Total CO₂/Ano**         | Soma das emissões agrupadas por ano         |
| **Média Consumo/Empresa** | Média do consumo energético por empresa     |
| **Top 5 Emissores**       | Ranking das empresas com maiores emissões   |
| **Emissões por Setor**    | Distribuição por setor de atividade         |
| **Intensidade Carbónica** | Emissões por unidade de energia (t CO₂/MWh) |
| **Tendência Anual**       | Variação percentual ano a ano               |
| **Previsão 3 Anos**       | Projeção futura com intervalo de confiança  |

---

## 🚀 Como Executar

### Pré-requisitos

- **Node.js 18+** (desenvolvimento)
- **Docker** (produção)

### Desenvolvimento

```bash
# Clonar repositório
git clone https://github.com/zecarreira/get2c-v2.git
cd tech2c-carbon-tracker

# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev
```

Aceder a [http://localhost:3000](http://localhost:3000)

### Docker

```bash
# Build e execução
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

### Gerar Dados de Teste

```bash
npx tsx scripts/generate-test-data.ts
```

O ficheiro será criado em `public/sample-dgeg-data.xlsx`.

---

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Executar uma vez (CI)
npm test -- --run

# Com coverage
npm test -- --coverage
```

**Cobertura:** 24 testes unitários

- Validações Zod (11 testes)
- Excel processor (13 testes)

---

## 🛠️ Tech Stack e Justificação

### Frontend

| Tecnologia       | Versão | Justificação                                            |
| ---------------- | ------ | ------------------------------------------------------- |
| **Next.js**      | 16     | Framework full-stack com App Router e Server Components |
| **React**        | 19     | UI Library com as mais recentes features                |
| **TypeScript**   | 5      | Tipagem estática para melhor DX                         |
| **Tailwind CSS** | 4      | Utility-first CSS framework                             |
| **shadcn/ui**    | -      | Componentes acessíveis e customizáveis                  |
| **Recharts**     | 2      | Gráficos declarativos baseados em D3.js                 |
| **next-themes**  | -      | Gestão de temas (dark/light mode)                       |

### Backend

| Tecnologia             | Justificação                                   |
| ---------------------- | ---------------------------------------------- |
| **Next.js API Routes** | Endpoints serverless integrados                |
| **xlsx (SheetJS)**     | Parsing de ficheiros Excel                     |
| **Zod**                | Validação type-safe com mensagens customizadas |
| **jsPDF**              | Geração de relatórios PDF                      |

### Testing & DevOps

| Tecnologia          | Uso                           |
| ------------------- | ----------------------------- |
| **Vitest**          | Unit testing rápido e moderno |
| **Testing Library** | Testes de componentes React   |
| **Docker**          | Containerização para deploy   |
| **Sentry**          | Error monitoring (opcional)   |

### Porquê Next.js?

1. **Full-stack** - Frontend e backend numa única codebase
2. **Performance** - Server Components reduzem JS enviado ao cliente
3. **Deploy** - Facilmente dar deploy em Vercel ou Docker
4. **DX** - Hot reload, TypeScript nativo, file-based routing

## 🏗️ Arquitetura do Projeto

```
src/
├── app/
│   ├── api/upload/           # API endpoint
│   ├── global-error.tsx      # Error boundary (Sentry)
│   ├── layout.tsx            # Layout com providers
│   └── page.tsx              # Dashboard principal (6 tabs)
│
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── carbon-intensity.tsx  # Métricas de eficiência
│   ├── charts.tsx            # Gráficos animados
│   ├── empty-state.tsx       # Estado vazio
│   ├── export-pdf.tsx        # Exportar relatório
│   ├── file-upload.tsx       # Upload drag-and-drop
│   ├── filters.tsx           # Filtros ano/setor
│   ├── forecast-chart.tsx    # Previsão de emissões
│   ├── indicator-cards.tsx   # Cards de KPIs
│   ├── language-toggle.tsx   # Alternar PT/EN
│   ├── rankings.tsx          # Rankings de empresas
│   ├── skeletons.tsx         # Loading states
│   ├── theme-toggle.tsx      # Dark/Light mode
│   ├── trend-analysis.tsx    # Análise de tendências
│   └── upload-history.tsx    # Histórico de uploads
│
├── hooks/
│   └── use-local-storage.ts  # Hook para localStorage
│
├── lib/
│   ├── i18n/                 # Traduções PT/EN
│   ├── validations/          # Schemas Zod
│   ├── excel-processor.ts    # Processamento Excel
│   ├── rate-limiter.ts       # Rate limiting
│   └── utils.ts              # Utilitários
│
└── types/
    └── index.ts              # Definições TypeScript
```

### Fluxo de Dados

```
Upload Excel → Validação Zod → Excel Processor → Indicadores → Dashboard
     ↓              ↓              ↓                 ↓
 Drag&Drop    Size/Type      xlsx parse      Cards + Charts
              Validation     + Aggregation   + Filtros + PDF
```

---

## 📊 Estrutura do Ficheiro Excel Esperado

O sistema reconhece automaticamente as seguintes colunas (case-insensitive):

| Coluna          | Nomes Aceites                            | Obrigatório |
| --------------- | ---------------------------------------- | ----------- |
| Empresa         | `empresa`, `company`, `nome`, `entidade` | ✅          |
| Setor           | `setor`, `sector`, `atividade`, `cae`    | ❌          |
| Ano             | `ano`, `year`, `período`                 | ❌          |
| Emissões CO₂    | `emissoes`, `emissions`, `co2`, `tco2`   | ✅          |
| Consumo Energia | `consumo`, `energia`, `energy`, `mwh`    | ❌          |

### Exemplo

| Empresa | Setor    | Ano  | Emissões CO2 (t) | Consumo Energia (MWh) |
| ------- | -------- | ---- | ---------------- | --------------------- |
| EDP     | Energia  | 2023 | 150000           | 500000                |
| Galp    | Petróleo | 2023 | 200000           | 750000                |

---

## 🔒 Validação

- **Ficheiro:** Extensão (.xlsx/.xls), tamanho (max 10MB), tipo MIME
- **Dados:** Campos obrigatórios, tipos, valores não negativos
- **Rate Limit:** 10 requests/minuto por IP

Mensagens de erro em **português** para melhor UX.

---

## 📄 Licença

Desenvolvido para o **Challenge Tech2C**.

---

## 👤 Autor

**José Carreira**
