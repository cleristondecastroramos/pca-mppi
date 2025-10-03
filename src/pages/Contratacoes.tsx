import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Contratacoes() {
  // Mock data - será substituído por dados reais do banco
  const contratacoes = [
    {
      id: 1,
      descricao: "Aquisição de Computadores",
      setor: "CTI",
      classe: "Material Permanente",
      valorEstimado: 450000,
      status: "Em Licitação",
      prioridade: "Alta",
    },
    {
      id: 2,
      descricao: "Serviços de Limpeza",
      setor: "CAA",
      classe: "Serviço",
      valorEstimado: 280000,
      status: "Contratado",
      prioridade: "Média",
    },
    {
      id: 3,
      descricao: "Material de Escritório",
      setor: "CCS",
      classe: "Material de Consumo",
      valorEstimado: 85000,
      status: "Planejamento",
      prioridade: "Baixa",
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; className: string }> = {
      "Planejamento": { variant: "secondary", className: "bg-info/10 text-info hover:bg-info/20" },
      "Em Licitação": { variant: "secondary", className: "bg-warning/10 text-warning hover:bg-warning/20" },
      "Contratado": { variant: "secondary", className: "bg-success/10 text-success hover:bg-success/20" },
      "Concluído": { variant: "secondary", className: "bg-success/10 text-success hover:bg-success/20" },
    };
    return variants[status] || variants["Planejamento"];
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const variants: Record<string, { variant: any; className: string }> = {
      "Alta": { variant: "destructive", className: "" },
      "Média": { variant: "secondary", className: "bg-warning/10 text-warning hover:bg-warning/20" },
      "Baixa": { variant: "secondary", className: "bg-muted text-muted-foreground" },
    };
    return variants[prioridade] || variants["Média"];
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Contratações</h1>
            <p className="text-sm text-muted-foreground">Gerencie todas as contratações do PCA 2026</p>
          </div>
          <Link to="/nova-contratacao">
            <Button size="xs">Nova Contratação</Button>
          </Link>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por descrição, setor, classe..."
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="xs">Filtros</Button>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Classe</TableHead>
                <TableHead className="text-right">Valor Estimado</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contratacoes.map((contratacao) => (
                <TableRow key={contratacao.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">#{contratacao.id}</TableCell>
                  <TableCell>{contratacao.descricao}</TableCell>
                  <TableCell>{contratacao.setor}</TableCell>
                  <TableCell>{contratacao.classe}</TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(contratacao.valorEstimado)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusBadge(contratacao.status).variant}
                      className={getStatusBadge(contratacao.status).className}
                    >
                      {contratacao.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getPrioridadeBadge(contratacao.prioridade).variant}
                      className={getPrioridadeBadge(contratacao.prioridade).className}
                    >
                      {contratacao.prioridade}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="xs">
                      Ver Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}
