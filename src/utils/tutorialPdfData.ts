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
  | { type: "table"; headers: string[]; rows: string[][]; headerAlign?: string[] };

export const TOC = [
  "Introdução ao Sistema",
  "Acesso e Autenticação",
  "Perfis de Acesso e Permissões",
  "Navegação e Interface",
  "Home — Página Inicial",
  "Visão Geral — Dashboard",
  "Contratações",
  "Nova Contratação",
  "Setores Demandantes",
  "Controle de Prazos",
  "Pontos de Atenção",
  "Prioridades de Contratação",
  "Avaliação e Conformidade",
  "Resultados Alcançados",
  "Relatórios",
  "Orçamento Planejado",
  "Gerenciamento de Usuários",
  "Notificações",
  "Minha Conta",
  "FAQ / Dúvidas",
  "Glossário de Termos e Siglas",
];

const MATRIX: string[][] = [
  ["Home / Visão Geral", "Completo", "Completo", "Apenas seu setor", "Somente leitura"],
  ["Contratações", "CRUD completo", "Visualizar e editar", "Edita rascunhos", "Somente leitura"],
  ["Nova Contratação", "[V]", "[V]", "[V] (setor fixo)", "[X]"],
  ["Setores Demandantes", "[V]", "[V]", "[X]", "[X]"],
  ["Controle de Prazos", "[V]", "[V]", "Apenas seu setor", "[X]"],
  ["Pontos de Atenção", "[V]", "[V]", "Apenas seu setor", "[X]"],
  ["Prioridades", "[V]", "[V]", "Apenas seu setor", "[X]"],
  ["Conformidade", "Gerenciar", "Gerenciar", "[X]", "[X]"],
  ["Resultados", "[V]", "[V]", "[X]", "[X]"],
  ["Relatórios", "Gerar e exportar", "Gerar e exportar", "[X]", "[X]"],
  ["Orçamento Planejado", "Gerenciar completo", "[X]", "[X]", "[X]"],
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
  ["Modalidade", "Sim", "Pregão, Dispensa, Inexigibilidade, Concorrência"],
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
  ["Trava Orçamentária", "Mecanismo que bloqueia novas contratações quando o limite é atingido."],
  ["Etapa do Processo", "Fase atual (Planejamento, Em Licitação, Contratado, Concluído)."],
  ["Sobrestamento", "Paralisação temporária de um processo de contratação."],
  ["Devolução", "Retorno do processo ao setor para correções."],
  ["Empenho", "Ato administrativo que reserva recursos orçamentários."],
  ["Conformidade", "Verificação de requisitos documentais e legais."],
  ["Valor Estimado", "Valor previsto para a contratação, antes do certame."],
  ["Valor Contratado", "Valor efetivamente acordado no contrato."],
  ["Valor Executado", "Quantia exata de recursos orçamentários que foi empenhada para cobrir uma despesa específica."],
  ["Código PCA", "Identificador único no formato PCA-XXXX-2026."],
  ["Modalidade Licitatória", "Procedimento legal para seleção do fornecedor."],
  ["Normativo", "Lei de licitações que rege o processo."],
];

