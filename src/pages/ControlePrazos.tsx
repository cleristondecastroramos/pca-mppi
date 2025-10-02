import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ControlePrazos = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Controle de Prazos</h1>
        <p className="text-muted-foreground">Acompanhe prazos e compromissos.</p>

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