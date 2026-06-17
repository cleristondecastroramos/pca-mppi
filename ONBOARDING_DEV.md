# Relatório Técnico e Guia de Onboarding (PCA-MPPI)

Este documento tem como objetivo fornecer uma visão técnica detalhada do projeto **PCA-MPPI** para facilitar a integração (onboarding) de novos desenvolvedores na equipe. Aqui você encontrará detalhes sobre a arquitetura, tecnologias, estrutura de pastas e os principais fluxos do sistema.

---

## 1. Visão Geral do Sistema

O **PCA-MPPI** é uma aplicação web desenvolvida para o Ministério Público do Estado do Piauí (MPPI) focada no planejamento, controle e acompanhamento do **Plano Anual de Contratações**. 

O sistema substitui controles manuais e planilhas por uma plataforma centralizada que suporta:
- Separação lógica por exercício (ex: 2026, 2027);
- Cadastro e tramitação de demandas (Ativas, Suspensas, Concluídas);
- Dashboards analíticos com indicadores de execução orçamentária;
- Geração e exportação de relatórios (PDF);
- Trilha de auditoria e controle de acessos (RBAC).

A aplicação segue uma arquitetura baseada em **SPA (Single Page Application)** conectada a um backend como serviço (BaaS).

---

## 2. Stack Tecnológica

O projeto utiliza um ecossistema moderno e consolidado, focado em produtividade e manutenibilidade:

### Front-end
- **React (18.3.x):** Biblioteca principal para a interface.
- **TypeScript (5.8.x):** Tipagem estática em toda a base de código, garantindo segurança e autocomplete.
- **Vite:** Ferramenta de build extremamente rápida, usada tanto para desenvolvimento local quanto para geração do bundle de produção.
- **Tailwind CSS:** Framework utilitário de CSS para estilização direta via classes.
- **shadcn/ui & Radix UI:** Biblioteca de componentes base acessíveis, altamente customizáveis e que não instalam dependências como pacotes pesados, mas sim incorporam os componentes diretamente no código.
- **Framer Motion:** Utilizado para micro-interações e animações fluidas.
- **React Router (v6):** Gerenciamento de rotas do lado do cliente.
- **React Hook Form & Zod:** Gerenciamento de formulários complexos e validação robusta de esquemas de dados.

### Gestão de Estado & Data Fetching
- **TanStack Query (React Query v5):** Essencial no projeto. Usado para buscar, fazer cache, sincronizar e atualizar dados assíncronos de forma eficiente.

### Back-end & Banco de Dados (BaaS)
- **Supabase:** Plataforma Backend-as-a-Service baseada em PostgreSQL. O Supabase cuida de:
  - **Autenticação:** Gerenciamento de sessões e perfis de usuários.
  - **Database (PostgreSQL):** Banco de dados relacional que armazena demandas, justificativas, exercícios, etc.
  - **Row Level Security (RLS):** Segurança de banco de dados nativa do Postgres, configurada para garantir que usuários só vejam e manipulem o que estão autorizados.

### Exportação de Relatórios
- **jsPDF & jsPDF-AutoTable:** Geração dinâmica de PDFs no client-side a partir de listas e tabelas.

---

## 3. Estrutura de Diretórios (`/src`)

A base de código está organizada da seguinte maneira:

```text
src/
├── components/    # Componentes reutilizáveis (botões, modais, formulários, componentes UI gerados pelo shadcn)
├── hooks/         # Custom hooks do React (lógicas isoladas, fetchers de dados)
├── integrations/  # Integrações com serviços de terceiros (ex: Supabase client)
├── lib/           # Funções utilitárias centrais e configurações base (ex: config do utils para tailwind-merge)
├── modules/       # Código agrupado por domínio/módulo de negócio para facilitar a escalabilidade
├── pages/         # Componentes de página. Cada arquivo representa uma rota da aplicação (ex: VisaoGeral.tsx)
├── utils/         # Funções auxiliares puras (formatação de datas, moeda, geradores de PDF)
├── App.tsx        # Componente raiz, onde estão definidas as rotas principais (React Router)
└── main.tsx       # Entry point do React, onde ocorre o render e a configuração dos Providers (QueryClient, etc)
```

