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
            O <strong>PCA 2026</strong> (Plano de Contratações Anual 2026) é o sistema oficial do Ministério Público do Estado do Piauí (MPPI) desenvolvido para gerenciar de forma centralizada, transparente e eficiente todas as contratações públicas planejadas para o exercício de 2026. Ele substitui o uso de planilhas avulsas e dashboards de Power BI por uma plataforma web integrada, com controle de acesso, rastreabilidade e automação de processos.
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
            <><strong>Gestores:</strong> Servidores responsáveis pelo acompanhamento e consolidação das contratações de todos os setores.</>,
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
          <Note>O sistema não possui opção de cadastro autônomo. Caso não possua credenciais, entre em contato com o administrador na ASSESPPLAGES.</Note>

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
          <P>No <strong>menu lateral (sidebar)</strong>, clique no botão <strong>"Sair"</strong> na parte inferior. Sua sessão será encerrada e você será redirecionado para a tela de login.</P>
          <Note>Sempre efetue o logout ao finalizar suas atividades, especialmente em computadores compartilhados.</Note>
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
            "Visualização e edição de todas as contratações de todos os setores.",
            "Exclusão de registros de contratações.",
            "Gerenciamento de notificações do sistema.",
          ]} />

          <H3>3.2. Perfil Gestor</H3>
          <UL items={[
            "Visualização de todas as contratações de todos os setores.",
            "Edição técnica de contratações existentes.",
            "Geração de relatórios gerenciais e dashboards.",
            "Validação de demandas dos setores requisitantes.",
            <><strong>Sem acesso</strong> a gerenciamento de usuários, orçamento planejado e notificações.</>,
          ]} />

          <H3>3.3. Perfil Setor Requisitante</H3>
          <UL items={[
            "Cadastro de novas contratações no PCA.",
            "Edição de contratações em rascunho do seu próprio setor.",
            "Visualização apenas das demandas do seu setor.",
            <><strong>Sem acesso</strong> a relatórios, conformidade, resultados, setores demandantes ou gerenciamento.</>,
          ]} />
          <Note>Ao cadastrar nova contratação, o campo "Setor Requisitante" é preenchido automaticamente com o setor do usuário logado.</Note>

          <H3>3.4. Perfil Consulta</H3>
          <UL items={[
            "Visualização somente leitura das contratações.",
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
          <P>Exibe o nome do módulo atual, informações do usuário logado (nome, setor, avatar) e alternância de tema.</P>

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
          <P>A página Home é a tela de boas-vindas do sistema, exibida imediatamente após o login. Serve como ponto de partida para a navegação, apresentando o menu lateral com acesso a todos os módulos permitidos.</P>
        </Section>

        {/* 6. Visão Geral */}
        <Section id="sec6" title="6. Visão Geral — Dashboard">
          <H3>6.1. Indicadores Principais (KPIs)</H3>
          <P>Quatro indicadores-chave no topo da página:</P>
          <UL items={[
            <><strong>Total de Demandas:</strong> Quantidade total de contratações cadastradas.</>,
            <><strong>Valor Estimado Total:</strong> Soma dos valores estimados (R$).</>,
            <><strong>Valor Executado Total:</strong> Soma dos empenhos realizados (R$).</>,
            <><strong>Total Concluídas:</strong> Contratações com etapa "Concluído".</>,
          ]} />

          <H3>6.2. Filtros Disponíveis</H3>
          <P>Nove filtros interativos que atualizam automaticamente todos os indicadores e gráficos:</P>
          <UL items={[
            "Unidade Orçamentária (PGJ, FMMP, FEPDC)",
            "Setor Requisitante",
            "Tipo de Contratação",
            "Tipo de Recurso",
            "Classe",
            "Grau de Prioridade (Alta, Média, Baixa)",
            "Normativo (14.133/2021, 8.666/1993)",
            "Modalidade",
            "Status Atual (Não Iniciado, Em Andamento, Concluído, Sobrestado)",
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

        {/* 7. Contratações */}
        <Section id="sec7" title="7. Contratações">
          <H3>7.1. Listagem de Contratações</H3>
          <P>Tabela com todas as contratações: Código (PCA-XXXX-2026), Descrição, Setor, UO, Classe, Valor Estimado, Valor Contratado, Status, Prioridade e Ações.</P>

          <H3>7.2. Busca e Filtros</H3>
          <P>Campo de busca textual em tempo real (debounce de 500ms) e os mesmos filtros avançados da Visão Geral. Botão "Limpar filtros" para restaurar a visualização completa.</P>

          <H3>7.3. Edição de Contratação</H3>
          <OL items={[
            <>Na coluna "Ações", clique no ícone de <strong>edição</strong> (lápis).</>,
            "Modal de edição com todos os campos preenchidos.",
            "Altere os campos desejados.",
            <>Clique em <strong>"Salvar"</strong> para confirmar.</>,
          ]} />
          <Note>Toda edição é registrada automaticamente no histórico da contratação, incluindo dados anteriores, novos e o usuário responsável.</Note>

          <H3>7.4. Histórico de Alterações</H3>
          <P>Clique no ícone de <strong>histórico</strong> (relógio) para ver todas as alterações: data, usuário, ação, dados anteriores e novos.</P>

          <H3>7.5. Exclusão de Contratações</H3>
          <P>Restrita ao perfil <strong>Administrador</strong>. Clique no ícone de lixeira e confirme a exclusão.</P>
          <Note>A exclusão é <strong>irreversível</strong>. A contratação e todo o histórico serão removidos permanentemente.</Note>

          <H3>7.6. Importação CSV</H3>
          <P>Importação em massa de contratações a partir de arquivos CSV para migração ou atualização em lote.</P>
        </Section>

        {/* 8. Nova Contratação */}
        <Section id="sec8" title="8. Nova Contratação">
          <H3>8.1. Informações Básicas (campos obrigatórios marcados com *)</H3>
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

          <H3>8.2. Valores e Quantidades</H3>
          <P>Informe Quantidade, Unidade de Fornecimento, Tipo de Recurso e Valor Unitário. O <strong>Valor Estimado Total = Quantidade × Valor Unitário</strong> é calculado automaticamente.</P>

          <H3>8.3. Código PCA Automático</H3>
          <P>Ao salvar, o sistema gera um código único no formato <strong>PCA-XXXX-2026</strong>.</P>

          <H3>8.4. Validações e Trava Orçamentária</H3>
          <UL items={[
            "Todos os campos obrigatórios devem estar preenchidos.",
            "Descrição (10-500 caracteres) e Justificativa (20-1000 caracteres) respeitam limites.",
            "Valor estimado deve ser maior que zero.",
            "Se a trava orçamentária estiver ativa, o sistema verifica se o valor total do setor não ultrapassa o limite.",
          ]} />
        </Section>

        {/* 9. Setores Demandantes */}
        <Section id="sec9" title="9. Setores Demandantes">
          <P>
            O módulo <strong>Setores Demandantes</strong> oferece uma visão consolidada e analítica de todas as contratações organizadas por setor requisitante. Trata-se de uma ferramenta estratégica voltada para <strong>Administradores</strong> e <strong>Gestores</strong>, que permite compreender o panorama geral das demandas de cada um dos 13 setores cadastrados no sistema: CAA, CCF, CCS, CEAF, CLC, CONINT, CPPT, CRH, CTI, GAECO, GSI, PLANEJAMENTO e PROCON.
          </P>

          <H3>9.1. Visão Geral e KPIs</H3>
          <P>
            Na parte superior da página são exibidos indicadores consolidados (KPIs) que sintetizam o total de demandas cadastradas e o valor estimado acumulado de todas as contratações. Esses indicadores são atualizados automaticamente conforme o setor selecionado, permitindo ao usuário visualizar rapidamente a dimensão e o impacto financeiro das demandas de cada área.
          </P>

          <H3>9.2. Filtro por Setor</H3>
          <P>
            Por meio de botões de seleção rápida, o usuário pode escolher um setor específico para visualizar apenas suas demandas, ou selecionar <strong>"Todos"</strong> para exibir a visão consolidada de todos os setores simultaneamente. Ao selecionar um setor, a tabela abaixo é filtrada automaticamente, exibindo somente as contratações pertencentes àquele setor.
          </P>

          <H3>9.3. Tabela de Demandas por Setor</H3>
          <P>
            A tabela principal exibe as seguintes informações de cada contratação: <strong>Código PCA</strong> (no formato PCA-XXXX-2026), <strong>Descrição</strong> resumida do objeto, <strong>Classe</strong> (Material ou Serviço), <strong>Modalidade</strong> de contratação, <strong>Valor Estimado</strong>, <strong>Valor Contratado</strong>, <strong>Saldo Orçamentário</strong>, <strong>Empenhos</strong> (1º, 2º e 3º) e <strong>Etapa do Processo</strong>. Todos os valores monetários são formatados no padrão brasileiro (R$).
          </P>

          <H3>9.4. Utilidade Estratégica</H3>
          <P>
            Este módulo é especialmente útil para reuniões de planejamento e acompanhamento gerencial, pois permite identificar setores com maior volume de demandas, comparar valores estimados versus contratados, verificar saldos orçamentários remanescentes e acompanhar a evolução dos empenhos. Administradores podem utilizar essas informações para redistribuir recursos, ajustar prioridades e garantir o equilíbrio orçamentário entre os setores.
          </P>
        </Section>

        {/* 10. Controle de Prazos */}
        <Section id="sec10" title="10. Controle de Prazos">
          <P>
            O módulo <strong>Controle de Prazos</strong> é responsável pelo acompanhamento temporal de todas as contratações cadastradas no sistema. Seu objetivo principal é garantir que nenhuma demanda ultrapasse seus prazos sem que os responsáveis sejam alertados, contribuindo para o cumprimento do calendário do Plano de Contratações Anual. Disponível para <strong>Administradores</strong>, <strong>Gestores</strong> e <strong>Setores Requisitantes</strong> (neste caso, limitado às contratações do próprio setor).
          </P>

          <H3>10.1. Datas Monitoradas</H3>
          <P>O sistema monitora quatro datas-chave de cada contratação, que representam os marcos temporais do ciclo de vida processual:</P>
          <UL items={[
            <><strong>Data Prevista de Contratação:</strong> Prazo estimado para a conclusão do processo de contratação, definido no momento do cadastro da demanda.</>,
            <><strong>Data de Envio ao PGEA:</strong> Data em que a documentação foi encaminhada ao Plano de Gestão e Execução Administrativa.</>,
            <><strong>Data de Finalização da Licitação:</strong> Data em que o procedimento licitatório foi efetivamente concluído.</>,
            <><strong>Data de Conclusão:</strong> Data em que todo o processo de contratação foi finalizado, incluindo a assinatura do contrato e publicação.</>,
          ]} />

          <H3>10.2. Classificação de Status de Prazo</H3>
          <P>Cada contratação é automaticamente classificada com base na data prevista de contratação em relação à data atual:</P>
          <UL items={[
            <><strong className="text-destructive">Vencido:</strong> A data prevista já passou e a contratação ainda não foi concluída. Exibido com badge vermelho e ícone de alerta.</>,
            <><strong className="text-warning">Próximo ao vencimento:</strong> A data prevista está dentro dos próximos 30 dias. Exibido com badge amarelo e ícone de relógio.</>,
            <><strong className="text-success">No prazo:</strong> A data prevista ainda está a mais de 30 dias. Exibido com badge verde e ícone de confirmação.</>,
            <><strong>Concluído:</strong> A contratação já foi finalizada, independentemente do prazo original.</>,
          ]} />

          <H3>10.3. Filtros Disponíveis</H3>
          <P>A página oferece múltiplos filtros para facilitar a localização e análise das contratações:</P>
          <UL items={[
            <><strong>Busca textual:</strong> Pesquisa por descrição, setor requisitante ou código PCA.</>,
            <><strong>Filtro por status de prazo:</strong> Permite exibir apenas contratações vencidas, próximas ao vencimento, no prazo ou concluídas.</>,
            <><strong>Filtro por mês:</strong> Permite visualizar apenas contratações cuja data prevista está em um mês específico do ano.</>,
          ]} />

          <H3>10.4. Edição de Datas</H3>
          <P>
            Usuários com perfil de <strong>Administrador</strong> ou <strong>Gestor</strong> podem editar as datas diretamente na tabela, clicando sobre a célula correspondente. Um calendário (datepicker) é exibido para seleção da nova data. Todas as alterações são salvas automaticamente no banco de dados e registradas no histórico de auditoria. O perfil <strong>Setor Requisitante</strong> possui acesso apenas para visualização, sem possibilidade de edição.
          </P>

          <H3>10.5. Indicadores Resumidos</H3>
          <P>
            Na parte superior da página, KPIs exibem o total de contratações monitoradas, a quantidade de contratações com prazo vencido e a quantidade com prazo próximo ao vencimento, proporcionando uma visão rápida da situação geral dos prazos.
          </P>
        </Section>

        {/* 11. Pontos de Atenção */}
        <Section id="sec11" title="11. Pontos de Atenção">
          <P>
            O módulo <strong>Pontos de Atenção</strong> (também chamado de <strong>Prioridades de Atenção</strong>) funciona como um painel de alerta inteligente do sistema, destacando automaticamente as contratações que exigem intervenção imediata ou acompanhamento prioritário. Disponível para <strong>Administradores</strong>, <strong>Gestores</strong> e <strong>Setores Requisitantes</strong> (limitado ao próprio setor).
          </P>

          <H3>11.1. Critérios de Classificação</H3>
          <P>O sistema analisa automaticamente todas as contratações e as classifica em duas categorias principais de atenção:</P>
          <UL items={[
            <><strong className="text-destructive">Atrasados (Prazos Vencidos):</strong> Contratações cuja data prevista de contratação já ultrapassou a data atual e que ainda não foram concluídas nem sobrestadas. Representam situações críticas que demandam ação imediata por parte do setor responsável e da gestão.</>,
            <><strong className="text-warning">Atenção — Prazo nos Próximos 120 dias:</strong> Contratações cuja data prevista de contratação está dentro dos próximos 120 dias (aproximadamente 4 meses). Funcionam como um alerta preventivo, permitindo que os responsáveis se antecipem e garantam o andamento tempestivo do processo.</>,
          ]} />

          <H3>11.2. Informações Exibidas</H3>
          <P>Para cada contratação destacada, o sistema exibe:</P>
          <UL items={[
            <><strong>Código PCA:</strong> Identificador único no formato PCA-XXXX-2026.</>,
            <><strong>Descrição:</strong> Resumo do objeto da contratação.</>,
            <><strong>Setor Requisitante:</strong> Setor responsável pela demanda.</>,
            <><strong>Etapa do Processo:</strong> Fase atual da contratação (Planejamento, Em Licitação, Contratado, etc.).</>,
            <><strong>Data Prevista:</strong> Data originalmente planejada para conclusão da contratação.</>,
            <><strong>Dias de atraso ou dias restantes:</strong> Cálculo automático mostrando há quantos dias o prazo está vencido (para atrasados) ou quantos dias faltam para o vencimento (para os que exigem atenção).</>,
          ]} />

          <H3>11.3. Navegação por Abas</H3>
          <P>
            A interface é organizada em duas abas (tabs): <strong>"Atrasados"</strong> e <strong>"Atenção (120 dias)"</strong>. Cada aba apresenta uma tabela dedicada com suas respectivas contratações, KPIs de resumo (quantidade de itens na categoria) e badges coloridos para rápida identificação visual. A aba de atrasados é exibida por padrão ao acessar a página.
          </P>

          <H3>11.4. Finalidade Estratégica</H3>
          <P>
            Este módulo é essencial para a gestão proativa das contratações. Ao concentrar em uma única tela todas as situações que requerem atenção, ele permite que gestores identifiquem gargalos, cobrem providências dos setores responsáveis e tomem decisões tempestivas para evitar prejuízos ao planejamento anual. É recomendável que administradores e gestores consultem este módulo diariamente como parte de sua rotina de acompanhamento.
          </P>
        </Section>

        {/* 12. Prioridades de Contratação */}
        <Section id="sec12" title="12. Prioridades de Contratação">
          <P>
            O módulo <strong>Prioridades de Contratação</strong> organiza todas as demandas cadastradas no sistema de acordo com seu <strong>grau de prioridade</strong>, oferecendo uma visão estratégica que facilita a tomada de decisão sobre quais contratações devem receber atenção prioritária. Disponível para <strong>Administradores</strong>, <strong>Gestores</strong> e <strong>Setores Requisitantes</strong> (limitado ao próprio setor).
          </P>

          <H3>12.1. Níveis de Prioridade</H3>
          <P>O sistema classifica cada contratação em três níveis de prioridade, cada um representado por uma coluna visual distinta:</P>
          <UL items={[
            <><strong className="text-destructive">Alta:</strong> Contratações de caráter urgente ou imprescindível para a continuidade dos serviços do MPPI. São demandas que, caso não sejam realizadas no prazo, podem comprometer o funcionamento de setores essenciais, acarretar prejuízos financeiros ou descumprir obrigações legais. Identificadas com ícone de alerta vermelho (⚠️).</>,
            <><strong className="text-warning">Média:</strong> Contratações importantes que possuem relevância para a melhoria dos serviços ou a manutenção de atividades regulares, mas que admitem certa flexibilidade no prazo de execução. Representam o nível padrão atribuído a novas demandas quando não há indicação específica de urgência. Identificadas com ícone circular amarelo (●).</>,
            <><strong>Baixa:</strong> Contratações que, embora necessárias, podem ser postergadas sem impacto significativo nas operações do MPPI. Geralmente envolvem melhorias incrementais, aquisições de menor valor ou demandas que podem aguardar janelas orçamentárias mais favoráveis. Identificadas com ícone de seta para baixo (↓).</>,
          ]} />

          <H3>12.2. Layout em Colunas (Kanban)</H3>
          <P>
            A interface apresenta as contratações em um layout de três colunas lado a lado, no estilo kanban, onde cada coluna corresponde a um nível de prioridade (Alta, Média, Baixa). Cada coluna exibe no topo o número de demandas e o valor estimado total daquela categoria. Dentro de cada coluna, cada contratação é apresentada como um card contendo: descrição do objeto, setor requisitante, status atual (não iniciado, em andamento, concluído ou sobrestado) e valor estimado.
          </P>

          <H3>12.3. Filtros</H3>
          <P>A página oferece dois filtros para refinamento da visualização:</P>
          <UL items={[
            <><strong>Busca textual:</strong> Permite pesquisar por descrição ou setor requisitante, atualizando instantaneamente as três colunas conforme o termo digitado.</>,
            <><strong>Filtro por status:</strong> Permite exibir apenas contratações com determinado status (não iniciado, em andamento, concluído ou sobrestado), facilitando análises focadas em um estágio específico do processo.</>,
          ]} />

          <H3>12.4. Status das Contratações</H3>
          <P>Cada contratação dentro dos cards de prioridade exibe seu status atual, determinado automaticamente pelo sistema:</P>
          <UL items={[
            <><strong>Não iniciado:</strong> Contratação ainda na fase de planejamento, sem movimentação processual. Badge azul.</>,
            <><strong>Em andamento:</strong> Contratação em fase de licitação ou já contratada, com atividades em progresso. Badge amarelo.</>,
            <><strong>Concluído:</strong> Contratação finalizada com sucesso. Badge verde.</>,
            <><strong>Sobrestado:</strong> Contratação temporariamente suspensa por determinação administrativa ou técnica. Badge cinza.</>,
          ]} />

          <H3>12.5. Alteração de Prioridade</H3>
          <P>
            Usuários com perfil de <strong>Administrador</strong> ou <strong>Gestor</strong> podem alterar o grau de prioridade de qualquer contratação diretamente pela página de detalhes ou pela lista de contratações. Toda alteração é registrada no histórico de auditoria do sistema, incluindo o valor anterior, o novo valor e a identificação do usuário que realizou a mudança. Setores Requisitantes visualizam as prioridades de suas demandas, mas não podem alterá-las.
          </P>

          <H3>12.6. Importância para a Gestão</H3>
          <P>
            A correta classificação das prioridades é fundamental para o sucesso do Plano de Contratações Anual. Ela permite que a equipe de gestão aloque recursos, organize cronogramas e direcione esforços para as demandas mais críticas. Recomenda-se que a revisão das prioridades seja realizada periodicamente, especialmente diante de mudanças orçamentárias, alterações legislativas ou surgimento de novas necessidades institucionais.
          </P>
        </Section>

        {/* 13. Conformidade */}
        <Section id="sec13" title="13. Avaliação e Conformidade">
          <P>
            O módulo <strong>Avaliação e Conformidade</strong> é responsável por verificar e registrar o cumprimento dos requisitos documentais e legais de cada processo de contratação. Ele funciona como um checklist estruturado que acompanha todas as etapas obrigatórias, garantindo que nenhum documento ou procedimento seja omitido ao longo do processo licitatório e contratual. Este módulo está disponível exclusivamente para usuários com perfil de <strong>Administrador</strong> e <strong>Gestor</strong>.
          </P>

          <H3>13.1. Estrutura do Checklist: Duas Fases</H3>
          <P>
            O checklist de conformidade é dividido em <strong>duas fases distintas</strong>, que refletem as etapas reais do processo de contratação pública conforme as normas vigentes (Leis nº 8.666/93 e nº 14.133/21):
          </P>

          <H3>Fase 1 — Fase de Licitação</H3>
          <P>
            A primeira fase abrange todos os documentos e atos necessários para a realização do procedimento licitatório. É composta por <strong>7 itens</strong> obrigatórios:
          </P>
          <OL items={[
            <><strong>Termo de Referência aprovado:</strong> Documento que descreve detalhadamente o objeto da contratação, suas especificações técnicas, quantidades, prazos e condições de execução. Deve estar devidamente aprovado pela autoridade competente antes do início do processo licitatório.</>,
            <><strong>Pesquisa de Mercado:</strong> Levantamento de preços praticados no mercado para o objeto da contratação, utilizado para estimar o valor de referência e garantir a economicidade do processo.</>,
            <><strong>Pareceres Jurídicos emitidos sobre a licitação:</strong> Manifestação da assessoria jurídica atestando a legalidade e regularidade do procedimento licitatório, conforme exigido pela legislação.</>,
            <><strong>Publicação de edital conforme normas:</strong> Verificação de que o edital foi publicado nos veículos oficiais exigidos (Diário Oficial, portais de transparência) dentro dos prazos legais.</>,
            <><strong>Atas do Certame:</strong> Registro formal de todas as sessões do procedimento licitatório, incluindo propostas apresentadas, lances, habilitação e eventuais recursos.</>,
            <><strong>Termo de Homologação:</strong> Ato da autoridade competente que confirma a regularidade de todo o procedimento licitatório e ratifica o resultado do certame.</>,
            <><strong>Termo de Adjudicação:</strong> Ato que atribui formalmente ao licitante vencedor o objeto da licitação, após a homologação do resultado.</>,
          ]} />

          <H3>Fase 2 — Fase de Contratação</H3>
          <P>
            A segunda fase abrange os documentos e atos necessários para a formalização do contrato após a conclusão da licitação. É composta por <strong>4 itens</strong> obrigatórios:
          </P>
          <OL items={[
            <><strong>Atos de autorização registrados:</strong> Documentos que comprovam a autorização formal para a celebração do contrato pela autoridade competente.</>,
            <><strong>Documentação do fornecedor completa:</strong> Verificação de que toda a documentação de habilitação do fornecedor vencedor está válida e em conformidade (certidões negativas, documentos fiscais, regularidade trabalhista, etc.).</>,
            <><strong>Assinatura do Contrato:</strong> Confirmação de que o instrumento contratual foi devidamente assinado por ambas as partes (contratante e contratado).</>,
            <><strong>Publicação do Extrato do Contrato:</strong> Verificação de que o extrato do contrato foi publicado no Diário Oficial, conforme exigido pela legislação para garantir transparência e eficácia do ato.</>,
          ]} />

          <H3>13.2. Regra Especial para Contratações via SRP</H3>
          <Note>
            <strong>Importante:</strong> Quando uma contratação é cadastrada como <strong>SRP (Sistema de Registro de Preços)</strong>, o checklist exibe <strong>apenas a Fase de Licitação</strong> (7 itens). A Fase de Contratação <strong>não é aplicável</strong> neste caso, pois no regime de SRP o resultado da licitação gera uma <strong>Ata de Registro de Preços</strong>, e não um contrato imediato. A contratação efetiva ocorre posteriormente, por meio de adesão à ata, em processo próprio. Portanto, o percentual de conformidade para demandas SRP é calculado com base apenas nos 7 itens da Fase de Licitação, enquanto para as demais demandas o cálculo considera todos os 11 itens (7 da licitação + 4 da contratação).
          </Note>

          <H3>13.3. Percentual de Conformidade</H3>
          <P>
            Para cada contratação, o sistema calcula automaticamente um <strong>percentual de conformidade</strong> baseado na proporção de itens marcados como cumpridos em relação ao total aplicável. O percentual é exibido na tabela principal por meio de badges coloridos:
          </P>
          <UL items={[
            <><strong className="text-success">80% ou mais:</strong> Badge verde — conformidade alta, indicando que a maioria dos requisitos foi atendida.</>,
            <><strong className="text-warning">Entre 30% e 79%:</strong> Badge amarelo — conformidade parcial, sinalizando que há itens pendentes que precisam de atenção.</>,
            <><strong className="text-muted-foreground">Abaixo de 30%:</strong> Badge cinza — conformidade baixa, indicando que o processo ainda está em estágio inicial de documentação.</>,
          ]} />

          <H3>13.4. Como Auditar uma Contratação</H3>
          <P>Para realizar a avaliação de conformidade de uma contratação, siga os passos:</P>
          <OL items={[
            "Na tabela principal, localize a contratação desejada utilizando os filtros de busca, setor ou status.",
            <>Clique no botão <strong>"Auditar"</strong> na coluna de ações da contratação.</>,
            "Um modal (janela) será aberto exibindo o checklist dividido nas fases aplicáveis.",
            "Marque os checkboxes correspondentes aos documentos e atos já cumpridos.",
            "Utilize o campo de observação na parte inferior para registrar particularidades, pendências ou justificativas relevantes.",
            <>Clique em <strong>"Salvar"</strong> para registrar a avaliação. O percentual de conformidade será atualizado automaticamente na tabela.</>,
          ]} />

          <H3>13.5. Filtros e Exportação</H3>
          <P>
            A página oferece filtros por <strong>busca textual</strong> (descrição ou código PCA), <strong>setor requisitante</strong> e <strong>status da contratação</strong>. Além disso, é possível exportar os dados filtrados em formato <strong>CSV</strong> para análise externa, clicando no botão <strong>"Exportar CSV"</strong> no canto superior direito.
          </P>

          <H3>13.6. Importância para o Processo</H3>
          <P>
            A avaliação de conformidade é fundamental para garantir que todos os processos de contratação do MPPI estejam em conformidade com a legislação vigente, reduzindo riscos de irregularidades, impugnações e questionamentos por parte dos órgãos de controle. Recomenda-se que a auditoria de conformidade seja realizada de forma contínua, à medida que os documentos de cada fase são produzidos e validados.
          </P>
        </Section>

        {/* 14. Resultados Alcançados */}
        <Section id="sec14" title="14. Resultados Alcançados">
          <P>
            O módulo <strong>Resultados Alcançados</strong> é o painel de desempenho do sistema PCA 2026, responsável por consolidar e apresentar de forma visual os resultados efetivos das contratações concluídas pelo MPPI. Disponível exclusivamente para <strong>Administradores</strong> e <strong>Gestores</strong>, este módulo transforma dados brutos em indicadores estratégicos que permitem avaliar o desempenho institucional no cumprimento do Plano de Contratações Anual.
          </P>

          <H3>14.1. KPIs (Indicadores-Chave de Desempenho)</H3>
          <P>Na parte superior da página, três indicadores principais sintetizam o panorama das contratações concluídas:</P>
          <UL items={[
            <><strong>Demandas Concluídas:</strong> Quantidade total de contratações que atingiram a etapa "Concluído", representando os processos que foram integralmente finalizados.</>,
            <><strong>Valor Contratado:</strong> Soma dos valores efetivamente contratados em todas as demandas concluídas, formatado em reais (R$). Este indicador permite comparar o valor planejado (estimado) com o valor real da contratação.</>,
            <><strong>Taxa de Conclusão:</strong> Percentual de demandas concluídas em relação ao total de demandas cadastradas no sistema. Indica o grau de execução do Plano de Contratações Anual.</>,
          ]} />

          <H3>14.2. Gráficos Analíticos</H3>
          <P>O módulo apresenta três gráficos interativos que permitem análises sob diferentes perspectivas. Cada gráfico possui botões de alternância para visualizar os dados por <strong>número de processos</strong> ou por <strong>valores contratados</strong>:</P>
          <UL items={[
            <><strong>Distribuição por Unidade Orçamentária (UO):</strong> Gráfico de pizza que mostra como as contratações concluídas estão distribuídas entre as unidades orçamentárias (PGJ, FMMP, FEPDC). Permite identificar qual fonte de recurso foi mais utilizada.</>,
            <><strong>Distribuição por Tipo de Contratação:</strong> Gráfico de pizza que categoriza as contratações concluídas por tipo (Aquisição, Serviço Continuado, Obra, etc.), revelando quais modalidades de contratação são mais frequentes ou movimentam maior volume financeiro.</>,
            <><strong>Distribuição por Classe:</strong> Gráfico de pizza que segmenta as contratações entre Material e Serviço, oferecendo uma visão clara da natureza predominante das aquisições do MPPI.</>,
          ]} />

          <H3>14.3. Tabela de Valor Contratado por Setor</H3>
          <P>
            Na parte inferior da página, uma tabela detalhada apresenta o valor total contratado por cada setor requisitante. Esta informação é essencial para avaliar quais setores estão mais avançados na execução de suas demandas e quais ainda possuem margem significativa entre o planejado e o realizado.
          </P>

          <H3>14.4. Finalidade Estratégica</H3>
          <P>
            O módulo Resultados Alcançados desempenha um papel central na <strong>prestação de contas</strong> e na <strong>avaliação de desempenho institucional</strong>. Seus dados permitem que a alta gestão do MPPI:
          </P>
          <UL items={[
            <><strong>Avalie a efetividade do planejamento:</strong> Ao comparar a taxa de conclusão com o total planejado, é possível identificar se o PCA está sendo executado conforme previsto ou se há atrasos sistêmicos que exigem intervenção.</>,
            <><strong>Identifique economias:</strong> A comparação entre valores estimados e contratados revela se houve economia nas contratações, informação relevante para relatórios de gestão fiscal e prestação de contas aos órgãos de controle.</>,
            <><strong>Subsidie decisões orçamentárias futuras:</strong> Os padrões de execução identificados neste módulo (quais tipos de contratação são mais frequentes, quais setores consomem mais recursos) alimentam o planejamento do próximo exercício.</>,
            <><strong>Produza relatórios de gestão:</strong> Os gráficos e indicadores podem ser utilizados em apresentações à Procuradoria-Geral de Justiça, ao Conselho Superior do Ministério Público e aos órgãos de controle externo.</>,
          ]} />
        </Section>

        {/* 15. Relatórios */}
        <Section id="sec15" title="15. Relatórios">
          <P>
            O módulo <strong>Relatórios</strong> é a ferramenta de geração e exportação de relatórios gerenciais do sistema PCA 2026. Ele permite que <strong>Administradores</strong> e <strong>Gestores</strong> produzam documentos estruturados a partir dos dados das contratações, aplicando filtros avançados e escolhendo entre diferentes tipos de relatório conforme a necessidade da análise.
          </P>

          <H3>15.1. Tipos de Relatório Disponíveis</H3>
          <P>O sistema oferece cinco tipos de relatório, cada um com foco em uma dimensão específica do processo de contratação:</P>
          <UL items={[
            <><strong>Contratações — Detalhado:</strong> Listagem completa de todas as contratações com código PCA, descrição, setor requisitante, unidade orçamentária, prioridade, valores estimado e contratado, normativo aplicável e data prevista. É o relatório mais abrangente e indicado para análises gerais.</>,
            <><strong>Contratações — Por Status:</strong> Relatório que agrupa as contratações por seu status atual (não iniciado, em andamento, concluído, sobrestado), incluindo a situação do prazo (no prazo, próximo ao vencimento, vencido). Ideal para acompanhamento do andamento geral do PCA.</>,
            <><strong>Contratações — Por Setor:</strong> Relatório organizado por setor requisitante, exibindo código PCA, descrição, prioridade e valores. Útil para reuniões setoriais e prestação de contas por área.</>,
            <><strong>Auditoria — Conformidade:</strong> Relatório que apresenta o percentual de conformidade documental de cada contratação, com base no checklist de auditoria (Fases de Licitação e Contratação). Permite identificar processos com documentação incompleta.</>,
            <><strong>Prazos — Críticos e Alertas:</strong> Relatório focado exclusivamente em contratações com prazos vencidos ou próximos ao vencimento. Filtra automaticamente apenas os processos que demandam atenção imediata, ordenando-os por criticidade.</>,
          ]} />

          <H3>15.2. Filtros Avançados</H3>
          <P>Todos os relatórios podem ser refinados por meio de um painel completo de filtros, que inclui:</P>
          <UL items={[
            <><strong>Unidade Orçamentária:</strong> PGJ, FMMP, FEPDC ou todas.</>,
            <><strong>Setor Requisitante:</strong> Qualquer um dos 13 setores cadastrados.</>,
            <><strong>Tipo de Contratação:</strong> Aquisição, Serviço Continuado, Obra, etc.</>,
            <><strong>Tipo de Recurso:</strong> Filtragem por fonte de financiamento.</>,
            <><strong>Classe:</strong> Material ou Serviço.</>,
            <><strong>Grau de Prioridade:</strong> Alta, Média ou Baixa.</>,
            <><strong>Normativo:</strong> Lei 8.666/1993 ou Lei 14.133/2021.</>,
            <><strong>Modalidade:</strong> Pregão, Concorrência, Dispensa, etc.</>,
            <><strong>Etapa do Processo:</strong> Não iniciado, em andamento, concluído ou sobrestado.</>,
          ]} />

          <H3>15.3. Formatos de Exportação</H3>
          <P>Cada relatório pode ser exportado em dois formatos:</P>
          <UL items={[
            <><strong>PDF:</strong> Documento formatado para impressão e compartilhamento, com cabeçalho institucional do MPPI, data de geração, filtros aplicados e tabela estilizada. Abre em uma nova aba do navegador para visualização e impressão.</>,
            <><strong>CSV:</strong> Arquivo de dados separados por vírgula, compatível com Microsoft Excel, Google Sheets e outros softwares de planilha. Ideal para análises adicionais, cruzamentos de dados e elaboração de gráficos personalizados.</>,
          ]} />

          <H3>15.4. Visualização Prévia</H3>
          <P>
            Antes de exportar, o usuário pode visualizar o relatório diretamente na tela do sistema. A tabela de prévia exibe os mesmos dados que serão incluídos no documento exportado, permitindo verificar se os filtros aplicados estão corretos e se o relatório contém as informações desejadas.
          </P>

          <H3>15.5. Finalidade Estratégica</H3>
          <P>
            O módulo de Relatórios é a principal ferramenta de <strong>comunicação institucional</strong> e <strong>prestação de contas</strong> do sistema PCA 2026. Seus documentos atendem a diversas finalidades:
          </P>
          <UL items={[
            <><strong>Prestação de contas aos órgãos de controle:</strong> Os relatórios detalhados e de conformidade fornecem evidências documentais do cumprimento das obrigações legais de planejamento e execução de contratações públicas.</>,
            <><strong>Suporte a decisões da alta gestão:</strong> Relatórios por setor e por status permitem que a Procuradoria-Geral e a ASSESPPLAGES identifiquem rapidamente áreas que necessitam de reforço, redistribuição de recursos ou intervenção direta.</>,
            <><strong>Reuniões de acompanhamento:</strong> Os relatórios em PDF podem ser impressos ou projetados em reuniões periódicas de acompanhamento do PCA, servindo como base objetiva para discussões e deliberações.</>,
            <><strong>Análises avançadas:</strong> A exportação em CSV permite que analistas e gestores realizem cruzamentos de dados, construam gráficos customizados e integrem as informações do PCA com outras bases de dados institucionais.</>,
            <><strong>Transparência e publicidade:</strong> Os relatórios podem ser utilizados para atender demandas de transparência pública e solicitações de informação sobre as contratações planejadas e executadas pelo MPPI.</>,
          ]} />
        </Section>

        {/* 16. Orçamento */}
        <Section id="sec16" title="16. Orçamento Planejado">
          <P>Exclusivo do <strong>Administrador</strong>. Define limites orçamentários anuais para os 13 setores.</P>

          <H3>16.1. Fontes de Recurso</H3>
          <UL items={[
            <><strong>PGJ:</strong> Orçamento principal do MPPI.</>,
            <><strong>FMMP:</strong> Fundo de Modernização do Ministério Público.</>,
            <><strong>FEPDC:</strong> Fundo Estadual de Proteção e Defesa do Consumidor.</>,
          ]} />

          <H3>16.2. Trava Orçamentária</H3>
          <P>Quando ativada, bloqueia novas contratações que ultrapassem o limite. O interruptor (switch) permite ativar/desativar por setor.</P>

          <H3>16.3. Auditoria</H3>
          <P>Todas as alterações são registradas com data, usuário, valores anteriores e novos. Acessível pelo botão <strong>"Histórico"</strong>.</P>
        </Section>

        {/* 17. Gerenciamento */}
        <Section id="sec17" title="17. Gerenciamento de Usuários">
          <P>Exclusivo do <strong>Administrador</strong>.</P>

          <H3>17.1. Criar Usuário</H3>
          <OL items={[
            <>Clique em <strong>"Novo Usuário"</strong>.</>,
            "Preencha: Nome, E-mail, Setor, Cargo, Perfil de Acesso e Senha Temporária.",
            <>Clique em <strong>"Criar"</strong>.</>,
          ]} />
          <Note>O sistema NÃO envia e-mails automáticos. Comunique as credenciais diretamente ao novo servidor.</Note>

          <H3>17.2. Editar e Excluir</H3>
          <P>Use os ícones de lápis (editar) e lixeira (excluir) na tabela. A exclusão é permanente e irreversível.</P>

          <H3>17.3. Política de Acessos</H3>
          <P>O botão <strong>"Política de Acessos"</strong> abre um modal com a descrição de cada perfil e a Matriz de Acesso completa.</P>
        </Section>

        {/* 18. Notificações */}
        <Section id="sec18" title="18. Notificações">
          <P>
            O módulo <strong>Central de Notificações</strong> é o canal oficial de comunicação rápida do sistema PCA 2026, permitindo que a administração envie alertas, avisos e mensagens importantes a todos os usuários da plataforma de forma instantânea. A criação e o gerenciamento de notificações são exclusivos do perfil <strong>Administrador</strong>, enquanto todos os demais perfis (<strong>Gestor</strong>, <strong>Setor Requisitante</strong> e <strong>Consulta</strong>) podem visualizar as notificações recebidas.
          </P>

          <H3>18.1. Como Criar uma Notificação</H3>
          <P>Para criar e disparar uma nova notificação, o Administrador deve acessar a página <strong>"Notificações"</strong> no menu lateral e preencher o formulário disponível no card <strong>"Nova Notificação"</strong>:</P>
          <OL items={[
            <><strong>Título Curto (máx. 50 caracteres):</strong> Um resumo objetivo do assunto da notificação. Exemplo: "Prazo de encerramento prorrogado" ou "Novo normativo aplicável".</>,
            <><strong>Mensagem Direta (máx. 150 caracteres):</strong> O conteúdo da notificação, que deve ser claro e direto. Este texto será exibido a todos os usuários.</>,
            <>Clique em <strong>"Disparar para Usuários"</strong> para enviar a notificação imediatamente.</>,
          ]} />
          <Note>
            As notificações são enviadas instantaneamente e ficam visíveis para todos os usuários do sistema. Certifique-se de que o conteúdo está correto antes de disparar.
          </Note>

          <H3>18.2. Como os Usuários Recebem as Notificações</H3>
          <P>
            Todas as notificações ativas são exibidas no <strong>ícone de sino (🔔)</strong> localizado no canto superior direito do cabeçalho do sistema, visível em todas as páginas. O funcionamento é o seguinte:
          </P>
          <UL items={[
            <><strong>Indicador de não lida:</strong> Quando há notificações que o usuário ainda não visualizou, um <strong>ponto vermelho</strong> aparece sobre o ícone do sino, sinalizando que existem mensagens pendentes.</>,
            <><strong>Dropdown de notificações:</strong> Ao clicar no sino, um menu suspenso exibe a lista de notificações ativas, mostrando o título, a mensagem e a data/hora de criação de cada uma.</>,
            <><strong>Marcação automática como lida:</strong> Ao abrir o dropdown, todas as notificações são automaticamente marcadas como lidas para aquele usuário. O ponto vermelho desaparece, indicando que não há novas mensagens.</>,
            <><strong>Controle individual de leitura:</strong> Cada usuário possui seu próprio registro de leitura. Ou seja, o fato de um usuário ter lido uma notificação não afeta o status de leitura dos demais usuários.</>,
          ]} />

          <H3>18.3. Gerenciamento de Notificações</H3>
          <P>
            Na página de Notificações, o Administrador visualiza o <strong>Histórico de Notificações Ativas</strong> em uma tabela que exibe o título, a mensagem e a data de criação de cada notificação. As seguintes ações estão disponíveis:
          </P>
          <UL items={[
            <><strong>Excluir (inativar):</strong> O Administrador pode remover uma notificação clicando no ícone de lixeira (🗑️). A exclusão é lógica — a notificação é marcada como inativa e desaparece do painel de todos os usuários, mas permanece registrada no banco de dados para fins de auditoria. Uma confirmação é solicitada antes da exclusão.</>,
          ]} />

          <H3>18.4. Casos de Uso Recomendados</H3>
          <P>A Central de Notificações é ideal para comunicar:</P>
          <UL items={[
            "Prorrogações ou alterações de prazos do PCA.",
            "Publicação de novos normativos ou orientações que afetem as contratações.",
            "Avisos sobre manutenções programadas no sistema.",
            "Comunicados institucionais da ASSESPPLAGES.",
            "Alertas sobre mudanças orçamentárias ou bloqueios de trava.",
            "Lembretes sobre datas-limite para envio de documentação.",
          ]} />

          <H3>18.5. Limitações</H3>
          <P>
            O sistema de notificações é <strong>unidirecional</strong>: apenas o Administrador pode criar e enviar mensagens. Não há funcionalidade de resposta ou interação por parte dos demais usuários. As notificações também não são enviadas por e-mail — são exibidas exclusivamente dentro do sistema PCA 2026.
          </P>
        </Section>

        <Section id="sec19" title="19. Minha Conta">
          <P>A página <strong>Minha Conta</strong> está disponível para <strong>todos os perfis de acesso</strong> e permite que cada usuário gerencie suas informações pessoais dentro do sistema. Manter esses dados atualizados é fundamental para garantir a correta identificação do responsável em cada ação registrada, facilitar a comunicação entre os setores e assegurar a rastreabilidade das operações realizadas.</P>

          <H3>Informações Editáveis</H3>
          <UL items={[
            <><strong>Nome completo:</strong> Utilizado na identificação do usuário em históricos, relatórios e registros de auditoria. É essencial que esteja correto e atualizado.</>,
            <><strong>Ramal:</strong> Facilita o contato direto entre setores para esclarecimentos sobre demandas e processos.</>,
            <><strong>Avatar:</strong> O usuário pode personalizar sua foto de perfil escolhendo entre uma galeria pré-definida de imagens ou fazendo upload de uma foto pessoal.</>,
          ]} />

          <H3>Informações Somente Leitura</H3>
          <P>Os campos <strong>e-mail</strong>, <strong>setor</strong> e <strong>cargo</strong> são exibidos apenas para consulta e não podem ser alterados pelo próprio usuário. Caso haja necessidade de correção nesses dados, o usuário deve solicitar a atualização a um administrador do sistema.</P>

          <H3>Alteração de Senha</H3>
          <P>A página também oferece a funcionalidade de <strong>troca de senha</strong>, permitindo que o usuário atualize sua credencial de acesso a qualquer momento. Recomenda-se alterar a senha periodicamente para manter a segurança da conta, especialmente após o primeiro acesso ao sistema.</P>
        </Section>

        <Section id="sec20" title="20. FAQ / Dúvidas">
          <P>A seção de <strong>FAQ (Perguntas Frequentes)</strong> reúne as dúvidas mais comuns sobre o funcionamento do sistema em formato de acordeão expansível, permitindo consulta rápida e objetiva.</P>

          <H3>Conteúdo da Seção</H3>
          <UL items={[
            "Respostas para dúvidas operacionais sobre cadastro, edição e exclusão de demandas.",
            "Orientações sobre funcionalidades específicas como filtros, relatórios e orçamento.",
            "Esclarecimentos sobre perfis de acesso e permissões do sistema.",
          ]} />

          <H3>Canais de Suporte</H3>
          <P>Ao final da página, o sistema disponibiliza os <strong>canais oficiais de suporte</strong> para questões que não estejam contempladas nas perguntas frequentes:</P>
          <UL items={[
            <><strong>CLC (Coordenadoria de Licitações e Contratos):</strong> canal de suporte para dúvidas relacionadas aos processos licitatórios, etapas do certame, documentação e conformidade.</>,
            <><strong>ASSESPPLAGES (Assessoria de Planejamento e Gestão):</strong> canal de suporte para questões de planejamento, orçamento, priorização de demandas e funcionamento geral do sistema PCA.</>,
          ]} />

          <P>Os contatos incluem <strong>e-mail</strong> e <strong>ramal telefônico</strong> de cada setor, facilitando o acesso direto à equipe responsável conforme a natureza da dúvida.</P>
        </Section>

        {/* 21. Glossário */}
        <Section id="sec21" title="21. Glossário de Termos e Siglas">
          <H3>Siglas</H3>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-xs">
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
            <table className="w-full text-xs">
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
            <table className="w-full text-xs">
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

const MATRIX = [
  ["Home / Visão Geral", "Completo", "Completo", "Apenas seu setor", "Somente leitura"],
  ["Contratações", "CRUD completo", "Visualizar e editar", "Edita rascunhos", "Somente leitura"],
  ["Nova Contratação", "✓", "✓", "✓ (setor fixo)", "✗"],
  ["Setores Demandantes", "✓", "✓", "✗", "✗"],
  ["Controle de Prazos", "✓", "✓", "Apenas seu setor", "✗"],
  ["Pontos de Atenção", "✓", "✓", "Apenas seu setor", "✗"],
  ["Prioridades", "✓", "✓", "Apenas seu setor", "✗"],
  ["Conformidade", "Gerenciar", "Gerenciar", "✗", "✗"],
  ["Resultados", "✓", "✓", "✗", "✗"],
  ["Relatórios", "Gerar e exportar", "Gerar e exportar", "✗", "✗"],
  ["Orçamento Planejado", "Gerenciar completo", "✗", "✗", "✗"],
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
  ["Modalidade", "Sim", "Pregão, Dispensa, Inexigibilidade, Concorrência"],
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
