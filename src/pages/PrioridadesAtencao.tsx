import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

const PrioridadesAtencao = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Pontos de Atenção</h1>
            <p className="text-sm text-muted-foreground">Itens que requerem acompanhamento imediato.</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-2">
            <div className="space-y-3">
              {[
                {
                  title: "Aquisição de Equipamentos de TI",
                  setor: "CTI",
                  prazo: "Vence em 5 dias",
                  status: "warning",
                },
                {
                  title: "Contratação de Serviços de Vigilância",
                  setor: "CAA",
                  prazo: "Vencido há 2 dias",
                  status: "danger",
                },
                {
                  title: "Reforma do Prédio Anexo",
                  setor: "CEAF",
                  prazo: "Vence em 10 dias",
                  status: "warning",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.setor}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm px-2 py-1 rounded ${
                        item.status === "danger"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-warning/10 text-warning"
                      }`}
                    >
                      {item.prazo}
                    </span>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PrioridadesAtencao;