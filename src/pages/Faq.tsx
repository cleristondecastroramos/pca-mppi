import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

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
              <AccordionItem value="o-que-e">
                <AccordionTrigger>O que é o Sistema de Gerenciamento PCA MPPI?</AccordionTrigger>
                <AccordionContent>
                  Plataforma para gestão do Plano de Contratações Anual: cadastro, acompanhamento, prazos,
                  priorização, conformidade e resultados, com relatórios e controle de acesso por perfis.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="como-acessar">
                <AccordionTrigger>Como acesso e troco minha senha?</AccordionTrigger>
                <AccordionContent>
                  A autenticação é feita via Supabase. Para trocar a senha, acesse Minha Conta → Segurança.
                  A senha precisa ter no mínimo 8 caracteres. Em caso de esquecimento, utilize "Esqueci senha".
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="perfis">
                <AccordionTrigger>Quais são os perfis e permissões?</AccordionTrigger>
                <AccordionContent>
                  - Administrador: acesso total, gerenciamento de usuários e configurações.
                  - Gestor: gestão das contratações, prazos, prioridades, relatórios.
                  - Setor requisitante: cadastro e acompanhamento das demandas do setor.
                  - Consulta: acesso somente leitura às informações e relatórios.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="prazos">
                <AccordionTrigger>Como funcionam os prazos e a atualização de status?</AccordionTrigger>
                <AccordionContent>
                  Em Controle de Prazos, a edição das datas atualiza os estados. Ao preencher "Finalização Licitação",
                  o status muda para "concluído"; ao preencher "Entrada CLC", muda para "em andamento".
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="avatar">
                <AccordionTrigger>Como atualizar minha foto de perfil?</AccordionTrigger>
                <AccordionContent>
                  Em Minha Conta, envie uma imagem no widget de avatar. Ela será replicada no topo direito (Header)
                  e persistida no perfil. Em caso de erro de carregamento, o sistema exibe iniciais.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="relatorios">
                <AccordionTrigger>Como gerar relatórios?</AccordionTrigger>
                <AccordionContent>
                  Em Relatórios, aplique filtros por status, setor e período. Utilize Exportar CSV ou PDF.
                  O PDF abre em uma nova janela formatada com cabeçalho e tabela.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Canais de Comunicação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>E-mail de suporte: suporte.pca@mppi.mp.br</p>
            <p>Telefone: (86) 2222-8004 (Coord. Licitações e Contratos)</p>
            <p>Portal interno: MPPI → Coord. Licitações e Contratos → PCA</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Faq;
