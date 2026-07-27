import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile, useUserRoles } from "@/lib/auth";
import { toast } from "sonner";
import { Loader2, Plus, Search, Check, AlertTriangle, X, CheckSquare, RefreshCw, FileText, Pencil, Trash2, Eye, RotateCcw } from "lucide-react";

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
  const [partialQuantity, setPartialQuantity] = useState<number | string>(1);
  const [partialValorUnit, setPartialValorUnit] = useState<number | string>(0);
  const [partialReason, setPartialReason] = useState("");

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editQuantity, setEditQuantity] = useState<number | string>(1);
  const [editValorUnit, setEditValorUnit] = useState<number | string>(0);
  const [editJustificativa, setEditJustificativa] = useState("");

  const [isReasonOpen, setIsReasonOpen] = useState(false);

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

  const [filterUnidade, setFilterUnidade] = useState("Todas");
  const [filterCategoria, setFilterCategoria] = useState("Todas");
  const [filterPrioridade, setFilterPrioridade] = useState("Todas");
  const [filterAprovacao, setFilterAprovacao] = useState("Todas");

  const loadDemands = async () => {
    if (!profile || !roles) return;
    setLoading(true);
    try {
      let query = supabase
        .from("contratacoes")
        .select("*")
        .eq("exercicio", 2027);

      if (!isManagerOrAdmin) {
        if ((profile as any).unidade_requisitante_id) {
          query = query.eq("unidade_requisitante_id", (profile as any).unidade_requisitante_id);
        } else {
          // Se não for admin e não tiver unidade vinculada, exibe apenas as que ele mesmo criou
          query = query.eq("created_by", currentUserId);
        }
      }

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
    if (currentUserId && profile && roles) {
      loadDemands();
    }
  }, [currentUserId, profile, roles]);

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

  const handleResetToPending = async (demandId: string) => {
    try {
      const { error } = await supabase
        .from("contratacoes")
        .update({
          status_aprovacao: "Pendente de análise",
          status_planejamento: "Em análise",
          justificativa_alteracao: null,
          justificativa_nao_aprovacao: null,
          updated_at: new Date().toISOString(),
          updated_by: currentUserId || profile?.id || undefined,
        })
        .eq("id", demandId);

      if (error) throw error;
      toast.success("Demanda revertida para 'Pendente de análise' com sucesso.");
      await loadDemands();
    } catch (e: any) {
      console.error("[Planejamento2027] Erro ao reverter decisão:", e);
      toast.error("Erro ao reverter decisão: " + (e.message || String(e)));
    }
  };

  const handleApprovePartialSubmit = async () => {
    if (!selectedDemand) return;
    if (!partialReason.trim()) {
      toast.error("É necessário informar o motivo da aprovação parcial.");
      return;
    }
    try {
      const parsedQty = Math.max(1, parseInt(String(partialQuantity), 10) || 1);
      const parsedUnit = Math.max(0, parseFloat(String(partialValorUnit)) || 0);
      const valTotal = parsedQty * parsedUnit;

      const { error } = await supabase
        .from("contratacoes")
        .update({
          status_aprovacao: "Aprovada parcialmente",
          status_planejamento: "Aprovado",
          quantidade: parsedQty,
          quantidade_itens: parsedQty,
          valor_unitario: parsedUnit,
          valor_estimado: valTotal,
          justificativa_alteracao: partialReason,
          updated_at: new Date().toISOString(),
          updated_by: currentUserId || profile?.id || undefined,
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

  const handleEditDemand = (row: any) => {
    setSelectedDemand(row);
    setEditQuantity(row.quantidade_itens || row.quantidade || 1);
    setEditValorUnit(row.valor_unitario || 0);
    setEditJustificativa(row.justificativa || "");
    setIsEditOpen(true);
  };

  const [editSaving, setEditSaving] = useState(false);

  const handleEditSubmit = async () => {
    if (!selectedDemand) return;
    setEditSaving(true);
    try {
      const parsedQty = Math.max(1, parseInt(String(editQuantity), 10) || 1);
      const parsedUnit = Math.max(0, parseFloat(String(editValorUnit)) || 0);
      const valTotal = parsedQty * parsedUnit;

      const { error } = await supabase
        .from("contratacoes")
        .update({
          quantidade: parsedQty,
          quantidade_itens: parsedQty,
          valor_unitario: parsedUnit,
          valor_estimado: valTotal,
          justificativa: editJustificativa,
          updated_at: new Date().toISOString(),
          updated_by: currentUserId || profile?.id || undefined,
        })
        .eq("id", selectedDemand.id);

      if (error) throw error;
      toast.success("Demanda atualizada com sucesso!");
      setIsEditOpen(false);
      setSelectedDemand(null);
      await loadDemands();
    } catch (e: any) {
      console.error("[Planejamento2027] Erro ao atualizar demanda:", e);
      toast.error("Erro ao atualizar demanda: " + (e.message || String(e)));
    } finally {
      setEditSaving(false);
    }
  };

  // Delete demand dialog state
  const [deleteTargetDemand, setDeleteTargetDemand] = useState<any | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingDemand, setDeletingDemand] = useState(false);

  function openDeleteDemand(row: any) {
    setDeleteTargetDemand(row);
    setIsDeleteOpen(true);
  }

  const confirmDeleteDemand = async () => {
    if (!deleteTargetDemand) return;
    setDeletingDemand(true);
    try {
      const { data, error } = await supabase
        .from("contratacoes")
        .delete()
        .eq("id", deleteTargetDemand.id)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error("Não foi possível excluir a demanda. Verifique se você possui permissão para excluí-la.");
      }

      toast.success("Demanda excluída com sucesso.");
      setIsDeleteOpen(false);
      setDeleteTargetDemand(null);
      await loadDemands();
    } catch (e: any) {
      console.error("[Planejamento2027] Erro ao excluir demanda:", e);
      toast.error("Erro ao excluir demanda: " + (e.message || String(e)));
    } finally {
      setDeletingDemand(false);
    }
  };

  const handleViewReason = (row: any) => {
    setSelectedDemand(row);
    setIsReasonOpen(true);
  };

  // Métricas baseadas apenas nas demandas filtradas (não no total geral se houver filtro)
  // Mas espera, se demands for usado aqui antes de filteredDemands ser declarado, teremos erro.
  // Vou mover isso para baixo de filteredDemands.

  // Extraction for dropdowns
  const uniqueUnidades = Array.from(new Set(demands.map(d => d.unidade_demandante).filter(Boolean))).sort();
  const uniqueCategorias = Array.from(new Set(demands.map(d => d.categoria_material_ou_servico).filter(Boolean))).sort();

  const filteredDemands = demands.filter((d) => {
    const term = search.toLowerCase();
    const matchesSearch = (
      d.descricao?.toLowerCase().includes(term) ||
      d.unidade_demandante?.toLowerCase().includes(term) ||
      d.catmat_catser_codigo?.toLowerCase().includes(term)
    );

    const matchesUnidade = filterUnidade === "Todas" || d.unidade_demandante === filterUnidade;
    const matchesCategoria = filterCategoria === "Todas" || d.categoria_material_ou_servico === filterCategoria;
    const matchesPrioridade = filterPrioridade === "Todas" || (d.grau_prioridade || d.prioridade) === filterPrioridade;
    const matchesAprovacao = filterAprovacao === "Todas" || d.status_aprovacao === filterAprovacao;

    return matchesSearch && matchesUnidade && matchesCategoria && matchesPrioridade && matchesAprovacao;
  });

  // Metrics
  const totalSubmitted = filteredDemands.length;
  const totalValue = filteredDemands.reduce((acc, d) => acc + (Number(d.valor_estimado || d.valor_total) || 0), 0);
  const totalApproved = filteredDemands.filter(d => d.status_aprovacao?.startsWith("Aprovada")).length;
  const totalPending = filteredDemands.filter(d => d.status_aprovacao === "Pendente de análise").length;
  const totalRejected = filteredDemands.filter(d => d.status_aprovacao === "Não aprovada").length;

  const getStatusBadge = (status: string, isAdmin: boolean) => {
    switch (status) {
      case "Aprovada integralmente":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none font-bold">Aprovada Integralmente</Badge>;
      case "Aprovada parcialmente":
        return <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-none font-bold">Aprovada Parcialmente</Badge>;
      case "Não aprovada":
        return <Badge className="bg-rose-500 hover:bg-rose-600 text-white border-none font-bold">Não Aprovada</Badge>;
      default:
        return isAdmin 
          ? <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none font-bold">Pendente</Badge>
          : <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none font-bold text-center leading-tight py-1">Demanda Enviada.<br/>Aguardando Análise</Badge>;
    }
  };

  const handleExportPdf = () => {
    const doc = new jsPDF({ orientation: "landscape" });

    // Logo (if available, we simulate header)
    const logoImg = new Image();
    logoImg.src = "/logo-mppi.png";
    
    logoImg.onload = () => {
      generatePdf(doc, logoImg);
    };

    logoImg.onerror = () => {
      // Fallback without logo
      generatePdf(doc, null);
    };
  };

  const generatePdf = (doc: jsPDF, logoImg: HTMLImageElement | null) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    const addHeaderFooter = (pageNumber: number, totalPages: number) => {
      if (logoImg) {
        doc.addImage(logoImg, "PNG", 14, 10, 55, 14);
      } else {
        doc.setFontSize(14);
        doc.text("MPPI", 14, 20);
      }
      doc.setFontSize(12);
      doc.setTextColor(50, 50, 50);
      const title = isManagerOrAdmin ? "Planejamento PCA 2027 - Geral" : `Planejamento PCA 2027 - ${(profile as any)?.unidades_requisitantes?.nome || "Unidade"}`;
      doc.text(title, pageWidth / 2, 30, { align: "center" });
      
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text("Relatório de consolidação de aquisições pretendidas", pageWidth / 2, 36, { align: "center" });
      
      // Footer
      doc.setFontSize(8);
      doc.text(`Página ${pageNumber} de ${totalPages}`, pageWidth - 20, pageHeight - 10, { align: "right" });
      doc.text("Gerado pelo Sistema PCA MPPI", 14, pageHeight - 10);
    };

    // Group by unidade
    const grouped = filteredDemands.reduce((acc, curr) => {
      const unidade = curr.unidade_demandante || "Unidade Não Informada";
      if (!acc[unidade]) acc[unidade] = [];
      acc[unidade].push(curr);
      return acc;
    }, {} as Record<string, any[]>);

    let startY = 46;
    const sortedUnidades = Object.keys(grouped).sort();

    sortedUnidades.forEach((unidade, index) => {
      const items = grouped[unidade];
      
      if (startY > pageHeight - 40) {
        doc.addPage();
        startY = 46;
      }
      
      doc.setFontSize(11);
      doc.setTextColor(217, 65, 93);
      doc.text(`Unidade Requisitante: ${unidade}`, 14, startY);
      startY += 5;

      const tableBody = items.map(d => [
        d.descricao || "-",
        d.categoria_material_ou_servico || "-",
        d.quantidade_itens || d.quantidade || 0,
        (d.valor_unitario || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
        (d.valor_estimado || d.valor_total || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
        d.grau_prioridade || d.prioridade || "-",
        d.status_aprovacao || "Pendente"
      ]);

      autoTable(doc, {
        head: [["Objeto / Descrição", "Categoria / Grupo", "Qtd", "Valor Unit.", "Valor Total", "Prioridade", "Situação"]],
        body: tableBody,
        startY: startY,
        theme: "grid",
        styles: { fontSize: 8 },
        headStyles: { fillColor: [217, 65, 93], textColor: [255, 255, 255], fontStyle: "bold", halign: "center" },
        columnStyles: {
          0: { cellWidth: "auto" },
          1: { cellWidth: 35 },
          2: { cellWidth: 15, halign: "right" },
          3: { cellWidth: 25, halign: "right" },
          4: { cellWidth: 25, halign: "right" },
          5: { cellWidth: 20, halign: "center" },
          6: { cellWidth: 30, halign: "center" }
        },
        margin: { bottom: 20 }
      });

      startY = (doc as any).lastAutoTable.finalY + 15;
    });

    const pageCount = (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      addHeaderFooter(i, pageCount);
    }

    doc.save("Relatorio_PCA_2027.pdf");
    toast.success("Relatório PDF exportado com sucesso!");
  };

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              {isManagerOrAdmin ? "Planejamento PCA 2027" : `Minhas Demandas - ${(profile as any)?.unidades_requisitantes?.nome || "Unidade"}`}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isManagerOrAdmin 
                ? "Painel relata todas as demandas recebidas para consolidação." 
                : "Acompanhe a lista de aquisições pretendidas enviadas ao PCA 2027."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={handleExportPdf} 
              disabled={loading || filteredDemands.length === 0}
              title="Exportar Relatório em PDF"
              className="border-red-200 bg-red-50/60 dark:bg-red-950/30 text-red-700 dark:text-red-300 hover:bg-red-100 hover:text-red-800 dark:hover:bg-red-900/50 font-bold shadow-sm flex items-center gap-2 px-3.5 transition-all"
            >
              <FileText className="h-4.5 w-4.5 text-red-600 dark:text-red-400 shrink-0" />
              <span className="font-extrabold text-[11px] tracking-wider uppercase text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/60 px-1.5 py-0.5 rounded border border-red-200/80 dark:border-red-800/80">PDF</span>
              <span className="text-sm font-bold">Exportar PDF</span>
            </Button>
            <Button variant="outline" size="icon" onClick={loadDemands} title="Recarregar" disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            {isManagerOrAdmin || roles?.includes("setor_requisitante") ? (
              <Button onClick={() => navigate("/nova-demanda")} className="bg-[#D9415D] hover:bg-[#C0354E] text-white font-bold shadow-md">
                <Plus className="mr-2 h-4.5 w-4.5" /> Apresentar Demanda
              </Button>
            ) : null}
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
          <div className="px-6 pb-4 pt-0 grid grid-cols-1 md:grid-cols-4 gap-4 border-b border-slate-100 dark:border-slate-800">
            {isManagerOrAdmin && (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Unidade Requisitante</Label>
                <Select value={filterUnidade} onValueChange={setFilterUnidade}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Todas" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todas">Todas as unidades</SelectItem>
                    {uniqueUnidades.map(u => <SelectItem key={u as string} value={u as string}>{u as string}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Categoria / Grupo</Label>
              <Select value={filterCategoria} onValueChange={setFilterCategoria}>
                <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Todas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todas">Todas as categorias</SelectItem>
                  {uniqueCategorias.map(c => <SelectItem key={c as string} value={c as string}>{c as string}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Grau de Prioridade</Label>
              <Select value={filterPrioridade} onValueChange={setFilterPrioridade}>
                <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Todas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todas">Todas as prioridades</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Aprovação</Label>
              <Select value={filterAprovacao} onValueChange={setFilterAprovacao}>
                <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Todas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todas">Todas</SelectItem>
                  <SelectItem value="Aprovada integralmente">Aprovada Integralmente</SelectItem>
                  <SelectItem value="Aprovada parcialmente">Aprovada Parcialmente</SelectItem>
                  <SelectItem value="Não aprovada">Não Aprovada</SelectItem>
                  <SelectItem value="Pendente de análise">
                    {isManagerOrAdmin ? "Pendente" : "Aguardando Análise"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary hover:bg-primary/90">
                    {isManagerOrAdmin && <TableHead className="font-bold text-white text-center">Unidade</TableHead>}
                    <TableHead className="font-bold text-white text-center">Objeto / Descrição</TableHead>
                    <TableHead className="font-bold text-white text-center">Categoria / Grupo</TableHead>
                    <TableHead className="font-bold text-white text-center">Qtd</TableHead>
                    <TableHead className="font-bold text-white text-center">Valor Unitário</TableHead>
                    <TableHead className="font-bold text-white text-center">Valor Total</TableHead>
                    <TableHead className="font-bold text-white text-center">Prioridade</TableHead>
                    <TableHead className="font-bold text-white text-center">Aprovação</TableHead>
                    <TableHead className="font-bold text-white text-center">{isManagerOrAdmin ? "Ações de Análise" : "Ações"}</TableHead>
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
                        {isManagerOrAdmin && <TableCell className="font-semibold">{row.unidade_demandante}</TableCell>}
                        <TableCell className="max-w-xs">
                          <div className="font-medium text-slate-900 dark:text-white line-clamp-2">{row.descricao}</div>
                          {row.status_aprovacao === "Não aprovada" && row.justificativa_nao_aprovacao && (
                            <div className="text-xs text-rose-500 mt-1.5 p-2 bg-rose-500/5 border border-rose-500/10 rounded">
                              <span className="font-bold">Motivo Rejeição:</span> {row.justificativa_nao_aprovacao}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-slate-700 dark:text-slate-300">
                            {row.categoria_material_ou_servico || "—"}
                          </div>
                          {row.catmat_catser_codigo && (
                            <Badge variant="outline" className="mt-1.5 text-[10px] text-slate-500 font-mono">
                              {row.catmat_catser_tipo}: {row.catmat_catser_codigo}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">{row.quantidade_itens || row.quantidade || 0} {row.unidade_fornecimento}</TableCell>
                        <TableCell className="text-right font-mono">
                          {Number(row.valor_unitario || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </TableCell>
                        <TableCell className="text-right font-bold font-mono">
                          {Number(row.valor_estimado || row.valor_total || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className={`font-semibold ${
                            (row.grau_prioridade || row.prioridade) === "Alta" ? "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400" :
                            (row.grau_prioridade || row.prioridade) === "Baixa" ? "bg-slate-100 text-slate-700 dark:bg-slate-850 dark:text-slate-400" :
                            "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                          }`}>
                            {row.grau_prioridade || row.prioridade}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">{getStatusBadge(row.status_aprovacao, isManagerOrAdmin || false)}</TableCell>
                        <TableCell className="text-center">
                          {isManagerOrAdmin ? (
                            <div className="flex items-center justify-center gap-1 flex-wrap">
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
                                  setPartialQuantity(row.quantidade_itens || row.quantidade || 1);
                                  setPartialValorUnit(row.valor_unitario || 0);
                                  setPartialReason(row.justificativa_alteracao || "");
                                  setIsPartialOpen(true);
                                }}
                              >
                                <CheckSquare className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                                title="Editar Demanda"
                                onClick={() => handleEditDemand(row)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                title="Não Aprovar"
                                onClick={() => {
                                  setSelectedDemand(row);
                                  setRejectReason(row.justificativa_nao_aprovacao || "");
                                  setIsRejectOpen(true);
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              {row.status_aprovacao !== "Pendente de análise" && (
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/30"
                                  title="Reverter decisão (Voltar para Pendente de Análise)"
                                  onClick={() => handleResetToPending(row.id)}
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              )}
                              {(row.status_aprovacao === "Aprovada parcialmente" || row.status_aprovacao === "Não aprovada") && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-sky-600 hover:text-sky-700 hover:bg-sky-50 dark:hover:bg-sky-950/30"
                                  title="Ver Motivo da Análise"
                                  onClick={() => handleViewReason(row)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                title="Excluir Demanda"
                                onClick={() => openDeleteDemand(row)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            row.status_aprovacao === "Pendente de análise" ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                                  title="Editar Demanda"
                                  onClick={() => handleEditDemand(row)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                  title="Excluir Demanda"
                                  onClick={() => openDeleteDemand(row)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              (row.status_aprovacao === "Aprovada parcialmente" || row.status_aprovacao === "Não aprovada") ? (
                                <Button
                                  size="sm"
                                  className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                  onClick={() => handleViewReason(row)}
                                >
                                  <Eye className="h-3 w-3 mr-1" /> Ver Motivo
                                </Button>
                              ) : (
                                <span className="text-[11px] text-emerald-600 font-semibold">Aprovada</span>
                              )
                            )
                          )}
                        </TableCell>
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
          <DialogContent className="max-w-md p-0 overflow-hidden">
            <DialogHeader className="bg-primary px-6 py-4">
              <DialogTitle className="text-white">Aprovação Parcial de Demanda</DialogTitle>
              <DialogDescription className="text-slate-100">
                Ajuste os valores ou quantidades da demanda que foram validados.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 px-6 py-3">
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
                    onChange={(e) => setPartialQuantity(e.target.value)}
                    onBlur={() => {
                      if (partialQuantity === "" || Number(partialQuantity) < 1) setPartialQuantity(1);
                    }}
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
                    onChange={(e) => setPartialValorUnit(e.target.value)}
                    onBlur={() => {
                      if (partialValorUnit === "" || Number(partialValorUnit) < 0) setPartialValorUnit(0);
                    }}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="partial_reason">Motivo da Aprovação Parcial</Label>
                <Textarea
                  id="partial_reason"
                  placeholder="Justifique a alteração da quantidade ou valor..."
                  value={partialReason}
                  onChange={(e) => setPartialReason(e.target.value)}
                  rows={3}
                  required
                />
              </div>
              <div className="text-right font-bold text-primary pt-1">
                Novo Total: {((Math.max(1, parseInt(String(partialQuantity), 10) || 1)) * (Math.max(0, parseFloat(String(partialValorUnit)) || 0))).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </div>
            </div>
            <DialogFooter className="px-6 py-4 bg-slate-50 border-t">
              <Button variant="outline" onClick={() => setIsPartialOpen(false)}>Cancelar</Button>
              <Button onClick={handleApprovePartialSubmit} className="bg-primary text-primary-foreground">Salvar Aprovação Parcial</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal: Reject Demand */}
        <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
          <DialogContent className="max-w-md p-0 overflow-hidden">
            <DialogHeader className="bg-primary px-6 py-4">
              <DialogTitle className="flex items-center gap-2 text-white">
                <AlertTriangle className="h-5 w-5" /> Reprovar Demanda
              </DialogTitle>
              <DialogDescription className="text-slate-100">
                Ao recusar a incorporação da demanda ao PCA 2027, você deve registrar uma justificativa formal obrigatória.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 px-6 py-3">
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
            <DialogFooter className="px-6 py-4 bg-slate-50 border-t">
              <Button variant="outline" onClick={() => setIsRejectOpen(false)}>Cancelar</Button>
              <Button onClick={handleRejectSubmit} className="bg-rose-600 hover:bg-rose-700 text-white font-bold">
                Confirmar Não Aprovação
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal: Edit Demand */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-lg p-0 overflow-hidden">
            <DialogHeader className="bg-primary px-6 py-4">
              <DialogTitle className="flex items-center gap-2 text-white">
                <Pencil className="h-5 w-5" /> Editar Demanda
              </DialogTitle>
              <DialogDescription className="text-slate-100">
                Altere os quantitativos e valores da demanda pendente.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 px-6 py-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Objeto</Label>
                <div className="text-sm font-semibold p-2.5 bg-muted/30 rounded border line-clamp-2">{selectedDemand?.descricao}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit_qty">Quantidade</Label>
                  <Input
                    id="edit_qty"
                    type="number"
                    min={1}
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(e.target.value)}
                    onBlur={() => {
                      if (editQuantity === "" || Number(editQuantity) < 1) setEditQuantity(1);
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit_unit">Valor Unitário (R$)</Label>
                  <Input
                    id="edit_unit"
                    type="number"
                    step="0.01"
                    min={0}
                    value={editValorUnit}
                    onChange={(e) => setEditValorUnit(e.target.value)}
                    onBlur={() => {
                      if (editValorUnit === "" || Number(editValorUnit) < 0) setEditValorUnit(0);
                    }}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit_justificativa">Justificativa da Demanda</Label>
                <Textarea
                  id="edit_justificativa"
                  placeholder="Descreva a justificativa para esta contratação..."
                  value={editJustificativa}
                  onChange={(e) => setEditJustificativa(e.target.value)}
                  rows={5}
                  className="min-h-[140px] resize-y"
                />
              </div>
              <div className="text-right font-bold text-primary pt-1">
                Novo Total: {((Math.max(1, parseInt(String(editQuantity), 10) || 1)) * (Math.max(0, parseFloat(String(editValorUnit)) || 0))).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </div>
            </div>
            <DialogFooter className="px-6 py-4 bg-slate-50 border-t">
              <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={editSaving}>Cancelar</Button>
              <Button onClick={handleEditSubmit} disabled={editSaving} className="bg-primary text-primary-foreground">
                {editSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal: View Reason */}
        <Dialog open={isReasonOpen} onOpenChange={setIsReasonOpen}>
          <DialogContent className="max-w-md p-0 overflow-hidden">
            <DialogHeader className="bg-primary px-6 py-4">
              <DialogTitle className="text-white">Motivo da Análise</DialogTitle>
              <DialogDescription className="text-slate-100">
                Justificativa registrada para a decisão da Administração.
              </DialogDescription>
            </DialogHeader>
            <div className="p-6 space-y-4">
              {selectedDemand?.status_aprovacao === "Aprovada parcialmente" && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-900 dark:text-blue-100 font-medium">
                  <strong>Decisão:</strong> Aprovação Parcial
                </div>
              )}
              {selectedDemand?.status_aprovacao === "Não aprovada" && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg text-sm text-rose-900 dark:text-rose-100 font-medium">
                  <strong>Decisão:</strong> Demanda Não Aprovada
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Justificativa da Administração</Label>
                <div className="p-3.5 bg-muted/40 rounded-lg text-sm border text-foreground leading-relaxed">
                  {selectedDemand?.justificativa_alteracao || selectedDemand?.justificativa_nao_aprovacao || "Nenhum motivo registrado."}
                </div>
              </div>

              {selectedDemand?.status_aprovacao === "Aprovada parcialmente" && (
                <div className="p-3 bg-slate-50 dark:bg-slate-900 border rounded-lg text-xs space-y-1 text-slate-700 dark:text-slate-300">
                  <div className="flex justify-between"><span>Qtd. Aprovada:</span> <strong>{selectedDemand?.quantidade_itens || selectedDemand?.quantidade}</strong></div>
                  <div className="flex justify-between"><span>Valor Unit. Aprovado:</span> <strong>{Number(selectedDemand?.valor_unitario || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong></div>
                  <div className="flex justify-between border-t pt-1 font-semibold text-primary"><span>Valor Total Aprovado:</span> <strong>{Number(selectedDemand?.valor_estimado || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong></div>
                </div>
              )}
            </div>
            <DialogFooter className="px-6 py-3 bg-slate-50 border-t">
              <Button onClick={() => setIsReasonOpen(false)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal: Delete Demand Confirmation */}
        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Demanda</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta demanda? Esta ação é permanente e removerá o item do planejamento 2027.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deletingDemand}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={confirmDeleteDemand}
                disabled={deletingDemand}
              >
                {deletingDemand ? "Excluindo..." : "Confirmar exclusão"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </Layout>
  );
}
