import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, Copy } from "lucide-react";

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
  const [confMap, setConfMap] = useState<Record<string, number>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const calculateConformity = (data: Record<string, any>) => {
    const total: number = CHECKLIST_ITEMS.length;
    if (total === 0) return 0;
    let checked = 0;
    CHECKLIST_ITEMS.forEach((item) => {
      if (data[item.key]) checked++;
    });
    return Math.round((checked / total) * 100);
  };

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("contratacoes")
          .select("id, codigo, descricao, setor_requisitante, etapa_processo, sobrestado, valor_estimado, numero_sei_contratacao")
          .order("created_at", { ascending: false });
        if (error) throw error;
        if (mounted) setRows((data as any) || []);
        // Carregar conformidade agregada para todas as contratações
        const ids = ((data as any) || []).map((r: any) => r.id);
        if (ids.length) {
          try {
            const { data: confAll, error: confErr } = await supabase
              .from("contratacoes_conformidade")
              .select("*")
              .in("contratacao_id", ids);
            if (confErr) throw confErr;
            const map: Record<string, number> = {};
            (confAll || []).forEach((c: any) => {
              map[c.contratacao_id] = calculateConformity(c);
            });
            if (mounted) setConfMap(map);
          } catch (err: any) {
            toast.error("Erro ao carregar conformidade agregada", { description: err?.message || String(err) });
            if (mounted) setConfMap({});
          }
        } else {
          if (mounted) setConfMap({});
        }
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
      const idStr = String(r.id).toLowerCase();
      const shortId = String(r.id).slice(-8).toLowerCase();
      const codigo = (r as any).codigo?.toLowerCase() || "";
      const matches = r.descricao.toLowerCase().includes(q) || idStr.includes(q) || shortId.includes(q) || codigo.includes(q);
      if (!matches) return false;
      if (setorFiltro !== "todos" && (r.setor_requisitante || "") !== setorFiltro) return false;
      const s = statusLabel(r);
      if (statusFiltro !== "todos" && s !== statusFiltro) return false;
      return true;
    });
  }, [rows, search, setorFiltro, statusFiltro]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const conformityBadge = (pct: number | undefined) => {
    const val = pct ?? 0;
    if (val >= 80) return { variant: "secondary", className: "bg-success/10 text-success", text: `${val}%` };
    if (val >= 30) return { variant: "secondary", className: "bg-warning/10 text-warning", text: `${val}%` };
    return { variant: "secondary", className: "bg-muted/10 text-muted-foreground", text: `${val}%` };
  };

  const openChecklist = async (row: Contratacao) => {
    setOpenAudit({ id: row.id, sei: (row as any).numero_sei_contratacao || undefined });
    setAuditState({});
    setAuditNotes("");
    
    // Buscar conformidade da nova tabela dedicada
    const { data: conf } = await supabase
      .from("contratacoes_conformidade")
      .select("*")
      .eq("contratacao_id", row.id)
      .maybeSingle();
    
    if (conf) {
      setAuditState({
        termo_referencia_aprovado: conf.termo_referencia_aprovado || false,
        pesquisa_mercado: conf.pesquisa_mercado || false,
        pareceres_juridicos: conf.pareceres_juridicos || false,
        publicacao_edital: conf.publicacao_edital || false,
        atas_certame: conf.atas_certame || false,
        atos_autorizacao: conf.atos_autorizacao || false,
        documentacao_fornecedor: conf.documentacao_fornecedor || false,
        termo_homologacao: conf.termo_homologacao || false,
        termo_adjudicacao: conf.termo_adjudicacao || false,
      });
      setAuditNotes(conf.observacao || "");
    }
  };

  const saveChecklist = async () => {
    if (!openAudit) return;
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error("Usuário não autenticado");
        return;
      }

      // Salvar na tabela dedicada usando upsert
      const { error } = await supabase
        .from("contratacoes_conformidade")
        .upsert({
          contratacao_id: openAudit.id,
          user_id: userData.user.id,
          termo_referencia_aprovado: auditState.termo_referencia_aprovado || false,
          pesquisa_mercado: auditState.pesquisa_mercado || false,
          pareceres_juridicos: auditState.pareceres_juridicos || false,
          publicacao_edital: auditState.publicacao_edital || false,
          atas_certame: auditState.atas_certame || false,
          atos_autorizacao: auditState.atos_autorizacao || false,
          documentacao_fornecedor: auditState.documentacao_fornecedor || false,
          termo_homologacao: auditState.termo_homologacao || false,
          termo_adjudicacao: auditState.termo_adjudicacao || false,
          observacao: auditNotes || null,
        }, { onConflict: 'contratacao_id' });

      if (error) throw error;
      
      // Atualizar o confMap localmente para refletir a mudança imediatamente
      const newPct = calculateConformity(auditState);
      setConfMap((prev) => ({ ...prev, [openAudit.id]: newPct }));

      toast.success("Checklist salvo");
      setOpenAudit(null);
    } catch (e: any) {
      toast.error("Falha ao salvar checklist", { description: e.message || String(e) });
    }
  };

  const exportCSV = () => {
    const header = ["ID", "Código", "Descrição", "Setor", "Status", "Valor Estimado"].join(",");
    const lines = filtered.map((r) => [
      r.id,
      (r as any).codigo || "",
      `"${r.descricao.replace(/"/g, '""')}"`,
      r.setor_requisitante || "",
      statusLabel(r),
      String(r.valor_estimado || 0)
    ].join(","));
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
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por ID ou descrição" />
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
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-muted-foreground">{filtered.length} resultados</div>
              <div className="flex items-center gap-2">
                <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                  <SelectTrigger className="h-8 w-[140px]"><SelectValue placeholder="Itens por página" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 por página</SelectItem>
                    <SelectItem value="20">20 por página</SelectItem>
                    <SelectItem value="50">50 por página</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-40 text-muted-foreground"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Carregando...</div>
            ) : (
              <div className="rounded-lg border border-border bg-card overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[110px]">ID</TableHead>
                      <TableHead className="min-w-[280px]">Descrição</TableHead>
                      <TableHead className="w-[160px]">Setor</TableHead>
                      <TableHead className="w-[120px]">Status</TableHead>
                      <TableHead className="w-[120px]">Conformidade</TableHead>
                      <TableHead className="w-[140px]">Valor Estimado</TableHead>
                      <TableHead className="w-[140px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhuma contratação encontrada.</TableCell></TableRow>
                    ) : (
                      paginated.map((r) => (
                        <TableRow key={r.id} className="hover:bg-muted/40">
                          <TableCell className="font-medium">{(r as any).codigo || String(r.id).slice(-8)}</TableCell>
                          <TableCell><div className="truncate" title={r.descricao}>{r.descricao}</div></TableCell>
                          <TableCell>{r.setor_requisitante || "-"}</TableCell>
                          <TableCell>
                            {(() => { const s = statusLabel(r); const b = getStatusBadge(s); return <Badge variant={b.variant as any} className={b.className}>{s}</Badge>; })()}
                          </TableCell>
                          <TableCell>
                            {(() => { const b = conformityBadge(confMap[r.id]); return <Badge variant={b.variant as any} className={b.className}>{b.text}</Badge>; })()}
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
                <div className="flex items-center justify-between p-2">
                  <div className="text-xs text-muted-foreground">Página {page}</div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="xs" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Anterior</Button>
                    <Button variant="outline" size="xs" onClick={() => setPage((p) => (p * pageSize >= filtered.length ? p : p + 1))} disabled={page * pageSize >= filtered.length}>Próxima</Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={!!openAudit} onOpenChange={() => setOpenAudit(null)}>
          <DialogContent className="max-w-xl p-0 overflow-hidden [&>button]:text-white">
            <DialogHeader className="bg-sidebar p-6">
              <DialogTitle className="text-white">Auditoria</DialogTitle>
              <DialogDescription className="text-white/80">Preencha a checklist e registre observações para a contratação selecionada.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 p-6">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>SEI:</span>
                <Badge variant="secondary" className="text-[10px]">{openAudit?.sei || "—"}</Badge>
                {openAudit?.sei ? (
                  <Button
                    variant="ghost"
                    size="xs"
                    className="h-6 w-6 p-0"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(String(openAudit?.sei));
                        toast.success("Número SEI copiado");
                      } catch {
                        toast.error("Falha ao copiar número SEI");
                      }
                    }}
                    title="Copiar número SEI"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                ) : null}
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
