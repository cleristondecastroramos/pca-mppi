import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type Contratacao = Tables<"contratacoes">;

const CHECKLIST_ITEMS = [
  { key: "termo_referencia_aprovado", label: "Termo de Referência aprovado" },
  { key: "pesquisa_mercado", label: "Pesquisa de Mercado" },
  { key: "pareceres_juridicos", label: "Pareceres Jurídicos emitidos sobre a licitação" },
  { key: "publicacao_edital", label: "Publicação de edital conforme normas" },
  { key: "atas_certame", label: "Atas do Certame" },
  { key: "atos_autorizacao", label: "Atos de autorização registrados" },
  { key: "documentacao_fornecedor", label: "Documentação do fornecedor completa" },
  { key: "termo_homologacao", label: "Termo de Homologação" },
  { key: "termo_adjudicacao", label: "Termo de Adjudicação" },
] as const;

const AvaliacaoConformidade = () => {
  const [rows, setRows] = useState<Contratacao[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [setorFiltro, setSetorFiltro] = useState<string>("todos");
  const [statusFiltro, setStatusFiltro] = useState<string>("todos");
  const [openAudit, setOpenAudit] = useState<{ id: string; sei?: string } | null>(null);
  const [auditState, setAuditState] = useState<Record<string, boolean>>({});
  const [auditNotes, setAuditNotes] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("contratacoes")
          .select("id, descricao, setor_requisitante, etapa_processo, sobrestado, valor_estimado, numero_sei_contratacao")
          .order("created_at", { ascending: false });
        if (error) throw error;
        if (mounted) setRows((data as any) || []);
      } catch (e: any) {
        toast.error("Erro ao carregar contratações", { description: e.message || String(e) });
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    const { data: sub } = supabase.auth.onAuthStateChange(() => fetchData());
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const statusLabel = (c: Contratacao) => {
    if ((c as any).sobrestado === true) return "sobrestado";
    if (c.etapa_processo === "Concluído") return "concluído";
    if (c.etapa_processo === "Em Licitação" || c.etapa_processo === "Contratado") return "em andamento";
    return "não iniciado";
  };
  const getStatusBadge = (label: string) => {
    const variants: Record<string, { variant: any; className: string }> = {
      "não iniciado": { variant: "secondary", className: "bg-info/10 text-info" },
      "em andamento": { variant: "secondary", className: "bg-warning/10 text-warning" },
      "concluído": { variant: "secondary", className: "bg-success/10 text-success" },
      "sobrestado": { variant: "secondary", className: "bg-muted/10 text-muted-foreground" },
    };
    return variants[label] || variants["não iniciado"];
  };

  const distinctSetores = useMemo(() => {
    const s = new Set<string>();
    rows.forEach((r) => { if (r.setor_requisitante) s.add(String(r.setor_requisitante)); });
    return Array.from(s).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      const matches = r.descricao.toLowerCase().includes(q) || (r.setor_requisitante || "").toLowerCase().includes(q);
      if (!matches) return false;
      if (setorFiltro !== "todos" && (r.setor_requisitante || "") !== setorFiltro) return false;
      const s = statusLabel(r);
      if (statusFiltro !== "todos" && s !== statusFiltro) return false;
      return true;
    });
  }, [rows, search, setorFiltro, statusFiltro]);

  const openChecklist = async (row: Contratacao) => {
    setOpenAudit({ id: row.id, sei: (row as any).numero_sei_contratacao || undefined });
    setAuditState({});
    setAuditNotes("");
    const { data } = await supabase
      .from("contratacoes_historico")
      .select("dados_novos, created_at")
      .eq("contratacao_id", row.id)
      .eq("acao", "Conformidade")
      .order("created_at", { ascending: false })
      .limit(1);
    const last = (data && data[0]?.dados_novos) as any;
    const conf = last?.conformidade as { checklist?: Record<string, boolean>; observacao?: string } | undefined;
    if (conf) {
      setAuditState(conf.checklist || {});
      setAuditNotes(conf.observacao || "");
    }
  };

  const saveChecklist = async () => {
    if (!openAudit) return;
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { data: before } = await supabase.from("contratacoes").select("*").eq("id", openAudit.id).single();
      const payload = { checklist: auditState, observacao: auditNotes };
      if (userData.user) {
        await supabase.from("contratacoes_historico").insert({
          contratacao_id: openAudit.id,
          user_id: userData.user.id,
          acao: "Conformidade",
          dados_anteriores: before,
          dados_novos: { ...(before || {}), conformidade: payload },
        });
      }
      toast.success("Checklist salvo");
      setOpenAudit(null);
    } catch (e: any) {
      toast.error("Falha ao salvar checklist", { description: e.message || String(e) });
    }
  };

  const exportCSV = () => {
    const header = ["ID", "Descrição", "Setor", "Status", "Valor Estimado"].join(",");
    const lines = filtered.map((r) => [r.id, `"${r.descricao.replace(/"/g, '""')}"`, r.setor_requisitante || "", statusLabel(r), String(r.valor_estimado || 0)].join(","));
    const csv = [header, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "conformidade.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Avaliação e Conformidade</h1>
            <p className="text-sm text-muted-foreground">Audite e verifique conformidade.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="xs" onClick={exportCSV}>Exportar CSV</Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-3">
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex-1 min-w-[220px]">
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por descrição ou setor" />
              </div>
              <div className="w-[200px]">
                <Select value={setorFiltro} onValueChange={setSetorFiltro}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Setor" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {distinctSetores.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[200px]">
                <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="não iniciado">não iniciado</SelectItem>
                    <SelectItem value="em andamento">em andamento</SelectItem>
                    <SelectItem value="concluído">concluído</SelectItem>
                    <SelectItem value="sobrestado">sobrestado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Auditorias e Checklists</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-40 text-muted-foreground"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Carregando...</div>
            ) : (
              <div className="rounded-lg border border-border bg-card overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[280px]">Descrição</TableHead>
                      <TableHead className="w-[160px]">Setor</TableHead>
                      <TableHead className="w-[120px]">Status</TableHead>
                      <TableHead className="w-[140px]">Valor Estimado</TableHead>
                      <TableHead className="w-[140px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhuma contratação encontrada.</TableCell></TableRow>
                    ) : (
                      filtered.map((r) => (
                        <TableRow key={r.id} className="hover:bg-muted/40">
                          <TableCell><div className="truncate" title={r.descricao}>{r.descricao}</div></TableCell>
                          <TableCell>{r.setor_requisitante || "-"}</TableCell>
                          <TableCell>
                            {(() => { const s = statusLabel(r); const b = getStatusBadge(s); return <Badge variant={b.variant as any} className={b.className}>{s}</Badge>; })()}
                          </TableCell>
                          <TableCell className="text-right">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(r.valor_estimado || 0)}</TableCell>
                          <TableCell className="text-right">
                            <Button size="xs" onClick={() => openChecklist(r)}>Auditar</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={!!openAudit} onOpenChange={() => setOpenAudit(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Checklist de Conformidade</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>SEI:</span>
                <Badge variant="secondary" className="text-[10px]">{openAudit?.sei || "—"}</Badge>
              </div>
              {CHECKLIST_ITEMS.map((it) => (
                <label key={it.key} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={!!auditState[it.key]} onCheckedChange={(v) => setAuditState((s) => ({ ...s, [it.key]: !!v }))} />
                  {it.label}
                </label>
              ))}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Observações</label>
                <Textarea value={auditNotes} onChange={(e) => setAuditNotes(e.target.value)} rows={3} placeholder="Observações e apontamentos" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setOpenAudit(null)}>Cancelar</Button>
                <Button size="sm" onClick={saveChecklist}>Salvar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default AvaliacaoConformidade;
