// All tutorial content data matching Tutorial.tsx exactly

export interface PdfSection {
  id: string;
  title: string;
  content: PdfBlock[];
}

export type PdfBlock =
  | { type: "p"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "note"; text: string }
  | { type: "tip"; text: string }
  | { type: "table"; headers: string[]; rows: string[][]; headerAlign?: string[]; columnWidths?: number[] };

export const TOC = [
  "Introdução ao Sistema",
  "Acesso e Autenticação",
  "Perfis de Acesso e Permissões",
  "Navegação e Interface",
  "Home — Página Inicial",
  "Visão Geral — Dashboard",
  "Demandas Ativas",
  "Demandas Suspensas",
  "Nova Demanda de Contratação",
  "Setores Demandantes",
  "Controle de Prazos",
  "Riscos e Pendências",
  "Prioridades de Contratação",
  "Conformidade",
  "Licitações SRP (Sistema de Registro de Preços)",
  "Resultados Alcançados",
  "Relatórios",
  "Orçamento",
  "Gerenciamento de Usuários",
  "Notificações",
  "Minha Conta",
  "FAQ / Dúvidas",
  "Glossário de Termos e Siglas",
];

const MATRIX: string[][] = [
  ["Home / Visão Geral", "Completo", "Completo", "Apenas seu setor", "Somente leitura"],
  ["Demandas Ativas", "CRUD completo", "Visualizar e editar", "Visualiza e edita o setor", "Somente leitura"],
  ["Demandas Suspensas", "Reativar/Fundir", "Reativar/Fundir", "Apenas seu setor", "Somente leitura"],
  ["Nova Demanda", "[V]", "[V]", "[V] (setor fixo)", "[X]"],
  ["Setores Demandantes", "[V]", "[V]", "[X]", "[X]"],
  ["Controle de Prazos", "[V]", "[V]", "Apenas seu setor", "[X]"],
  ["Riscos e Pendências", "[V]", "[V]", "Apenas seu setor", "[X]"],
  ["Prioridades", "[V]", "[V]", "Apenas seu setor", "[X]"],
  ["Conformidade", "Gerenciar", "Gerenciar", "[X]", "[X]"],
  ["Licitações SRP", "[V]", "[V]", "Apenas seu setor", "Somente leitura"],
  ["Resultados", "[V]", "[V]", "[X]", "[X]"],
  ["Relatórios", "Gerar e exportar", "Gerar e exportar", "[X]", "[X]"],
  ["Orçamento", "Gerenciar completo", "[X]", "[X]", "[X]"],
  ["Gerenc. Usuários", "Gerenciar completo", "[X]", "[X]", "[X]"],
  ["Notificações", "Gerenciar", "Visualizar", "Visualizar", "Visualizar"],
  ["FAQ / Dúvidas", "[V]", "[V]", "[V]", "[V]"],
  ["Minha Conta", "[V]", "[V]", "[V]", "[V]"],
];

const FORM_FIELDS: string[][] = [
  ["Descrição do Objeto", "Sim", "10-500 caracteres"],
  ["PDM/CATSER", "Não", "Código do catálogo"],
  ["Classe", "Sim", "Material Consumo, Serviço, Serviço de TI, etc."],
  ["Setor Requisitante", "Sim", "Auto para perfil Setor Req."],
  ["Tipo de Contratação", "Sim", "Nova, Renovação, Aditivo, Repactuação, etc."],
  ["SRP", "Sim", "Sim / Não"],
  ["Modalidade", "Sim", "Pregão Eletrônico, Concorrência, Dispensa, Inexigibilidade, ARP (própria), ARP (carona)"],
  ["Normativo", "Sim", "14.133/2021 ou 8.666/1993"],
  ["Grau de Prioridade", "Sim", "Alta, Média, Baixa"],
  ["Unidade Orçamentária", "Sim", "PGJ, FMMP, FEPDC"],
  ["Data Prevista", "Sim", "Data estimada de conclusão"],
  ["Justificativa", "Sim", "20-1000 caracteres"],
];

const SIGLAS: string[][] = [
  ["PCA", "Plano de Contratações Anual"],
  ["MPPI", "Ministério Público do Estado do Piauí"],
  ["PGJ", "Procuradoria-Geral de Justiça"],
  ["FMMP", "Fundo de Modernização do Ministério Público"],
  ["FEPDC", "Fundo Estadual de Proteção e Defesa do Consumidor"],
  ["UO", "Unidade Orçamentária"],
  ["SRP", "Sistema de Registro de Preços"],
  ["SEI", "Sistema Eletrônico de Informações"],
  ["PGEA", "Procedimento de Gestão Administrativa"],
  ["CLC", "Coordenadoria de Licitações e Contratos"],
  ["PDM", "Padrão Descritivo de Material"],
  ["CATSER", "Catálogo de Serviços"],
  ["ASSESPPLAGES", "Assessoria de Planejamento e Gestão"],
  ["DFD", "Documento de Formalização de Demanda"],
  ["ETP", "Estudo Técnico Preliminar"],
  ["TR", "Termo de Referência"],
];

const SETORES: string[][] = [
  ["CAA", "Coordenadoria de Apoio Administrativo"],
  ["CCF", "Coordenadoria de Contabilidade e Finanças"],
  ["CCS", "Coordenadoria de Comunicação Social"],
  ["CEAF", "Centro de Estudos e Aperfeiçoamento Funcional"],
  ["CLC", "Coordenadoria de Licitações e Contratos"],
  ["CONINT", "Controladoria Interna"],
  ["CPPT", "Coordenadoria de Perícias e Pareceres Técnicos"],
  ["CRH", "Coordenadoria de Recursos Humanos"],
  ["CTI", "Coordenadoria de Tecnologia da Informação"],
  ["GAECO", "Grupo de Atuação Especial de Combate ao Crime Organizado"],
  ["GSI", "Gabinete de Segurança Institucional"],
  ["PLAN", "Assessoria de Planejamento e Gestão (ASSESPPLAGES)"],
  ["PROCON", "Programa de Proteção e Defesa do Consumidor"],
];

