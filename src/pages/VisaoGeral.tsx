import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const VisaoGeral = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Visão Geral</h1>
        <p className="text-muted-foreground">Resumo e panorama geral do PCA 2026.</p>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Indicadores</CardTitle>
            </CardHeader>
            <CardContent>
              Em breve: indicadores principais e resumos.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              Em breve: registros e logs relevantes.
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default VisaoGeral;