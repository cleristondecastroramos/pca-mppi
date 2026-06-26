import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile, useUserRoles } from "@/lib/auth";
import { toast } from "sonner";
import { Loader2, Plus, Search, Check, AlertTriangle, X, CheckSquare, RefreshCw, FileText } from "lucide-react";

export default function Planejamento2027() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [demands, setDemands] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedDemand, setSelectedDemand] = useState<any | null>(null);

  // Modal controls
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const [isPartialOpen, setIsPartialOpen] = useState(false);
  const [partialQuantity, setPartialQuantity] = useState<number>(1);
  const [partialValorUnit, setPartialValorUnit] = useState<number>(0);

  const { data: session } = supabase.auth.useSession ? { data: { session: null } } : { data: { session: null } };
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { data: profile } = useUserProfile(currentUserId ?? undefined);
  const { data: roles } = useUserRoles(currentUserId ?? undefined);

  const isManagerOrAdmin = roles?.includes("administrador") || roles?.includes("gestor");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setCurrentUserId(data.session.user.id);
      } else {
        navigate("/auth");
      }
    });
  }, [navigate]);

  const loadDemands = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("contratacoes")
        .select("*")
        .eq("exercicio", 2027);

      const { data, error } = await query;
      if (error) throw error;
      setDemands(data || []);
    } catch (e: any) {
      console.error(e);
      toast.error("Erro ao carregar demandas: " + (e.message || e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      loadDemands();
    }
  }, [currentUserId]);

  const handleApproveIntegral = async (id: string) => {
    try {
      const { error } = await supabase
        .from("contratacoes")
        .update({
          status_aprovacao: "Aprovada integralmente",
          status_planejamento: "Aprovado",
          updated_at: new Date().toISOString(),
          updated_by: currentUserId
        })
        .eq("id", id);

      if (error) throw error;
      toast.success("Demanda aprovada integralmente!");
      loadDemands();
    } catch (e: any) {
      toast.error("Erro ao aprovar demanda: " + e.message);
    }
  };

  const handleApprovePartialSubmit = async () => {
    if (!selectedDemand) return;
    try {
      const valTotal = partialQuantity * partialValorUnit;
      const { error } = await supabase
        .from("contratacoes")
        .update({
          status_aprovacao: "Aprovada parcialmente",
          status_planejamento: "Aprovado",
          quantidade: partialQuantity,
          quantidade_itens: partialQuantity,
          valor_unitario: partialValorUnit,
          valor_total: valTotal,
          valor_estimado: valTotal,
          updated_at: new Date().toISOString(),
          updated_by: currentUserId
        })
        .eq("id", selectedDemand.id);

      if (error) throw error;
      toast.success("Demanda aprovada parcialmente com novos valores!");
      setIsPartialOpen(false);
      setSelectedDemand(null);
      loadDemands();
    } catch (e: any) {
      toast.error("Erro ao aprovar parcialmente: " + e.message);
    }
  };

  const handleRejectSubmit = async () => {
    if (!selectedDemand) return;
    if (!rejectReason.trim()) {
      toast.error("É necessário informar a justificativa para a não aprovação.");
      return;
    }

    try {
      const { error } = await supabase
        .from("contratacoes")
        .update({
          status_aprovacao: "Não aprovada",
          status_planejamento: "Recusado",
          justificativa_nao_aprovacao: rejectReason,
          updated_at: new Date().toISOString(),
          updated_by: currentUserId
        })
        .eq("id", selectedDemand.id);

      if (error) throw error;
      toast.success("Demanda reprovada com sucesso!");
      setIsRejectOpen(false);
      setRejectReason("");
      setSelectedDemand(null);
      loadDemands();
    } catch (e: any) {
      toast.error("Erro ao reprovar demanda: " + e.message);
    }
  };

  // Metrics
  const totalSubmitted = demands.length;
  const totalValue = demands.reduce((acc, d) => acc + (Number(d.valor_total) || 0), 0);
  const totalApproved = demands.filter(d => d.status_aprovacao?.startsWith("Aprovada")).length;
  const totalPending = demands.filter(d => d.status_aprovacao === "Pendente de análise").length;
  const totalRejected = demands.filter(d => d.status_aprovacao === "Não aprovada").length;

  const filteredDemands = demands.filter((d) => {
    const term = search.toLowerCase();
    return (
      d.descricao?.toLowerCase().includes(term) ||
      d.unidade_demandante?.toLowerCase().includes(term) ||
      d.catmat_catser_codigo?.toLowerCase().includes(term)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Aprovada integralmente":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none font-bold">Aprovada Integral</Badge>;
      case "Aprovada parcialmente":
        return <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-none font-bold">Aprovada Parcial</Badge>;
      case "Não aprovada":
        return <Badge className="bg-rose-500 hover:bg-rose-600 text-white border-none font-bold">Não Aprovada</Badge>;
      default:
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none font-bold">Pendente</Badge>;
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Planejamento PCA 2027
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Coleta de demandas e consolidação das aquisições pretendidas para 2027
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={loadDemands} title="Recarregar" disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button onClick={() => navigate("/nova-demanda-2027")} className="bg-[#D9415D] hover:bg-[#C0354E] text-white font-bold shadow-md">
              <Plus className="mr-2 h-4.5 w-4.5" /> Apresentar Demanda
            </Button>
          </div>
        </div>

        {/* Dashboard Cards / KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
            <CardHeader className="py-4 pb-2">
              <CardDescription className="text-xs uppercase font-bold tracking-wider">Demandas Enviadas</CardDescription>
              <CardTitle className="text-2xl font-bold">{totalSubmitted}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
            <CardHeader className="py-4 pb-2">
              <CardDescription className="text-xs uppercase font-bold tracking-wider">Valor Total Estimado</CardDescription>
              <CardTitle className="text-2xl font-bold text-primary">
                {totalValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
            <CardHeader className="py-4 pb-2">
              <CardDescription className="text-xs uppercase font-bold tracking-wider">Aprovadas</CardDescription>
              <CardTitle className="text-2xl font-bold text-emerald-500">{totalApproved}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
            <CardHeader className="py-4 pb-2">
              <CardDescription className="text-xs uppercase font-bold tracking-wider">Pendentes</CardDescription>
              <CardTitle className="text-2xl font-bold text-amber-500">{totalPending}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
            <CardHeader className="py-4 pb-2">
              <CardDescription className="text-xs uppercase font-bold tracking-wider">Não Aprovadas</CardDescription>
              <CardTitle className="text-2xl font-bold text-rose-500">{totalRejected}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* List of Demands */}
        <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-sm">
          <CardHeader className="pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold">Quadro Geral de Demandas</CardTitle>
              <CardDescription>Consulte as demandas e acompanhe as decisões da administração</CardDescription>
            </div>
            <div className="flex items-center w-full max-w-sm gap-2 bg-slate-50 dark:bg-slate-950 border px-3 py-1 rounded-lg">
              <Search className="h-4 w-4 text-slate-400" />
              <Input
                placeholder="Pesquisar por descrição, setor, código..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-none bg-transparent h-8 focus-visible:ring-0 p-0 text-sm"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-100/50 dark:bg-slate-800/30">
                    <TableHead className="font-bold">Unidade</TableHead>
                    <TableHead className="font-bold">Objeto / Descrição</TableHead>
                    <TableHead className="font-bold">CATMAT/SER</TableHead>
                    <TableHead className="font-bold text-right">Qtd</TableHead>
                    <TableHead className="font-bold text-right">Valor Unitário</TableHead>
                    <TableHead className="font-bold text-right">Valor Total</TableHead>
                    <TableHead className="font-bold text-center">Prioridade</TableHead>
                    <TableHead className="font-bold text-center">Aprovação</TableHead>
                    {isManagerOrAdmin && <TableHead className="font-bold text-center">Ações de Análise</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={isManagerOrAdmin ? 9 : 8} className="text-center py-10 text-slate-500">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" /> Carregando demandas...
                      </TableCell>
                    </TableRow>
                  ) : filteredDemands.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isManagerOrAdmin ? 9 : 8} className="text-center py-10 text-slate-500">
                        Nenhuma demanda encontrada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDemands.map((row) => (
                      <TableRow key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                        <TableCell className="font-semibold">{row.unidade_demandante}</TableCell>
                        <TableCell className="max-w-xs">
                          <div className="font-medium text-slate-900 dark:text-white line-clamp-2">{row.descricao}</div>
                          {row.status_aprovacao === "Não aprovada" && row.justificativa_nao_aprovacao && (
                            <div className="text-xs text-rose-500 mt-1.5 p-2 bg-rose-500/5 border border-rose-500/10 rounded">
                              <span className="font-bold">Motivo Rejeição:</span> {row.justificativa_nao_aprovacao}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-semibold">
                            {row.catmat_catser_tipo}: {row.catmat_catser_codigo}
                          </Badge>
                          {row.categoria_material_ou_servico && (
                            <div className="text-[10px] text-muted-foreground mt-0.5">{row.categoria_material_ou_servico}</div>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">{row.quantidade} {row.unidade_fornecimento}</TableCell>
                        <TableCell className="text-right font-mono">
                          {Number(row.valor_unitario).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </TableCell>
                        <TableCell className="text-right font-bold font-mono">
                          {Number(row.valor_total).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className={`font-semibold ${
                            row.prioridade === "Alta" ? "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400" :
                            row.prioridade === "Baixa" ? "bg-slate-100 text-slate-700 dark:bg-slate-850 dark:text-slate-400" :
                            "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                          }`}>
                            {row.prioridade}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">{getStatusBadge(row.status_aprovacao)}</TableCell>
                        {isManagerOrAdmin && (
                          <TableCell className="text-center">
                            {row.status_aprovacao === "Pendente de análise" ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                  title="Aprovar Integralmente"
                                  onClick={() => handleApproveIntegral(row.id)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                                  title="Aprovar Parcialmente"
                                  onClick={() => {
                                    setSelectedDemand(row);
                                    setPartialQuantity(row.quantidade);
                                    setPartialValorUnit(row.valor_unitario);
                                    setIsPartialOpen(true);
                                  }}
                                >
                                  <CheckSquare className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                  title="Não Aprovar"
                                  onClick={() => {
                                    setSelectedDemand(row);
                                    setRejectReason("");
                                    setIsRejectOpen(true);
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-muted-foreground font-semibold">Análise Concluída</span>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Modal: Approve Partially */}
        <Dialog open={isPartialOpen} onOpenChange={setIsPartialOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Aprovação Parcial de Demanda</DialogTitle>
              <DialogDescription>
                Ajuste os valores ou quantidades da demanda que foram validados.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Objeto</Label>
                <div className="text-sm font-semibold p-2.5 bg-muted/30 rounded border">{selectedDemand?.descricao}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="partial_qty">Quantidade Aprovada</Label>
                  <Input
                    id="partial_qty"
                    type="number"
                    min={1}
                    value={partialQuantity}
                    onChange={(e) => setPartialQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="partial_unit">Valor Unitário Aprovado (R$)</Label>
                  <Input
                    id="partial_unit"
                    type="number"
                    step="0.01"
                    min={0}
                    value={partialValorUnit}
                    onChange={(e) => setPartialValorUnit(Math.max(0, parseFloat(e.target.value) || 0))}
                  />
                </div>
              </div>
              <div className="text-right font-bold text-primary pt-1">
                Novo Total: {(partialQuantity * partialValorUnit).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPartialOpen(false)}>Cancelar</Button>
              <Button onClick={handleApprovePartialSubmit} className="bg-primary text-primary-foreground">Salvar Aprovação Parcial</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal: Reject Demand */}
        <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-rose-500">
                <AlertTriangle className="h-5 w-5" /> Reprovar Demanda
              </DialogTitle>
              <DialogDescription>
                Ao recusar a incorporação da demanda ao PCA 2027, você deve registrar uma justificativa formal obrigatória.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Objeto</Label>
                <div className="text-sm font-semibold p-2.5 bg-muted/30 rounded border line-clamp-2">{selectedDemand?.descricao}</div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reject_reason">Justificativa da Não Aprovação</Label>
                <Textarea
                  id="reject_reason"
                  placeholder="Justifique por que esta demanda não foi aprovada..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRejectOpen(false)}>Cancelar</Button>
              <Button onClick={handleRejectSubmit} className="bg-rose-600 hover:bg-rose-700 text-white font-bold">
                Confirmar Não Aprovação
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
