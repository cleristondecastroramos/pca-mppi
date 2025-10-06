import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Edit, History, Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import type { Tables } from "@/integrations/supabase/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Contratacao = Tables<"contratacoes">;
type HistoricoItem = Tables<"contratacoes_historico"> & {
  profiles?: { nome_completo: string | null } | null;
};

export default function Contratacoes() {
  const [contratacoes, setContratacoes] = useState<Contratacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingContratacao, setEditingContratacao] = useState<Contratacao | null>(null);
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [showHistorico, setShowHistorico] = useState(false);
  const [selectedContratacaoId, setSelectedContratacaoId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchContratacoes();
  }, []);

  const fetchContratacoes = async () => {
    try {
      const { data, error } = await supabase
        .from("contratacoes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setContratacoes(data || []);
    } catch (error) {
      console.error("Erro ao buscar contratações:", error);
      toast.error("Erro ao carregar contratações");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistorico = async (contratacaoId: string) => {
    try {
      // Buscar histórico
      const { data: historicoData, error: historicoError } = await supabase
        .from("contratacoes_historico")
        .select("*")
        .eq("contratacao_id", contratacaoId)
        .order("created_at", { ascending: false });

      if (historicoError) throw historicoError;

      // Buscar dados dos usuários para cada entrada do histórico
      const historicoComUsuarios = await Promise.all(
        (historicoData || []).map(async (item) => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("nome_completo")
            .eq("id", item.user_id)
            .single();

          return {
            ...item,
            profiles: profileData,
          };
        })
      );

      setHistorico(historicoComUsuarios);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      toast.error("Erro ao carregar histórico");
    }
  };

  const handleEdit = async (contratacao: Contratacao) => {
    setEditingContratacao({ ...contratacao });
  };

  const handleSaveEdit = async () => {
    if (!editingContratacao) return;

    try {
      // Buscar dados anteriores para o histórico
      const { data: dadosAnteriores } = await supabase
        .from("contratacoes")
        .select("*")
        .eq("id", editingContratacao.id)
        .single();

      // Atualizar contratação
      const { error: updateError } = await supabase
        .from("contratacoes")
        .update({
          descricao: editingContratacao.descricao,
          setor_requisitante: editingContratacao.setor_requisitante,
          classe: editingContratacao.classe,
          valor_estimado: editingContratacao.valor_estimado,
          etapa_processo: editingContratacao.etapa_processo,
          grau_prioridade: editingContratacao.grau_prioridade,
          justificativa: editingContratacao.justificativa,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingContratacao.id);

      if (updateError) throw updateError;

      // Registrar no histórico
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        await supabase.from("contratacoes_historico").insert({
          contratacao_id: editingContratacao.id,
          user_id: userData.user.id,
          acao: "Edição",
          dados_anteriores: dadosAnteriores,
          dados_novos: editingContratacao,
        });
      }

      toast.success("Contratação atualizada com sucesso");
      setEditingContratacao(null);
      fetchContratacoes();
    } catch (error) {
      console.error("Erro ao salvar edição:", error);
      toast.error("Erro ao salvar alterações");
    }
  };

  const handleShowHistorico = (contratacaoId: string) => {
    setSelectedContratacaoId(contratacaoId);
    setShowHistorico(true);
    fetchHistorico(contratacaoId);
  };

  const getStatusBadge = (status: string | null) => {
    const variants: Record<string, { variant: any; className: string }> = {
      "Planejamento": { variant: "secondary", className: "bg-info/10 text-info hover:bg-info/20" },
      "Em Licitação": { variant: "secondary", className: "bg-warning/10 text-warning hover:bg-warning/20" },
      "Contratado": { variant: "secondary", className: "bg-success/10 text-success hover:bg-success/20" },
      "Concluído": { variant: "secondary", className: "bg-success/10 text-success hover:bg-success/20" },
    };
    return variants[status || "Planejamento"] || variants["Planejamento"];
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const variants: Record<string, { variant: any; className: string }> = {
      "Alta": { variant: "destructive", className: "" },
      "Média": { variant: "secondary", className: "bg-warning/10 text-warning hover:bg-warning/20" },
      "Baixa": { variant: "secondary", className: "bg-muted text-muted-foreground" },
    };
    return variants[prioridade] || variants["Média"];
  };

  const filteredContratacoes = contratacoes.filter((contratacao) =>
    contratacao.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contratacao.setor_requisitante.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contratacao.classe && contratacao.classe.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatCurrency = (value: number | null) => {
    if (!value) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatSetor = (setor: string | null) => {
    if (!setor) return "-";
    if (setor === "PLANEJAMENTO") return "PLAN";
    return setor;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Carregando contratações...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Contratações</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie todas as contratações do PCA 2026 ({filteredContratacoes.length} registros)
            </p>
          </div>
          <Link to="/nova-contratacao">
            <Button size="xs">
              <Plus className="h-4 w-4 mr-1" />
              Nova Contratação
            </Button>
          </Link>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por descrição, setor, classe..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="xs">
            <Filter className="h-4 w-4 mr-1" />
            Filtros
          </Button>
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
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContratacoes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "Nenhuma contratação encontrada com os critérios de busca." : "Nenhuma contratação cadastrada."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredContratacoes.map((contratacao) => (
                  <TableRow key={contratacao.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      #{contratacao.id.slice(-8)}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={contratacao.descricao}>
                        {contratacao.descricao}
                      </div>
                    </TableCell>
                    <TableCell>{formatSetor(contratacao.setor_requisitante)}</TableCell>
                    <TableCell>{contratacao.classe || "-"}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(contratacao.valor_estimado)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusBadge(contratacao.etapa_processo).variant}
                        className={getStatusBadge(contratacao.etapa_processo).className}
                      >
                        {contratacao.etapa_processo || "Planejamento"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getPrioridadeBadge(contratacao.grau_prioridade).variant}
                        className={getPrioridadeBadge(contratacao.grau_prioridade).className}
                      >
                        {contratacao.grau_prioridade}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(contratacao.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleEdit(contratacao)}
                          title="Editar contratação"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleShowHistorico(contratacao.id)}
                          title="Ver histórico"
                        >
                          <History className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          title="Ver detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Dialog de Edição */}
        <Dialog open={!!editingContratacao} onOpenChange={() => setEditingContratacao(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Contratação</DialogTitle>
              <DialogDescription>
                Faça as alterações necessárias na contratação. Todas as mudanças serão registradas no histórico.
              </DialogDescription>
            </DialogHeader>
            {editingContratacao && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-descricao">Descrição</Label>
                    <Textarea
                      id="edit-descricao"
                      value={editingContratacao.descricao}
                      onChange={(e) =>
                        setEditingContratacao({ ...editingContratacao, descricao: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-setor">Setor Requisitante</Label>
                    <Select
                      value={editingContratacao.setor_requisitante}
                      onValueChange={(value) =>
                        setEditingContratacao({ ...editingContratacao, setor_requisitante: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CAA">CAA</SelectItem>
                        <SelectItem value="CCF">CCF</SelectItem>
                        <SelectItem value="CCS">CCS</SelectItem>
                        <SelectItem value="CLC">CLC</SelectItem>
                        <SelectItem value="CPPT">CPPT</SelectItem>
                        <SelectItem value="CTI">CTI</SelectItem>
                        <SelectItem value="CRH">CRH</SelectItem>
                        <SelectItem value="CEAF">CEAF</SelectItem>
                        <SelectItem value="GAECO">GAECO</SelectItem>
                        <SelectItem value="GSI">GSI</SelectItem>
                        <SelectItem value="CONINT">CONINT</SelectItem>
                        <SelectItem value="PLANEJAMENTO">PLANEJAMENTO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit-classe">Classe</Label>
                    <Input
                      id="edit-classe"
                      value={editingContratacao.classe || ""}
                      onChange={(e) =>
                        setEditingContratacao({ ...editingContratacao, classe: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-valor">Valor Estimado</Label>
                    <Input
                      id="edit-valor"
                      type="number"
                      step="0.01"
                      value={editingContratacao.valor_estimado || ""}
                      onChange={(e) =>
                        setEditingContratacao({
                          ...editingContratacao,
                          valor_estimado: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-prioridade">Prioridade</Label>
                    <Select
                      value={editingContratacao.grau_prioridade}
                      onValueChange={(value) =>
                        setEditingContratacao({ ...editingContratacao, grau_prioridade: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Alta">Alta</SelectItem>
                        <SelectItem value="Média">Média</SelectItem>
                        <SelectItem value="Baixa">Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Status</Label>
                    <Select
                      value={editingContratacao.etapa_processo || "Planejamento"}
                      onValueChange={(value) =>
                        setEditingContratacao({ ...editingContratacao, etapa_processo: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Planejamento">Planejamento</SelectItem>
                        <SelectItem value="Em Licitação">Em Licitação</SelectItem>
                        <SelectItem value="Contratado">Contratado</SelectItem>
                        <SelectItem value="Concluído">Concluído</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-justificativa">Justificativa</Label>
                    <Textarea
                      id="edit-justificativa"
                      value={editingContratacao.justificativa}
                      onChange={(e) =>
                        setEditingContratacao({ ...editingContratacao, justificativa: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingContratacao(null)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveEdit}>Salvar Alterações</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog de Histórico */}
        <Dialog open={showHistorico} onOpenChange={setShowHistorico}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Histórico de Alterações</DialogTitle>
              <DialogDescription>
                Registro completo de todas as alterações realizadas nesta contratação.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {historico.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma alteração registrada para esta contratação.
                </p>
              ) : (
                historico.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{item.acao}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(item.created_at)} por{" "}
                          {item.profiles?.nome_completo || "Sistema"}
                        </p>
                      </div>
                    </div>
                    {item.dados_anteriores && item.dados_novos && (
                      <div className="text-xs space-y-1">
                        <p className="font-medium">Alterações:</p>
                        <div className="bg-muted p-2 rounded">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(
                              {
                                anterior: item.dados_anteriores,
                                novo: item.dados_novos,
                              },
                              null,
                              2
                            )}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
