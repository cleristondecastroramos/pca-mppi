import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SetoresDemandantes = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Setores Demandantes</h1>
        <p className="text-muted-foreground">Gerencie e visualize setores solicitantes.</p>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Setores</CardTitle>
          </CardHeader>
          <CardContent>
            Em breve: tabela de setores, filtros e ações.
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SetoresDemandantes;