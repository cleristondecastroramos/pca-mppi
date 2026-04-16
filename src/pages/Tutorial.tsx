import { useState } from "react";
import { Layout } from "@/components/Layout";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateTutorialPdf } from "@/utils/tutorialPdf";

export default function Tutorial() {
  const [generating, setGenerating] = useState(false);

  const handleExportPdf = async () => {
    setGenerating(true);
    try {
      await generateTutorialPdf();
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">📖 Tutorial Completo do Sistema PCA 2026</h1>
            <p className="text-sm text-muted-foreground">
              Sistema de Gerenciamento do Plano de Contratações Anual — Ministério Público do Estado do Piauí
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExportPdf}
            disabled={generating}
            title="Exportar Tutorial em PDF"
            className="h-8 w-8 text-muted-foreground hover:text-primary flex-shrink-0"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
          </Button>
        </div>

        {/* Sumário */}
        <Section title="Sumário">
          <ol className="list-decimal list-inside space-y-1 text-sm">
            {TOC.map((item, i) => (
              <li key={i}>
                <a href={`#sec${i + 1}`} className="text-primary hover:underline">{item}</a>
              </li>
            ))}
          </ol>
        </Section>

        {/* 1. Introdução */}
        <Section id="sec1" title="1. Introdução ao Sistema">
          <H3>1.1. O que é o PCA 2026?</H3>
          <P>
            O <strong>Sistema de Gerenciamento PCA MPPI 2026</strong> é o sistema oficial do Ministério Público do Estado do Piauí (MPPI) desenvolvido para gerenciar de forma centralizada, transparente e eficiente todas as contratações públicas planejadas para o exercício de 2026. Ele substitui o uso de planilhas avulsas e dashboards de Power BI por uma plataforma web integrada, com controle de acesso, rastreabilidade e automação de processos.
          </P>

          <H3>1.2. Objetivo do Sistema</H3>
          <UL items={[
            <><strong>Centralização:</strong> Reunir em uma única plataforma todas as demandas de contratação dos diversos setores do MPPI.</>,
            <><strong>Transparência:</strong> Oferecer visibilidade total sobre o andamento de cada contratação, desde o planejamento até a conclusão.</>,
            <><strong>Controle orçamentário:</strong> Gerenciar limites orçamentários por setor e unidade orçamentária, com travas automáticas que impedem o excesso de gastos.</>,
            <><strong>Rastreabilidade:</strong> Manter histórico completo de todas as alterações realizadas em cada contratação, incluindo dados anteriores e novos, com identificação do usuário responsável.</>,
            <><strong>Conformidade:</strong> Acompanhar o cumprimento de requisitos documentais e legais de cada processo licitatório.</>,
            <><strong>Tomada de decisão:</strong> Fornecer dashboards, indicadores e relatórios que auxiliem gestores e administradores na priorização e acompanhamento das contratações.</>,
          ]} />

          <H3>1.3. Público-alvo</H3>
          <UL items={[
            <><strong>Administradores do sistema</strong> (CLC e ASSESPPLAGES): Responsáveis pela gestão global, cadastro de usuários e configurações.</>,
            <><strong>Gestores:</strong> Servidores responsáveis pelo acompanhamento e consolidação das demandas de todos setores.</>,
            <><strong>Setores Requisitantes:</strong> Servidores dos setores que cadastram e gerenciam suas próprias demandas de contratação (CAA, CCF, CCS, CLC, CPPT, CTI, CRH, CEAF, GAECO, GSI, CONINT, PLANEJAMENTO, PROCON).</>,
            <><strong>Consulta:</strong> Servidores com acesso somente para leitura das informações do sistema.</>,
          ]} />

          <H3>1.4. Requisitos de Acesso</H3>
          <UL items={[
            <><strong>Navegador web atualizado:</strong> Google Chrome, Mozilla Firefox, Microsoft Edge ou Safari em suas versões mais recentes.</>,
            <><strong>Conexão com a internet:</strong> O sistema é acessível via web a partir de qualquer dispositivo.</>,
            <><strong>Credenciais de acesso:</strong> E-mail institucional (@mppi.mp.br) e senha fornecidos pelo administrador do sistema. <em>Não existe opção de autocadastro</em> — somente administradores podem criar contas.</>,
          ]} />
        </Section>

        {/* 2. Acesso e Autenticação */}
        <Section id="sec2" title="2. Acesso e Autenticação">
          <H3>2.1. Tela de Login</H3>
          <P>Para acessar o sistema:</P>
          <OL items={[
            <>Abra o navegador e acesse o endereço do sistema: <strong>https://pca-mppi.vercel.app</strong></>,
            <>Na tela de login, preencha o <strong>E-mail Institucional</strong> (formato seu.nome@mppi.mp.br) e a <strong>Senha</strong>.</>,
            <>Clique no botão <strong>"Entrar"</strong>.</>,
            <>Se as credenciais estiverem corretas, você será redirecionado para a <strong>Página Inicial (Home)</strong>.</>,
          ]} />
          <Note>O sistema não possui opção de cadastro autônomo. Caso não possua credenciais, entre em contato com o administrador na Coordenadoria de Licitações e Contratos ou na Assessoria de Planejamento e Gestão.</Note>

          <H3>2.2. Recuperação de Senha (Esqueci Minha Senha)</H3>
          <OL items={[
            <>Na tela de login, clique em <strong>"Esqueci minha senha"</strong>.</>,
            <>Informe o e-mail institucional associado à sua conta.</>,
            <>Clique em <strong>"Enviar link de redefinição"</strong>.</>,
            <>Acesse seu e-mail, localize a mensagem e clique no link de redefinição.</>,
            <>Defina sua nova senha na tela de <strong>Redefinir Senha</strong>.</>,
          ]} />
          <Note>O link de redefinição de senha tem validade limitada. Caso expire, repita o processo.</Note>

          <H3>2.3. Redefinição de Senha</H3>
          <P>Após clicar no link recebido por e-mail, informe a nova senha, confirme-a e clique em <strong>"Redefinir Senha"</strong>.</P>
          <Tip>Utilize senhas fortes contendo letras maiúsculas, minúsculas, números e caracteres especiais.</Tip>

          <H3>2.4. Logout (Sair do Sistema)</H3>
          <P>O sistema oferece duas formas práticas para o encerramento seguro da sessão:</P>
          <UL items={[
            <><strong>Pelo Menu Lateral (Sidebar):</strong> Localizado na parte inferior do menu à esquerda, basta clicar no botão <strong>"Sair"</strong>.</>,
            <><strong>Pelo Menu do Avatar (Header):</strong> No canto superior direito, clique sobre sua foto ou iniciais e utilize o botão <strong>"Sair"</strong> com ícone posicionado à direita no menu suspenso.</>,
          ]} />
          <Note>Sempre efetue o logout ao finalizar suas atividades, especialmente em computadores compartilhados, para garantir a segurança dos dados e da sua conta.</Note>
        </Section>

        {/* 3. Perfis */}
        <Section id="sec3" title="3. Perfis de Acesso e Permissões">
          <P>O sistema PCA 2026 implementa um rigoroso controle de acesso baseado em perfis de usuário.</P>

          <H3>3.1. Perfil Administrador</H3>
          <P>Nível mais alto de acesso. Atribuições:</P>
          <UL items={[
            "Gerenciamento completo de usuários e perfis de acesso (criação, edição e exclusão).",
            "Configurações globais, incluindo orçamento planejado e travas orçamentárias.",
            "Aprovação final de planejamentos e validação de dados.",
            "Visualização e edição de todas as demandas de todos os setores.",
            "Exclusão de registros do PCA.",
            "Gerenciamento de notificações do sistema.",
          ]} />

          <H3>3.2. Perfil Gestor</H3>
          <UL items={[
            "Visualização de todas as demandas e contratações de todos os setores.",
            "Edição técnica de contratações existentes.",
            "Geração de relatórios gerenciais e dashboards.",
            "Validação de demandas dos setores requisitantes.",
            <><strong>Sem acesso</strong> a gerenciamento de usuários, orçamento e notificações globais.</>,
          ]} />

          <H3>3.3. Perfil Setor Requisitante</H3>
          <UL items={[
            "Cadastro de novas demandas de contratação no PCA.",
            "Visualização e edição de todas as demandas do seu próprio setor.",
            <><strong>Sem acesso</strong> a relatórios gerenciais, conformidade consolidada ou gerenciamento.</>,
          ]} />
          <Note>Ao cadastrar nova demanda, o campo "Setor Requisitante" é preenchido automaticamente com o setor do usuário logado.</Note>

          <H3>3.4. Perfil Consulta</H3>
          <UL items={[
            "Visualização somente leitura das informações vigentes.",
            "Acesso à Visão Geral, FAQ e Minha Conta.",
            <><strong>Sem permissão</strong> para cadastrar, editar ou excluir qualquer registro.</>,
          ]} />

          <H3>3.5. Matriz de Acesso por Funcionalidade</H3>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-sidebar text-white">
                  <th className="text-left p-2 font-semibold">Funcionalidade</th>
                  <th className="text-center p-2 font-semibold">Admin</th>
                  <th className="text-center p-2 font-semibold">Gestor</th>
                  <th className="text-center p-2 font-semibold">Setor Req.</th>
                  <th className="text-center p-2 font-semibold">Consulta</th>
                </tr>
              </thead>
              <tbody>
                {MATRIX.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-muted/30" : ""}>
                    <td className="p-2 font-medium">{row[0]}</td>
                    <td className="p-2 text-center">{row[1]}</td>
                    <td className="p-2 text-center">{row[2]}</td>
                    <td className="p-2 text-center">{row[3]}</td>
                    <td className="p-2 text-center">{row[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* 4. Navegação */}
        <Section id="sec4" title="4. Navegação e Interface">
          <H3>4.1. Menu Lateral (Sidebar)</H3>
          <P>O menu lateral é o principal elemento de navegação, posicionado à esquerda da tela:</P>
          <UL items={[
            <><strong>Retrátil:</strong> Pode ser expandido ou colapsado (mostrando apenas ícones).</>,
            <><strong>Adaptativo por perfil:</strong> Exibe apenas os módulos permitidos para o seu perfil de acesso.</>,
            <><strong>Destaque visual:</strong> O módulo ativo é destacado com cor diferenciada.</>,
            <><strong>Indicação de versão:</strong> Na parte inferior, é exibido o número da versão atual do sistema.</>,
            <><strong>Botão "Sair":</strong> Na parte inferior, permite encerrar a sessão.</>,
          ]} />

          <H3>4.2. Cabeçalho (Header)</H3>
          <P>O cabeçalho é a barra superior constante em todo o sistema. Ele exibe o nome da página atual, o sino de notificações, a troca de temas e o <strong>Menu do Avatar</strong>.</P>
          <P>Ao clicar no avatar do usuário no canto direito, um menu compacto fornece as seguintes informações e ferramentas:</P>
          <UL items={[
            <><strong>Identificação:</strong> Mostra seu nome completo, e-mail institucional e o perfil de acesso atribuído (ex: Administrador, Gestor, etc.).</>,
            <><strong>Botão "Minha Conta":</strong> Localizado à esquerda na parte inferior do menu, permite acessar rapidamente a página de edição de perfil e senha.</>,
            <><strong>Botão "Sair":</strong> Localizado à direita na parte inferior, permite o encerramento rápido da sessão atual.</>,
          ]} />

          <H3>4.3. Tema Claro / Escuro</H3>
          <UL items={[
            <><strong>Tema Claro:</strong> Fundo branco com texto escuro, ideal para ambientes iluminados.</>,
            <><strong>Tema Escuro:</strong> Fundo escuro com texto claro, ideal para reduzir cansaço visual.</>,
          ]} />
          <P>Para alternar, utilize o ícone de sol/lua no cabeçalho do sistema.</P>

          <H3>4.4. Responsividade</H3>
          <P>O sistema é responsivo e se adapta a desktop, tablet e mobile. Em telas pequenas, o menu lateral é acessível via botão "hambúrguer".</P>
        </Section>

        {/* 5. Home */}
        <Section id="sec5" title="5. Home — Página Inicial">
          <P>A página Home é a tela de boas-vindas do sistema, exibida imediatamente após o login do usuário. Esta tela serve como ponto de partida central para toda a navegação dentro da plataforma, proporcionando uma experiência de entrada intuitiva e organizada.</P>
          
          <H3>5.1. Estrutura da Página Inicial</H3>
          <P>A página Home apresenta uma interface limpa e objetiva, composta pelos seguintes elementos principais:</P>
          <UL items={[
            <><strong>Menu Lateral (Sidebar):</strong> Localizado à esquerda da tela, o menu lateral é o principal meio de navegação do sistema. Ele apresenta de forma hierárquica todos os módulos e funcionalidades aos quais o usuário tem acesso, de acordo com seu perfil de permissões.</>,
            <><strong>Cabeçalho Superior:</strong> Exibe o título do módulo atual, notificações do sistema, seletor de tema (claro/escuro) e o menu do avatar, que centraliza as informações do perfil e botões de acesso rápido para conta e logout.</>,
            <><strong>Área de Conteúdo Principal:</strong> Região central da tela onde são exibidas mensagens de boas-vindas e informações contextuais sobre o sistema.</>,
          ]} />
          
          <H3>5.2. Funcionalidades Disponíveis</H3>
          <P>A partir da Home, o usuário pode acessar rapidamente qualquer módulo do sistema através do menu lateral. Os módulos disponíveis variam conforme o perfil de acesso do usuário autenticado. As principais áreas acessíveis incluem:</P>
          <UL items={[
            <><strong>Visão Geral:</strong> Dashboard com indicadores e gráficos consolidados.</>,
            <><strong>Demandas Ativas:</strong> Gestão completa do fluxo principal de contratações.</>,
            <><strong>Orçamento:</strong> Controle orçamentário por setor requisitante.</>,
            <><strong>Setores Demandantes:</strong> Visualização das demandas por área.</>,
            <><strong>Relatórios:</strong> Geração de relatórios e exportação de dados.</>,
            <><strong>Gerenciamento de Usuários:</strong> Administração de contas (apenas para administradores).</>,
          ]} />
          
          <H3>5.3. Personalização da Experiência</H3>
          <P>O sistema memoriza as preferências do usuário, como o estado de expansão/colapso do menu lateral, proporcionando uma experiência personalizada a cada acesso. O tema visual (claro ou escuro) também pode ser alternado conforme a preferência do usuário.</P>
          <Tip>Utilize o menu lateral para navegar entre os módulos de forma rápida. Os itens são organizados de acordo com a frequência de uso e importância operacional, facilitando o acesso às funcionalidades mais utilizadas.</Tip>
        </Section>

        {/* 6. Visão Geral */}
        <Section id="sec6" title="6. Visão Geral — Dashboard">
          <H3>6.1. Indicadores Principais (KPIs)</H3>
          <P>Quatro indicadores-chave no topo da página que representam o esforço do planejamento ATIVO (ignorando demandas suspensas):</P>
          <UL items={[
            <><strong>Total de Demandas:</strong> Quantidade total de contratações ativas.</>,
            <><strong>Valor Estimado Total:</strong> Soma dos valores estimados (R$).</>,
            <><strong>Valor Executado Total:</strong> Soma dos empenhos realizados (R$). Inclui régua de evolução mostrando o percentual executado em relação ao valor estimado, com cor dinâmica (azul &lt; 40%, ciano entre 40%–79%, verde ≥ 80%).</>,
            <><strong>Total Concluídas:</strong> Contratações com etapa "Concluído".</>,
          ]} />
          <Note>Passe o cursor sobre os cards de KPI para ver uma descrição contextual. Os cards que possuem régua de progresso exibem o percentual exato no tooltip.</Note>

          <H3>6.2. Filtros Disponíveis</H3>
          <P>Oito filtros interativos que atualizam automaticamente todos os indicadores e gráficos:</P>
          <UL items={[
            "Unidade Orçamentária (PGJ, FMMP, FEPDC)",
            "Setor Requisitante",
            "Tipo de Contratação",
            "Tipo de Recurso",
            "Classe",
            "Grau de Prioridade (Alta, Média, Baixa)",
            "Normativo (14.133/2021, 8.666/1993)",
            "Modalidade",
            "Status Atual (Não Iniciado, Iniciado, Em Diligência, Em Andamento, Concluído)",
          ]} />

          <H3>6.3. Gráficos e Visualizações</H3>
          <UL items={[
            <><strong>Gráfico de Barras:</strong> Distribuição por Setor Requisitante (quantidade ou valor estimado).</>,
            <><strong>Pizza — UO:</strong> Proporção entre PGJ, FMMP e FEPDC.</>,
            <><strong>Pizza — Tipo:</strong> Nova Contratação, Renovação, Aditivo, etc.</>,
            <><strong>Pizza — Classe:</strong> Material de Consumo, Serviço, Serviço de TI, etc.</>,
          ]} />
          <Tip>Passe o cursor do mouse sobre os gráficos para ver os valores detalhados de cada segmento.</Tip>
        </Section>

        {/* 7. Demandas Ativas */}
        <Section id="sec7" title="7. Demandas Ativas">
          <H3>7.1. Listagem de Demandas Ativas</H3>
          <P>Tabela principal com todas as demandas integradas ativamente ao fluxo orçamentário: Código (PCA-XXXX-2026), Descrição, Setor, UO, Classe, Valor Total, Valor Contratado, Status, Prioridade e Ações. Demandas suspensas não aparecem aqui.</P>

          <H3>7.2. Busca e Filtros</H3>
          <P>Campo de busca textual em tempo real (debounce de 500ms) e os mesmos oitos filtros avançados da Visão Geral. Botão "Limpar filtros" para restaurar a visualização completa.</P>

          <H3>7.3. Edição da Demanda</H3>
          <OL items={[
            <>Na coluna "Ações", clique no ícone de edição (lápis).</>,
            "Modal de edição com todos os campos preenchidos será exibido.",
            "Altere os campos desejados.",
            <>Clique em "Salvar" para confirmar.</>,
          ]} />
          <Note>Toda edição é registrada automaticamente no histórico da contratação, incluindo dados anteriores, novos e o usuário responsável, garantindo a rastreabilidade total.</Note>

          <H3>7.4. Histórico de Alterações</H3>
          <P>Clique no ícone de histórico (relógio) para ver todas as alterações: data, usuário, ação, dados anteriores e novos.</P>

          <H3>7.5. Exclusão de Demandas</H3>
          <P>Restrita ao perfil Administrador. Clique no ícone de lixeira e confirme a exclusão.</P>
          <Note>A exclusão é irreversível. A demanda e todo o seu histórico serão removidos permanentemente. Use Suspensão como alternativa temporária.</Note>

          <H3>7.6. Importação CSV</H3>
          <P>Importação em massa de demandas a partir de arquivos CSV para migração ou atualização em lote da planilha de planejamento.</P>
        </Section>

        {/* 8. Demandas Suspensas */}
        <Section id="sec8" title="8. Demandas Suspensas">
          <P>O módulo de 'Demandas Suspensas' isola todos os processos e planejamentos que foram interrompidos administrativa ou tecnicamente. Estas demandas não são computadas nos gráficos e métricas de execução orçamentária para não poluir o painel ativo.</P>
          
          <H3>8.1. KPIs Isolados</H3>
          <UL items={[
            <><strong>Valor Retido:</strong> Soma em R$ estacionada nos processos paralisados.</>,
            <><strong>Volume de Demandas:</strong> Número toral de demandas totalmente sobrestadas.</>,
            <><strong>Ocorrências Parciais (Filhas):</strong> Demandas criadas artificialmente após suspensão de itens individuais.</>,
          ]} />

          <H3>8.2. Suspensão Parcial (Relação Pai e Filha)</H3>
          <P>Em casos onde apenas alguns itens do planejamento precisam ser suspensos, o sistema bifurca a demanda original (Pai): gera-se uma Demanda Filha com os quantitativos paralisados, mantendo o Pai circulando normalmente. O valor da Filha é descontado do limite planejado.</P>

          <H3>8.3. Reativação e Fusão Reversa</H3>
          <OL items={[
            "Localize a demanda suspensa e clique no botão de Reativar na coluna de ações.",
            <><strong>Fusão reversa (Demandas Filhas):</strong> O sistema excluirá a demanda filha e fará a devolução integral (soma) das quantidades e dos valores estimados de volta para a Demanda Origem, limpando o banco de lixo operacional.</>,
            <><strong>Retorno de Fluxo (Suspensão Total):</strong> A simples remoção da tag devolve o controle da demanda ao fluxo das 'Demandas Ativas'.</>,
          ]} />
          <Note>O modal de Reativação explica detalhadamente qual operação lógica (Suspensão Total ou Fusão Reversa) será acionada pelo mecanismo antes do procedimento final.</Note>
        </Section>

        {/* 9. Nova Demanda de Contratação */}
        <Section id="sec9" title="9. Nova Demanda de Contratação">
          <H3>9.1. Informações Básicas (campos obrigatórios marcados com *)</H3>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-sidebar text-white">
                  <th className="text-left p-2 font-semibold">Campo</th>
                  <th className="text-center p-2 font-semibold">Obrigatório</th>
                  <th className="text-left p-2 font-semibold">Descrição</th>
                </tr>
              </thead>
              <tbody>
                {FORM_FIELDS.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-muted/30" : ""}>
                    <td className="p-2 font-medium">{row[0]}</td>
                    <td className="p-2 text-center">{row[1] === "Sim" ? <span className="text-destructive font-bold">Sim</span> : <span className="text-muted-foreground">Não</span>}</td>
                    <td className="p-2">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <H3>9.2. Valores e Quantidades</H3>
          <P>Informe Quantidade, Unidade de Fornecimento, Tipo de Recurso e Valor Unitário. O Valor Estimado Total = Quantidade × Valor Unitário é calculado automaticamente.</P>

          <H3>9.3. Código PCA Automático</H3>
          <P>Ao salvar uma nova contratação, o sistema gera automaticamente um código único no formato PCA-XXXX-2026. Este código é o identificador oficial de cada demanda aprovada no Plano de Contratações Anual e possui papel fundamental no processo de aquisição.</P>
          <P>O código PCA é utilizado para especificar o alinhamento da contratação com o planejamento institucional na etapa de formalização da demanda, por meio do Documento de Formalização de Demanda (DFD).</P>
          <Note>O Documento de Formalização de Demanda (DFD) é o instrumento inicial previsto na Nova Lei de Licitações (Lei nº 14.133/2021) que formaliza a necessidade de compra ou contratação. O DFD garante que cada aquisição esteja devidamente alinhada com o Plano de Contratações Anual (PCA) e com os objetivos estratégicos da instituição, sendo obrigatório para o início de qualquer processo de contratação.</Note>

          <H3>9.4. Validações e Trava Orçamentária</H3>
          <UL items={[
            "Todos os campos obrigatórios devem estar preenchidos.",
            "Descrição (10-500 caracteres) e Justificativa (20-1000 caracteres) respeitam limites.",
            "Valor total planejado deve ser maior que zero.",
            "Se a trava orçamentária estiver ativa, o sistema verifica se o valor total do setor não ultrapassa o limite alocado.",
          ]} />

          <H3>9.5. Cálculo Automático da Data Prevista de Início</H3>
          <P>O campo Data Prevista para Início da Contratação é calculado automaticamente pelo sistema e permanece bloqueado para edição manual. O cálculo baseia-se no Tipo de Contratação, na Modalidade e na Data Prevista para Conclusão.</P>
          <UL items={[
            "Regra 1: Se for uma Nova Contratação nas modalidades Pregão Eletrônico, Concorrência ou Concurso, a data de início é definida como 150 dias antes da data de término.",
            "Regra 2: Se for uma Nova Contratação nas modalidades Dispensa ou Inexigibilidade, a data de início é definida como 90 dias antes da data de término.",
            "Regra 3: Para os demais tipos de contratação (Renovação, Aditivo, Repactuação, Apostilamento ou Indeterminado), a data de início é definida como 120 dias antes da data de término.",
          ]} />
          <Note>Este mecanismo garante um planejamento realista e padronizado, alertando os gestores sobre o momento ideal para iniciar cada processo administrativo.</Note>
        </Section>

        {/* 10. Setores Demandantes */}
        <Section id="sec10" title="10. Setores Demandantes">
          <P>O módulo Setores Demandantes oferece uma visão consolidada e analítica de todas as demandas organizadas por setor requisitante. É uma ferramenta estratégica voltada para Administradores e Gestores, cobrindo os 13 setores cadastrados: CAA, CCF, CCS, CEAF, CLC, CONINT, CPPT, CRH, CTI, GAECO, GSI, PLANEJAMENTO e PROCON.</P>

          <H3>10.1. Indicadores (KPIs) com Régua de Evolução</H3>
          <P>Na parte superior da página são exibidos quatro indicadores consolidados que refletem o perfil financeiro ativo:</P>
          <UL items={[
            <><strong>Quantidade de Demandas:</strong> Total de demandas cadastradas e validamente ativas.</>,
            <><strong>Valor Estimado:</strong> Soma dos valores originalmente planejados para as contratações do setor.</>,
            <><strong>Valor Executado:</strong> Soma dos empenhos realizados. Exibe uma régua de progresso discreta e o percentual executado em relação ao valor estimado.</>,
            <><strong>Saldo Orçamentário:</strong> Diferença entre o valor estimado e o valor executado. Exibe régua colorida (verde, âmbar, vermelho).</>,
          ]} />
          <Tip>Passe o cursor sobre os cards de Valor Executado e Saldo Orçamentário para visualizar o percentual exato em relação ao valor inicialmente planejado.</Tip>

          <H3>10.2. Filtros Disponíveis</H3>
          <P>A barra de filtros permite refinar a visualização de demandas por critérios combinados:</P>
          <UL items={[
            "Setor: Botões de seleção rápida para cada um dos 13 setores.",
            "Tipo de Contratação: Nova Contratação, Renovação, Aditivo Quantitativo, Repactuação, Apostilamento e Indeterminado.",
            "Status: Não Iniciado, Iniciado, Em Diligência, Em Andamento e Concluído.",
          ]} />

          <H3>10.3. Legenda Visual</H3>
          <P>Acima da tabela há uma legenda com a representação visual de todos os status e badges.</P>
          
          <H3>10.4. Tabela de Demandas — Colunas e Tooltip</H3>
          <P>Na tabela principal atente-se à coluna de Prazo. O sistema avisa o momento em que a demanda precisa ser iniciada usando badges verdes, amarelos ou alertando o vencimento em vermelho.</P>
        </Section>

        {/* 11. Controle de Prazos */}
        <Section id="sec11" title="11. Controle de Prazos">
          <P>O módulo Controle de Prazos é responsável pelo acompanhamento temporal de todas as contratações cadastradas no sistema. Seu objetivo principal é garantir que nenhuma demanda ultrapasse seus prazos sem que os responsáveis sejam alertados.</P>
          <H3>11.1. Datas Monitoradas</H3>
          <P>O sistema monitora quatro datas-chave de cada contratação:</P>
          <UL items={[
            "Data Prevista de Contratação: Prazo estimado para a conclusão do processo.",
            "Data de Envio ao PGEA: Data de encaminhamento ao fluxo administrativo.",
            "Data de Finalização da Licitação: Data efetiva do certame.",
            "Data de Conclusão: Finalização com contrato assinado.",
          ]} />
          <H3>11.2. Classificação de Status de Prazo</H3>
          <P>Cada contratação é classificada baseada no calendário atual:</P>
          <UL items={[
            "Vencido: A data prevista já passou e a contratação não foi concluída.",
            "Próximo ao vencimento: Está dentro dos próximos 30 dias.",
            "No prazo: Mais de 30 dias de sobra.",
            "Concluído: Demanda finalizada.",
          ]} />
          <H3>11.3. Edição de Datas</H3>
          <P>Administrador e Gestores podem editar dados in-line na tabela com datepicker, agilizando ajustes.</P>
        </Section>

        {/* 12. Riscos e Pendências */}
        <Section id="sec12" title="12. Riscos e Pendências">
          <P>O módulo Riscos e Pendências funciona como um painel de alerta inteligente do sistema, focando no que deu erro gerencial ou beira o colapso temporal de planejamento.</P>
          <H3>12.1. Critérios de Classificação</H3>
          <P>O sistema analisa permanentemente as datas contábeis de demandas ativas e as joga em dois agrupamentos primários:</P>
          <UL items={[
            "Atrasados (Prazos Vencidos): Demandas cuja data-alvo prevista já falhou. Requerem verificação urgente.",
            "Atenção — Prazo nos Próximos 120 dias: Demandas de conclusão com prazo restrito. Exigem antecipação.",
          ]} />
          <H3>12.2. Navegação por Abas</H3>
          <P>A interface do analista fica dividida em duas grandes abas tabulares (Atrasados e Atenção 120 dias) revelando o volume sumário das deficiências.</P>
        </Section>

        {/* 13. Prioridades de Contratação */}
        <Section id="sec13" title="13. Prioridades de Contratação">
          <P>O módulo Prioridades de Contratação organiza todas as demandas ativas cadastradas no modelo visual Kanban, arrastando o grau de importância analítica por colunas inteiras.</P>
          <H3>13.1. Níveis de Prioridade</H3>
          <P>O grau de priorização se reflete na categorização:</P>
          <UL items={[
            "Alta: Demandas urgentes, imprescindíveis e vitais.",
            "Média: O core do planejamento anual. Relevância regular de reposição institucional.",
            "Baixa: Avanços contingenciáveis que aguardam brechas orçamentárias.",
          ]} />
          <H3>13.2. Layout em Colunas (Kanban)</H3>
          <P>Os gestores do PCA podem reatribuir facilmente o peso individual arrastando status visualmente para rebalancear a ordem das execuções prioritárias do MPPI.</P>
        </Section>

        {/* 14. Conformidade */}
        <Section id="sec14" title="14. Conformidade">
          <P>O módulo Conformidade é encarregado de medir, auferir e provar a higidez do acervo da demanda de contratação e documentar a robustez burocrática face à legislação federal da Nova Lei de Licitações (14.133/21).</P>
          <H3>14.1. Estrutura do Checklist: Duas Fases</H3>
          <P>Fase 1 — Licitação (7 Itens Fundamentais)</P>
          <OL items={[
            "Termo de Referência aprovado.",
            "Pesquisa de Mercado anexada.",
            "Pareceres Jurídicos em boa lei expedidos.",
            "Publicação plena validada do edital.",
            "Atas das sessões ratificadas.",
            "Homologação superior exarada.",
            "Adjudicação do objeto consolidada.",
          ]} />
          <P>Fase 2 — Contratação (4 Itens Terminais)</P>
          <OL items={[
            "Deliberações finalísticas validadas.",
            "Habilitação e idoneidades apuradas.",
            "Assinatura física/digital confirmada.",
            "Extrato emitido no Diário Oficial Público.",
          ]} />
          <Note>Exceção: Nos planejamentos de Sistema de Registro de Preços (SRP), o sistema oculta a Fase 2, exigindo a completude apenas do módulo 1 para 100%.</Note>
          <H3>14.2. Percentual de Conformidade</H3>
          <P>Ao clicar em auditar, um progresso percentual se desdobra em forma de badges de sinalização visual (verde &gt; 80%, cinza &lt; 30%) conforme o andamento.</P>
        </Section>

        {/* 15. Licitações SRP */}
        <Section id="sec15" title="15. Licitações SRP (Sistema de Registro de Preços)">
          <P>A página Licitações SRP é um módulo especializado para o gerenciamento de demandas que utilizam o Sistema de Registro de Preços. Ela oferece uma interface otimizada para o fluxo específico de atas e registros de preços, permitindo um acompanhamento mais detalhado da fase de licitação até o registro da ata.</P>
          <H3>15.1. Diferenciais do Módulo SRP</H3>
          <UL items={[
            <>Filtro Automático: Esta página exibe exclusivamente as demandas que foram marcadas com "SRP: Sim" no momento do cadastro.</>,
            <>Status Automático: Diferente de outros módulos, o status da demanda em SRP é calculado automaticamente pelo sistema com base no preenchimento de campos técnicos específicos.</>,
            <>Edição por Seções: O modal de edição é organizado em abas (Workflow, Fases Administrativas, Resultado e Especificações) para facilitar a inserção de dados.</>,
          ]} />
          <H3>15.2. Progressão Automática de Status</H3>
          <P>O status da demanda evolui conforme os dados são inseridos no sistema:</P>
          <UL items={[
            "Planejada: Status inicial ao cadastrar a demanda.",
            "Processo Administrativo Iniciado: Quando o campo \"Nº SEI de Contratação\" é preenchido.",
            "Fase Externa da Licitação: Quando os campos \"Nº SEI de Licitação\" e \"Nº do Edital\" são preenchidos.",
            "Licitação Concluída: Quando a \"Data Prevista para Contratação\" (que no SRP representa a data do certame) é preenchida.",
            "Ata Registrada: Quando o campo \"Nº do Contrato/Ata\" é preenchido.",
          ]} />
          <Note>Para que o status evolua corretamente, é fundamental manter os campos de controle administrativo atualizados.</Note>
        </Section>

        {/* 16. Resultados Alcançados */}
        <Section id="sec16" title="16. Resultados Alcançados">
          <P>O módulo Resultados Alcançados centraliza os dashboards estritamente relativos ao volume final operado de sucesso. É desenhado para a comprovação da consecução dos certames da entidade.</P>
          <H3>16.1. Métricas da Colheita Contratual</H3>
          <UL items={[
            "Demandas Concluídas: Expressão bruta do volume contável operado.",
            "Valor Contratado Total Consolidado: Esforço real negociado consolidado em todos os fechamentos.",
            "Taxa de Conclusão: Variável balizadora perante todo o rol cadastrado.",
          ]} />
          <H3>16.2. Estratificação e Inteligência</H3>
          <P>Gráficos de Pizza interativos particionam o bolo concluído entre as óticas cruciais: Unidades Orçamentárias pagadoras (quem financia), tipo da classe comercial, e o modelo contratual de execução.</P>
        </Section>

        {/* 17. Relatórios */}
        <Section id="sec17" title="17. Relatórios">
          <P>O módulo Relatórios é o motor nativo da plataforma responsável pelo processamento instantâneo de dados para extrações auditáveis sob forma de PDFs e relatórios formatados robustos.</P>
          <H3>17.1. Tipos Modelados Nativamente</H3>
          <UL items={[
            "Plano de Contratações Anual — PCA 2.0: Relatório padrão para visualização das exigências mínimas legais.",
            "Gerencial — Base de Dados Completa: Listagem transacional super-enriquecida consolidada para painéis financeiros avançados.",
            "Auditoria — Conformidade Licitatória: Onde se extrai a taxa de zelo de compliance da base documental.",
            "Riscos — Prazos Críticos e Alertas: Identificação taxativa de processos em risco temporal.",
            "Demandas Suspensas e Retidas: Arquivo focado em apontar rubricas orçamentárias congeladas.",
            "Orçamento — Extrato Consolidado Setorial: Saldo sumário macro onde a visão agrupa caixa previsto, caixa gasto e sobras.",
          ]} />
          <H3>17.2. Fatiamento em Multiplas Dimensões</H3>
          <P>Um modal extenso provê 8 agrupamentos macro-lógicos para filtros massivos, com opções de download flexível tanto para leitura oficial (PDF) quanto banco de dados (CSV).</P>
        </Section>

        {/* 18. Orçamento */}
        <Section id="sec18" title="18. Orçamento">
          <P>O módulo de Orçamento reflete a blindagem contábil parametrizada exclusivamente pela Administração (ASSESPPLAGES/CLC).</P>
          <H3>18.1. Divisão e Tetos Financeiros</H3>
          <P>A Administração pode injetar massas financeiras nos centros de custo fatiadas em PGJ, FMMP e FEPDC. O Sincronizador Inteligente ('Preencher do Planejado') insere automaticamente baseando-se no preenchimento global das demandas.</P>
          <H3>18.2. Ativador da Trava de Sistema</H3>
          <P>A trava orçamentária é acionada setor a setor recusando excedentes nas tabelas de lançamento que extrapolem em centavos a baliza permitida.</P>
          <H3>18.3. Governança e Rastreabilidade</H3>
          <P>A listagem histórica (Histórico de Edições) gera a folha de auditoria sobre quem majorou/minorou cotas financeiras com temporalidade cravada no relógio gerencial.</P>
        </Section>

        {/* 19. Gerenciamento de Usuários */}
        <Section id="sec19" title="19. Gerenciamento de Usuários">
          <P>Módulo restrito destinado ao controle de credenciais da plataforma (Administrador).</P>
          <H3>19.1. Admissão e Credenciamentos</H3>
          <OL items={[
            <>Clique em "Novo Usuário".</>,
            "Forneça nome, cargo, e-mail padronizado @mppi, lotação oficial formatada.",
            "Acople o perfil que garantirá seu clearance matricial (Gestor, Consulta, etc).",
          ]} />
          <Note>A segurança impede envios automáticos de chave digital externa: notifique as credenciais internamente de forma manual.</Note>
          <H3>19.2. Manutenção de Painel de Acesso</H3>
          <P>O painel busca livremente pelos filtros base, permitindo edição instantânea via lápis e revogação definitiva do login via exclusão lixeira vermelha em real-time.</P>
        </Section>

        {/* 20. Notificações */}
        <Section id="sec20" title="20. Notificações">
          <P>O módulo Central de Notificações é o broadcast interno de alcance global ou sectarizado manipulável só e somente pela Administração.</P>
          <H3>20.1. Gatilhos de Avisos Macro</H3>
          <OL items={[
            "Construir título breve. Digitar conteúdo sintético na caixa ampliada.",
            "Apontamento de Escopo: Disparar seletivamente a setores isolados ou rádio para Todos.",
          ]} />
          <H3>20.2. UX / Interface</H3>
          <P>O pino do sino vermelho aparece no topo de menu. Marcando leitura interativa. O Administrador pode inativar um aviso retroativo antigo no backoffice limpo.</P>
        </Section>

        {/* 21. Minha Conta */}
        <Section id="sec21" title="21. Minha Conta">
          <P>A página Minha Conta permite que cada usuário gerencie sua sub-identidade civil sem fricção central das chefias de TI para pequenos reajustes funcionais.</P>
          <H3>21.1. Modificações Básicas</H3>
          <UL items={[
            "Ajustar Avatar funcional. Rebatizar extensões (Ramais). Modificar ortografia primária de seu nome exibido na UI.",
            "Travas automáticas garantem que não haja transferência isolada de nível departamental ou de email do governo, que exijam validação ADM cruzada.",
          ]} />
        </Section>

        {/* 22. FAQ / Dúvidas */}
        <Section id="sec22" title="22. FAQ / Dúvidas">
          <P>Painel compilado de autoajuda formatado em acordeão expansível para consultas estáticas de fluxos usuais, desancorando dúvidas primárias.</P>
        </Section>

        {/* 23. Glossário de Termos e Siglas */}
        <Section id="sec23" title="23. Glossário de Termos e Siglas">
          <H3>23.1. Siglas</H3>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-xs table-fixed">
              <colgroup>
                <col className="w-[140px]" />
                <col />
              </colgroup>
              <thead>
                <tr className="bg-sidebar text-white">
                  <th className="text-left p-2 font-semibold">Sigla</th>
                  <th className="text-left p-2 font-semibold">Significado</th>
                </tr>
              </thead>
              <tbody>
                {SIGLAS.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-muted/30" : ""}>
                    <td className="p-2 font-bold">{row[0]}</td>
                    <td className="p-2">{row[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <H3>Setores Requisitantes</H3>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-xs table-fixed">
              <colgroup>
                <col className="w-[140px]" />
                <col />
              </colgroup>
              <thead>
                <tr className="bg-sidebar text-white">
                  <th className="text-left p-2 font-semibold">Sigla</th>
                  <th className="text-left p-2 font-semibold">Setor</th>
                </tr>
              </thead>
              <tbody>
                {SETORES.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-muted/30" : ""}>
                    <td className="p-2 font-bold">{row[0]}</td>
                    <td className="p-2">{row[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <H3>Termos Técnicos</H3>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-xs table-fixed">
              <colgroup>
                <col className="w-[140px]" />
                <col />
              </colgroup>
              <thead>
                <tr className="bg-sidebar text-white">
                  <th className="text-left p-2 font-semibold">Termo</th>
                  <th className="text-left p-2 font-semibold">Definição</th>
                </tr>
              </thead>
              <tbody>
                {TERMOS.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-muted/30" : ""}>
                    <td className="p-2 font-bold">{row[0]}</td>
                    <td className="p-2">{row[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <div className="border-t pt-6 text-center text-xs text-muted-foreground">
          <p>© 2026 Sistema PCA 2026 — Ministério Público do Estado do Piauí</p>
          <p>Desenvolvido pela Assessoria de Planejamento e Gestão (ASSESPPLAGES)</p>
        </div>
      </div>
    </Layout>
  );
}

/* ====== Helper Components ====== */

function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6">
      <h2 className="text-lg font-bold text-primary border-b border-primary/20 pb-2 mb-4">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-bold text-foreground mt-4 mb-1">{children}</h3>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-foreground/90 leading-relaxed text-justify">{children}</p>;
}

function UL({ items }: { items: (string | React.ReactNode)[] }) {
  return (
    <ul className="list-disc list-inside space-y-1 text-sm text-foreground/90 ml-2">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}

function OL({ items }: { items: (string | React.ReactNode)[] }) {
  return (
    <ol className="list-decimal list-inside space-y-1 text-sm text-foreground/90 ml-2">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ol>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-destructive/5 border-l-4 border-destructive/50 p-3 rounded-r-lg text-xs text-foreground/80 my-2">
      <strong className="text-destructive">Importante:</strong> {children}
    </div>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-success/5 border-l-4 border-success/50 p-3 rounded-r-lg text-xs text-foreground/80 my-2">
      <strong className="text-success">Dica:</strong> {children}
    </div>
  );
}

/* ====== Data ====== */

const TOC = [
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

const MATRIX = [
  ["Home / Visão Geral", "Completo", "Completo", "Apenas seu setor", "Somente leitura"],
  ["Demandas Ativas", "CRUD completo", "Visualizar e editar", "Visualiza e edita o setor", "Somente leitura"],
  ["Demandas Suspensas", "Reativar/Fundir", "Reativar/Fundir", "Apenas seu setor", "Somente leitura"],
  ["Nova Demanda", "✓", "✓", "✓ (setor fixo)", "✗"],
  ["Setores Demandantes", "✓", "✓", "✗", "✗"],
  ["Controle de Prazos", "✓", "✓", "Apenas seu setor", "✗"],
  ["Riscos e Pendências", "✓", "✓", "Apenas seu setor", "✗"],
  ["Prioridades", "✓", "✓", "Apenas seu setor", "✗"],
  ["Conformidade", "Gerenciar", "Gerenciar", "✗", "✗"],
  ["Licitações SRP", "✓", "✓", "Apenas seu setor", "Somente leitura"],
  ["Resultados", "✓", "✓", "✗", "✗"],
  ["Relatórios", "Gerar e exportar", "Gerar e exportar", "✗", "✗"],
  ["Orçamento", "Gerenciar completo", "✗", "✗", "✗"],
  ["Gerenc. Usuários", "Gerenciar completo", "✗", "✗", "✗"],
  ["Notificações", "Gerenciar", "Visualizar", "Visualizar", "Visualizar"],
  ["FAQ / Dúvidas", "✓", "✓", "✓", "✓"],
  ["Minha Conta", "✓", "✓", "✓", "✓"],
];

const FORM_FIELDS = [
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

const SIGLAS = [
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

const SETORES = [
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

const TERMOS = [
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
