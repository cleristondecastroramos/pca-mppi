import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ControlePrazos = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Controle de Prazos</h1>
            <p className="text-sm text-muted-foreground">Acompanhe prazos e compromissos.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Agenda e Alertas</CardTitle>
          </CardHeader>
          <CardContent>
            Em breve: calendário, lembretes e alertas.
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ControlePrazos;