export function getTutorialSections(): PdfSection[] {
  return [
    // 1. Introdução
    {
      id: "sec1",
      title: "1. Introdução ao Sistema",
      content: [
        { type: "h3", text: "1.1. O que é o PCA 2026?" },
        { type: "p", text: "O PCA 2026 (Plano de Contratações Anual 2026) é o sistema oficial do Ministério Público do Estado do Piauí (MPPI) desenvolvido para gerenciar de forma centralizada, transparente e eficiente todas as contratações públicas planejadas para o exercício de 2026. Ele substitui o uso de planilhas avulsas e dashboards de Power BI por uma plataforma web integrada, com controle de acesso, rastreabilidade e automação de processos." },
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
          "Gestores: Servidores responsáveis pelo acompanhamento e consolidação das contratações de todos os setores.",
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
        { type: "p", text: "No menu lateral (sidebar), clique no botão \"Sair\" na parte inferior. Sua sessão será encerrada e você será redirecionado para a tela de login." },
        { type: "note", text: "Sempre efetue o logout ao finalizar suas atividades, especialmente em computadores compartilhados." },
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
          "Visualização e edição de todas as contratações de todos os setores.",
          "Exclusão de registros de contratações.",
          "Gerenciamento de notificações do sistema.",
        ] },
        { type: "h3", text: "3.2. Perfil Gestor" },
        { type: "ul", items: [
          "Visualização de todas as contratações de todos os setores.",
          "Edição técnica de contratações existentes.",
          "Geração de relatórios gerenciais e dashboards.",
          "Validação de demandas dos setores requisitantes.",
          "Sem acesso a gerenciamento de usuários, orçamento planejado e notificações.",
        ] },
        { type: "h3", text: "3.3. Perfil Setor Requisitante" },
        { type: "ul", items: [
          "Cadastro de novas contratações no PCA.",
          "Edição de contratações em rascunho do seu próprio setor.",
          "Visualização apenas das demandas do seu setor.",
          "Sem acesso a relatórios, conformidade, resultados, setores demandantes ou gerenciamento.",
        ] },
        { type: "note", text: "Ao cadastrar nova contratação, o campo \"Setor Requisitante\" é preenchido automaticamente com o setor do usuário logado." },
        { type: "h3", text: "3.4. Perfil Consulta" },
        { type: "ul", items: [
          "Visualização somente leitura das contratações.",
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
        { type: "p", text: "Exibe o nome do módulo atual, informações do usuário logado (nome, setor, avatar) e alternância de tema." },
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
        { type: "p", text: "A página Home é a tela de boas-vindas do sistema, exibida imediatamente após o login. Serve como ponto de partida para a navegação, apresentando o menu lateral com acesso a todos os módulos permitidos." },
      ],
    },
    // 6. Visão Geral
    {
      id: "sec6",
      title: "6. Visão Geral — Dashboard",
      content: [
        { type: "h3", text: "6.1. Indicadores Principais (KPIs)" },
        { type: "p", text: "Quatro indicadores-chave no topo da página:" },
        { type: "ul", items: [
          "Total de Demandas: Quantidade total de contratações cadastradas.",
          "Valor Estimado Total: Soma dos valores estimados (R$).",
          "Valor Executado Total: Soma dos empenhos realizados (R$).",
          "Total Concluídas: Contratações com etapa \"Concluído\".",
        ] },
        { type: "h3", text: "6.2. Filtros Disponíveis" },
        { type: "p", text: "Nove filtros interativos que atualizam automaticamente todos os indicadores e gráficos:" },
        { type: "ul", items: [
          "Unidade Orçamentária (PGJ, FMMP, FEPDC)",
          "Setor Requisitante",
          "Tipo de Contratação",
          "Tipo de Recurso",
          "Classe",
          "Grau de Prioridade (Alta, Média, Baixa)",
          "Normativo (14.133/2021, 8.666/1993)",
          "Modalidade",
          "Status Atual (Não Iniciado, Em Andamento, Concluído, Sobrestado)",
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
    // 7. Contratações
    {
      id: "sec7",
      title: "7. Contratações",
      content: [
        { type: "h3", text: "7.1. Listagem de Contratações" },
        { type: "p", text: "Tabela com todas as contratações: Código (PCA-XXXX-2026), Descrição, Setor, UO, Classe, Valor Estimado, Valor Contratado, Status, Prioridade e Ações." },
        { type: "h3", text: "7.2. Busca e Filtros" },
        { type: "p", text: "Campo de busca textual em tempo real (debounce de 500ms) e os mesmos filtros avançados da Visão Geral. Botão \"Limpar filtros\" para restaurar a visualização completa." },
        { type: "h3", text: "7.3. Edição de Contratação" },
        { type: "ol", items: [
          "Na coluna \"Ações\", clique no ícone de edição (lápis).",
          "Modal de edição com todos os campos preenchidos.",
          "Altere os campos desejados.",
          "Clique em \"Salvar\" para confirmar.",
        ] },
        { type: "note", text: "Toda edição é registrada automaticamente no histórico da contratação, incluindo dados anteriores, novos e o usuário responsável." },
        { type: "h3", text: "7.4. Histórico de Alterações" },
        { type: "p", text: "Clique no ícone de histórico (relógio) para ver todas as alterações: data, usuário, ação, dados anteriores e novos." },
        { type: "h3", text: "7.5. Exclusão de Contratações" },
        { type: "p", text: "Restrita ao perfil Administrador. Clique no ícone de lixeira e confirme a exclusão." },
        { type: "note", text: "A exclusão é irreversível. A contratação e todo o histórico serão removidos permanentemente." },
        { type: "h3", text: "7.6. Importação CSV" },
        { type: "p", text: "Importação em massa de contratações a partir de arquivos CSV para migração ou atualização em lote." },
      ],
    },
    // 8. Nova Contratação
    {
      id: "sec8",
      title: "8. Nova Contratação",
      content: [
        { type: "h3", text: "8.1. Informações Básicas (campos obrigatórios marcados com *)" },
        {
          type: "table",
          headers: ["Campo", "Obrigatório", "Descrição"],
          rows: FORM_FIELDS,
          headerAlign: ["left", "center", "left"],
        },
        { type: "h3", text: "8.2. Valores e Quantidades" },
        { type: "p", text: "Informe Quantidade, Unidade de Fornecimento, Tipo de Recurso e Valor Unitário. O Valor Estimado Total = Quantidade × Valor Unitário é calculado automaticamente." },
        { type: "h3", text: "8.3. Código PCA Automático" },
        { type: "p", text: "Ao salvar, o sistema gera um código único no formato PCA-XXXX-2026." },
        { type: "h3", text: "8.4. Validações e Trava Orçamentária" },
        { type: "ul", items: [
          "Todos os campos obrigatórios devem estar preenchidos.",
          "Descrição (10-500 caracteres) e Justificativa (20-1000 caracteres) respeitam limites.",
          "Valor estimado deve ser maior que zero.",
          "Se a trava orçamentária estiver ativa, o sistema verifica se o valor total do setor não ultrapassa o limite.",
        ] },
      ],
    },
    // 9. Setores Demandantes
    {
      id: "sec9",
      title: "9. Setores Demandantes",
      content: [
        { type: "p", text: "O módulo Setores Demandantes oferece uma visão consolidada e analítica de todas as contratações organizadas por setor requisitante. Trata-se de uma ferramenta estratégica voltada para Administradores e Gestores, que permite compreender o panorama geral das demandas de cada um dos 13 setores cadastrados no sistema: CAA, CCF, CCS, CEAF, CLC, CONINT, CPPT, CRH, CTI, GAECO, GSI, PLANEJAMENTO e PROCON." },
        { type: "h3", text: "9.1. Visão Geral e KPIs" },
        { type: "p", text: "Na parte superior da página são exibidos indicadores consolidados (KPIs) que sintetizam o total de demandas cadastradas e o valor estimado acumulado de todas as contratações. Esses indicadores são atualizados automaticamente conforme o setor selecionado, permitindo ao usuário visualizar rapidamente a dimensão e o impacto financeiro das demandas de cada área." },
        { type: "h3", text: "9.2. Filtro por Setor" },
        { type: "p", text: "Por meio de botões de seleção rápida, o usuário pode escolher um setor específico para visualizar apenas suas demandas, ou selecionar \"Todos\" para exibir a visão consolidada de todos os setores simultaneamente. Ao selecionar um setor, a tabela abaixo é filtrada automaticamente, exibindo somente as contratações pertencentes àquele setor." },
        { type: "h3", text: "9.3. Tabela de Demandas por Setor" },
        { type: "p", text: "A tabela principal exibe as seguintes informações de cada contratação: Código PCA (no formato PCA-XXXX-2026), Descrição resumida do objeto, Classe (Material ou Serviço), Modalidade de contratação, Valor Estimado, Valor Contratado, Saldo Orçamentário, Empenhos e Etapa do Processo. Todos os valores monetários são formatados no padrão brasileiro (R$)." },
        { type: "h3", text: "9.4. Utilidade Estratégica" },
        { type: "p", text: "Este módulo é especialmente útil para reuniões de planejamento e acompanhamento gerencial, pois permite identificar setores com maior volume de demandas, comparar valores estimados versus contratados, verificar saldos orçamentários remanescentes e acompanhar a evolução dos empenhos. Administradores podem utilizar essas informações para redistribuir recursos, ajustar prioridades e garantir o equilíbrio orçamentário entre os setores." },
      ],
    },
    // 10. Controle de Prazos
    {
      id: "sec10",
      title: "10. Controle de Prazos",
      content: [
        { type: "p", text: "O módulo Controle de Prazos é responsável pelo acompanhamento temporal de todas as contratações cadastradas no sistema. Seu objetivo principal é garantir que nenhuma demanda ultrapasse seus prazos sem que os responsáveis sejam alertados, contribuindo para o cumprimento do calendário do Plano de Contratações Anual. Disponível para Administradores, Gestores e Setores Requisitantes (neste caso, limitado às contratações do próprio setor)." },
        { type: "h3", text: "10.1. Datas Monitoradas" },
        { type: "p", text: "O sistema monitora quatro datas-chave de cada contratação, que representam os marcos temporais do ciclo de vida processual:" },
        { type: "ul", items: [
          "Data Prevista de Contratação: Prazo estimado para a conclusão do processo de contratação, definido no momento do cadastro da demanda.",
          "Data de Envio ao PGEA: Data em que a documentação foi encaminhada ao Plano de Gestão e Execução Administrativa.",
          "Data de Finalização da Licitação: Data em que o procedimento licitatório foi efetivamente concluído.",
          "Data de Conclusão: Data em que todo o processo de contratação foi finalizado, incluindo a assinatura do contrato e publicação.",
        ] },
        { type: "h3", text: "10.2. Classificação de Status de Prazo" },
        { type: "p", text: "Cada contratação é automaticamente classificada com base na data prevista de contratação em relação à data atual:" },
        { type: "ul", items: [
          "Vencido: A data prevista já passou e a contratação ainda não foi concluída. Exibido com badge vermelho e ícone de alerta.",
          "Próximo ao vencimento: A data prevista está dentro dos próximos 30 dias. Exibido com badge amarelo e ícone de relógio.",
          "No prazo: A data prevista ainda está a mais de 30 dias. Exibido com badge verde e ícone de confirmação.",
          "Concluído: A contratação já foi finalizada, independentemente do prazo original.",
        ] },
        { type: "h3", text: "10.3. Filtros Disponíveis" },
        { type: "p", text: "A página oferece múltiplos filtros para facilitar a localização e análise das contratações:" },
        { type: "ul", items: [
          "Busca textual: Pesquisa por descrição, setor requisitante ou código PCA.",
          "Filtro por status de prazo: Permite exibir apenas contratações vencidas, próximas ao vencimento, no prazo ou concluídas.",
          "Filtro por mês: Permite visualizar apenas contratações cuja data prevista está em um mês específico do ano.",
        ] },
        { type: "h3", text: "10.4. Edição de Datas" },
        { type: "p", text: "Usuários com perfil de Administrador ou Gestor podem editar as datas diretamente na tabela, clicando sobre a célula correspondente. Um calendário (datepicker) é exibido para seleção da nova data. Todas as alterações são salvas automaticamente no banco de dados e registradas no histórico de auditoria. O perfil Setor Requisitante possui acesso apenas para visualização, sem possibilidade de edição." },
        { type: "h3", text: "10.5. Indicadores Resumidos" },
        { type: "p", text: "Na parte superior da página, KPIs exibem o total de contratações monitoradas, a quantidade de contratações com prazo vencido e a quantidade com prazo próximo ao vencimento, proporcionando uma visão rápida da situação geral dos prazos." },
      ],
    },
    // 11. Pontos de Atenção
    {
      id: "sec11",
      title: "11. Pontos de Atenção",
      content: [
        { type: "p", text: "O módulo Pontos de Atenção (também chamado de Prioridades de Atenção) funciona como um painel de alerta inteligente do sistema, destacando automaticamente as contratações que exigem intervenção imediata ou acompanhamento prioritário. Disponível para Administradores, Gestores e Setores Requisitantes (limitado ao próprio setor)." },
        { type: "h3", text: "11.1. Critérios de Classificação" },
        { type: "p", text: "O sistema analisa automaticamente todas as contratações e as classifica em duas categorias principais de atenção:" },
        { type: "ul", items: [
          "Atrasados (Prazos Vencidos): Contratações cuja data prevista de contratação já ultrapassou a data atual e que ainda não foram concluídas nem sobrestadas. Representam situações críticas que demandam ação imediata por parte do setor responsável e da gestão.",
          "Atenção — Prazo nos Próximos 120 dias: Contratações cuja data prevista de contratação está dentro dos próximos 120 dias (aproximadamente 4 meses). Funcionam como um alerta preventivo, permitindo que os responsáveis se antecipem e garantam o andamento tempestivo do processo.",
        ] },
        { type: "h3", text: "11.2. Informações Exibidas" },
        { type: "p", text: "Para cada contratação destacada, o sistema exibe:" },
        { type: "ul", items: [
          "Código PCA: Identificador único no formato PCA-XXXX-2026.",
          "Descrição: Resumo do objeto da contratação.",
          "Setor Requisitante: Setor responsável pela demanda.",
          "Etapa do Processo: Fase atual da contratação (Planejamento, Em Licitação, Contratado, etc.).",
          "Data Prevista: Data originalmente planejada para conclusão da contratação.",
          "Dias de atraso ou dias restantes: Cálculo automático mostrando há quantos dias o prazo está vencido (para atrasados) ou quantos dias faltam para o vencimento (para os que exigem atenção).",
        ] },
        { type: "h3", text: "11.3. Navegação por Abas" },
        { type: "p", text: "A interface é organizada em duas abas (tabs): \"Atrasados\" e \"Atenção (120 dias)\". Cada aba apresenta uma tabela dedicada com suas respectivas contratações, KPIs de resumo (quantidade de itens na categoria) e badges coloridos para rápida identificação visual. A aba de atrasados é exibida por padrão ao acessar a página." },
        { type: "h3", text: "11.4. Finalidade Estratégica" },
        { type: "p", text: "Este módulo é essencial para a gestão proativa das contratações. Ao concentrar em uma única tela todas as situações que requerem atenção, ele permite que gestores identifiquem gargalos, cobrem providências dos setores responsáveis e tomem decisões tempestivas para evitar prejuízos ao planejamento anual. É recomendável que administradores e gestores consultem este módulo diariamente como parte de sua rotina de acompanhamento." },
      ],
    },
    // 12. Prioridades de Contratação
    {
      id: "sec12",
      title: "12. Prioridades de Contratação",
      content: [
        { type: "p", text: "O módulo Prioridades de Contratação organiza todas as demandas cadastradas no sistema de acordo com seu grau de prioridade, oferecendo uma visão estratégica que facilita a tomada de decisão sobre quais contratações devem receber atenção prioritária. Disponível para Administradores, Gestores e Setores Requisitantes (limitado ao próprio setor)." },
        { type: "h3", text: "12.1. Niveis de Prioridade" },
        { type: "p", text: "O sistema classifica cada contratacao em tres niveis de prioridade, cada um representado por uma coluna visual distinta:" },
        { type: "ul", items: [
          "Alta: Contratacoes de carater urgente ou imprescindivel para a continuidade dos servicos do MPPI. Sao demandas que, caso nao sejam realizadas no prazo, podem comprometer o funcionamento de setores essenciais, acarretar prejuizos financeiros ou descumprir obrigacoes legais. Identificadas com icone de alerta vermelho [ALTA].",
          "Media: Contratacoes importantes que possuem relevancia para a melhoria dos servicos ou a manutencao de atividades regulares, mas que admitem certa flexibilidade no prazo de execucao. Representam o nivel padrao atribuido a novas demandas quando nao ha indicacao especifica de urgencia. Identificadas com icone circular amarelo [MEDIA].",
          "Baixa: Contratacoes que, embora necessarias, podem ser postergadas sem impacto significativo nas operacoes do MPPI. Geralmente envolvem melhorias incrementais, aquisicoes de menor valor ou demandas que podem aguardar janelas orcamentarias mais favoraveis. Identificadas com icone de seta para baixo [BAIXA].",
        ] },
        { type: "h3", text: "12.2. Layout em Colunas (Kanban)" },
        { type: "p", text: "A interface apresenta as contratações em um layout de três colunas lado a lado, no estilo kanban, onde cada coluna corresponde a um nível de prioridade (Alta, Média, Baixa). Cada coluna exibe no topo o número de demandas e o valor estimado total daquela categoria. Dentro de cada coluna, cada contratação é apresentada como um card contendo: descrição do objeto, setor requisitante, status atual (não iniciado, em andamento, concluído ou sobrestado) e valor estimado." },
        { type: "h3", text: "12.3. Filtros" },
        { type: "p", text: "A página oferece dois filtros para refinamento da visualização:" },
        { type: "ul", items: [
          "Busca textual: Permite pesquisar por descrição ou setor requisitante, atualizando instantaneamente as três colunas conforme o termo digitado.",
          "Filtro por status: Permite exibir apenas contratações com determinado status (não iniciado, em andamento, concluído ou sobrestado), facilitando análises focadas em um estágio específico do processo.",
        ] },
        { type: "h3", text: "12.4. Status das Contratações" },
        { type: "p", text: "Cada contratação dentro dos cards de prioridade exibe seu status atual, determinado automaticamente pelo sistema:" },
        { type: "ul", items: [
          "Não iniciado: Contratação ainda na fase de planejamento, sem movimentação processual. Badge azul.",
          "Em andamento: Contratação em fase de licitação ou já contratada, com atividades em progresso. Badge amarelo.",
          "Concluído: Contratação finalizada com sucesso. Badge verde.",
          "Sobrestado: Contratação temporariamente suspensa por determinação administrativa ou técnica. Badge cinza.",
        ] },
        { type: "h3", text: "12.5. Alteração de Prioridade" },
        { type: "p", text: "Usuários com perfil de Administrador ou Gestor podem alterar o grau de prioridade de qualquer contratação diretamente pela página de detalhes ou pela lista de contratações. Toda alteração é registrada no histórico de auditoria do sistema, incluindo o valor anterior, o novo valor e a identificação do usuário que realizou a mudança. Setores Requisitantes visualizam as prioridades de suas demandas, mas não podem alterá-las." },
        { type: "h3", text: "12.6. Importância para a Gestão" },
        { type: "p", text: "A correta classificação das prioridades é fundamental para o sucesso do Plano de Contratações Anual. Ela permite que a equipe de gestão aloque recursos, organize cronogramas e direcione esforços para as demandas mais críticas. Recomenda-se que a revisão das prioridades seja realizada periodicamente, especialmente diante de mudanças orçamentárias, alterações legislativas ou surgimento de novas necessidades institucionais." },
      ],
    },
    // 13. Conformidade
    {
      id: "sec13",
      title: "13. Avaliação e Conformidade",
      content: [
        { type: "p", text: "O módulo Avaliação e Conformidade é responsável por verificar e registrar o cumprimento dos requisitos documentais e legais de cada processo de contratação. Ele funciona como um checklist estruturado que acompanha todas as etapas obrigatórias, garantindo que nenhum documento ou procedimento seja omitido ao longo do processo licitatório e contratual. Este módulo está disponível exclusivamente para usuários com perfil de Administrador e Gestor." },
        { type: "h3", text: "13.1. Estrutura do Checklist: Duas Fases" },
        { type: "p", text: "O checklist de conformidade é dividido em duas fases distintas, que refletem as etapas reais do processo de contratação pública conforme as normas vigentes (Leis nº 8.666/93 e nº 14.133/21):" },
        { type: "h3", text: "Fase 1 — Fase de Licitação" },
        { type: "p", text: "A primeira fase abrange todos os documentos e atos necessários para a realização do procedimento licitatório. É composta por 7 itens obrigatórios:" },
        { type: "ol", items: [
          "Termo de Referência aprovado: Documento que descreve detalhadamente o objeto da contratação, suas especificações técnicas, quantidades, prazos e condições de execução.",
          "Pesquisa de Mercado: Levantamento de preços praticados no mercado para o objeto da contratação.",
          "Pareceres Jurídicos emitidos sobre a licitação: Manifestação da assessoria jurídica atestando a legalidade e regularidade do procedimento licitatório.",
          "Publicação de edital conforme normas: Verificação de que o edital foi publicado nos veículos oficiais exigidos dentro dos prazos legais.",
          "Atas do Certame: Registro formal de todas as sessões do procedimento licitatório.",
          "Termo de Homologação: Ato da autoridade competente que confirma a regularidade de todo o procedimento licitatório.",
          "Termo de Adjudicação: Ato que atribui formalmente ao licitante vencedor o objeto da licitação.",
        ] },
        { type: "h3", text: "Fase 2 — Fase de Contratação" },
        { type: "p", text: "A segunda fase abrange os documentos e atos necessários para a formalização do contrato. É composta por 4 itens obrigatórios:" },
        { type: "ol", items: [
          "Atos de autorização registrados: Documentos que comprovam a autorização formal para a celebração do contrato.",
          "Documentação do fornecedor completa: Verificação de que toda a documentação de habilitação do fornecedor está válida.",
          "Assinatura do Contrato: Confirmação de que o instrumento contratual foi devidamente assinado por ambas as partes.",
          "Publicação do Extrato do Contrato: Verificação de que o extrato do contrato foi publicado no Diário Oficial.",
        ] },
        { type: "note", text: "Importante: Quando uma contratação é cadastrada como SRP (Sistema de Registro de Preços), o checklist exibe apenas a Fase de Licitação (7 itens). A Fase de Contratação não é aplicável neste caso, pois no regime de SRP o resultado da licitação gera uma Ata de Registro de Preços, e não um contrato imediato." },
        { type: "h3", text: "13.3. Percentual de Conformidade" },
        { type: "p", text: "Para cada contratação, o sistema calcula automaticamente um percentual de conformidade baseado na proporção de itens marcados como cumpridos em relação ao total aplicável. O percentual é exibido por meio de badges coloridos:" },
        { type: "ul", items: [
          "80% ou mais: Badge verde — conformidade alta.",
          "Entre 30% e 79%: Badge amarelo — conformidade parcial.",
          "Abaixo de 30%: Badge cinza — conformidade baixa.",
        ] },
        { type: "h3", text: "13.4. Como Auditar uma Contratação" },
        { type: "p", text: "Para realizar a avaliação de conformidade de uma contratação, siga os passos:" },
        { type: "ol", items: [
          "Na tabela principal, localize a contratação desejada utilizando os filtros de busca, setor ou status.",
          "Clique no botão \"Auditar\" na coluna de ações da contratação.",
          "Um modal (janela) será aberto exibindo o checklist dividido nas fases aplicáveis.",
          "Marque os checkboxes correspondentes aos documentos e atos já cumpridos.",
          "Utilize o campo de observação para registrar particularidades, pendências ou justificativas relevantes.",
          "Clique em \"Salvar\" para registrar a avaliação. O percentual será atualizado automaticamente.",
        ] },
        { type: "h3", text: "13.5. Filtros e Exportação" },
        { type: "p", text: "A página oferece filtros por busca textual (descrição ou código PCA), setor requisitante e status da contratação. Além disso, é possível exportar os dados filtrados em formato CSV para análise externa, clicando no botão \"Exportar CSV\" no canto superior direito." },
        { type: "h3", text: "13.6. Importância para o Processo" },
        { type: "p", text: "A avaliação de conformidade é fundamental para garantir que todos os processos de contratação do MPPI estejam em conformidade com a legislação vigente, reduzindo riscos de irregularidades, impugnações e questionamentos por parte dos órgãos de controle. Recomenda-se que a auditoria de conformidade seja realizada de forma contínua, à medida que os documentos de cada fase são produzidos e validados." },
      ],
    },
    // 14. Resultados Alcançados
    {
      id: "sec14",
      title: "14. Resultados Alcançados",
      content: [
        { type: "p", text: "O módulo Resultados Alcançados é o painel de desempenho do sistema PCA 2026, responsável por consolidar e apresentar de forma visual os resultados efetivos das contratações concluídas pelo MPPI. Disponível exclusivamente para Administradores e Gestores." },
        { type: "h3", text: "14.1. KPIs (Indicadores-Chave de Desempenho)" },
        { type: "p", text: "Na parte superior da página, três indicadores principais sintetizam o panorama das contratações concluídas:" },
        { type: "ul", items: [
          "Demandas Concluídas: Quantidade total de contratações que atingiram a etapa \"Concluído\".",
          "Valor Contratado: Soma dos valores efetivamente contratados em todas as demandas concluídas, formatado em reais (R$).",
          "Taxa de Conclusão: Percentual de demandas concluídas em relação ao total de demandas cadastradas no sistema.",
        ] },
        { type: "h3", text: "14.2. Gráficos Analíticos" },
        { type: "p", text: "O módulo apresenta três gráficos interativos que permitem análises sob diferentes perspectivas:" },
        { type: "ul", items: [
          "Distribuição por Unidade Orçamentária (UO): Gráfico de pizza que mostra como as contratações concluídas estão distribuídas entre PGJ, FMMP e FEPDC.",
          "Distribuição por Tipo de Contratação: Gráfico de pizza que categoriza as contratações concluídas por tipo.",
          "Distribuição por Classe: Gráfico de pizza que segmenta as contratações entre Material e Serviço.",
        ] },
        { type: "h3", text: "14.3. Tabela de Valor Contratado por Setor" },
        { type: "p", text: "Na parte inferior da página, uma tabela detalhada apresenta o valor total contratado por cada setor requisitante. Esta informação é essencial para avaliar quais setores estão mais avançados na execução de suas demandas." },
        { type: "h3", text: "14.4. Finalidade Estratégica" },
        { type: "p", text: "O módulo Resultados Alcançados desempenha um papel central na prestação de contas e na avaliação de desempenho institucional. Seus dados permitem que a alta gestão do MPPI:" },
        { type: "ul", items: [
          "Avalie a efetividade do planejamento: Comparar a taxa de conclusão com o total planejado.",
          "Identifique economias: Comparação entre valores estimados e contratados.",
          "Subsidie decisões orçamentárias futuras: Padrões de execução alimentam o planejamento do próximo exercício.",
          "Produza relatórios de gestão: Gráficos e indicadores para apresentações institucionais.",
        ] },
      ],
    },
    // 15. Relatórios
    {
      id: "sec15",
      title: "15. Relatórios",
      content: [
        { type: "p", text: "O módulo Relatórios é a ferramenta de geração e exportação de relatórios gerenciais do sistema PCA 2026. Ele permite que Administradores e Gestores produzam documentos estruturados a partir dos dados das contratações." },
        { type: "h3", text: "15.1. Tipos de Relatório Disponíveis" },
        { type: "p", text: "O sistema oferece cinco tipos de relatório:" },
        { type: "ul", items: [
          "Contratações — Detalhado: Listagem completa de todas as contratações com código PCA, descrição, setor, UO, prioridade, valores e data prevista.",
          "Contratações — Por Status: Agrupa as contratações por status atual, incluindo situação do prazo.",
          "Contratações — Por Setor: Organizado por setor requisitante. Útil para reuniões setoriais.",
          "Auditoria — Conformidade: Percentual de conformidade documental de cada contratação.",
          "Prazos — Críticos e Alertas: Focado em contratações com prazos vencidos ou próximos ao vencimento.",
        ] },
        { type: "h3", text: "15.2. Filtros Avançados" },
        { type: "p", text: "Todos os relatórios podem ser refinados por meio de um painel completo de filtros:" },
        { type: "ul", items: [
          "Unidade Orçamentária: PGJ, FMMP, FEPDC ou todas.",
          "Setor Requisitante: Qualquer um dos 13 setores cadastrados.",
          "Tipo de Contratação: Aquisição, Serviço Continuado, Obra, etc.",
          "Tipo de Recurso: Filtragem por fonte de financiamento.",
          "Classe: Material ou Serviço.",
          "Grau de Prioridade: Alta, Média ou Baixa.",
          "Normativo: Lei 8.666/1993 ou Lei 14.133/2021.",
          "Modalidade: Pregão, Concorrência, Dispensa, etc.",
          "Etapa do Processo: Não iniciado, em andamento, concluído ou sobrestado.",
        ] },
        { type: "h3", text: "15.3. Formatos de Exportação" },
        { type: "p", text: "Cada relatório pode ser exportado em dois formatos:" },
        { type: "ul", items: [
          "PDF: Documento formatado para impressão e compartilhamento, com cabeçalho institucional do MPPI.",
          "CSV: Arquivo compatível com Microsoft Excel, Google Sheets e outros softwares de planilha.",
        ] },
        { type: "h3", text: "15.4. Visualização Prévia" },
        { type: "p", text: "Antes de exportar, o usuário pode visualizar o relatório diretamente na tela do sistema, permitindo verificar se os filtros aplicados estão corretos." },
        { type: "h3", text: "15.5. Finalidade Estratégica" },
        { type: "p", text: "O módulo de Relatórios é a principal ferramenta de comunicação institucional e prestação de contas do sistema PCA 2026." },
        { type: "ul", items: [
          "Prestação de contas aos órgãos de controle.",
          "Suporte a decisões da alta gestão.",
          "Reuniões de acompanhamento.",
          "Análises avançadas com exportação CSV.",
          "Transparência e publicidade.",
        ] },
      ],
    },
    // 16. Orçamento
    {
      id: "sec16",
      title: "16. Orçamento Planejado",
      content: [
        { type: "p", text: "Exclusivo do Administrador. Define limites orçamentários anuais para os 13 setores." },
        { type: "h3", text: "16.1. Fontes de Recurso" },
        { type: "ul", items: [
          "PGJ: Orçamento principal do MPPI.",
          "FMMP: Fundo de Modernização do Ministério Público.",
          "FEPDC: Fundo Estadual de Proteção e Defesa do Consumidor.",
        ] },
        { type: "h3", text: "16.2. Trava Orçamentária" },
        { type: "p", text: "Quando ativada, bloqueia novas contratações que ultrapassem o limite. O interruptor (switch) permite ativar/desativar por setor." },
        { type: "h3", text: "16.3. Auditoria" },
        { type: "p", text: "Todas as alterações são registradas com data, usuário, valores anteriores e novos. Acessível pelo botão \"Histórico\"." },
      ],
    },
    // 17. Gerenciamento
    {
      id: "sec17",
      title: "17. Gerenciamento de Usuários",
      content: [
        { type: "p", text: "Exclusivo do Administrador." },
        { type: "h3", text: "17.1. Criar Usuário" },
        { type: "ol", items: [
          "Clique em \"Novo Usuário\".",
          "Preencha: Nome, E-mail, Setor, Cargo, Perfil de Acesso e Senha Temporária.",
          "Clique em \"Criar\".",
        ] },
        { type: "note", text: "O sistema NÃO envia e-mails automáticos. Comunique as credenciais diretamente ao novo servidor." },
        { type: "h3", text: "17.2. Editar e Excluir" },
        { type: "p", text: "Use os ícones de lápis (editar) e lixeira (excluir) na tabela. A exclusão é permanente e irreversível." },
        { type: "h3", text: "17.3. Política de Acessos" },
        { type: "p", text: "O botão \"Política de Acessos\" abre um modal com a descrição de cada perfil e a Matriz de Acesso completa." },
      ],
    },
    // 18. Notificações
    {
      id: "sec18",
      title: "18. Notificações",
      content: [
        { type: "p", text: "O módulo Central de Notificações é o canal oficial de comunicação rápida do sistema PCA 2026, permitindo que a administração envie alertas, avisos e mensagens importantes a todos os usuários da plataforma de forma instantânea. A criação e o gerenciamento de notificações são exclusivos do perfil Administrador, enquanto todos os demais perfis (Gestor, Setor Requisitante e Consulta) podem visualizar as notificações recebidas." },
        { type: "h3", text: "18.1. Como Criar uma Notificação" },
        { type: "p", text: "Para criar e disparar uma nova notificação, o Administrador deve acessar a página \"Notificações\" no menu lateral e preencher o formulário:" },
        { type: "ol", items: [
          "Título Curto (máx. 50 caracteres): Um resumo objetivo do assunto da notificação.",
          "Mensagem Direta (máx. 150 caracteres): O conteúdo da notificação, que deve ser claro e direto.",
          "Clique em \"Disparar para Usuários\" para enviar a notificação imediatamente.",
        ] },
        { type: "note", text: "As notificações são enviadas instantaneamente e ficam visíveis para todos os usuários do sistema. Certifique-se de que o conteúdo está correto antes de disparar." },
        { type: "h3", text: "18.2. Como os Usuarios Recebem as Notificacoes" },
        { type: "p", text: "Todas as notificacoes ativas sao exibidas no icone de sino [SINO] localizado no canto superior direito do cabecalho do sistema:" },
        { type: "ul", items: [
          "Indicador de nao lida: Um ponto vermelho aparece sobre o icone do sino quando ha mensagens pendentes.",
          "Dropdown de notificacoes: Ao clicar no sino, um menu suspenso exibe a lista de notificacoes ativas.",
          "Marcacao automatica como lida: Ao abrir o dropdown, todas as notificacoes sao marcadas como lidas.",
          "Controle individual de leitura: Cada usuario possui seu proprio registro de leitura.",
        ] },
        { type: "h3", text: "18.3. Gerenciamento de Notificacoes" },
        { type: "p", text: "Na pagina de Notificacoes, o Administrador visualiza o Historico de Notificacoes Ativas em uma tabela. As seguintes acoes estao disponiveis:" },
        { type: "ul", items: [
          "Excluir (inativar): O Administrador pode remover uma notificacao clicando no icone de lixeira [LIXEIRA]. A exclusao e logica - a notificacao e marcada como inativa.",
        ] },
        { type: "h3", text: "18.4. Casos de Uso Recomendados" },
        { type: "p", text: "A Central de Notificações é ideal para comunicar:" },
        { type: "ul", items: [
          "Prorrogações ou alterações de prazos do PCA.",
          "Publicação de novos normativos ou orientações.",
          "Avisos sobre manutenções programadas no sistema.",
          "Comunicados institucionais da ASSESPPLAGES.",
          "Alertas sobre mudanças orçamentárias ou bloqueios de trava.",
          "Lembretes sobre datas-limite para envio de documentação.",
        ] },
        { type: "h3", text: "18.5. Limitações" },
        { type: "p", text: "O sistema de notificações é unidirecional: apenas o Administrador pode criar e enviar mensagens. Não há funcionalidade de resposta ou interação por parte dos demais usuários. As notificações também não são enviadas por e-mail — são exibidas exclusivamente dentro do sistema PCA 2026." },
      ],
    },
    // 19. Minha Conta
    {
      id: "sec19",
      title: "19. Minha Conta",
      content: [
        { type: "p", text: "A página Minha Conta está disponível para todos os perfis de acesso e permite que cada usuário gerencie suas informações pessoais dentro do sistema. Manter esses dados atualizados é fundamental para garantir a correta identificação do responsável em cada ação registrada, facilitar a comunicação entre os setores e assegurar a rastreabilidade das operações realizadas." },
        { type: "h3", text: "Informações Editáveis" },
        { type: "ul", items: [
          "Nome completo: Utilizado na identificação do usuário em históricos, relatórios e registros de auditoria. É essencial que esteja correto e atualizado.",
          "Ramal: Facilita o contato direto entre setores para esclarecimentos sobre demandas e processos.",
          "Avatar: O usuário pode personalizar sua foto de perfil escolhendo entre uma galeria pré-definida de imagens ou fazendo upload de uma foto pessoal.",
        ] },
        { type: "h3", text: "Informações Somente Leitura" },
        { type: "p", text: "Os campos e-mail, setor e cargo são exibidos apenas para consulta e não podem ser alterados pelo próprio usuário. Caso haja necessidade de correção nesses dados, o usuário deve solicitar a atualização a um administrador do sistema." },
        { type: "h3", text: "Alteração de Senha" },
        { type: "p", text: "A página também oferece a funcionalidade de troca de senha, permitindo que o usuário atualize sua credencial de acesso a qualquer momento. Recomenda-se alterar a senha periodicamente para manter a segurança da conta, especialmente após o primeiro acesso ao sistema." },
      ],
    },
    // 20. FAQ
    {
      id: "sec20",
      title: "20. FAQ / Dúvidas",
      content: [
        { type: "p", text: "A seção de FAQ (Perguntas Frequentes) reúne as dúvidas mais comuns sobre o funcionamento do sistema em formato de acordeão expansível, permitindo consulta rápida e objetiva." },
        { type: "h3", text: "Conteúdo da Seção" },
        { type: "ul", items: [
          "Respostas para dúvidas operacionais sobre cadastro, edição e exclusão de demandas.",
          "Orientações sobre funcionalidades específicas como filtros, relatórios e orçamento.",
          "Esclarecimentos sobre perfis de acesso e permissões do sistema.",
        ] },
        { type: "h3", text: "Canais de Suporte" },
        { type: "p", text: "Ao final da página, o sistema disponibiliza os canais oficiais de suporte para questões que não estejam contempladas nas perguntas frequentes:" },
        { type: "ul", items: [
          "CLC (Coordenadoria de Licitações e Contratos): canal de suporte para dúvidas relacionadas aos processos licitatórios, etapas do certame, documentação e conformidade.",
          "ASSESPPLAGES (Assessoria de Planejamento e Gestão): canal de suporte para questões de planejamento, orçamento, priorização de demandas e funcionamento geral do sistema PCA.",
        ] },
        { type: "p", text: "Os contatos incluem e-mail e ramal telefônico de cada setor, facilitando o acesso direto à equipe responsável conforme a natureza da dúvida." },
      ],
    },
    // 21. Glossário
    {
      id: "sec21",
      title: "21. Glossário de Termos e Siglas",
      content: [
        { type: "h3", text: "Siglas" },
        {
          type: "table",
          headers: ["Sigla", "Significado"],
          rows: SIGLAS,
        },
        { type: "h3", text: "Setores Requisitantes" },
        {
          type: "table",
          headers: ["Sigla", "Setor"],
          rows: SETORES,
        },
        { type: "h3", text: "Termos Técnicos" },
        {
          type: "table",
          headers: ["Termo", "Definição"],
          rows: TERMOS,
        },
      ],
    },
  ];
}
