import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AvaliacaoConformidade = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Avaliação e Conformidade</h1>
        <p className="text-muted-foreground">Audite e verifique conformidade.</p>

        <Card>
          <CardHeader>
            <CardTitle>Checklist e Auditorias</CardTitle>
          </CardHeader>
          <CardContent>
            Em breve: checklists, auditorias e relatórios de conformidade.
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AvaliacaoConformidade;