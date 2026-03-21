import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  Gavel, 
  Package, 
  Wallet,
  ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  HelpCircle, 
  CheckCircle2, 
  ArrowRight,
  Info,
  Layers,
  FileCheck,
  MousePointer2,
  Table as TableIcon,
  Plus,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";

// Lazy-loaded components
import SrpDashboard from "@/modules/srp/pages/Dashboard";
import SrpBiddingBoard from "@/modules/srp/pages/BiddingBoard";
import SrpLotBuilder from "@/modules/srp/pages/LotBuilder";
import SrpArpManager from "@/modules/srp/pages/ArpManager";

export default function LicitacoesSRP() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/visao-geral">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Licitações SRP</h1>
              <p className="text-muted-foreground">Monitoramento da execução e andamento das licitações SRP.</p>
            </div>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-all duration-300"
                title="Tutorial desta página"
              >
                <HelpCircle className="h-6 w-6" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[850px] max-h-[90vh] overflow-y-auto p-0 border-none shadow-2xl bg-white dark:bg-slate-950">
              {/* Header Estilo Relatório */}
              <div className="bg-primary p-8 text-white sticky top-0 z-10 shadow-xl flex items-center justify-between">
                <div>
                  <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                       <CheckCircle2 className="h-8 w-8 text-white/90" />
                       <DialogTitle className="text-2xl font-black uppercase tracking-tight">Manual Operacional de Licitações SRP</DialogTitle>
                    </div>
                    <DialogDescription className="text-white/80 font-medium text-sm border-t border-white/20 pt-2">
                      Sistema de Registro de Preços • Planejamento e Execução 2026
                    </DialogDescription>
                  </DialogHeader>
                </div>
                <div className="hidden md:block text-right opacity-50 text-[10px] font-mono leading-none">
                  DOC-SRP-2026-MPPI<br/>
                  VERSÃO 2.1<br/>
                  CONFIDENCIAL
                </div>
              </div>

              <div className="p-10 space-y-12">
                {/* 1. Introdução */}
                <section className="space-y-4">
                   <h3 className="text-sm font-black text-primary uppercase tracking-widest border-b-2 border-primary/10 pb-2">01. Introdução ao Módulo de SRP</h3>
                   <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
                      O Sistema de Registro de Preços (SRP) constitui um conjunto de procedimentos administrativos para o registro formal de preços relativos à prestação de serviços e aquisição de bens, destinados a contratações futuras. Este módulo especializado no PCA 2026 foi concebido para automatizar o monitoramento do ciclo de vida das Atas de Registro de Preços, desde a fase nascente de planejamento até o exaurimento total dos saldos empenhados. A interface centraliza informações críticas, reduzindo a fragmentação de dados e garantindo total conformidade com a Nova Lei de Licitações (Lei 14.133/2021).
                   </p>
                </section>

                {/* 2. Dashboard */}
                <section className="space-y-4">
                   <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg"><LayoutDashboard className="h-5 w-5" /></div>
                      <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest border-b-2 border-blue-100 pb-2 flex-1">02. Inteligência de Dados e Dashboards</h3>
                   </div>
                   <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
                      O Dashboard SRP atua como o centro de comando estratégico do módulo. Ele apresenta uma visão consolidada de quatro pilares fundamentais: (a) <strong>Volume de Licitações Ativas</strong>, permitindo o controle de carga de trabalho; (b) <strong>Gestão de Prazos</strong>, identificando atas com vencimento em até 90 dias; (c) <strong>Alertas de Saldo Crítico</strong>, disparando notificações automáticas quando itens atingem menos de 10% de disponibilidade; e (d) <strong>Patrimônio Registrado</strong>, exibindo o valor financeiro pleno comprometido em atas vigentes. O "Funil de Licitações" quantifica a fluidez processual, destacando em qual etapa administrativa (Publicação, Proposta, Julgamento ou Homologação) se concentra o maior volume de processos.
                   </p>
                </section>

                {/* 3. Mesa */}
                <section className="space-y-4">
                   <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-orange-50 text-orange-700 rounded-lg"><Gavel className="h-5 w-5" /></div>
                      <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest border-b-2 border-orange-100 pb-2 flex-1">03. Mesa de Operações Administrativas</h3>
                   </div>
                   <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
                      A Mesa de Operações utiliza uma metodologia de gestão visual de fluxos (Kanban) para monitorar o andamento dos processos administrativos vinculados ao SRP. Cada registro exibe o número do SEI, o objeto da licitação e o percentual de prioridade. A progressão de status é **dinâmica e automática**: ao inserir os dados de empenho ou de edital nos modais de edição, o sistema reclassifica instantaneamente o processo entre Planejamento, Publicação, Disputa ou Homologação. O botão "Iniciar Novo Processo" é a porta de entrada para converter demandas estimadas do PCA em procedimentos administrativos concretos com numeração SEI oficial.
                   </p>
                </section>

                {/* 4. Lotes */}
                <section className="space-y-4">
                   <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-purple-50 text-purple-700 rounded-lg"><Layers className="h-5 w-5" /></div>
                      <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest border-b-2 border-purple-100 pb-2 flex-1">04. Construtor e Consolidador de Lotes</h3>
                   </div>
                   <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
                      Esta ferramenta é vital para a economia de escala e padronização. O Construtor permite o agrupamento de múltiplos itens da fila de adesão para a formação de **Lotes Licitatórios**. Ao arrastar itens para um lote, o sistema executa cálculos matemáticos de consolidação de valores e quantidades. Uma funcionalidade nativa de destaque é o suporte à Lei Complementar 123/2006: se o valor acumulado do lote for de até **R$ 80.000,00**, o sistema aplica automaticamente a diretriz de **Cota Exclusiva para ME/EPP**, auxiliando o gestor a assegurar as prerrogativas legais de micro e pequenas empresas de forma proativa.
                   </p>
                </section>

                {/* 5. Atas */}
                <section className="space-y-4">
                   <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg"><Wallet className="h-5 w-5" /></div>
                      <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest border-b-2 border-emerald-100 pb-2 flex-1">05. Gestão de Saldo e Execução de Atas</h3>
                   </div>
                   <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
                      O Gestor de Atas funciona como o livro-razão financeiro do SRP. Ele detalha os itens que compõem cada lote adjudicado, exibindo o saldo remanescente tanto para a Unidade Gerenciadora (MPPI) quanto para caronas/participantes. Registra-se o consumo através de **Notas de Empenho (NE)**, onde o sistema valida a quantidade solicitada versus o saldo atual, bloqueando inconsistências orçamentárias. **Ponto Crítico de Observação:** Itens sinalizados com o ícone triangular vermelho exigem obrigatoriamente uma pesquisa de mercado atualizada antes do pedido de empenho, conforme jurisprudência do TCU, para garantir que o preço registrado permanece vantajoso para a administração pública.
                   </p>
                </section>

                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dotted border-slate-300 dark:border-slate-700">
                   <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Informação de Apoio</h4>
                   <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
                      Dúvidas adicionais sobre o preenchimento de campos específicos podem ser sanadas através da Central de Ajuda na página de Tutoriais Gerais ou diretamente com a Coordenadoria de Licitações (CLC).
                   </p>
                </div>
              </div>

              <div className="p-8 border-t bg-slate-50 dark:bg-slate-900 flex justify-between items-center sticky bottom-0 z-10">
                <div className="text-[10px] text-slate-400 font-medium">
                  © 2026 MINISTÉRIO PÚBLICO DO ESTADO DO PIAUÍ<br/>
                  DIRETORIA DE PLANEJAMENTO E GESTÃO
                </div>
                <Button className="px-10 rounded-lg font-bold shadow-xl bg-primary hover:bg-primary/90 text-white transition-all duration-300" onClick={(e: any) => {
                  const dialogClose = e.target.closest('[role="dialog"]')?.querySelector('button[aria-label="Close"]');
                  dialogClose?.click();
                }}>
                  CONCLUIR LEITURA E INICIAR
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-800 p-1.5 h-14 rounded-xl">
            <TabsTrigger 
              value="dashboard" 
              className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all duration-300 flex items-center justify-center gap-2 px-4 py-2 font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="mesa" 
              className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all duration-300 flex items-center justify-center gap-2 px-4 py-2 font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              <Gavel className="h-4 w-4" />
              Mesa de Operações
            </TabsTrigger>
            <TabsTrigger 
              value="lotes" 
              className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all duration-300 flex items-center justify-center gap-2 px-4 py-2 font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              <Package className="h-4 w-4" />
              Construtor de Lotes
            </TabsTrigger>
            <TabsTrigger 
              value="atas" 
              className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all duration-300 flex items-center justify-center gap-2 px-4 py-2 font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              <Wallet className="h-4 w-4" />
              Gestor de Atas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="border-none p-0 outline-none">
            <SrpDashboard />
          </TabsContent>
          <TabsContent value="mesa" className="border-none p-0 outline-none">
            <SrpBiddingBoard />
          </TabsContent>
          <TabsContent value="lotes" className="border-none p-0 outline-none">
            <SrpLotBuilder />
          </TabsContent>
          <TabsContent value="atas" className="border-none p-0 outline-none">
            <SrpArpManager />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
