import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Mail, Phone, Building2, UserCircle, MessageSquare } from "lucide-react";

const Faq = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">FAQ / Dúvidas</h1>
          <p className="text-sm text-muted-foreground">Perguntas frequentes sobre o sistema, funcionalidades e canais de contato.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Perguntas e Respostas</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="cadastro">
                <AccordionTrigger>Como cadastrar uma nova contratação corretamente?</AccordionTrigger>
                <AccordionContent>
                  Acesse <strong>Contratações &gt; Nova Contratação</strong>. Preencha todos os campos marcados com asterisco (*). 
                  O <em>Valor Estimado Total</em> será calculado automaticamente multiplicando a <em>Quantidade</em> pelo <em>Valor Unitário</em>. 
                  Certifique-se de selecionar a Unidade Orçamentária (UO) correta.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="orcamento-planejado">
                <AccordionTrigger>Como funciona o limite do Orçamento Planejado por setor?</AccordionTrigger>
                <AccordionContent>
                  O sistema gerencia um <strong>Orçamento Planejado</strong> anual para cada Setor Demandante, estipulando um teto financeiro 
                  distribuído entre as Unidades Orçamentárias (PGJ, FMMP e FEPDC). 
                  <br /><br />
                  Se a <strong>Trava Orçamentária</strong> estiver ativada para o seu setor, a soma de todas as suas contratações não poderá 
                  ultrapassar esse limite. Ao tentar cadastrar uma nova demanda que exceda o teto estabelecido, o sistema bloqueará a gravação 
                  para garantir a responsabilidade orçamentária. Caso ocorra o bloqueio, você deve reprogramar contratações existentes ou entrar em 
                  contato com a administração para adequação do seu orçamento planejado.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="saldo">
                <AccordionTrigger>Por que recebo erro de "Saldo orçamentário insuficiente" ao salvar?</AccordionTrigger>
                <AccordionContent>
                  O sistema possui travas baseadas no orçamento planejado para cada UO. Se a sua demanda ultrapassar o saldo disponível, 
                  o salvamento será bloqueado. Nestes casos, entre em contato com a <strong>ASSESPPLAGES</strong> ou a <strong>CLC</strong> 
                  para solicitar autorização de excedente ou ajuste no planejamento.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="historico">
                <AccordionTrigger>Como vejo quem alterou uma demanda e o que foi mudado?</AccordionTrigger>
                <AccordionContent>
                  Na listagem de contratações, clique no ícone de <strong>Histórico (Relógio)</strong> na coluna de ações. 
                  O sistema exibirá um registro detalhado com: data, horário, nome do usuário e a comparação exata entre o 
                  valor antigo e o novo para cada campo modificado.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="status">
                <AccordionTrigger>Como os status (Não Iniciado, Em Andamento, Concluído) são definidos?</AccordionTrigger>
                <AccordionContent>
                  Os status são derivados da Etapa do Processo:
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li><strong>Não Iniciado:</strong> Quando a demanda está em 'Planejamento'.</li>
                    <li><strong>Em Andamento:</strong> Quando está em 'Em Licitação' ou 'Contratado'.</li>
                    <li><strong>Concluído:</strong> Quando a etapa é definida como 'Concluído'.</li>
                    <li><strong>Sobrestado:</strong> Quando a opção de interrupção temporária é marcada no modal de edição.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="codigo-id">
                <AccordionTrigger>O que é o Código (ID) que aparece na lista?</AccordionTrigger>
                <AccordionContent>
                  Cada demanda recebe um identificador único composto por 4 dígitos alfanuméricos para facilitar a comunicação e rastreio (ex: 8A2F). 
                  Esse código serve para identificar a demanda no preenchimento do Documento Formalizador da Demanda (DFD) 
                  quando for iniciado o processo de contratação.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="filtros">
                <AccordionTrigger>Como utilizar os filtros de busca de forma eficiente?</AccordionTrigger>
                <AccordionContent>
                  Você pode combinar a busca textual (pelo nome do objeto ou setor) com os seletores superiores (UO, Classe, Status). 
                  Os seletores superiores filtram a base de dados instantaneamente, enquanto a barra de busca refina o resultado 
                  exibido na tela.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="exclusao">
                <AccordionTrigger>Posso excluir uma demanda cadastrada por engano?</AccordionTrigger>
                <AccordionContent>
                  A exclusão está disponível apenas para perfis com nível de acesso <strong>Administrador</strong> ou <strong>Gestor</strong>. 
                  Lembre-se que a exclusão é permanente e remove também todo o histórico de alterações associado àquela demanda.
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
            <CardDescription>Entre em contato para suporte técnico ou informações sobre o plano.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="font-semibold text-sm flex items-center gap-2 text-muted-foreground border-b pb-1">
                <Building2 className="h-4 w-4" />
                Gestão do Plano de Contratações Anual
              </h3>
              <div className="space-y-3 text-sm">
                <p className="font-medium">Coordenação de Licitações e Contratos (CLC)</p>
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
                Desenvolvimento do Sistema
              </h3>
              <div className="space-y-3 text-sm">
                <p className="font-medium">Assessoria de Planejamento e Gestão (ASSESPPLAGES)</p>
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

export default Faq;
