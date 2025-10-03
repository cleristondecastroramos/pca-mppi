import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ResultadosAlcancados = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Resultados Alcançados</h1>
            <p className="text-sm text-muted-foreground">Painel de resultados e metas.</p>
          </div>
        </div>

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