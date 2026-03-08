import { Layout } from "@/components/Layout";

export default function Tutorial() {
  return (
    <Layout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-xl font-bold text-foreground">📖 Tutorial Completo do Sistema PCA 2026</h1>
          <p className="text-sm text-muted-foreground">
            Sistema de Gerenciamento do Plano de Contratações Anual — Ministério Público do Estado do Piauí
          </p>
          <p className="text-xs text-muted-foreground mt-1">Versão 1.0 · Março de 2026 · ASSESPPLAGES</p>
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
            <><strong>Administradores do sistema</strong> (ASSESPPLAGES): Responsáveis pela gestão global, cadastro de usuários e configurações.</>,
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
            <>Abra o navegador e acesse o endereço do sistema: <strong>https://pca-mppi.lovable.app</strong></>,
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
            <><strong>Valor Executado Total:</strong> Soma dos empenhos (Empenho 1 + 2 + 3).</>,
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

        {/* 9-12 */}
        <Section id="sec9" title="9. Setores Demandantes">
          <P>Visão consolidada por setor requisitante. Disponível para <strong>Administrador</strong> e <strong>Gestor</strong>. Exibe quantidade, valor estimado, distribuição por status e prioridade de cada setor.</P>
        </Section>

        <Section id="sec10" title="10. Controle de Prazos">
          <P>Acompanhamento dos prazos de cada contratação: data prevista, envio ao PGEA, finalização da licitação e conclusão. Alertas para prazos vencidos ou próximos ao vencimento. Disponível para <strong>Admin</strong>, <strong>Gestor</strong> e <strong>Setor Requisitante</strong> (somente seu setor).</P>
        </Section>

        <Section id="sec11" title="11. Pontos de Atenção">
          <P>Destaca contratações que exigem atenção especial: prazos vencidos, devoluções, sobrestamentos e valores elevados sem evolução. Classifica por critérios de urgência e impacto. Disponível para <strong>Admin</strong>, <strong>Gestor</strong> e <strong>Setor Requisitante</strong>.</P>
        </Section>

        <Section id="sec12" title="12. Prioridades de Contratação">
          <P>Organiza contratações por grau de prioridade (Alta, Média, Baixa) e alinhamento estratégico com os objetivos do MPPI. Disponível para <strong>Admin</strong>, <strong>Gestor</strong> e <strong>Setor Requisitante</strong>.</P>
        </Section>

        {/* 13. Conformidade */}
        <Section id="sec13" title="13. Avaliação e Conformidade">
          <P>Checklist de conformidade documental para cada contratação. Disponível para <strong>Admin</strong> e <strong>Gestor</strong>.</P>
          <H3>Itens do Checklist</H3>
          <OL items={[
            "Termo de Referência Aprovado",
            "Pesquisa de Mercado",
            "Pareceres Jurídicos",
            "Publicação do Edital",
            "Atas do Certame",
            "Atos de Autorização",
            "Documentação do Fornecedor",
            "Termo de Homologação",
            "Termo de Adjudicação",
            "Assinatura do Contrato",
            "Publicação do Contrato",
          ]} />
          <P>Campo de observação textual para particularidades ou pendências.</P>
        </Section>

        {/* 14-15 */}
        <Section id="sec14" title="14. Resultados Alcançados">
          <P>Indicadores de desempenho: percentual concluído vs. planejado, economia obtida, taxa de sucesso e evolução temporal. Comparativos planejado x realizado. Disponível para <strong>Admin</strong> e <strong>Gestor</strong>.</P>
        </Section>

        <Section id="sec15" title="15. Relatórios">
          <P>Geração de relatórios gerenciais: geral, por setor, por UO, de prazos e de conformidade. Com opções de exportação. Disponível para <strong>Admin</strong> e <strong>Gestor</strong>.</P>
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

        {/* 18-20 */}
        <Section id="sec18" title="18. Notificações">
          <P>O <strong>Administrador</strong> pode criar e gerenciar notificações do sistema. Demais perfis podem apenas visualizar notificações publicadas.</P>
        </Section>

        <Section id="sec19" title="19. Minha Conta">
          <P>Disponível para <strong>todos os perfis</strong>. Permite editar:</P>
          <UL items={[
            "Nome completo e ramal.",
            "Avatar (galeria pré-definida ou upload de foto pessoal).",
          ]} />
          <P>E-mail, setor e cargo são exibidos como informação (somente leitura).</P>
        </Section>

        <Section id="sec20" title="20. FAQ / Dúvidas">
          <P>Perguntas frequentes em formato expansível (acordeão). Inclui informações de contato da ASSESPPLAGES para suporte técnico e funcional.</P>
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
  return <p className="text-sm text-foreground/90 leading-relaxed">{children}</p>;
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
  ["PGEA", "Plano de Gestão Estratégica e Administrativo"],
  ["CLC", "Coordenadoria de Licitações e Contratos"],
  ["PDM", "Padrão Descritivo de Material"],
  ["CATSER", "Catálogo de Serviços"],
  ["ASSESPPLAGES", "Assessoria de Planejamento e Gestão"],
];

const SETORES = [
  ["CAA", "Coordenadoria de Apoio Administrativo"],
  ["CCF", "Coordenadoria de Controle Financeiro"],
  ["CCS", "Coordenadoria de Comunicação Social"],
  ["CEAF", "Centro de Estudos e Aperfeiçoamento Funcional"],
  ["CLC", "Coordenadoria de Licitações e Contratos"],
  ["CONINT", "Controladoria Interna"],
  ["CPPT", "Coordenadoria de Planejamento e Projetos de TI"],
  ["CRH", "Coordenadoria de Recursos Humanos"],
  ["CTI", "Coordenadoria de Tecnologia da Informação"],
  ["GAECO", "Grupo de Atuação Especial de Combate ao Crime Organizado"],
  ["GSI", "Gabinete de Segurança Institucional"],
  ["PLAN", "Assessoria de Planejamento (PLANEJAMENTO)"],
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
  ["Código PCA", "Identificador único no formato PCA-XXXX-2026."],
  ["Modalidade Licitatória", "Procedimento legal para seleção do fornecedor."],
  ["Normativo", "Lei de licitações que rege o processo."],
];