---

## 4. Gerenciamento de Estado e Fluxo de Dados

### Data Fetching com Supabase + React Query
No PCA-MPPI, evitamos ao máximo armazenar o estado global de dados em contextos ou Redux. Em vez disso, usamos o **React Query**.

**Padrão Comum:**
1. Cria-se uma função assíncrona que consome o Supabase Client (em `src/integrations/` ou `src/hooks/`).
2. Usa-se `useQuery` para buscar dados ou `useMutation` para enviar dados (cadastros, edições, suspensões).
3. Após o sucesso de uma *mutation*, chamamos `queryClient.invalidateQueries({ queryKey: [...] })` para forçar a atualização automática da tela sem recarregar a página.

### Variáveis de Estado Local
Usamos `useState` para controle local de UI (ex: modais abertos, abas ativas, selects de filtros da tabela).

---

## 5. Principais Funcionalidades e Telas (`src/pages`)

Ao navegar no código, atente-se às seguintes rotas e páginas críticas:

1. **Visão Geral / Dashboard (`VisaoGeral.tsx`):** Exibe métricas, total de orçamento comprometido e painéis gráficos. Fortemente dependente do Recharts e requisições agregadas do banco.
2. **Nova Contratação (`NovaContratacao.tsx`):** Formulário complexo para inserção de demandas no PCA. Faz uso de `react-hook-form` e `zod`.
3. **Demandas Ativas & Suspensas (`Demandas.tsx` / `Suspensas.tsx`):** Telas de listagem estilo data-table. Possuem filtros dinâmicos e permitem ações por linha (editar, visualizar, suspender).
4. **Relatórios (`Relatorios.tsx`):** Página dedicada à aplicação de filtros para gerar extratos exportáveis. Integra-se ativamente com as funções de geração de PDF em `src/utils/`.

---

## 6. Autenticação e Segurança (RBAC)

A aplicação lida com informações sensíveis.
- **Sessões:** Gerenciadas de forma automática pelo SDK do Supabase.
- **Perfis (RBAC):** Os usuários estão classificados em perfis (ex: Admin, Operador, Visualizador). Alguns componentes na interface são condicionalmente renderizados dependendo do perfil do usuário autenticado. 
- A validação real ocorre no back-end (Supabase RLS), mas a UI se ajusta para não mostrar botões de edição a usuários sem permissão.

---

## 7. Padrões de Projeto e Boas Práticas

Para manter a consistência ao contribuir:

1. **Tipagem:** Não use `any`. Se está integrando com o Supabase, você pode (e deve) utilizar as tipagens geradas pelo banco de dados ou criar *interfaces* próprias se estiver compondo dados.
2. **Estilização:** Use Tailwind. Para componentes customizados, utilize a convenção `cn()` (classe utilitária em `src/lib/utils.ts` que combina `clsx` com `tailwind-merge`).
3. **Componentização:** Se um trecho de UI se repete em duas ou mais páginas, mova para `src/components`. Se a lógica de requisição se repete, crie um hook em `src/hooks`.
4. **Formulários:** Sempre valide as entradas com Zod. Evite formulários "soltos" com `useState` se passarem de 3 campos.

---

## 8. Como Configurar o Ambiente Local

1. **Repositório:**
   ```bash
   git clone https://github.com/mppi/pca-mppi.git
   cd pca-mppi
   ```

2. **Dependências:**
   O projeto utiliza Node.js >= 18.
   ```bash
   npm install
   ```

3. **Variáveis de Ambiente (`.env`):**
   Crie o arquivo na raiz do projeto contendo as chaves para se conectar à instância do Supabase:
   ```env
   VITE_SUPABASE_URL=SuaURL
   VITE_SUPABASE_ANON_KEY=SuaChaveAnonima
   ```

4. **Executando:**
   ```bash
   npm run dev
   ```
   Acesse em `http://localhost:8080` (ou a porta informada no terminal).

---

> **Dúvidas?**
> Ao mexer na estrutura do banco ou RLS, consulte as migrações SQL (geralmente em `/supabase/migrations`). Para dúvidas de regras de negócio, converse com os analistas responsáveis pelo escopo institucional do projeto no MPPI.
