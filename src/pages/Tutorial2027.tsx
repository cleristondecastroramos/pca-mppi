import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, ClipboardList, PlusCircle, CheckCircle, FileDown, Loader2, Database, Building2 } from "lucide-react";
import { generateTutorialPdf } from "@/utils/tutorialPdf";

export default function Tutorial2027() {
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
      <div className="space-y-6 max-w-4xl pb-12">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">📖 Tutorial de Planejamento — PCA 2027</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Guia oficial de operação do módulo de planejamento, abrangendo o cadastro estruturado, integração com o catálogo federal e regras de revisão técnica.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExportPdf}
            disabled={generating}
            title="Exportar Tutorial em PDF"
            className="h-10 w-10 text-muted-foreground hover:text-primary flex-shrink-0"
          >
            {generating ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileDown className="h-5 w-5" />}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              1. Visão Geral do Fluxo de Planejamento
            </CardTitle>
            <CardDescription>
              Compreendendo o novo ciclo de captação estruturada de demandas para o ano de 2027.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            <p>
              Diferente do exercício de 2026, o módulo do <strong>PCA 2027</strong> introduz um modelo avançado de planejamento que foca na qualidade, padronização e estruturação dos dados desde o momento da captação. O fluxo é composto por três etapas fundamentais:
            </p>
            <ul className="space-y-4 mt-4">
              <li className="flex gap-3">
                <div className="flex-shrink-0 mt-1"><Building2 className="h-5 w-5 text-slate-400" /></div>
                <div>
                  <strong>Captação via Unidades Requisitantes:</strong> As unidades (Promotorias, Coordenadorias, etc.) identificam e registram suas necessidades institucionais de bens e serviços.
                </div>
              </li>
              <li className="flex gap-3">
                <div className="flex-shrink-0 mt-1"><Database className="h-5 w-5 text-slate-400" /></div>
                <div>
                  <strong>Padronização Federal (CATMAT/CATSER):</strong> Todas as demandas agora são obrigatoriamente vinculadas ao catálogo de materiais e serviços do Governo Federal, impedindo a inserção de textos livres genéricos.
                </div>
              </li>
              <li className="flex gap-3">
                <div className="flex-shrink-0 mt-1"><CheckCircle className="h-5 w-5 text-slate-400" /></div>
                <div>
                  <strong>Revisão e Consolidação Técnica:</strong> A equipe técnica e os administradores analisam as solicitações em um painel dedicado, podendo aprová-las (consolidando no Plano) ou rejeitá-las com devida justificativa para correção.
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-primary" />
              2. Cadastro de Nova Demanda (Integração CATMAT/CATSER)
            </CardTitle>
            <CardDescription>
              Passo a passo para inserir uma nova necessidade de contratação com busca assistida.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            <p>
              O formulário de <strong>Nova Demanda 2027</strong> foi redesenhado para garantir que os dados cheguem à equipe de licitações já padronizados. Siga os passos:
            </p>
            <ol className="list-decimal pl-5 space-y-3">
              <li>No menu principal (à esquerda), selecione <strong>Nova Demanda 2027</strong>.</li>
              <li>
                <strong>Unidade Requisitante:</strong> Caso seu perfil já esteja vinculado a uma unidade, este campo será preenchido e bloqueado automaticamente. Administradores podem selecionar em nome de qualquer unidade.
              </li>
              <li>
                <strong>Busca no Catálogo (Obrigatório):</strong>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-500">
                  <li>Selecione a base desejada (Materiais - CATMAT ou Serviços - CATSER).</li>
                  <li>Escolha o <strong>Grupo/Classe</strong> correspondente ao item.</li>
                  <li>O sistema fará uma conexão com a base de dados do Governo Federal e listará os itens padronizados.</li>
                  <li>Filtre pelo nome e selecione o item desejado. A descrição técnica e o código PDM serão preenchidos automaticamente.</li>
                </ul>
              </li>
              <li>Descreva detalhadamente a <strong>Justificativa</strong> (por que o Ministério Público necessita dessa contratação).</li>
              <li>Insira a <strong>Quantidade</strong>, a <strong>Unidade de Medida</strong> (ex: Unidade, Pacote, Mês) e o <strong>Valor Unitário Estimado</strong>.</li>
              <li>Defina a <strong>Prioridade</strong> estratégica (Alta, Média ou Baixa) e clique em <strong>Cadastrar Demanda</strong>.</li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              3. Painel de Planejamento (Aprovação e Análise)
            </CardTitle>
            <CardDescription>
              Como a equipe gestora realiza a consolidação das solicitações.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <p>
              Através do <strong>Painel Planejamento 2027</strong>, os usuários com permissão de Gestor ou Administrador possuem uma visão analítica de todas as demandas solicitadas.
            </p>
            <ul className="list-disc pl-5 space-y-3">
              <li>
                <strong>Análise Detalhada:</strong> É possível visualizar o valor total estimado, a unidade requisitante, a justificativa e os dados extraídos do catálogo (CATMAT/CATSER).
              </li>
              <li>
                <strong>Aprovação Rápida:</strong> Demandas que estão corretas podem ser aprovadas com um único clique. O status muda para "Consolidado" e o item entra oficialmente para o planejamento do ano.
              </li>
              <li>
                <strong>Devolução / Rejeição:</strong> Se um item foi selecionado incorretamente ou se a justificativa for insuficiente, o avaliador pode rejeitar o pedido. O sistema exigirá que um motivo (justificativa técnica) seja digitado, orientando a unidade requisitante sobre o que precisa ser ajustado.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-amber-600" />
              4. Dúvidas Frequentes e Suporte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full text-sm">
              <AccordionItem value="item-1">
                <AccordionTrigger>Não consigo digitar livremente o objeto que desejo contratar. Por quê?</AccordionTrigger>
                <AccordionContent className="text-slate-500">
                  Para o ano de 2027, o MPPI adotou a padronização obrigatória com o catálogo oficial do Governo Federal (Compras.gov.br). Isso evita duplicação de itens, erros de descrição técnica e facilita a consolidação das licitações (compras em lote). Você deve encontrar o item mais próximo no catálogo.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Como faço para corrigir uma demanda que cadastrei errado?</AccordionTrigger>
                <AccordionContent className="text-slate-500">
                  Enquanto a demanda estiver com status de "Pendente", você pode acessá-la no painel e fazer as edições necessárias. Caso ela já tenha sido "Consolidada", você não poderá editá-la e deverá entrar em contato com a equipe de licitações.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Fui notificado que minha demanda foi rejeitada. O que devo fazer?</AccordionTrigger>
                <AccordionContent className="text-slate-500">
                  Acesse o painel e localize sua demanda. Lá haverá a mensagem escrita pelo Gestor com o motivo da devolução (ex: "Favor escolher o item na classe 3020 e melhorar a justificativa"). Acesse a edição da demanda, faça as correções e salve para que ela seja avaliada novamente.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
