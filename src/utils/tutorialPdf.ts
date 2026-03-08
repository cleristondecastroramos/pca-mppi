import jsPDF from "jspdf";
import "jspdf-autotable";

// Sidebar red color from CSS: hsl(349, 67%, 55%) => #D9415D
const RED = [217, 65, 93] as const;
const GRAY_TEXT = [80, 80, 80] as const;
const BLACK = [0, 0, 0] as const;

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN_LEFT = 20;
const MARGIN_RIGHT = 20;
const CONTENT_W = PAGE_W - MARGIN_LEFT - MARGIN_RIGHT;
const HEADER_Y = 18;
const CONTENT_START_Y = 32;
const FOOTER_Y = PAGE_H - 15;
const MAX_Y = FOOTER_Y - 10;

function addHeaderFooter(doc: jsPDF, logoImg: HTMLImageElement | null, pageNum: number, totalPages: number) {
  // Header logo
  if (logoImg) {
    const logoH = 12;
    const logoW = (logoImg.width / logoImg.height) * logoH;
    doc.addImage(logoImg, "PNG", MARGIN_LEFT, 5, logoW, logoH);
  }
  // Header red line
  doc.setDrawColor(...RED);
  doc.setLineWidth(0.5);
  doc.line(MARGIN_LEFT, HEADER_Y + 4, PAGE_W - MARGIN_RIGHT, HEADER_Y + 4);

  // Footer red line
  doc.line(MARGIN_LEFT, FOOTER_Y - 3, PAGE_W - MARGIN_RIGHT, FOOTER_Y - 3);
  // Footer text
  doc.setFontSize(8);
  doc.setTextColor(...GRAY_TEXT);
  doc.text("PCA MPPI", MARGIN_LEFT, FOOTER_Y + 2);
  doc.text(`${pageNum} / ${totalPages}`, PAGE_W - MARGIN_RIGHT, FOOTER_Y + 2, { align: "right" });
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// Tutorial content sections
interface TutorialSection {
  title: string;
  paragraphs: string[];
}

function getTutorialSections(): TutorialSection[] {
  return [
    {
      title: "1. Introdução ao Sistema",
      paragraphs: [
        "1.1. O que é o PCA 2026?\nO PCA 2026 (Plano de Contratações Anual 2026) é o sistema oficial do Ministério Público do Estado do Piauí (MPPI) desenvolvido para gerenciar de forma centralizada, transparente e eficiente todas as contratações públicas planejadas para o exercício de 2026. Ele substitui o uso de planilhas avulsas e dashboards de Power BI por uma plataforma web integrada, com controle de acesso, rastreabilidade e automação de processos.",
        "1.2. Objetivo do Sistema\n• Centralização: Reunir em uma única plataforma todas as demandas de contratação dos diversos setores do MPPI.\n• Transparência: Oferecer visibilidade total sobre o andamento de cada contratação.\n• Controle orçamentário: Gerenciar limites orçamentários por setor e unidade orçamentária.\n• Rastreabilidade: Manter histórico completo de todas as alterações.\n• Conformidade: Acompanhar o cumprimento de requisitos documentais e legais.\n• Tomada de decisão: Fornecer dashboards, indicadores e relatórios.",
        "1.3. Público-alvo\n• Administradores do sistema (CLC e ASSESPPLAGES)\n• Gestores: Servidores responsáveis pelo acompanhamento e consolidação das contratações.\n• Setores Requisitantes: Servidores que cadastram e gerenciam suas próprias demandas.\n• Consulta: Servidores com acesso somente leitura.",
        "1.4. Requisitos de Acesso\n• Navegador web atualizado (Chrome, Firefox, Edge ou Safari).\n• Conexão com a internet.\n• Credenciais de acesso fornecidas pelo administrador.",
      ],
    },
    {
      title: "2. Acesso e Autenticação",
      paragraphs: [
        "2.1. Tela de Login\nPara acessar o sistema:\n1. Abra o navegador e acesse o endereço do sistema.\n2. Na tela de login, preencha o E-mail Institucional e a Senha.\n3. Clique no botão \"Entrar\".\n4. Se as credenciais estiverem corretas, você será redirecionado para a Página Inicial.",
        "2.2. Recuperação de Senha\n1. Na tela de login, clique em \"Esqueci minha senha\".\n2. Informe o e-mail institucional.\n3. Clique em \"Enviar link de redefinição\".\n4. Acesse seu e-mail e clique no link de redefinição.\n5. Defina sua nova senha.",
        "2.3. Redefinição de Senha\nApós clicar no link recebido por e-mail, informe a nova senha, confirme-a e clique em \"Redefinir Senha\". Utilize senhas fortes contendo letras maiúsculas, minúsculas, números e caracteres especiais.",
        "2.4. Logout (Sair do Sistema)\nNo menu lateral (sidebar), clique no botão \"Sair\" na parte inferior. Sempre efetue o logout ao finalizar suas atividades.",
      ],
    },
    {
      title: "3. Perfis de Acesso e Permissões",
      paragraphs: [
        "O sistema PCA 2026 implementa um rigoroso controle de acesso baseado em perfis de usuário.",
        "3.1. Perfil Administrador\nNível mais alto de acesso. Atribuições:\n• Gerenciamento completo de usuários e perfis de acesso.\n• Configurações globais, incluindo orçamento planejado e travas orçamentárias.\n• Aprovação final de planejamentos e validação de dados.\n• Visualização e edição de todas as contratações.\n• Exclusão de registros e gerenciamento de notificações.",
        "3.2. Perfil Gestor\n• Visualização de todas as contratações de todos os setores.\n• Edição técnica de contratações existentes.\n• Geração de relatórios gerenciais e dashboards.\n• Sem acesso a gerenciamento de usuários, orçamento planejado e notificações.",
        "3.3. Perfil Setor Requisitante\n• Cadastro de novas contratações no PCA.\n• Edição de contratações em rascunho do seu próprio setor.\n• Visualização apenas das demandas do seu setor.",
        "3.4. Perfil Consulta\n• Visualização somente leitura das contratações.\n• Acesso à Visão Geral, FAQ e Minha Conta.\n• Sem permissão para cadastrar, editar ou excluir qualquer registro.",
      ],
    },
    {
      title: "4. Navegação e Interface",
      paragraphs: [
        "4.1. Menu Lateral (Sidebar)\nO menu lateral é o principal elemento de navegação:\n• Retrátil: Pode ser expandido ou colapsado.\n• Adaptativo por perfil: Exibe apenas os módulos permitidos para o seu perfil.\n• Destaque visual: O módulo ativo é destacado com cor diferenciada.\n• Botão \"Sair\": Na parte inferior, permite encerrar a sessão.",
        "4.2. Cabeçalho (Header)\nExibe o nome do módulo atual, informações do usuário logado e alternância de tema.",
        "4.3. Tema Claro / Escuro\n• Tema Claro: Fundo branco com texto escuro.\n• Tema Escuro: Fundo escuro com texto claro.\nPara alternar, utilize o ícone de sol/lua no cabeçalho.",
        "4.4. Responsividade\nO sistema é responsivo e se adapta a desktop, tablet e mobile.",
      ],
    },
    {
      title: "5. Home — Página Inicial",
      paragraphs: [
        "A página Home é a tela de boas-vindas do sistema, exibida imediatamente após o login. Serve como ponto de partida para a navegação, apresentando o menu lateral com acesso a todos os módulos permitidos.",
      ],
    },
    {
      title: "6. Visão Geral — Dashboard",
      paragraphs: [
        "6.1. Indicadores Principais (KPIs)\nQuatro indicadores-chave no topo da página:\n• Total de Demandas\n• Valor Estimado Total\n• Valor Executado Total\n• Total Concluídas",
        "6.2. Filtros Disponíveis\nNove filtros interativos: Unidade Orçamentária, Setor Requisitante, Tipo de Contratação, Tipo de Recurso, Classe, Grau de Prioridade, Normativo, Modalidade e Status Atual.",
        "6.3. Gráficos e Visualizações\n• Gráfico de Barras: Distribuição por Setor Requisitante.\n• Pizza — UO: Proporção entre PGJ, FMMP e FEPDC.\n• Pizza — Tipo: Nova Contratação, Renovação, Aditivo, etc.\n• Pizza — Classe: Material de Consumo, Serviço, Serviço de TI, etc.",
      ],
    },
    {
      title: "7. Contratações",
      paragraphs: [
        "7.1. Listagem de Contratações\nTabela com todas as contratações: Código, Descrição, Setor, UO, Classe, Valor Estimado, Valor Contratado, Status, Prioridade e Ações.",
        "7.2. Busca e Filtros\nCampo de busca textual em tempo real (debounce de 500ms) e filtros avançados. Botão \"Limpar filtros\" para restaurar a visualização completa.",
        "7.3. Edição de Contratação\n1. Na coluna \"Ações\", clique no ícone de edição.\n2. Modal de edição com todos os campos preenchidos.\n3. Altere os campos desejados.\n4. Clique em \"Salvar\" para confirmar.\nToda edição é registrada automaticamente no histórico.",
        "7.4. Histórico de Alterações\nClique no ícone de histórico (relógio) para ver todas as alterações: data, usuário, ação, dados anteriores e novos.",
        "7.5. Exclusão de Contratações\nRestrita ao perfil Administrador. A exclusão é irreversível.",
        "7.6. Importação CSV\nImportação em massa de contratações a partir de arquivos CSV.",
      ],
    },
    {
      title: "8. Nova Contratação",
      paragraphs: [
        "8.1. Informações Básicas (campos obrigatórios marcados com *)\nDescrição do Objeto, PDM/CATSER, Classe, Setor Requisitante, Tipo de Contratação, SRP, Modalidade, Normativo, Grau de Prioridade, Unidade Orçamentária, Data Prevista e Justificativa.",
        "8.2. Valores e Quantidades\nInforme Quantidade, Unidade de Fornecimento, Tipo de Recurso e Valor Unitário. O Valor Estimado Total = Quantidade × Valor Unitário é calculado automaticamente.",
        "8.3. Código PCA Automático\nAo salvar, o sistema gera um código único no formato PCA-XXXX-2026.",
        "8.4. Validações e Trava Orçamentária\n• Todos os campos obrigatórios devem estar preenchidos.\n• Descrição (10-500 caracteres) e Justificativa (20-1000 caracteres) respeitam limites.\n• Valor estimado deve ser maior que zero.\n• Se a trava orçamentária estiver ativa, o sistema verifica o limite.",
      ],
    },
    {
      title: "9. Setores Demandantes",
      paragraphs: [
        "O módulo Setores Demandantes oferece uma visão consolidada e analítica de todas as contratações organizadas por setor requisitante. Disponível para Administradores e Gestores.",
        "9.1. Visão Geral e KPIs\nIndicadores consolidados que sintetizam o total de demandas cadastradas e o valor estimado acumulado.",
        "9.2. Filtro por Setor\nBotões de seleção rápida para filtrar por setor específico ou visualizar todos.",
        "9.3. Tabela de Demandas por Setor\nExibe: Código PCA, Descrição, Classe, Modalidade, Valor Estimado, Valor Contratado, Saldo Orçamentário, Empenhos e Etapa do Processo.",
        "9.4. Utilidade Estratégica\nEspecialmente útil para reuniões de planejamento e acompanhamento gerencial.",
      ],
    },
    {
      title: "10. Controle de Prazos",
      paragraphs: [
        "O módulo Controle de Prazos é responsável pelo acompanhamento temporal de todas as contratações cadastradas no sistema.",
        "10.1. Datas Monitoradas\n• Data Prevista de Contratação\n• Data de Envio ao PGEA\n• Data de Finalização da Licitação\n• Data de Conclusão",
        "10.2. Classificação de Status de Prazo\n• Vencido: A data prevista já passou.\n• Próximo ao vencimento: Dentro dos próximos 30 dias.\n• No prazo: A mais de 30 dias.\n• Concluído: Já finalizada.",
        "10.3. Filtros Disponíveis\n• Busca textual\n• Filtro por status de prazo\n• Filtro por mês",
        "10.4. Edição de Datas\nAdministradores e Gestores podem editar datas diretamente na tabela.",
        "10.5. Indicadores Resumidos\nKPIs exibem totais de contratações monitoradas, vencidas e próximas ao vencimento.",
      ],
    },
    {
      title: "11. Pontos de Atenção",
      paragraphs: [
        "O módulo Pontos de Atenção funciona como um painel de alerta inteligente do sistema.",
        "11.1. Critérios de Classificação\n• Atrasados (Prazos Vencidos): Contratações cuja data prevista já ultrapassou a data atual.\n• Atenção — Prazo nos Próximos 120 dias: Contratações com prazo dentro dos próximos 120 dias.",
        "11.2. Informações Exibidas\nCódigo PCA, Descrição, Setor Requisitante, Etapa do Processo, Data Prevista, Dias de atraso ou dias restantes.",
        "11.3. Navegação por Abas\nDuas abas: \"Atrasados\" e \"Atenção (120 dias)\".",
        "11.4. Finalidade Estratégica\nEssencial para a gestão proativa das contratações. Recomenda-se consulta diária.",
      ],
    },
    {
      title: "12. Prioridades de Contratação",
      paragraphs: [
        "O módulo Prioridades de Contratação organiza todas as demandas de acordo com seu grau de prioridade.",
        "12.1. Níveis de Prioridade\n• Alta: Contratações de caráter urgente ou imprescindível.\n• Média: Contratações importantes com certa flexibilidade no prazo.\n• Baixa: Contratações que podem ser postergadas sem impacto significativo.",
        "12.2. Layout em Colunas (Kanban)\nInterface em três colunas lado a lado, estilo kanban.",
        "12.3. Filtros\n• Busca textual\n• Filtro por status",
        "12.4. Status das Contratações\n• Não iniciado (badge azul)\n• Em andamento (badge amarelo)\n• Concluído (badge verde)\n• Sobrestado (badge cinza)",
        "12.5. Alteração de Prioridade\nAdministradores e Gestores podem alterar o grau de prioridade. Toda alteração é registrada no histórico.",
      ],
    },
    {
      title: "13. Avaliação e Conformidade",
      paragraphs: [
        "O módulo Avaliação e Conformidade verifica e registra o cumprimento dos requisitos documentais e legais de cada contratação. Disponível para Administradores e Gestores.",
        "13.1. Fase 1 — Fase de Licitação (7 itens)\n1. Termo de Referência aprovado\n2. Pesquisa de Mercado\n3. Pareceres Jurídicos\n4. Publicação de edital\n5. Atas do Certame\n6. Termo de Homologação\n7. Termo de Adjudicação",
        "13.2. Fase 2 — Fase de Contratação (4 itens)\n1. Atos de autorização registrados\n2. Documentação do fornecedor completa\n3. Assinatura do Contrato\n4. Publicação do Extrato do Contrato",
        "Regra SRP: Contratações via SRP exibem apenas a Fase de Licitação.",
        "13.3. Percentual de Conformidade\nCalculado automaticamente com base nos itens marcados.",
        "13.4. Filtros e Exportação\nFiltros por busca textual, setor e status. Exportação em CSV.",
      ],
    },
    {
      title: "14. Resultados Alcançados",
      paragraphs: [
        "O módulo Resultados Alcançados consolida e apresenta os resultados efetivos das contratações concluídas. Disponível para Administradores e Gestores.",
        "14.1. KPIs\n• Demandas Concluídas\n• Valor Contratado\n• Taxa de Conclusão",
        "14.2. Gráficos Analíticos\n• Distribuição por Unidade Orçamentária\n• Distribuição por Tipo de Contratação\n• Distribuição por Classe",
        "14.3. Tabela de Valor Contratado por Setor\nValor total contratado por cada setor requisitante.",
        "14.4. Finalidade Estratégica\nPrestação de contas, avaliação de desempenho, identificação de economias e subsídio a decisões orçamentárias.",
      ],
    },
    {
      title: "15. Relatórios",
      paragraphs: [
        "O módulo Relatórios permite gerar e exportar relatórios gerenciais. Disponível para Administradores e Gestores.",
        "15.1. Tipos de Relatório\n• Contratações — Detalhado\n• Contratações — Por Status\n• Contratações — Por Setor\n• Auditoria — Conformidade\n• Prazos — Críticos e Alertas",
        "15.2. Filtros Avançados\nUnidade Orçamentária, Setor Requisitante, Tipo de Contratação, Tipo de Recurso, Classe, Grau de Prioridade, Normativo, Modalidade e Etapa do Processo.",
        "15.3. Formatos de Exportação\n• PDF: Com cabeçalho institucional do MPPI.\n• CSV: Compatível com Excel e Google Sheets.",
        "15.4. Visualização Prévia\nO usuário pode visualizar o relatório diretamente na tela antes de exportar.",
      ],
    },
    {
      title: "16. Orçamento Planejado",
      paragraphs: [
        "Exclusivo do Administrador. Define limites orçamentários anuais para os 13 setores.",
        "16.1. Fontes de Recurso\n• PGJ: Orçamento principal do MPPI.\n• FMMP: Fundo de Modernização do Ministério Público.\n• FEPDC: Fundo Estadual de Proteção e Defesa do Consumidor.",
        "16.2. Trava Orçamentária\nQuando ativada, bloqueia novas contratações que ultrapassem o limite.",
        "16.3. Auditoria\nTodas as alterações são registradas com data, usuário, valores anteriores e novos.",
      ],
    },
    {
      title: "17. Gerenciamento de Usuários",
      paragraphs: [
        "Exclusivo do Administrador.",
        "17.1. Criar Usuário\n1. Clique em \"Novo Usuário\".\n2. Preencha: Nome, E-mail, Setor, Cargo, Perfil de Acesso e Senha Temporária.\n3. Clique em \"Criar\".\nImportante: O sistema NÃO envia e-mails automáticos. Comunique as credenciais diretamente.",
        "17.2. Editar e Excluir\nUse os ícones de lápis (editar) e lixeira (excluir) na tabela. A exclusão é permanente.",
        "17.3. Política de Acessos\nO botão \"Política de Acessos\" abre um modal com a descrição de cada perfil.",
      ],
    },
    {
      title: "18. Notificações",
      paragraphs: [
        "A Central de Notificações é o canal oficial de comunicação rápida do sistema. Criação exclusiva do Administrador; todos os perfis podem visualizar.",
        "18.1. Como Criar uma Notificação\n1. Acesse \"Notificações\" no menu lateral.\n2. Preencha Título Curto (máx. 50 caracteres) e Mensagem Direta (máx. 150 caracteres).\n3. Clique em \"Disparar para Usuários\".",
        "18.2. Como os Usuários Recebem\n• Indicador de não lida (ponto vermelho no sino).\n• Dropdown de notificações ao clicar.\n• Marcação automática como lida ao abrir.\n• Controle individual de leitura por usuário.",
        "18.3. Gerenciamento\nO Administrador pode excluir (inativar) notificações. A exclusão é lógica.",
        "18.4. Limitações\nO sistema é unidirecional. Notificações não são enviadas por e-mail.",
      ],
    },
    {
      title: "19. Minha Conta",
      paragraphs: [
        "Disponível para todos os perfis. Permite gerenciar informações pessoais dentro do sistema.",
        "Informações Editáveis:\n• Nome Completo: Utilizado em registros de auditoria e identificação.\n• Ramal: Número de telefone interno para contato entre setores.\n• Foto de Perfil (Avatar): Exibida no cabeçalho do sistema.",
        "Informações Somente Leitura:\n• E-mail, Setor e Cargo: Definidos pelo administrador. Alterações devem ser solicitadas ao administrador.",
        "Troca de Senha:\nO usuário pode alterar sua senha a qualquer momento. Recomenda-se troca periódica e uso de senhas fortes.",
        "Importante: Manter os dados atualizados é fundamental para a rastreabilidade e comunicação eficiente no sistema.",
      ],
    },
    {
      title: "20. FAQ / Dúvidas",
      paragraphs: [
        "Página com respostas às perguntas mais frequentes. Organizada em formato de acordeão (accordion) para rápida consulta.",
        "Abordagens comuns:\n• Como acessar o sistema pela primeira vez?\n• Esqueci minha senha, o que fazer?\n• Como cadastrar uma nova contratação?\n• Por que não consigo editar uma contratação?\n• O que é a trava orçamentária?",
      ],
    },
    {
      title: "21. Glossário de Termos e Siglas",
      paragraphs: [
        "Siglas:\n• PCA — Plano de Contratações Anual\n• MPPI — Ministério Público do Estado do Piauí\n• PGJ — Procuradoria-Geral de Justiça\n• FMMP — Fundo de Modernização do Ministério Público\n• FEPDC — Fundo Estadual de Proteção e Defesa do Consumidor\n• UO — Unidade Orçamentária\n• SRP — Sistema de Registro de Preços\n• SEI — Sistema Eletrônico de Informações\n• CLC — Coordenadoria de Licitações e Contratos",
        "Termos:\n• Contratação — Processo formal de aquisição de bens ou serviços.\n• Trava Orçamentária — Mecanismo que bloqueia novas contratações quando o limite é atingido.\n• Etapa do Processo — Fase atual (Planejamento, Em Licitação, Contratado, Concluído).\n• Sobrestamento — Paralisação temporária de um processo.\n• Devolução — Retorno do processo ao setor para correções.\n• Empenho — Ato administrativo que reserva recursos orçamentários.\n• Conformidade — Verificação de requisitos documentais e legais.\n• Valor Estimado — Valor previsto para a contratação.\n• Valor Contratado — Valor efetivamente acordado.\n• Código PCA — Identificador único no formato PCA-XXXX-2026.",
      ],
    },
  ];
}

export async function generateTutorialPdf() {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const logoImg = await loadImage("/logo-mppi.png");

  const sections = getTutorialSections();
  let currentPage = 1;

  // We'll first generate all pages, then go back to add headers/footers with total count
  // Pass 1: generate content
  const pageStarts: number[] = []; // page number where each section starts

  // Cover page
  if (logoImg) {
    const logoH = 30;
    const logoW = (logoImg.width / logoImg.height) * logoH;
    doc.addImage(logoImg, "PNG", (PAGE_W - logoW) / 2, 40, logoW, logoH);
  }

  doc.setDrawColor(...RED);
  doc.setLineWidth(0.8);
  doc.line(MARGIN_LEFT, 80, PAGE_W - MARGIN_RIGHT, 80);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...BLACK);
  doc.text("Tutorial Completo do Sistema", PAGE_W / 2, 95, { align: "center" });
  doc.text("PCA 2026", PAGE_W / 2, 107, { align: "center" });

  doc.setFontSize(12);
  doc.setTextColor(...GRAY_TEXT);
  doc.setFont("helvetica", "normal");
  doc.text("Sistema de Gerenciamento do Plano de Contratações Anual", PAGE_W / 2, 122, { align: "center" });
  doc.text("Ministério Público do Estado do Piauí", PAGE_W / 2, 130, { align: "center" });

  doc.setDrawColor(...RED);
  doc.setLineWidth(0.8);
  doc.line(MARGIN_LEFT, 140, PAGE_W - MARGIN_RIGHT, 140);

  currentPage = 1;

  // Content pages
  for (const section of sections) {
    doc.addPage();
    currentPage++;
    pageStarts.push(currentPage);

    let y = CONTENT_START_Y;

    // Section title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...RED);
    doc.text(section.title, MARGIN_LEFT, y);
    y += 3;

    // Red line under title
    doc.setDrawColor(...RED);
    doc.setLineWidth(0.3);
    doc.line(MARGIN_LEFT, y, PAGE_W - MARGIN_RIGHT, y);
    y += 8;

    // Paragraphs
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...BLACK);

    for (const para of section.paragraphs) {
      const lines = doc.splitTextToSize(para, CONTENT_W);

      for (const line of lines) {
        if (y > MAX_Y) {
          doc.addPage();
          currentPage++;
          y = CONTENT_START_Y;
        }
        doc.text(line, MARGIN_LEFT, y);
        y += 5;
      }
      y += 3; // space between paragraphs
    }
  }

  const totalPages = doc.getNumberOfPages();

  // Pass 2: add headers and footers to all pages
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    if (i === 1) {
      // Cover page - only footer
      doc.setDrawColor(...RED);
      doc.setLineWidth(0.5);
      doc.line(MARGIN_LEFT, FOOTER_Y - 3, PAGE_W - MARGIN_RIGHT, FOOTER_Y - 3);
      doc.setFontSize(8);
      doc.setTextColor(...GRAY_TEXT);
      doc.text("PCA MPPI", MARGIN_LEFT, FOOTER_Y + 2);
      doc.text(`${i} / ${totalPages}`, PAGE_W - MARGIN_RIGHT, FOOTER_Y + 2, { align: "right" });
    } else {
      addHeaderFooter(doc, logoImg, i, totalPages);
    }
  }

  doc.save("Tutorial_PCA_MPPI_2026.pdf");
}
