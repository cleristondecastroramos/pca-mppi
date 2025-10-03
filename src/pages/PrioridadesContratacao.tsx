import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PrioridadesContratacao = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Prioridades de Contratação</h1>
            <p className="text-sm text-muted-foreground">Defina e acompanhe prioridades.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Matriz de Prioridades</CardTitle>
          </CardHeader>
          <CardContent>
            Em breve: critérios, pontuações e rankings.
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PrioridadesContratacao;