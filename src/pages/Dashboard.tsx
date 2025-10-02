import { Layout } from "@/components/Layout";
import { KPICard } from "@/components/KPICard";
import {
  DollarSign,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do PCA 2026</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total de Contratações"
            value="156"
            icon={FileText}
            variant="default"
          />
          <KPICard
            title="Valor Total Estimado"
            value="R$ 42,5M"
            icon={DollarSign}
            variant="info"
          />
          <KPICard
            title="Concluídas"
            value="48"
            icon={CheckCircle}
            variant="success"
            trend={{ value: "+12% vs mês anterior", isPositive: true }}
          />
          <KPICard
            title="Em Atraso"
            value="23"
            icon={AlertTriangle}
            variant="warning"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Andamento por Etapa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Planejamento</span>
                  <span className="font-medium">35 (22%)</span>
                </div>
                <Progress value={22} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Em Licitação</span>
                  <span className="font-medium">45 (29%)</span>
                </div>
                <Progress value={29} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Contratado</span>
                  <span className="font-medium">28 (18%)</span>
                </div>
                <Progress value={18} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Concluído</span>
                  <span className="font-medium">48 (31%)</span>
                </div>
                <Progress value={31} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Classe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "Material de Consumo", value: "R$ 12,3M", percentage: 29 },
                { name: "Serviços", value: "R$ 15,8M", percentage: 37 },
                { name: "Serviços de TI", value: "R$ 8,2M", percentage: 19 },
                { name: "Material Permanente", value: "R$ 4,5M", percentage: 11 },
                { name: "Engenharia/Obras", value: "R$ 1,7M", percentage: 4 },
              ].map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Prioridades de Atenção</CardTitle>
          </CardHeader>
          <CardContent>
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
}
