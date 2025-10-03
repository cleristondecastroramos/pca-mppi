import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AvaliacaoConformidade = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Avaliação e Conformidade</h1>
            <p className="text-sm text-muted-foreground">Audite e verifique conformidade.</p>
          </div>
        </div>

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