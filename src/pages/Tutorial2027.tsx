import { Layout } from "@/components/Layout";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { HelpCircle, ClipboardList, PlusCircle, CheckCircle, XCircle } from "lucide-react";

export default function Tutorial2027() {
  return (
    <Layout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-xl font-bold text-foreground">📖 Tutorial de Planejamento — PCA 2027</h1>
          <p className="text-sm text-muted-foreground">
            Instruções de fluxo, cadastro de demandas, revisão, aprovação e rejeição técnica do Plano Anual de Contratações para o exercício 2027.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              1. Visão Geral do Fluxo do PCA 2027
            </CardTitle>
            <CardDescription>
              O ciclo do PCA 2027 é focado na captação inicial de demandas e consolidação técnica para o ano de 2027.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            <p>
              Diferente do exercício de 2026 (que se encontra em fase de execução), o **PCA 2027** está na fase de **Planejamento**. O fluxo consiste nas seguintes etapas:
            </p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                <strong>Captação de Demandas:</strong> Os setores requisitantes identificam suas necessidades de contratação e cadastram as demandas no sistema.
              </li>
              <li>
                <strong>Revisão Técnica (Gestor/Admin):</strong> A equipe técnica analisa as demandas enviadas, verificando a corretude das informações, especificações e códigos CATMAT/CATSER.
              </li>
              <li>
                <strong>Aprovação ou Rejeição:</strong> As demandas que atendem aos requisitos técnicos são aprovadas e integradas ao Plano. Demandas com inconsistências podem ser rejeitadas ou enviadas para suspensão parcial para ajustes.
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-primary" />
              2. Cadastro de Nova Demanda 2027
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            <p>
              Para incluir uma nova demanda no PCA 2027:
            </p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>No menu lateral, selecione <strong>Nova Demanda 2027</strong>.</li>
              <li>Preencha a <strong>Descrição</strong> detalhada do item ou serviço desejado.</li>
              <li>
                Selecione o tipo de identificação: <strong>CATMAT</strong> (para materiais) ou <strong>CATSER</strong> (para serviços) e insira o respectivo código catalogado.
              </li>
              <li>Preencha a **Justificativa** da contratação, detalhando a necessidade institucional.</li>
              <li>Informe a **Quantidade**, a **Unidade de Fornecimento** e o **Valor Unitário Estimado**.</li>
              <li>Defina a **Prioridade** (Alta, Média ou Baixa) para fins de classificação estratégica.</li>
              <li>Clique em **Cadastrar Demanda**.</li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              3. Painel de Planejamento (Gestão e Análise)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <p>
              A rota <strong>Painel Planejamento 2027</strong> centraliza as demandas enviadas pelos setores e está disponível para administradores, gestores e consultas:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Filtro e Busca:</strong> Permite filtrar demandas por setor requisitante, classe de material/serviço ou status técnico.
              </li>
              <li>
                <strong>Aprovação Rápida:</strong> Gestores e Administradores podem validar e aprovar demandas diretamente, alterando o status técnico para consolidado.
              </li>
              <li>
                <strong>Rejeição Técnica:</strong> Ao rejeitar uma demanda, é obrigatório registrar uma justificativa técnica clara. O setor requisitante será notificado para realizar as adequações.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-amber-600" />
              4. Dúvidas Frequentes do Ciclo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full text-sm">
              <AccordionItem value="item-1">
                <AccordionTrigger>Quem pode cadastrar demandas no PCA 2027?</AccordionTrigger>
                <AccordionContent>
                  Todos os usuários com os perfis de Administrador, Gestor e Setor Requisitante têm permissão para cadastrar novas demandas direcionadas ao exercício de 2027.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Como posso alterar uma demanda que já foi cadastrada?</AccordionTrigger>
                <AccordionContent>
                  Se a demanda ainda não foi aprovada pelo Gestor, o setor requisitante pode editá-la a partir do Painel de Planejamento. Demandas já consolidadas necessitam de intervenção direta da equipe técnica da CLC ou da Assessoria de Planejamento.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>O que acontece se uma demanda for rejeitada?</AccordionTrigger>
                <AccordionContent>
                  A demanda é marcada com o status de "Rejeitada" e o motivo da rejeição ficará visível no histórico do registro. O usuário requisitante poderá ajustar as informações e reenviar para nova avaliação.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
