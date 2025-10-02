import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ResultadosAlcancados = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Resultados Alcançados</h1>
        <p className="text-muted-foreground">Painel de resultados e metas.</p>

        <Card>
          <CardHeader>
            <CardTitle>KPIs e Metas</CardTitle>
          </CardHeader>
          <CardContent>
            Em breve: gráficos, indicadores e comparativos.
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ResultadosAlcancados;