const TERMOS: string[][] = [
  ["Contratação", "Processo formal de aquisição de bens ou serviços pelo MPPI."],
  ["Trava Orçamentária", "Mecanismo que bloqueia novas demandas de contratação quando o limite é atingido."],
  ["Etapa do Processo", "Fase atual (Planejamento, Iniciado, Em Licitação, Retornado para Diligência, Contratado, Concluído)."],
  ["Sobrestamento / Suspensão", "Paralisação e retirada de uma demanda do fluxo principal orçamentário. Movida para as 'Demandas Suspensas'."],
  ["Demanda Filha", "Demanda gerada a partir de uma suspensão parcial de itens. Vinculada a uma Demanda Origem."],
  ["Fusão Reversa", "Operação de reativação de uma Demanda Filha, onde seus quantitativos retornam à Demanda Origem."],
  ["Devolução", "Retorno do processo ao setor para correções."],
  ["Empenho", "Ato administrativo que reserva recursos orçamentários."],
  ["Conformidade", "Verificação de requisitos documentais e legais."],
  ["Valor Estimado / Total", "Valor previsto para a demanda de contratação, antes do certame."],
  ["Valor Contratado", "Valor efetivamente acordado no contrato."],
  ["Valor Executado", "Quantia exata de recursos orçamentários que foi empenhada para cobrir uma despesa específica."],
  ["Código PCA", "Identificador único no formato PCA-XXXX-2026."],
  ["Modalidade Licitatória", "Procedimento legal para seleção do fornecedor (ex: Pregão, Dispensa)."],
  ["Normativo", "Lei de licitações que rege o processo (Lei 14.133 ou 8.666)."],
  ["Termo de Referência", "Documento que detalha o objeto, especificações e obrigações da contratação."],
  ["DFD", "Documento de Formalização de Demanda que oficializa a necessidade de compra."],
  ["ETP", "Estudo Técnico Preliminar que analisa a viabilidade da solução escolhida."],
  ["Mapa de Riscos", "Documento que identifica e mitiga riscos que podem afetar a contratação."],
  ["Pesquisa de Preços", "Levantamento de valores de mercado para balizar o custo estimado."],
  ["Homologação", "Confirmação da validade jurídica do processo pela autoridade superior."],
  ["Adjudicação", "Atribuição formal do objeto da licitação ao vencedor."],
  ["Aditivo", "Instrumento para alteração de valor ou prazo de contratos vigentes."],
  ["Apostilamento", "Anotação administrativa de ajustes contratuais que não exigem aditivo."],
  ["Repactuação", "Reajuste de preços para contratos de serviços contínuos com mão de obra."],
  ["Dispensa de Licitação", "Contratação direta por baixo valor ou situações específicas em lei."],
  ["Inexigibilidade", "Contratação direta quando não há possibilidade de competição."],
  ["Pregão Eletrônico", "Leilão em formato eletrônico para aquisição de bens e serviços comuns."],
  ["Registro de Preços", "Sistema para registro formal de preços para futuras contratações (SRP)."],
  ["Saldo Orçamentário", "Recurso ainda disponível no orçamento do setor após os empenhos realizados."],
];

