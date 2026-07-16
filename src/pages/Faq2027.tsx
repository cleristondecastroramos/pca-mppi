import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Mail, Phone, Building2, UserCircle, MessageSquare, HelpCircle, Lightbulb, Search, CheckCircle2 } from "lucide-react";

const Faq2027 = () => {
  return (
    <Layout>
      <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-in fade-in duration-500">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <HelpCircle className="h-8 w-8 text-primary" />
              Central de Ajuda e Dúvidas Frequentes — PCA 2027
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 mt-2 max-w-3xl">
              Bem-vindo ao espaço de suporte do Plano de Contratações Anual de 2027. Aqui você encontra respostas rápidas para as dúvidas mais comuns sobre o novo modelo estruturado de captação de demandas e uso do catálogo federal.
            </p>
          </div>
        </div>

        <Alert className="bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-800 dark:text-blue-300 font-bold">Dica Rápida</AlertTitle>
          <AlertDescription className="text-blue-700/80 dark:text-blue-400/80 mt-1">
            Recomendamos que você também consulte o nosso <strong>Tutorial Interativo</strong> na página <strong>/tutorial-2027</strong>. Lá existe um guia passo a passo completo sobre como navegar e usar o sistema.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6">
          
          {/* Sessão 1: Cadastro e Sistema */}
          <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                1. Regras de Cadastro e Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Accordion type="single" collapsible className="w-full text-slate-600 dark:text-slate-300">
                <AccordionItem value="cadastro-1">
                  <AccordionTrigger className="text-left font-semibold">Como cadastrar uma demanda para o PCA 2027?</AccordionTrigger>
                  <AccordionContent className="leading-relaxed">
                    No menu lateral esquerdo, clique em <strong>Nova Demanda 2027</strong>. Você deverá obrigatoriamente realizar uma busca por um item ou serviço no catálogo interno. Em seguida, preencha a Justificativa (detalhando a real necessidade), insira a quantidade desejada, o valor unitário estimado e o grau de prioridade.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="cadastro-2">
                  <AccordionTrigger className="text-left font-semibold">Posso editar ou excluir uma demanda após o envio?</AccordionTrigger>
                  <AccordionContent className="leading-relaxed">
                    <strong>Sim, mas com ressalvas.</strong> Você pode editar e excluir qualquer demanda sua que estiver com o status <em>"Demanda Enviada. Aguardando Análise"</em>. Assim que o Gestor ou Administrador realizar a análise e der um veredito (aprovando total, parcial ou rejeitando), a demanda será bloqueada para edições, pois ela passa a fazer parte oficial do processo de planejamento do órgão.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="cadastro-3">
                  <AccordionTrigger className="text-left font-semibold">Existe limite de orçamento planejado para o PCA 2027 por unidade?</AccordionTrigger>
                  <AccordionContent className="leading-relaxed">
                    Durante a fase de captação de demandas pelas Unidades Requisitantes, o foco está em levantar a <strong>real necessidade</strong> dos setores para o ano seguinte. As travas, cortes e conciliações orçamentárias rígidas serão feitas posteriormente na etapa de consolidação do plano, sob coordenação da Assessoria de Planejamento. Contudo, pede-se razoabilidade nos pedidos.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Sessão 2: Catálogo CATMAT/CATSER */}
          <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                2. Catálogo Federal (CATMAT / CATSER)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Accordion type="single" collapsible className="w-full text-slate-600 dark:text-slate-300">
                <AccordionItem value="cat-1">
                  <AccordionTrigger className="text-left font-semibold">Por que sou obrigado a usar um item do Catálogo?</AccordionTrigger>
                  <AccordionContent className="leading-relaxed">
                    Para o ano de 2027, o MPPI adotou a padronização obrigatória com o catálogo oficial do Governo Federal (Compras.gov.br). Isso evita a duplicação de itens (ex: um setor pedir "Cadeira Giratória" e outro pedir "Assento de Escritório"), reduz erros de descrição técnica e facilita compras conjuntas em lote.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="cat-2">
                  <AccordionTrigger className="text-left font-semibold">O que fazer se eu não achar exatamente a marca ou o modelo que preciso?</AccordionTrigger>
                  <AccordionContent className="leading-relaxed">
                    O catálogo federal é estruturado em níveis de generalização. Se você não achar um item ultra-específico, busque pelo item genérico correspondente (ex: "Computador Desktop") e detalhe todas as especificações técnicas, exigências de marca ou modelo de referência dentro do campo <strong>Justificativa</strong>.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Sessão 3: Análise e Aprovações */}
          <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                3. Análise, Status e Feedbacks
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Accordion type="single" collapsible className="w-full text-slate-600 dark:text-slate-300">
                <AccordionItem value="an-1">
                  <AccordionTrigger className="text-left font-semibold">O que significa uma demanda "Aprovada Parcialmente"?</AccordionTrigger>
                  <AccordionContent className="leading-relaxed">
                    Isso significa que a sua necessidade de contratação foi reconhecida e aceita pela administração, porém, o setor técnico de licitações ou orçamento optou por <strong>reduzir a quantidade solicitada</strong> ou <strong>ajustar o valor estimado</strong> com base em histórico de preços ou contingenciamento.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="an-2">
                  <AccordionTrigger className="text-left font-semibold">Minha demanda não foi aprovada. Como saber o motivo?</AccordionTrigger>
                  <AccordionContent className="leading-relaxed">
                    O sistema obriga os Administradores a registrarem uma justificativa escrita sempre que negam um pedido. Vá até a página de Planejamento PCA 2027. Localize sua demanda negada e você verá um botão azul escrito <strong>"Ver Motivo"</strong> na coluna de Situação. Clique nele para ler o despacho do administrador.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Sessão 4: Contatos */}
          <Card className="border-primary/20 shadow-sm overflow-hidden">
            <CardHeader className="bg-primary/5 pb-4 border-b border-primary/10 text-primary">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-6 w-6" />
                <CardTitle className="text-xl">Canais de Comunicação e Suporte</CardTitle>
              </div>
              <CardDescription className="text-primary/70">Entre em contato para suporte técnico com o sistema ou dúvidas conceituais sobre o planejamento.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-5 bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm w-full md:w-2/3 lg:w-1/2">
                <h3 className="font-bold text-base flex items-center gap-2 text-slate-800 dark:text-slate-200 border-b pb-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Coordenação de Licitações e Contratos (CLC)
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Responsável pelo apoio no uso do catálogo CATMAT/CATSER, dúvidas técnicas sobre contratações, consolidação orçamentária e diretrizes gerais do PCA 2027.
                </p>
                <div className="space-y-3 text-sm font-medium">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300">
                      <Mail className="h-4 w-4" />
                    </div>
                    <span>licitacao@mppi.mp.br</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300">
                      <Phone className="h-4 w-4" />
                    </div>
                    <span>(86) 2222-8004</span>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>

        </div>
      </div>
    </Layout>
  );
};

export default Faq2027;
