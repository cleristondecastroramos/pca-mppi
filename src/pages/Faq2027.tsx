import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Mail, Phone, Building2, UserCircle, MessageSquare } from "lucide-react";

const Faq2027 = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">FAQ / Dúvidas — PCA 2027</h1>
          <p className="text-sm text-muted-foreground">Perguntas frequentes sobre o planejamento, captação e aprovação de demandas para o exercício de 2027.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Perguntas e Respostas do Planejamento 2027</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="cadastro">
                <AccordionTrigger>Como cadastrar uma demanda para o PCA 2027?</AccordionTrigger>
                <AccordionContent>
                  Acesse o menu lateral e clique em **Nova Demanda 2027**. Preencha todos os campos obrigatórios, incluindo descrição, justificativa, tipo de catálogo (CATMAT/CATSER), quantidade e valor unitário estimado.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="catmat">
                <AccordionTrigger>O que são os campos CATMAT e CATSER?</AccordionTrigger>
                <AccordionContent>
                  São os códigos do catálogo de materiais (CATMAT) e catálogo de serviços (CATSER) do Governo Federal. A vinculação correta deste código é obrigatória no planejamento do PCA 2027 para garantir a padronização das demandas.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="fluxo">
                <AccordionTrigger>Qual o fluxo que a demanda segue após o cadastro?</AccordionTrigger>
                <AccordionContent>
                  Ao cadastrar, a demanda assume o status técnico de **Pendente** no Painel de Planejamento. Os gestores e administradores analisam tecnicamente a demanda. Ela poderá ser **Aprovada** (integrando o plano) ou **Rejeitada** (sendo devolvida ao setor para correção).
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="rejeicao">
                <AccordionTrigger>Minha demanda foi rejeitada. O que devo fazer?</AccordionTrigger>
                <AccordionContent>
                  Ao ser rejeitada por um Gestor ou Administrador, a justificativa técnica é gravada no sistema. Você deve acessar o **Painel Planejamento 2027**, verificar a justificativa técnica, editar a demanda com as correções necessárias e salvá-la novamente para nova análise.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="limite">
                <AccordionTrigger>Existe limite de orçamento planejado para o PCA 2027?</AccordionTrigger>
                <AccordionContent>
                  Durante a fase de captação de demandas, o foco está em levantar a real necessidade dos setores para o ano seguinte. As travas e conciliações orçamentárias rígidas serão consolidadas na etapa final de consolidação do plano, sob coordenação da Assessoria de Planejamento.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card className="border-primary/20 shadow-sm">
          <CardHeader className="pb-3 text-primary">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <CardTitle className="text-lg">Canais de Comunicação</CardTitle>
            </div>
            <CardDescription>Entre em contato para suporte técnico ou informações sobre o planejamento.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="font-semibold text-sm flex items-center gap-2 text-muted-foreground border-b pb-1">
                <Building2 className="h-4 w-4" />
                Coordenação de Licitações e Contratos (CLC)
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-full text-muted-foreground">
                    <Mail className="h-4 w-4" />
                  </div>
                  <span>licitacao@mppi.mp.br</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-full text-muted-foreground">
                    <Phone className="h-4 w-4" />
                  </div>
                  <span>(86) 2222-8004</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-sm flex items-center gap-2 text-muted-foreground border-b pb-1">
                <UserCircle className="h-4 w-4" />
                Assessoria de Planejamento e Gestão (ASSESPPLAGES)
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full text-primary">
                    <Mail className="h-4 w-4" />
                  </div>
                  <a href="mailto:planejamento@mppi.mp.br" className="hover:text-primary transition-colors">
                    planejamento@mppi.mp.br
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full text-primary">
                    <Phone className="h-4 w-4" />
                  </div>
                  <span>(86) 2222-8015</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Faq2027;
