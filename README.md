# PCA-MPPI
> Sistema de Gerenciamento do Plano Anual de Contratações do Ministério Público do Estado do Piauí

<p align="center">
  <img src="https://img.shields.io/badge/status-Em%20Produ%C3%A7%C3%A3o-success" alt="Status do projeto" />
  <img src="https://img.shields.io/badge/React-18.3-blue" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-blue" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-Backend-green" alt="Supabase" />
  <img src="https://img.shields.io/badge/Licen%C3%A7a-Institucional-lightgrey" alt="Licença" />
  <img src="https://img.shields.io/badge/Frontend-Vite-646CFF" alt="Vite" />
  <img src="https://img.shields.io/badge/UI-shadcn%2Fui-111827" alt="shadcn/ui" />
</p>

---

## Sumário

- [Descrição](#descrição)
- [Funcionalidades](#funcionalidades)
- [Capturas de tela](#capturas-de-tela)
- [Tecnologias](#tecnologias)
- [Ambientes](#ambientes)
- [Como executar](#como-executar)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Estrutura do sistema](#estrutura-do-sistema)
- [Roadmap](#roadmap)
- [Contribuição](#contribuição)
- [Segurança e acesso](#segurança-e-acesso)
- [Documentação e apoio](#documentação-e-apoio)
- [Licença](#licença)

---

## Descrição

O **PCA-MPPI** é um sistema web desenvolvido exclusivamente para o **Ministério Público do Estado do Piauí (MPPI)**. Seu objetivo é apoiar o planejamento, o acompanhamento e a gestão do Plano Anual de Contratações da instituição.

A solução centraliza demandas de contratação, dashboards gerenciais, relatórios estratégicos, controle de prazos, monitoramento orçamentário e rastreabilidade das ações realizadas ao longo do exercício. O sistema foi desenhado para fortalecer a governança, a transparência e a eficiência administrativa.

---

## Funcionalidades

- Gestão do Plano Anual de Contratações.
- Controle por exercício, com separação entre PCA 2026, PCA 2027 e exercícios futuros.
- Cadastro e acompanhamento de demandas de contratação.
- Gestão de demandas ativas, suspensas e sobrestadas.
- Controle de prazos e alertas operacionais.
- Indicadores e dashboards interativos.
- Relatórios estratégicos, gerenciais e operacionais.
- Exportação de relatórios em PDF e CSV.
- Perfis de acesso e permissões por usuário.
- Auditoria, conformidade e rastreabilidade das alterações.

---

## Capturas de tela

> Substitua os caminhos abaixo pelas imagens reais do projeto.

<p align="center">
  <img src="./docs/screenshots/visao-geral.png" alt="Visão Geral" width="31%" />
  <img src="./docs/screenshots/demandas-ativas.png" alt="Demandas Ativas" width="31%" />
  <img src="./docs/screenshots/relatorios.png" alt="Relatórios" width="31%" />
</p>

<p align="center">
  <img src="./docs/screenshots/demandas-suspensas.png" alt="Demandas Suspensas" width="31%" />
  <img src="./docs/screenshots/nova-demanda.png" alt="Nova Demanda" width="31%" />
  <img src="./docs/screenshots/tutorial.png" alt="Tutorial" width="31%" />
</p>

---

## Tecnologias

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Supabase](https://supabase.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [React Router](https://reactrouter.com/)
- [Lucide React](https://lucide.dev/)

---

## Ambientes

| Ambiente | Finalidade | Acesso |
|---|---|---|
| Desenvolvimento | Evolução local da aplicação | `localhost` |
| Homologação | Testes e validações | ambiente interno |
| Produção | Uso institucional do MPPI | acesso controlado |

---

## Como executar

### Pré-requisitos

- Node.js 18 ou superior.
- NPM ou Yarn.
- Projeto configurado no Supabase.

### Passos

```bash
git clone https://github.com/mppi/pca-mppi.git
cd pca-mppi
npm install
```

Crie um arquivo `.env` na raiz do projeto e adicione as variáveis de ambiente necessárias.

Depois, execute:

```bash
npm run dev
```

Abra o endereço informado no terminal, normalmente:

```bash
http://localhost:5173
```

---

## Variáveis de ambiente

```env
VITE_SUPABASE_URL=https://sua-url-do-supabase.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-do-supabase
```

---

## Estrutura do sistema

- **Visão Geral:** painéis e gráficos com os principais indicadores do PCA.
- **Demandas Ativas:** gestão das contratações em execução.
- **Demandas Suspensas:** acompanhamento das demandas interrompidas, totais ou parciais.
- **Relatórios:** geração e exportação de relatórios gerenciais e estratégicos.
- **Configurações e Usuários:** administração de perfis, permissões e dados cadastrais.
- **Documentação e Tutorial:** instruções de uso e apoio ao usuário final.

---

## Roadmap

- [x] Gestão de demandas por exercício.
- [x] Separação entre demandas ativas e suspensas.
- [x] Relatórios estratégicos e gerenciais.
- [x] Controle de permissões por perfil.
- [ ] Melhorias contínuas de layout e usabilidade.
- [ ] Ampliação dos relatórios analíticos.
- [ ] Evolução do tutorial e da documentação institucional.
- [ ] Novos módulos de acompanhamento e governança.

---

## Contribuição

Por se tratar de um sistema institucional do MPPI, as contribuições seguem um fluxo controlado:

1. Abra uma issue descrevendo o problema ou melhoria.
2. Crie uma branch específica para a tarefa.
3. Realize as alterações seguindo o padrão do projeto.
4. Abra um pull request para revisão.
5. Aguarde a validação da equipe responsável.

---

## Segurança e acesso

- Acesso restrito a usuários autorizados.
- Uso de e-mail institucional do MPPI.
- Controle de acesso por perfis.
- Registro de histórico para auditoria e rastreabilidade.

---

## Documentação e apoio

O PCA-MPPI conta com tutorial embutido, relatórios operacionais e estratégicos, além de apoio institucional para orientação de uso e suporte técnico.

---

## Licença

Este projeto é um software institucional de uso restrito do Ministério Público do Estado do Piauí (MPPI).  
A cópia, distribuição, engenharia reversa ou uso não autorizado fora do escopo institucional é estritamente proibido.