export function getTutorialSections(): PdfSection[] {
  return [
    // 1. Introdução
    {
      id: "sec1",
      title: "1. Introdução ao Sistema",
      content: [
        { type: "h3", text: "1.1. O que é o PCA 2026?" },
        { type: "p", text: "O Sistema de Gerenciamento PCA MPPI 2026 é o sistema oficial do Ministério Público do Estado do Piauí (MPPI) desenvolvido para gerenciar de forma centralizada, transparente e eficiente todas as contratações públicas planejadas para o exercício de 2026. Ele substitui o uso de planilhas avulsas e dashboards de Power BI por uma plataforma web integrada, com controle de acesso, rastreabilidade e automação de processos." },
        { type: "h3", text: "1.2. Objetivo do Sistema" },
        { type: "ul", items: [
          "Centralização: Reunir em uma única plataforma todas as demandas de contratação dos diversos setores do MPPI.",
          "Transparência: Oferecer visibilidade total sobre o andamento de cada contratação, desde o planejamento até a conclusão.",
          "Controle orçamentário: Gerenciar limites orçamentários por setor e unidade orçamentária, com travas automáticas que impedem o excesso de gastos.",
          "Rastreabilidade: Manter histórico completo de todas as alterações realizadas em cada contratação, incluindo dados anteriores e novos, com identificação do usuário responsável.",
          "Conformidade: Acompanhar o cumprimento de requisitos documentais e legais de cada processo licitatório.",
          "Tomada de decisão: Fornecer dashboards, indicadores e relatórios que auxiliem gestores e administradores na priorização e acompanhamento das contratações.",
        ] },
        { type: "h3", text: "1.3. Público-alvo" },
        { type: "ul", items: [
          "Administradores do sistema (CLC e ASSESPPLAGES): Responsáveis pela gestão global, cadastro de usuários e configurações.",
          "Gestores: Servidores responsáveis pelo acompanhamento e consolidação das demandas de todos os setores.",
          "Setores Requisitantes: Servidores dos setores que cadastram e gerenciam suas próprias demandas de contratação (CAA, CCF, CCS, CLC, CPPT, CTI, CRH, CEAF, GAECO, GSI, CONINT, PLANEJAMENTO, PROCON).",
          "Consulta: Servidores com acesso somente para leitura das informações do sistema.",
        ] },
        { type: "h3", text: "1.4. Requisitos de Acesso" },
        { type: "ul", items: [
          "Navegador web atualizado: Google Chrome, Mozilla Firefox, Microsoft Edge ou Safari em suas versões mais recentes.",
          "Conexão com a internet: O sistema é acessível via web a partir de qualquer dispositivo.",
          "Credenciais de acesso: E-mail institucional (@mppi.mp.br) e senha fornecidos pelo administrador do sistema. Não existe opção de autocadastro — somente administradores podem criar contas.",
        ] },
      ],
    },
    // 2. Acesso e Autenticação
    {
      id: "sec2",
      title: "2. Acesso e Autenticação",
      content: [
        { type: "h3", text: "2.1. Tela de Login" },
        { type: "p", text: "Para acessar o sistema:" },
        { type: "ol", items: [
          "Abra o navegador e acesse o endereço do sistema: https://pca-mppi.vercel.app",
          "Na tela de login, preencha o E-mail Institucional (formato seu.nome@mppi.mp.br) e a Senha.",
          "Clique no botão \"Entrar\".",
          "Se as credenciais estiverem corretas, você será redirecionado para a Página Inicial (Home).",
        ] },
        { type: "note", text: "O sistema não possui opção de cadastro autônomo. Caso não possua credenciais, entre em contato com o administrador na Coordenadoria de Licitações e Contratos ou na Assessoria de Planejamento e Gestão." },
        { type: "h3", text: "2.2. Recuperação de Senha (Esqueci Minha Senha)" },
        { type: "ol", items: [
          "Na tela de login, clique em \"Esqueci minha senha\".",
          "Informe o e-mail institucional associado à sua conta.",
          "Clique em \"Enviar link de redefinição\".",
          "Acesse seu e-mail, localize a mensagem e clique no link de redefinição.",
          "Defina sua nova senha na tela de Redefinir Senha.",
        ] },
        { type: "note", text: "O link de redefinição de senha tem validade limitada. Caso expire, repita o processo." },
        { type: "h3", text: "2.3. Redefinição de Senha" },
        { type: "p", text: "Após clicar no link recebido por e-mail, informe a nova senha, confirme-a e clique em \"Redefinir Senha\"." },
        { type: "tip", text: "Utilize senhas fortes contendo letras maiúsculas, minúsculas, números e caracteres especiais." },
        { type: "h3", text: "2.4. Logout (Sair do Sistema)" },
        { type: "p", text: "O sistema oferece duas formas práticas para o encerramento seguro da sessão:" },
        { type: "ul", items: [
          "Pelo Menu Lateral (Sidebar): Localizado na parte inferior do menu à esquerda, basta clicar no botão \"Sair\".",
          "Pelo Menu do Avatar (Header): No canto superior direito, clique sobre sua foto ou iniciais e utilize o botão \"Sair\" com ícone posicionado à direita no menu suspenso.",
        ] },
        { type: "note", text: "Sempre efetue o logout ao finalizar suas atividades, especialmente em computadores compartilhados, para garantir a segurança dos dados e da sua conta." },
      ],
    },
    // 3. Perfis
    {
      id: "sec3",
      title: "3. Perfis de Acesso e Permissões",
      content: [
        { type: "p", text: "O sistema PCA 2026 implementa um rigoroso controle de acesso baseado em perfis de usuário." },
        { type: "h3", text: "3.1. Perfil Administrador" },
        { type: "p", text: "Nível mais alto de acesso. Atribuições:" },
        { type: "ul", items: [
          "Gerenciamento completo de usuários e perfis de acesso (criação, edição e exclusão).",
          "Configurações globais, incluindo orçamento planejado e travas orçamentárias.",
          "Aprovação final de planejamentos e validação de dados.",
          "Visualização e edição de todas as demandas de todos os setores.",
          "Exclusão de registros do PCA.",
          "Gerenciamento de notificações do sistema.",
        ] },
        { type: "h3", text: "3.2. Perfil Gestor" },
        { type: "ul", items: [
          "Visualização de todas as demandas e contratações de todos os setores.",
          "Edição técnica de contratações existentes.",
          "Geração de relatórios gerenciais e dashboards.",
          "Validação de demandas dos setores requisitantes.",
          "Sem acesso a gerenciamento de usuários, orçamento e notificações globais.",
        ] },
        { type: "h3", text: "3.3. Perfil Setor Requisitante" },
        { type: "ul", items: [
          "Cadastro de novas demandas de contratação no PCA.",
          "Visualização e edição de todas as demandas do seu próprio setor.",
          "Sem acesso a relatórios gerenciais, conformidade consolidada ou gerenciamento.",
        ] },
        { type: "note", text: "Ao cadastrar nova demanda, o campo \"Setor Requisitante\" é preenchido automaticamente com o setor do usuário logado." },
        { type: "h3", text: "3.4. Perfil Consulta" },
        { type: "ul", items: [
          "Visualização somente leitura das informações vigentes.",
          "Acesso à Visão Geral, FAQ e Minha Conta.",
          "Sem permissão para cadastrar, editar ou excluir qualquer registro.",
        ] },
        { type: "h3", text: "3.5. Matriz de Acesso por Funcionalidade" },
        {
          type: "table",
          headers: ["Funcionalidade", "Admin", "Gestor", "Setor Req.", "Consulta"],
          rows: MATRIX,
          headerAlign: ["left", "center", "center", "center", "center"],
        },
      ],
    },
    // 4. Navegação
    {
      id: "sec4",
      title: "4. Navegação e Interface",
      content: [
        { type: "h3", text: "4.1. Menu Lateral (Sidebar)" },
        { type: "p", text: "O menu lateral é o principal elemento de navegação, posicionado à esquerda da tela:" },
        { type: "ul", items: [
          "Retrátil: Pode ser expandido ou colapsado (mostrando apenas ícones).",
          "Adaptativo por perfil: Exibe apenas os módulos permitidos para o seu perfil de acesso.",
          "Destaque visual: O módulo ativo é destacado com cor diferenciada.",
          "Indicação de versão: Na parte inferior, é exibido o número da versão atual do sistema.",
          "Botão \"Sair\": Na parte inferior, permite encerrar a sessão.",
        ] },
        { type: "h3", text: "4.2. Cabeçalho (Header)" },
        { type: "p", text: "O cabeçalho é a barra superior constante em todo o sistema. Ele exibe o nome da página atual, o sino de notificações, a troca de temas e o Menu do Avatar." },
        { type: "p", text: "Ao clicar no avatar do usuário no canto direito, um menu compacto fornece as seguintes informações e ferramentas:" },
        { type: "ul", items: [
          "Identificação: Mostra seu nome completo, e-mail institucional e o perfil de acesso atribuído (ex: Administrador, Gestor, etc.).",
          "Botão \"Minha Conta\": Localizado à esquerda na parte inferior do menu, permite acessar rapidamente a página de edição de perfil e senha.",
          "Botão \"Sair\": Localizado à direita na parte inferior, permite o encerramento rápido da sessão atual.",
        ] },
        { type: "h3", text: "4.3. Tema Claro / Escuro" },
        { type: "ul", items: [
          "Tema Claro: Fundo branco com texto escuro, ideal para ambientes iluminados.",
          "Tema Escuro: Fundo escuro com texto claro, ideal para reduzir cansaço visual.",
        ] },
        { type: "p", text: "Para alternar, utilize o ícone de sol/lua no cabeçalho do sistema." },
        { type: "h3", text: "4.4. Responsividade" },
        { type: "p", text: "O sistema é responsivo e se adapta a desktop, tablet e mobile. Em telas pequenas, o menu lateral é acessível via botão \"hambúrguer\"." },
      ],
    },
    // 5. Home
    {
      id: "sec5",
      title: "5. Home — Página Inicial",
      content: [
        { type: "p", text: "A página Home é a tela de boas-vindas do sistema, exibida imediatamente após o login do usuário. Esta tela serve como ponto de partida central para toda a navegação dentro da plataforma, proporcionando uma experiência de entrada intuitiva e organizada." },
        { type: "h3", text: "5.1. Estrutura da Página Inicial" },
        { type: "p", text: "A página Home apresenta uma interface limpa e objetiva, composta pelos seguintes elementos principais:" },
        { type: "ul", items: [
          "Menu Lateral (Sidebar): Localizado à esquerda da tela, o menu lateral é o principal meio de navegação do sistema. Ele apresenta de forma hierárquica todos os módulos e funcionalidades aos quais o usuário tem acesso, de acordo com seu perfil de permissões.",
          "Cabeçalho Superior: Exibe o título do módulo atual, notificações do sistema, seletor de tema (claro/escuro) e o menu do avatar, que centraliza as informações do perfil e botões de acesso rápido para conta e logout.",
          "Área de Conteúdo Principal: Região central da tela onde são exibidas mensagens de boas-vindas e informações contextuais sobre o sistema.",
        ] },
        { type: "h3", text: "5.2. Funcionalidades Disponíveis" },
        { type: "p", text: "A partir da Home, o usuário pode acessar rapidamente qualquer módulo do sistema através do menu lateral. Os módulos disponíveis variam conforme o perfil de acesso do usuário autenticado. As principais áreas acessíveis incluem:" },
        { type: "ul", items: [
          "Visão Geral: Dashboard com indicadores e gráficos consolidados.",
          "Demandas Ativas: Gestão completa do fluxo principal de contratações.",
          "Orçamento: Controle orçamentário por setor requisitante.",
          "Setores Demandantes: Visualização das demandas por área.",
          "Relatórios: Geração de relatórios e exportação de dados.",
          "Gerenciamento de Usuários: Administração de contas (apenas para administradores).",
        ] },
        { type: "h3", text: "5.3. Personalização da Experiência" },
        { type: "p", text: "O sistema memoriza as preferências do usuário, como o estado de expansão/colapso do menu lateral, proporcionando uma experiência personalizada a cada acesso. O tema visual (claro ou escuro) também pode ser alternado conforme a preferência do usuário." },
        { type: "tip", text: "Utilize o menu lateral para navegar entre os módulos de forma rápida. Os itens são organizados de acordo com a frequência de uso e importância operacional, facilitando o acesso às funcionalidades mais utilizadas." },
      ],
    },
    // 6. Visão Geral
    {
      id: "sec6",
      title: "6. Visão Geral — Dashboard",
      content: [
        { type: "h3", text: "6.1. Indicadores Principais (KPIs)" },
        { type: "p", text: "Quatro indicadores-chave no topo da página que representam o esforço do planejamento ATIVO (ignorando demandas suspensas):" },
        { type: "ul", items: [
          "Total de Demandas: Quantidade total de contratações ativas.",
          "Valor Estimado Total: Soma dos valores estimados (R$).",
          "Valor Executado Total: Soma dos empenhos realizados (R$). Inclui régua de evolução mostrando o percentual executado em relação ao valor estimado, com cor dinâmica (azul < 40%, ciano entre 40%–79%, verde >= 80%).",
          "Total Concluídas: Contratações com etapa \"Concluído\".",
        ] },
        { type: "note", text: "Passe o cursor sobre os cards de KPI para ver uma descrição contextual. Os cards que possuem régua de progresso exibem o percentual exato no tooltip." },
        { type: "h3", text: "6.2. Filtros Disponíveis" },
        { type: "p", text: "Oito filtros interativos que atualizam automaticamente todos os indicadores e gráficos:" },
        { type: "ul", items: [
          "Unidade Orçamentária (PGJ, FMMP, FEPDC)",
          "Setor Requisitante",
          "Tipo de Contratação",
          "Tipo de Recurso",
          "Classe",
          "Grau de Prioridade (Alta, Média, Baixa)",
          "Normativo (14.133/2021, 8.666/1993)",
          "Modalidade",
          "Status Atual (Não Iniciado, Iniciado, Em Diligência, Em Andamento, Concluído)",
        ] },
        { type: "h3", text: "6.3. Gráficos e Visualizações" },
        { type: "ul", items: [
          "Gráfico de Barras: Distribuição por Setor Requisitante (quantidade ou valor estimado).",
          "Pizza — UO: Proporção entre PGJ, FMMP e FEPDC.",
          "Pizza — Tipo: Nova Contratação, Renovação, Aditivo, etc.",
          "Pizza — Classe: Material de Consumo, Serviço, Serviço de TI, etc.",
        ] },
        { type: "tip", text: "Passe o cursor do mouse sobre os gráficos para ver os valores detalhados de cada segmento." },
      ],
    },
    // 7. Demandas Ativas
    {
      id: "sec7",
      title: "7. Demandas Ativas",
      content: [
        { type: "h3", text: "7.1. Listagem de Demandas Ativas" },
        { type: "p", text: "Tabela principal com todas as demandas integradas ativamente ao fluxo orçamentário: Código (PCA-XXXX-2026), Descrição, Setor, UO, Classe, Valor Total, Valor Contratado, Status, Prioridade e Ações. Demandas suspensas não aparecem aqui." },
        { type: "h3", text: "7.2. Busca e Filtros" },
        { type: "p", text: "Campo de busca textual em tempo real (debounce de 500ms) e os mesmos oitos filtros avançados da Visão Geral. Botão \"Limpar filtros\" para restaurar a visualização completa." },
        { type: "h3", text: "7.3. Edição da Demanda" },
        { type: "ol", items: [
          "Na coluna \"Ações\", clique no ícone de edição (lápis).",
          "Modal de edição com todos os campos preenchidos será exibido.",
          "Altere os campos desejados.",
          "Clique em \"Salvar\" para confirmar.",
        ] },
        { type: "note", text: "Toda edição é registrada automaticamente no histórico da contratação, incluindo dados anteriores, novos e o usuário responsável, garantindo a rastreabilidade total." },
        { type: "h3", text: "7.4. Histórico de Alterações" },
        { type: "p", text: "Clique no ícone de histórico (relógio) para ver todas as alterações: data, usuário, ação, dados anteriores e novos." },
        { type: "h3", text: "7.5. Exclusão de Demandas" },
        { type: "p", text: "Restrita ao perfil Administrador. Clique no ícone de lixeira e confirme a exclusão." },
        { type: "note", text: "A exclusão é irreversível. A demanda e todo o seu histórico serão removidos permanentemente. Use Suspensão como alternativa temporária." },
        { type: "h3", text: "7.6. Importação CSV" },
        { type: "p", text: "Importação em massa de demandas a partir de arquivos CSV para migração ou atualização em lote da planilha de planejamento." },
      ],
    },
    // 8. Demandas Suspensas
    {
      id: "sec8",
      title: "8. Demandas Suspensas",
      content: [
        { type: "p", text: "O módulo de 'Demandas Suspensas' isola todos os processos e planejamentos que foram interrompidos administrativa ou tecnicamente. Estas demandas não são computadas nos gráficos e métricas de execução orçamentária para não poluir o painel ativo." },
        { type: "h3", text: "8.1. KPIs Isolados" },
        { type: "ul", items: [
          "Valor Retido: Soma em R$ estacionada nos processos paralisados.",
          "Volume de Demandas: Número toral de demandas totalmente sobrestadas.",
          "Ocorrências Parciais (Filhas): Demandas criadas artificialmente após suspensão de itens individuais.",
        ] },
        { type: "h3", text: "8.2. Suspensão Parcial (Relação Pai e Filha)" },
        { type: "p", text: "Em casos onde apenas alguns itens do planejamento precisam ser suspensos, o sistema bifurca a demanda original (Pai): gera-se uma Demanda Filha com os quantitativos paralisados, mantendo o Pai circulando normalmente. O valor da Filha é descontado do limite planejado." },
        { type: "h3", text: "8.3. Reativação e Fusão Reversa" },
        { type: "ol", items: [
          "Localize a demanda suspensa e clique no botão de Reativar na coluna de ações.",
          "Fusão reversa (Demandas Filhas): O sistema excluirá a demanda filha e fará a devolução integral (soma) das quantidades e dos valores estimados de volta para a Demanda Origem, limpando o banco de lixo operacional.",
          "Retorno de Fluxo (Suspensão Total): A simples remoção da tag devolve o controle da demanda ao fluxo das 'Demandas Ativas'.",
        ] },
        { type: "note", text: "O modal de Reativação explica detalhadamente qual operação lógica (Suspensão Total ou Fusão Reversa) será acionada pelo mecanismo antes do procedimento final." },
      ],
    },
    // 9. Nova Demanda de Contratação
    {
      id: "sec9",
      title: "9. Nova Demanda de Contratação",
      content: [
        { type: "h3", text: "9.1. Informações Básicas (campos obrigatórios marcados com *)" },
        {
          type: "table",
          headers: ["Campo", "Obrigatório", "Descrição"],
          rows: FORM_FIELDS,
          headerAlign: ["left", "center", "left"],
        },
        { type: "h3", text: "9.2. Valores e Quantidades" },
        { type: "p", text: "Informe Quantidade, Unidade de Fornecimento, Tipo de Recurso e Valor Unitário. O Valor Estimado Total = Quantidade × Valor Unitário é calculado automaticamente." },
        { type: "h3", text: "9.3. Código PCA Automático" },
        { type: "p", text: "Ao salvar uma nova contratação, o sistema gera automaticamente um código único no formato PCA-XXXX-2026. Este código é o identificador oficial de cada demanda aprovada no Plano de Contratações Anual e possui papel fundamental no processo de aquisição." },
        { type: "p", text: "O código PCA é utilizado para especificar o alinhamento da contratação com o planejamento institucional na etapa de formalização da demanda, por meio do Documento de Formalização de Demanda (DFD)." },
        { type: "note", text: "O Documento de Formalização de Demanda (DFD) é o instrumento inicial previsto na Nova Lei de Licitações (Lei nº 14.133/2021) que formaliza a necessidade de compra ou contratação. O DFD garante que cada aquisição esteja devidamente alinhada com o Plano de Contratações Anual (PCA) e com os objetivos estratégicos da instituição, sendo obrigatório para o início de qualquer processo de contratação." },
        { type: "h3", text: "9.4. Validações e Trava Orçamentária" },
        { type: "ul", items: [
          "Todos os campos obrigatórios devem estar preenchidos.",
          "Descrição (10-500 caracteres) e Justificativa (20-1000 caracteres) respeitam limites.",
          "Valor total planejado deve ser maior que zero.",
          "Se a trava orçamentária estiver ativa, o sistema verifica se o valor total do setor não ultrapassa o limite alocado.",
        ] },
        { type: "h3", text: "9.5. Cálculo Automático da Data Prevista de Início" },
        { type: "p", text: "O campo Data Prevista para Início da Contratação é calculado automaticamente pelo sistema e permanece bloqueado para edição manual. O cálculo baseia-se no Tipo de Contratação, na Modalidade e na Data Prevista para Conclusão." },
        { type: "ul", items: [
          "Regra 1: Se for uma Nova Contratação nas modalidades Pregão Eletrônico, Concorrência ou Concurso, a data de início é definida como 150 dias antes da data de término.",
          "Regra 2: Se for uma Nova Contratação nas modalidades Dispensa ou Inexigibilidade, a data de início é definida como 90 dias antes da data de término.",
          "Regra 3: Para os demais tipos de contratação (Renovação, Aditivo, Repactuação, Apostilamento ou Indeterminado), a data de início é definida como 120 dias antes da data de término.",
        ] },
        { type: "note", text: "Este mecanismo garante um planejamento realista e padronizado, alertando os gestores sobre o momento ideal para iniciar cada processo administrativo." },
      ],
    },
    // 10. Setores Demandantes
    {
      id: "sec10",
      title: "10. Setores Demandantes",
      content: [
        { type: "p", text: "O módulo Setores Demandantes oferece uma visão consolidada e analítica de todas as demandas organizadas por setor requisitante. É uma ferramenta estratégica voltada para Administradores e Gestores, cobrindo os 13 setores cadastrados: CAA, CCF, CCS, CEAF, CLC, CONINT, CPPT, CRH, CTI, GAECO, GSI, PLANEJAMENTO e PROCON." },

        { type: "h3", text: "10.1. Indicadores (KPIs) com Régua de Evolução" },
        { type: "p", text: "Na parte superior da página são exibidos quatro indicadores consolidados que refletem o perfil financeiro ativo:" },
        { type: "ul", items: [
          "Quantidade de Demandas: Total de demandas cadastradas e validamente ativas.",
          "Valor Estimado: Soma dos valores originalmente planejados para as contratações do setor.",
          "Valor Executado: Soma dos empenhos realizados. Exibe uma régua de progresso discreta e o percentual executado em relação ao valor estimado.",
          "Saldo Orçamentário: Diferença entre o valor estimado e o valor executado. Exibe régua colorida (verde, âmbar, vermelho).",
        ] },
        { type: "tip", text: "Passe o cursor sobre os cards de Valor Executado e Saldo Orçamentário para visualizar o percentual exato em relação ao valor inicialmente planejado." },

        { type: "h3", text: "10.2. Filtros Disponíveis" },
        { type: "p", text: "A barra de filtros permite refinar a visualização de demandas por critérios combinados:" },
        { type: "ul", items: [
          "Setor: Botões de seleção rápida para cada um dos 13 setores.",
          "Tipo de Contratação: Nova Contratação, Renovação, Aditivo Quantitativo, Repactuação, Apostilamento e Indeterminado.",
          "Status: Não Iniciado, Iniciado, Em Diligência, Em Andamento e Concluído.",
        ] },

        { type: "h3", text: "10.3. Legenda Visual" },
        { type: "p", text: "Acima da tabela há uma legenda com a representação visual de todos os status e badges." },
        
        { type: "h3", text: "10.4. Tabela de Demandas — Colunas e Tooltip" },
        { type: "p", text: "Na tabela principal atente-se à coluna de Prazo. O sistema avisa o momento em que a demanda precisa ser iniciada usando badges verdes, amarelos ou alertando o vencimento em vermelho." },
      ],
    },
    // 11. Controle de Prazos
    {
      id: "sec11",
      title: "11. Controle de Prazos",
      content: [
        { type: "p", text: "O módulo Controle de Prazos é responsável pelo acompanhamento temporal de todas as contratações cadastradas no sistema. Seu objetivo principal é garantir que nenhuma demanda ultrapasse seus prazos sem que os responsáveis sejam alertados." },
        { type: "h3", text: "11.1. Datas Monitoradas" },
        { type: "p", text: "O sistema monitora quatro datas-chave de cada contratação:" },
        { type: "ul", items: [
          "Data Prevista de Contratação: Prazo estimado para a conclusão do processo.",
          "Data de Envio ao PGEA: Data de encaminhamento ao fluxo administrativo.",
          "Data de Finalização da Licitação: Data efetiva do certame.",
          "Data de Conclusão: Finalização com contrato assinado.",
        ] },
        { type: "h3", text: "11.2. Classificação de Status de Prazo" },
        { type: "p", text: "Cada contratação é classificada baseada no calendário atual:" },
        { type: "ul", items: [
          "Vencido: A data prevista já passou e a contratação não foi concluída.",
          "Próximo ao vencimento: Está dentro dos próximos 30 dias.",
          "No prazo: Mais de 30 dias de sobra.",
          "Concluído: Demanda finalizada.",
        ] },
        { type: "h3", text: "11.3. Edição de Datas" },
        { type: "p", text: "Administrador e Gestores podem editar dados in-line na tabela com datepicker, agilizando ajustes." },
      ],
    },
    // 12. Riscos e Pendências
    {
      id: "sec12",
      title: "12. Riscos e Pendências",
      content: [
        { type: "p", text: "O módulo Riscos e Pendências funciona como um painel de alerta inteligente do sistema, focando no que deu erro gerencial ou beira o colapso temporal de planejamento." },
        { type: "h3", text: "12.1. Critérios de Classificação" },
        { type: "p", text: "O sistema analisa permanentemente as datas contábeis de demandas ativas e as joga em dois agrupamentos primários:" },
        { type: "ul", items: [
          "Atrasados (Prazos Vencidos): Demandas cuja data-alvo prevista já falhou. Requerem verificação urgente.",
          "Atenção — Prazo nos Próximos 120 dias: Demandas de conclusão com prazo restrito. Exigem antecipação.",
        ] },
        { type: "h3", text: "12.2. Navegação por Abas" },
        { type: "p", text: "A interface do analista fica dividida em duas grandes abas tabulares (Atrasados e Atenção 120 dias) revelando o volume sumário das deficiências." },
      ],
    },
    // 13. Prioridades de Contratação
    {
      id: "sec13",
      title: "13. Prioridades de Contratação",
      content: [
        { type: "p", text: "O módulo Prioridades de Contratação organiza todas as demandas ativas cadastradas no modelo visual Kanban, arrastando o grau de importância analítica por colunas inteiras." },
        { type: "h3", text: "13.1. Níveis de Prioridade" },
        { type: "p", text: "O grau de priorização se reflete na categorização:" },
        { type: "ul", items: [
          "Alta: Demandas urgentes, imprescindíveis e vitais.",
          "Média: O core do planejamento anual. Relevância regular de reposição institucional.",
          "Baixa: Avanços contingenciáveis que aguardam brechas orçamentárias.",
        ] },
        { type: "h3", text: "13.2. Layout em Colunas (Kanban)" },
        { type: "p", text: "Os gestores do PCA podem reatribuir facilmente o peso individual arrastando status visualmente para rebalancear a ordem das execuções prioritárias do MPPI." },
      ],
    },
    // 14. Conformidade
    {
      id: "sec14",
      title: "14. Conformidade",
      content: [
        { type: "p", text: "O módulo Conformidade é encarregado de medir, auferir e provar a higidez do acervo da demanda de contratação e documentar a robustez burocrática face à legislação federal da Nova Lei de Licitações (14.133/21)." },
        { type: "h3", text: "14.1. Estrutura do Checklist: Duas Fases" },
        { type: "p", text: "Fase 1 — Licitação (7 Itens Fundamentais)" },
        { type: "ol", items: [
          "Termo de Referência aprovado.",
          "Pesquisa de Mercado anexada.",
          "Pareceres Jurídicos em boa lei expedidos.",
          "Publicação plena validada do edital.",
          "Atas das sessões ratificadas.",
          "Homologação superior exarada.",
          "Adjudicação do objeto consolidada.",
        ] },
        { type: "p", text: "Fase 2 — Contratação (4 Itens Terminais)" },
        { type: "ol", items: [
          "Deliberações finalísticas validadas.",
          "Habilitação e idoneidades apuradas.",
          "Assinatura física/digital confirmada.",
          "Extrato emitido no Diário Oficial Público.",
        ] },
        { type: "note", text: "Exceção: Nos planejamentos de Sistema de Registro de Preços (SRP), o sistema oculta a Fase 2, exigindo a completude apenas do módulo 1 para 100%." },
        { type: "h3", text: "14.2. Percentual de Conformidade" },
        { type: "p", text: "Ao clicar em auditar, um progresso percentual se desdobra em forma de badges de sinalização visual verde, amarela ou cinza conforme o andamento." },
      ],
    },
    // 15. Licitações SRP
    {
      id: "sec15",
      title: "15. Licitações SRP (Sistema de Registro de Preços)",
      content: [
        { type: "p", text: "A página Licitações SRP é um módulo especializado para o gerenciamento de demandas que utilizam o Sistema de Registro de Preços. Ela oferece uma interface otimizada para o fluxo específico de atas e registros de preços, permitindo um acompanhamento mais detalhado da fase de licitação até o registro da ata." },
        { type: "h3", text: "15.1. Diferenciais do Módulo SRP" },
        { type: "ul", items: [
          "Filtro Automático: Esta página exibe exclusivamente as demandas que foram marcadas com \"SRP: Sim\" no momento do cadastro.",
          "Status Automático: Diferente de outros módulos, o status da demanda em SRP é calculado automaticamente pelo sistema com base no preenchimento de campos técnicos específicos.",
          "Edição por Seções: O modal de edição é organizado em abas (Workflow, Fases Administrativas, Resultado e Especificações) para facilitar a inserção de dados.",
        ] },
        { type: "h3", text: "15.2. Progressão Automática de Status" },
        { type: "p", text: "O status da demanda evolui conforme os dados são inseridos no sistema:" },
        { type: "ul", items: [
          "Planejada: Status inicial ao cadastrar a demanda.",
          "Processo Administrativo Iniciado: Quando o campo \"Nº SEI de Contratação\" é preenchido.",
          "Fase Externa da Licitação: Quando os campos \"Nº SEI de Licitação\" e \"Nº do Edital\" são preenchidos.",
          "Licitação Concluída: Quando a \"Data Prevista para Contratação\" (que no SRP representa a data do certame) é preenchida.",
          "Ata Registrada: Quando o campo \"Nº do Contrato/Ata\" é preenchido.",
        ] },
        { type: "note", text: "Para que o status evolua corretamente, é fundamental manter os campos de controle administrativo atualizados." },
      ],
    },
    // 16. Resultados Alcançados
    {
      id: "sec16",
      title: "16. Resultados Alcançados",
      content: [
        { type: "p", text: "O módulo Resultados Alcançados centraliza os dashboards estritamente relativos ao volume final operado de sucesso. É desenhado para a comprovação da consecução dos certames da entidade." },
        { type: "h3", text: "16.1. Métricas da Colheita Contratual" },
        { type: "ul", items: [
          "Demandas Concluídas: Expressão bruta do volume contável operado.",
          "Valor Contratado Total Consolidado: Esforço real negociado consolidado em todos os fechamentos.",
          "Taxa de Conclusão: Variável balizadora perante todo o rol cadastrado.",
        ] },
        { type: "h3", text: "16.2. Estratificação e Inteligência" },
        { type: "p", text: "Gráficos de Pizza interativos particionam o bolo concluído entre as óticas cruciais: Unidades Orçamentárias pagadoras (quem financia), tipo da classe comercial, e o modelo contratual de execução." },
      ],
    },
    // 17. Relatórios
    {
      id: "sec17",
      title: "17. Relatórios",
      content: [
        { type: "p", text: "O módulo Relatórios é o motor nativo da plataforma responsável pelo processamento instantâneo de dados para extrações auditáveis sob forma de PDFs e relatórios formatados robustos." },
        { type: "h3", text: "17.1. Tipos Modelados Nativamente" },
        { type: "ul", items: [
          "Plano de Contratações Anual — PCA 2.0: Relatório padrão para visualização das exigências mínimas legais.",
          "Gerencial — Base de Dados Completa: Listagem transacional super-enriquecida consolidada para painéis financeiros avançados.",
          "Auditoria — Conformidade Licitatória: Onde se extrai a taxa de zelo de compliance da base documental.",
          "Riscos — Prazos Críticos e Alertas: Identificação taxativa de processos em risco temporal.",
          "Demandas Suspensas e Retidas: Arquivo focado em apontar rubricas orçamentárias congeladas.",
          "Orçamento — Extrato Consolidado Setorial: Saldo sumário macro onde a visão agrupa caixa previsto, caixa gasto e sobras.",
        ] },
        { type: "h3", text: "17.2. Fatiamento em Multiplas Dimensões" },
        { type: "p", text: "Um modal extenso provê 8 agrupamentos macro-lógicos para filtros massivos, com opções de download flexível tanto para leitura oficial (PDF) quanto banco de dados (CSV)." },
      ],
    },
    // 18. Orçamento
    {
      id: "sec18",
      title: "18. Orçamento",
      content: [
        { type: "p", text: "O módulo de Orçamento reflete a blindagem contábil parametrizada exclusivamente pela Administração (ASSESPPLAGES/CLC)." },
        { type: "h3", text: "18.1. Divisão e Tetos Financeiros" },
        { type: "p", text: "A Administração pode injetar massas financeiras nos centros de custo fatiadas em PGJ, FMMP e FEPDC. O Sincronizador Inteligente ('Preencher do Planejado') insere automaticamente baseando-se no preenchimento global das demandas." },
        { type: "h3", text: "18.2. Ativador da Trava de Sistema" },
        { type: "p", text: "A trava orçamentária é acionada setor a setor recusando excedentes nas tabelas de lançamento que extrapolem em centavos a baliza permitida." },
        { type: "h3", text: "18.3. Governança e Rastreabilidade" },
        { type: "p", text: "A listagem histórica (Histórico de Edições) gera a folha de auditoria sobre quem majorou/minorou cotas financeiras com temporalidade cravada no relógio gerencial." },
      ],
    },
    // 19. Gerenciamento de Usuários
    {
      id: "sec19",
      title: "19. Gerenciamento de Usuários",
      content: [
        { type: "p", text: "Módulo restrito destinado ao controle de credenciais da plataforma (Administrador)." },
        { type: "h3", text: "19.1. Admissão e Credenciamentos" },
        { type: "ol", items: [
          "Clique em \"Novo Usuário\".",
          "Forneça nome, cargo, e-mail padronizado @mppi, lotação oficial formatada.",
          "Acople o perfil que garantirá seu clearance matricial (Gestor, Consulta, etc).",
        ] },
        { type: "note", text: "A segurança impede envios automáticos de chave digital externa: notifique as credenciais internamente de forma manual." },
        { type: "h3", text: "19.2. Manutenção de Painel de Acesso" },
        { type: "p", text: "O painel busca livremente pelos filtros base, permitindo edição instantânea via lápis e revogação definitiva do login via exclusão lixeira vermelha em real-time." },
      ],
    },
    // 20. Notificações
    {
      id: "sec20",
      title: "20. Notificações",
      content: [
        { type: "p", text: "O módulo Central de Notificações é o broadcast interno de alcance global ou sectarizado manipulável só e somente pela Administração." },
        { type: "h3", text: "20.1. Gatilhos de Avisos Macro" },
        { type: "ol", items: [
          "Construir título breve. Digitar conteúdo sintético na caixa ampliada.",
          "Apontamento de Escopo: Disparar seletivamente a setores isolados ou rádio para Todos.",
        ] },
        { type: "h3", text: "20.2. UX / Interface" },
        { type: "p", text: "O pino do sino vermelho aparece no topo de menu. Marcando leitura interativa. O Administrador pode inativar um aviso retroativo antigo no backoffice limpo." },
      ],
    },
    // 21. Minha Conta
    {
      id: "sec21",
      title: "21. Minha Conta",
      content: [
        { type: "p", text: "A página Minha Conta permite que cada usuário gerencie sua sub-identidade civil sem fricção central das chefias de TI para pequenos reajustes funcionais." },
        { type: "h3", text: "21.1. Modificações Básicas" },
        { type: "ul", items: [
          "Ajustar Avatar funcional. Rebatizar extensões (Ramais). Modificar ortografia primária de seu nome exibido na UI.",
          "Travas automáticas garantem que não haja transferência isolada de nível departamental ou de email do governo, que exijam validação ADM cruzada.",
        ] },
      ],
    },
    // 22. FAQ / Dúvidas
    {
      id: "sec22",
      title: "22. FAQ / Dúvidas",
      content: [
        { type: "p", text: "Painel compilado de autoajuda formatado em acordeão expansível para consultas estáticas de fluxos usuais, desancorando dúvidas primárias." },
      ],
    },
    // 23. Glossário de Termos e Siglas
    {
      id: "sec23",
      title: "23. Glossário de Termos e Siglas",
      content: [
        { type: "h3", text: "23.1. Siglas" },
        {
          type: "table",
          headers: ["Sigla", "Significado"],
          rows: SIGLAS,
          columnWidths: [35, 135],
        },
        { type: "h3", text: "Setores Requisitantes" },
        {
          type: "table",
          headers: ["Sigla", "Setor"],
          rows: SETORES,
          columnWidths: [35, 135],
        },
        { type: "h3", text: "Termos Técnicos" },
        {
          type: "table",
          headers: ["Termo", "Definição"],
          rows: TERMOS,
          columnWidths: [35, 135],
        },
      ],
    },
  ];
}
