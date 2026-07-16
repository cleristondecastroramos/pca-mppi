import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BookOpen, LogIn, LayoutDashboard, PlusSquare, Search, Send, MessageSquare, FileText, CheckCircle2, HelpCircle, FileDown, Loader2, Lightbulb, AlertTriangle } from "lucide-react";
import { generateTutorialPdf2027 } from "@/utils/tutorialPdf";
import { toast } from "sonner";

export default function Tutorial2027() {
  const [generating, setGenerating] = useState(false);

  const handleExportPdf = async () => {
    setGenerating(true);
    try {
      await generateTutorialPdf2027();
    } catch (e: any) {
      toast.error("Erro ao gerar PDF: " + e.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-in fade-in duration-500">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary" />
              Guia de Planejamento PCA 2027
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 mt-2 max-w-3xl">
              Bem-vindo ao tutorial oficial para Unidades Requisitantes. Este guia passo a passo ajudará você a navegar no sistema, cadastrar suas demandas corretamente utilizando o catálogo federal, acompanhar a aprovação e exportar relatórios de suas necessidades para 2027.
            </p>
          </div>
          <Button
            onClick={handleExportPdf}
            disabled={generating}
            className="bg-primary hover:bg-primary/90 text-white font-semibold flex-shrink-0"
          >
            {generating ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Gerando PDF...</>
            ) : (
              <><FileDown className="h-4 w-4 mr-2" /> Exportar Tutorial</>
            )}
          </Button>
        </div>

        <Alert className="bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-800 dark:text-blue-300 font-bold">Dica de Navegação</AlertTitle>
          <AlertDescription className="text-blue-700/80 dark:text-blue-400/80 mt-1">
            Recomendamos exportar este tutorial em PDF clicando no botão acima para tê-lo como manual de consulta rápida no seu computador enquanto você utiliza o sistema de demandas.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6">
          
          <Card id="apresentacao">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                1. Apresentação do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-600 dark:text-slate-300">
              <p>O <strong>Plano de Contratações Anual (PCA) 2027</strong> é a ferramenta oficial do Ministério Público do Estado do Piauí (MPPI) para consolidar todas as necessidades de aquisição de bens e serviços. A principal inovação do PCA 2027 é a padronização das contratações por meio da obrigatoriedade do uso do catálogo federal (CATMAT e CATSER).</p>
              <p>Este tutorial foi elaborado especialmente para servir de guia definitivo para as <strong>Unidades Requisitantes</strong>. Seu objetivo é conduzir você desde o primeiro acesso até o momento em que sua unidade cadastra, acompanha e compreende as aprovações de suas demandas de contratação para 2027.</p>
              
              <Alert className="bg-rose-50/50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 mt-4">
                <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                <AlertTitle className="text-rose-800 dark:text-rose-300 font-bold">Lembre-se</AlertTitle>
                <AlertDescription className="text-rose-700/80 dark:text-rose-400/80 mt-1">
                  O papel das <strong>unidades requisitantes</strong> é planejar e inserir as demandas. O papel da <strong>equipe administradora (gestores de licitação)</strong> é consolidar e aprovar tecnicamente essas demandas.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card id="acesso">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <LogIn className="h-6 w-6 text-primary" />
                2. Acesso ao Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-600 dark:text-slate-300">
              <p>Para entrar no sistema, você deverá utilizar as credenciais (e-mail institucional e senha provisória) fornecidas pela administração.</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Autenticação:</strong> Acesse o link oficial do PCA e insira suas credenciais.</li>
                <li><strong>Troca de Senha:</strong> No primeiro acesso, o sistema exigirá que a senha provisória seja substituída por uma senha pessoal segura. A navegação será bloqueada até que isso seja feito.</li>
                <li><strong>Navegação:</strong> Após realizar o login e configurar sua senha, você será direcionado à Home (Página Inicial). Para acessar a área de demandas do próximo ano, localize e clique em <em>"Painel Planejamento"</em> no menu lateral esquerdo.</li>
              </ul>
            </CardContent>
          </Card>

          <Card id="visao_geral">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <LayoutDashboard className="h-6 w-6 text-primary" />
                3. Visão Geral da Navegação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-600 dark:text-slate-300">
              <p>O menu lateral do sistema agrupa todas as rotas de interesse. Entender as diferenças de visão entre perfis é essencial:</p>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li><strong>Perfil Demandante:</strong> Visualiza, edita e exclui apenas as demandas enviadas por sua própria unidade. Não consegue ver as necessidades de outros setores.</li>
                <li><strong>Perfil Administrador:</strong> Tem acesso total ao sistema. Consegue enxergar todas as demandas de todas as unidades, além de possuir permissão exclusiva para Aprovar, Aprovar Parcialmente ou Não Aprovar itens.</li>
              </ul>
              <p>Na página principal de "Planejamento PCA 2027", você verá no topo painéis com os valores totais, além de botões rápidos para <strong>Recarregar</strong> a página e <strong>Apresentar Nova Demanda</strong>.</p>
            </CardContent>
          </Card>

          <Card id="cadastro">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <PlusSquare className="h-6 w-6 text-primary" />
                4. Cadastro de Nova Demanda
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-600 dark:text-slate-300">
              <p>Cadastrar uma demanda significa formalizar a necessidade de aquisição. O formulário foi otimizado para evitar erros. Siga este fluxo:</p>
              
              <div className="grid gap-3 mt-4">
                <div className="flex gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                  <div className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm">1</div>
                  <div><strong>Acesse:</strong> Clique em "Nova Demanda" no menu ou no botão azul da página de Planejamento.</div>
                </div>
                <div className="flex gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                  <div className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm">2</div>
                  <div><strong>Unidade:</strong> Caso seu perfil esteja associado a uma unidade específica, o campo será preenchido e bloqueado automaticamente. Caso contrário, selecione a unidade desejada.</div>
                </div>
                <div className="flex gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                  <div className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm">3</div>
                  <div><strong>Catálogo (O Primeiro Passo):</strong> A busca pelo objeto a ser contratado no campo de pesquisa do catálogo interno é o primeiro passo para encontrar o item correto. Falaremos detalhadamente sobre isso na próxima seção.</div>
                </div>
                <div className="flex gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                  <div className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm">4</div>
                  <div><strong>Justificativa (Atenção Especial):</strong> A justificativa é um campo extremamente importante para a análise administrativa. Explique de forma clara o motivo da contratação. Por que o MPPI precisa desse item ou serviço? Detalhe especificidades que o catálogo federal não cobre, pois isso embasará a decisão técnica.</div>
                </div>
                <div className="flex gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                  <div className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm">5</div>
                  <div><strong>Quantidades e Valores:</strong> Preencha a Quantidade necessária, a Unidade de Medida (ex: Pacotes, Caixas, Meses) e faça uma estimativa do Valor Unitário. O valor total é calculado automaticamente com base na quantidade e no valor unitário.</div>
                </div>
                <div className="flex gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                  <div className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm">6</div>
                  <div><strong>Prioridade e Envio:</strong> Informe a prioridade (Alta, Média ou Baixa) para fins estratégicos, revise todos os campos e clique em "Cadastrar Demanda".</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card id="catalogo">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Search className="h-6 w-6 text-primary" />
                5. Uso do Catálogo Interno
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-600 dark:text-slate-300">
              <p>A escolha do item correto é o passo mais importante do cadastro. O sistema bloqueia a digitação de textos livres para evitar que um mesmo produto seja solicitado com dezenas de nomes diferentes.</p>
              
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li><strong>Pesquisa:</strong> Você pode filtrar primeiramente entre as bases de Materiais (CATMAT) e Serviços (CATSER).</li>
                <li><strong>Grupo e Categoria:</strong> Utilize os menus suspensos para afunilar sua busca a um grupo específico (Ex: Informática, Copa e Cozinha). Lembre-se: o grupo filtrado pode reduzir bastante o número de resultados indesejados e facilitar a localização do seu item.</li>
                <li><strong>Dica Prática:</strong> Evite palavras muito restritivas. Se precisa de uma cadeira giratória preta ergonômica, pesquise apenas por "Cadeira" e depois detalhe a especificidade ("preta", "ergonômica") na sua Justificativa.</li>
              </ul>

              <Alert className="bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <AlertTitle className="text-emerald-800 dark:text-emerald-300 font-bold">Boa Prática</AlertTitle>
                <AlertDescription className="text-emerald-700/80 dark:text-emerald-400/80 mt-1">
                  Selecione a opção que melhor descreva a classe geral do seu pedido e deixe as minúcias para o campo "Justificativa". Assim você evita retrabalho caso a administração decida consolidar itens de mesma natureza em um grande lote de compras.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card id="envio">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Send className="h-6 w-6 text-primary" />
                6. Envio e Acompanhamento da Demanda
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-600 dark:text-slate-300">
              <p>Após enviar a demanda, ela será encaminhada diretamente para a fila da área administrativa.</p>
              <p>Na página de Planejamento, uma tabela exibirá todas as suas solicitações. Depois do envio, a demanda entra em fase de acompanhamento e não deve ser alterada sem um critério ou real necessidade de ajuste. Preste muita atenção à coluna <strong>Situação</strong>:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 p-4 rounded-lg">
                  <div className="font-bold text-amber-700 dark:text-amber-400 mb-1">Demanda Enviada. Aguardando Análise</div>
                  <div className="text-sm">A solicitação aguarda o crivo do gestor. Neste estágio, você pode utilizar os botões ao final da linha (ícone de lápis) para editar as quantidades/justificativas, ou excluir o registro caso desista da contratação.</div>
                </div>
                <div className="border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800 p-4 rounded-lg">
                  <div className="font-bold text-emerald-700 dark:text-emerald-400 mb-1">Aprovada Integralmente</div>
                  <div className="text-sm">Seu pedido foi aceito pela área técnica do MPPI exatamente com os valores e quantitativos que foram enviados.</div>
                </div>
                <div className="border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 p-4 rounded-lg">
                  <div className="font-bold text-blue-700 dark:text-blue-400 mb-1">Aprovada Parcialmente</div>
                  <div className="text-sm">O pedido foi aceito para consolidar o Plano, porém a administração reduziu a quantidade solicitada ou ajustou os valores estipulados.</div>
                </div>
                <div className="border border-rose-200 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-800 p-4 rounded-lg">
                  <div className="font-bold text-rose-700 dark:text-rose-400 mb-1">Não Aprovada</div>
                  <div className="text-sm">O pedido foi indeferido pela gestão técnica e não fará parte do Plano de 2027.</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card id="feedback">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-primary" />
                7. Feedback da Análise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-600 dark:text-slate-300">
              <p>Sempre que uma demanda for aprovada parcialmente ou não aprovada, o sistema exige que o Administrador digite um motivo justificando sua decisão.</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Como visualizar o motivo:</strong> Na tabela principal, demandas com esse status exibirão um botão azul com a inscrição "Ver Motivo". Basta clicar para ler a justificativa do avaliador.</li>
                <li><strong>Bloqueio de Edição:</strong> Assim que a demanda receber qualquer tipo de resposta do Administrador (Aprovação ou Rejeição), ela se torna um documento oficial do planejamento. Portanto, os botões de editar e excluir <strong>desaparecerão</strong> para a sua unidade. Você terá apenas acesso de leitura.</li>
              </ul>
            </CardContent>
          </Card>

          <Card id="relatorios">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                8. Relatórios e Exportação PDF
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-600 dark:text-slate-300">
              <p>O PCA 2027 disponibiliza recursos práticos para a emissão de relatórios consolidados diretamente da página de Planejamento.</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Como gerar relatórios:</strong> Acima da tabela, você encontrará um ícone de documento ao lado do botão Recarregar. Ele permite gerar instantaneamente um PDF gerencial.</li>
                <li><strong>Integração de Filtros:</strong> O PDF exportado respeita rigorosamente os filtros da tela. Se você aplicar um filtro para visualizar apenas itens com prioridade "Alta" e situação "Não Aprovada", o PDF refletirá somente esses dados. O documento também inclui cabeçalhos oficiais do MPPI e paginação, tornando-o perfeito para ser anexado em prestação de contas internas ou reuniões.</li>
              </ul>
            </CardContent>
          </Card>

          <Card id="aprovacao">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-primary" />
                9. Aprovação Administrativa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-600 dark:text-slate-300">
              <p>Embora este tutorial seja voltado para quem envia demandas, é importante compreender como o Administrador atua nos bastidores:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Exclusividade:</strong> O demandante propõe. O Administrador dispõe. Apenas perfis gestores podem alterar o status de uma demanda para Aprovada ou Não Aprovada.</li>
                <li><strong>Transparência:</strong> O Sistema bloqueia ações silenciosas de cortes. Sempre que a administração cortar a quantidade ou barrar uma demanda, a equipe de licitações é forçada pelo software a detalhar um Motivo, garantindo total transparência à unidade solicitante.</li>
              </ul>
            </CardContent>
          </Card>

          <Card id="duvidas">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <HelpCircle className="h-6 w-6 text-primary" />
                10. Dúvidas Frequentes e Boas Práticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full text-slate-600 dark:text-slate-300">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-left font-semibold">Como evitar o preenchimento incorreto?</AccordionTrigger>
                  <AccordionContent>
                    Sempre faça uma boa pesquisa antes de selecionar o item do catálogo e utilize o campo Justificativa com bastante atenção para explicar o contexto. Além disso, confira se o Valor Unitário Estimado condiz minimamente com a realidade de mercado.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-left font-semibold">O que fazer se eu não encontrar o item exato que desejo?</AccordionTrigger>
                  <AccordionContent>
                    Busque por sinônimos ou selecione a categoria mais abrangente possível (Ex: Em vez de "Teclado mecânico switch azul", busque por "Teclado Padrão" e detalhe o switch na sua justificativa). O catálogo federal é estruturado em níveis de generalização e muitas vezes os itens são agrupados por similaridade para facilitar compras conjuntas.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-left font-semibold">Como revisar minha demanda após enviar?</AccordionTrigger>
                  <AccordionContent>
                    Após o envio, enquanto ela constar como "Aguardando Análise", navegue até a página de Planejamento e clique no ícone do lápis ao final da linha da sua demanda para revisar e ajustar valores. Lembre-se: após a decisão administrativa, a edição será desativada.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-left font-semibold">Preciso de Apoio Técnico, com quem falo?</AccordionTrigger>
                  <AccordionContent>
                    Caso enfrente problemas de acesso, senhas, bloqueio indevido de telas ou dúvidas sobre enquadramento técnico no CATMAT/CATSER, entre em contato com a equipe gestora de licitações pelo e-mail ou ramal oficial de suporte ao planejamento do MPPI.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

        </div>
      </div>
    </Layout>
  );
}
