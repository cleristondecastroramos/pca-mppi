import { type PdfSection } from "./tutorialPdfData";

export const TOC2027 = [
  "Apresentação do Sistema",
  "Acesso ao Sistema",
  "Visão Geral da Navegação",
  "Cadastro de Nova Demanda",
  "Uso do Catálogo Interno",
  "Envio e Acompanhamento da Demanda",
  "Feedback da Análise",
  "Relatórios e Exportação PDF",
  "Aprovação Administrativa",
  "Dúvidas Frequentes e Boas Práticas",
];

export const getTutorialSections2027 = (): PdfSection[] => [
  {
    id: "apresentacao",
    title: "1. Apresentação do Sistema",
    content: [
      {
        type: "p",
        text: "O Plano de Contratações Anual (PCA) 2027 é a ferramenta oficial do Ministério Público do Estado do Piauí (MPPI) para consolidar todas as necessidades de aquisição de bens e serviços. A principal inovação do PCA 2027 é a padronização das contratações por meio da obrigatoriedade do uso do catálogo federal (CATMAT e CATSER).",
      },
      {
        type: "p",
        text: "Este tutorial foi elaborado especialmente para servir de guia definitivo para as Unidades Requisitantes. Seu objetivo é conduzir você desde o primeiro acesso até o momento em que sua unidade cadastra, acompanha e compreende as aprovações de suas demandas de contratação para 2027.",
      },
      {
        type: "note",
        text: "Lembre-se: O papel das unidades requisitantes é planejar e inserir as demandas. O papel da equipe administradora (gestores de licitação) é consolidar e aprovar tecnicamente essas demandas.",
      },
    ],
  },
  {
    id: "acesso",
    title: "2. Acesso ao Sistema",
    content: [
      {
        type: "p",
        text: "Para entrar no sistema, você deverá utilizar as credenciais (e-mail institucional e senha provisória) fornecidas pela administração.",
      },
      {
        type: "ul",
        items: [
          "Autenticação: Acesse o link oficial do PCA e insira suas credenciais.",
          "Troca de Senha: No primeiro acesso, o sistema exigirá que a senha provisória seja substituída por uma senha pessoal segura. A navegação será bloqueada até que isso seja feito.",
          "Navegação: Após realizar o login e configurar sua senha, você será direcionado à Home (Página Inicial). Para acessar a área de demandas do próximo ano, localize e clique em \"Painel Planejamento\" no menu lateral esquerdo.",
        ],
      },
    ],
  },
  {
    id: "visao_geral",
    title: "3. Visão Geral da Navegação",
    content: [
      {
        type: "p",
        text: "O menu lateral do sistema agrupa todas as rotas de interesse. Entender as diferenças de visão entre perfis é essencial:",
      },
      {
        type: "ul",
        items: [
          "Perfil Demandante: Visualiza, edita e exclui apenas as demandas enviadas por sua própria unidade. Não consegue ver as necessidades de outros setores.",
          "Perfil Administrador: Tem acesso total ao sistema. Consegue enxergar todas as demandas de todas as unidades, além de possuir permissão exclusiva para Aprovar, Aprovar Parcialmente ou Não Aprovar itens.",
        ],
      },
      {
        type: "p",
        text: "Na página principal de \"Planejamento PCA 2027\", você verá no topo painéis com os valores totais, além de botões rápidos para Recarregar a página e Apresentar Nova Demanda.",
      },
    ],
  },
  {
    id: "cadastro",
    title: "4. Cadastro de Nova Demanda",
    content: [
      {
        type: "p",
        text: "Cadastrar uma demanda significa formalizar a necessidade de aquisição. O formulário foi otimizado para evitar erros.",
      },
      {
        type: "ol",
        items: [
          "Acesse: Clique em \"Nova Demanda\" no menu ou no botão azul da página de Planejamento.",
          "Unidade: Caso seu perfil esteja associado a uma unidade específica, o campo será preenchido e bloqueado automaticamente. Caso contrário, selecione a unidade desejada.",
          "Catálogo (O Primeiro Passo): A busca pelo objeto a ser contratado no campo de pesquisa do catálogo interno é o primeiro passo para encontrar o item correto. Falaremos detalhadamente sobre isso na próxima seção.",
          "Justificativa (Atenção Especial): A justificativa é um campo extremamente importante para a análise administrativa. Explique de forma clara o motivo da contratação. Por que o MPPI precisa desse item ou serviço? Detalhe especificidades que o catálogo federal não cobre, pois isso embasará a decisão técnica.",
          "Quantidades e Valores: Preencha a Quantidade necessária, a Unidade de Medida (ex: Pacotes, Caixas, Meses) e faça uma estimativa do Valor Unitário. O valor total é calculado automaticamente com base na quantidade e no valor unitário.",
          "Prioridade: Informe a prioridade (Alta, Média ou Baixa) para fins estratégicos.",
          "Salvar: Revise todos os campos e clique em \"Cadastrar Demanda\".",
        ],
      },
    ],
  },
  {
    id: "catalogo",
    title: "5. Uso do Catálogo Interno",
    content: [
      {
        type: "p",
        text: "A escolha do item correto é o passo mais importante. O sistema bloqueia a digitação de textos livres para evitar que um mesmo produto seja solicitado com dezenas de nomes diferentes.",
      },
      {
        type: "ul",
        items: [
          "Pesquisa: Você pode filtrar primeiramente entre as bases de Materiais (CATMAT) e Serviços (CATSER).",
          "Grupo e Categoria: Utilize os menus suspensos para afunilar sua busca a um grupo específico (Ex: Informática, Copa e Cozinha). Lembre-se: o grupo filtrado pode reduzir bastante o número de resultados indesejados e facilitar a localização do seu item.",
          "Dica Prática: Evite palavras muito restritivas. Se precisa de uma cadeira giratória preta ergonômica, pesquise apenas por \"Cadeira Ergonômica\" e depois detalhe a especificidade na sua Justificativa.",
        ],
      },
      {
        type: "tip",
        text: "Selecione a opção que melhor descreva a classe geral do seu pedido e deixe as minúcias para o campo 'Justificativa'. Assim você evita retrabalho caso a administração decida consolidar itens de mesma natureza em um lote de compras.",
      },
    ],
  },
  {
    id: "envio",
    title: "6. Envio e Acompanhamento da Demanda",
    content: [
      {
        type: "p",
        text: "Após enviar a demanda, ela será encaminhada diretamente para a fila da área administrativa.",
      },
      {
        type: "p",
        text: "Na página de Planejamento, uma tabela exibirá todas as suas solicitações. Depois do envio, a demanda entra em fase de acompanhamento e não deve ser alterada sem um critério ou real necessidade de ajuste. Preste muita atenção à coluna Situação:",
      },
      {
        type: "ul",
        items: [
          "Demanda Enviada. Aguardando Análise: Significa que a solicitação ainda está sob sua alçada e aguarda o crivo do gestor. Neste estágio, você pode utilizar os botões ao final da linha (ícone de lápis) para editar as quantidades/justificativas, ou até mesmo excluir o registro caso desista da contratação.",
          "Aprovada Integralmente: Seu pedido foi aceito exatamente como foi enviado.",
          "Aprovada Parcialmente: O pedido foi aceito, porém a administração reduziu a quantidade ou ajustou os valores.",
          "Não Aprovada: O pedido foi indeferido e não fará parte do Plano de 2027.",
        ],
      },
    ],
  },
  {
    id: "feedback",
    title: "7. Feedback da Análise",
    content: [
      {
        type: "p",
        text: "Sempre que uma demanda for aprovada parcialmente ou não aprovada, o sistema exigirá que o Administrador digite um motivo justificando sua decisão.",
      },
      {
        type: "ul",
        items: [
          "Como visualizar o motivo: Na tabela principal, demandas com esse status exibirão um botão azul com a inscrição \"Ver Motivo\". Basta clicar para ler a justificativa do avaliador.",
          "Bloqueio de Edição: Assim que a demanda receber qualquer tipo de resposta do Administrador (Aprovação ou Rejeição), ela se torna um documento oficial do planejamento. Portanto, os botões de editar e excluir desaparecerão para a sua unidade. Você terá apenas acesso de leitura.",
        ],
      },
    ],
  },
  {
    id: "relatorios",
    title: "8. Relatórios e Exportação PDF",
    content: [
      {
        type: "p",
        text: "O PCA 2027 disponibiliza recursos práticos para a emissão de relatórios consolidados diretamente da página de Planejamento.",
      },
      {
        type: "p",
        text: "Como gerar relatórios: Acima da tabela, você encontrará um ícone de documento ao lado do botão Recarregar. Ele permite gerar instantaneamente um PDF gerencial.",
      },
      {
        type: "p",
        text: "Integração de Filtros: O PDF exportado respeita rigorosamente os filtros da tela. Se você aplicar um filtro para visualizar apenas itens com prioridade \"Alta\" e situação \"Não Aprovada\", o PDF refletirá somente esses dados. O documento também inclui cabeçalhos oficiais do MPPI e paginação, tornando-o perfeito para ser anexado em prestação de contas internas ou reuniões.",
      },
    ],
  },
  {
    id: "aprovacao",
    title: "9. Aprovação Administrativa",
    content: [
      {
        type: "p",
        text: "Embora este tutorial seja voltado para quem envia demandas, é importante compreender como o Administrador atua:",
      },
      {
        type: "ul",
        items: [
          "Exclusividade: O demandante propõe. O Administrador dispõe. Apenas perfis gestores podem alterar o status de uma demanda para Aprovada ou Não Aprovada.",
          "Transparência: O Sistema bloqueia ações silenciosas de cortes. Sempre que a administração cortar a quantidade ou barrar uma demanda, a equipe de licitações é forçada pelo software a detalhar um Motivo, garantindo total transparência à unidade solicitante.",
        ],
      },
    ],
  },
  {
    id: "duvidas",
    title: "10. Dúvidas Frequentes e Boas Práticas",
    content: [
      {
        type: "h3",
        text: "Como evitar o preenchimento incorreto?",
      },
      {
        type: "p",
        text: "Sempre faça uma boa pesquisa antes de selecionar o item do catálogo e utilize o campo Justificativa com bastante atenção para explicar o contexto. Além disso, confira se o Valor Unitário Estimado condiz com o mercado.",
      },
      {
        type: "h3",
        text: "O que fazer se eu não encontrar o item que desejo?",
      },
      {
        type: "p",
        text: "Busque por sinônimos ou selecione a categoria mais abrangente possível (Ex: Em vez de \"Teclado mecânico switch azul\", busque por \"Teclado Padrão\" e detalhe na justificativa). O catálogo federal é estruturado em níveis de generalização.",
      },
      {
        type: "h3",
        text: "Como revisar minha demanda?",
      },
      {
        type: "p",
        text: "Após o envio, enquanto ela constar como \"Aguardando Análise\", clique no ícone do lápis para revisar e ajustar valores. Lembre-se: após a decisão administrativa, a edição será desativada.",
      },
      {
        type: "h3",
        text: "Apoio e Suporte",
      },
      {
        type: "p",
        text: "Caso enfrente problemas de acesso, bloqueio indevido de telas ou dúvidas sobre enquadramento no CATMAT/CATSER, entre em contato com a equipe gestora pelo e-mail oficial de suporte ao planejamento.",
      },
    ],
  },
];
