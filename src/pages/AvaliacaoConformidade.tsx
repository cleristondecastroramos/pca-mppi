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
import { translateError } from "@/lib/utils/error-translations";
import { Loader2, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

type Contratacao = Tables<"contratacoes">;

const FASE_LICITACAO_CONTRATACAO = [
  { key: "termo_referencia_aprovado", label: "Termo de Referência aprovado" },
  { key: "pesquisa_mercado", label: "Pesquisa de Mercado" },
  { key: "pareceres_juridicos", label: "Pareceres Jurídicos emitidos sobre a licitação" },
  { key: "publicacao_edital", label: "Publicação de edital conforme normas" },
  { key: "atas_certame", label: "Atas do Certame" },
  { key: "termo_homologacao", label: "Termo de Homologação" },
  { key: "termo_adjudicacao", label: "Termo de Adjudicação" },
  { key: "atos_autorizacao", label: "Atos de autorização registrados" },
  { key: "documentacao_fornecedor", label: "Documentação do fornecedor completa" },
  { key: "assinatura_contrato", label: "Assinatura do Contrato" },
  { key: "publicacao_contrato", label: "Publicação do Extrato do Contrato" },
] as const;

const FASE_EXECUCAO = [
  { key: "documento_aceite", label: "Documento de aceite" },
  { key: "justificativa_vantajosidade", label: "Justificativa da vantajosidade" },
  { key: "declaracao_conformidade", label: "Declaração de Conformidade" },
  { key: "pesquisa_precos", label: "Pesquisa de Preços" },
  { key: "mapa_comparativo", label: "Mapa Comparativo" },
  { key: "certidoes_habilitacao", label: "Certidões de habilitação/Contrato social" },
  { key: "margem_calculo", label: "Margem de cálculo" },
  { key: "parecer_orcamentario_financeiro", label: "Pareceres Orçamentário e Financeiro" },
  { key: "parecer_juridico_execucao", label: "Parecer Jurídico" },
  { key: "parecer_conint", label: "Parecer CONINT" },
  { key: "oficio_autorizacao_empenho", label: "Ofício e Autorização de empenho" },
  { key: "atualizar_certidoes", label: "Atualizar certidões" },
  { key: "termo_aditivo_apostilamento", label: "Termo Adtivo/Apostilamento" },
  { key: "publicacoes_execucao", label: "Publicações" },
] as const;

const AvaliacaoConformidade = () => {
  const [rows, setRows] = useState<Contratacao[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [setorFiltro, setSetorFiltro] = useState<string>("todos");
  const [statusFiltro, setStatusFiltro] = useState<string>("todos");
  const [openAudit, setOpenAudit] = useState<{ id: string; sei?: string; srp: boolean } | null>(null);
  const [auditState, setAuditState] = useState<Record<string, boolean>>({});
  const [auditNotes, setAuditNotes] = useState<string>("");
  const [confMap, setConfMap] = useState<Record<string, number>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const calculateConformity = (data: Record<string, any>, isSrp: boolean) => {
    const items = [...FASE_LICITACAO_CONTRATACAO, ...FASE_EXECUCAO];
    const total: number = items.length;
    if (total === 0) return 0;
    let checked = 0;
    items.forEach((item) => {
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
          .select("id, codigo, descricao, setor_requisitante, etapa_processo, sobrestado, valor_estimado, numero_sei_contratacao, srp")
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
            const contratacoesData = (data as any) || [];
            const srpMap: Record<string, boolean> = {};
            contratacoesData.forEach((r: any) => { srpMap[r.id] = !!r.srp; });
            (confAll || []).forEach((c: any) => {
              map[c.contratacao_id] = calculateConformity(c, srpMap[c.contratacao_id] || false);
            });
            if (mounted) setConfMap(map);
          } catch (err: any) {
            toast.error("Erro ao carregar conformidade agregada", { description: translateError(err?.message || String(err)) });
            if (mounted) setConfMap({});
          }
        } else {
          if (mounted) setConfMap({});
        }
      } catch (e: any) {
        toast.error("Erro ao carregar contratações", { description: translateError(e.message || String(e)) });
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
    // Buscar o valor atualizado de SRP diretamente no banco para garantir que seja lido
    const { data: currentContratacao } = await supabase
      .from("contratacoes")
      .select("srp")
      .eq("id", row.id)
      .maybeSingle();

    const isSrp = currentContratacao ? !!currentContratacao.srp : !!row.srp;

    setOpenAudit({ id: row.id, sei: (row as any).numero_sei_contratacao || undefined, srp: isSrp });
    setAuditState({});
    setAuditNotes("");

    // Buscar conformidade da nova tabela dedicada
    const { data: conf } = await supabase
      .from("contratacoes_conformidade")
      .select("*")
      .eq("contratacao_id", row.id)
      .maybeSingle();

    if (conf) {
      const newState: Record<string, boolean> = {};
      FASE_LICITACAO_CONTRATACAO.forEach(it => {
        newState[it.key] = (conf as any)[it.key] || false;
      });
      FASE_EXECUCAO.forEach(it => {
        newState[it.key] = (conf as any)[it.key] || false;
      });
      setAuditState(newState);
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

      const payload: any = {
        contratacao_id: openAudit.id,
        user_id: userData.user.id,
        observacao: auditNotes || null,
      };

      FASE_LICITACAO_CONTRATACAO.forEach(it => {
        payload[it.key] = auditState[it.key] || false;
      });
      FASE_EXECUCAO.forEach(it => {
        payload[it.key] = auditState[it.key] || false;
      });

      // Salvar na tabela dedicada usando upsert
      const { error } = await supabase
        .from("contratacoes_conformidade")
        .upsert(payload, { onConflict: 'contratacao_id' });

      if (error) throw error;

      // Atualizar o confMap localmente para refletir a mudança imediatamente
      const isSrp = !!openAudit.srp;
      const newPct = calculateConformity(auditState, isSrp);
      setConfMap((prev) => ({ ...prev, [openAudit.id]: newPct }));

      toast.success("Checklist salvo");
      setOpenAudit(null);
    } catch (e: any) {
      toast.error("Falha ao salvar checklist", { description: translateError(e.message || String(e)) });
    }
  };

  const exportCSV = () => {
    const header = ["Cod. PCA", "Código", "Descrição", "Setor", "Status", "Valor Estimado"].join(",");
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
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por Cod. PCA ou descrição" />
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
              <>
                <div className="rounded-lg border border-border bg-card overflow-hidden">
                  <table style={{ tableLayout: "fixed", width: "100%", borderCollapse: "collapse" }} className="text-sm caption-bottom">
                    <thead className="[&_tr]:border-b">
                      <tr className="bg-[#D9415D] border-b transition-colors">
                        <th style={{ width: "50px" }} className="h-10 px-1 text-center align-middle font-bold text-white text-xs">Cod. PCA</th>
                        <th style={{ width: "440px" }} className="h-10 px-1 text-center align-middle font-bold text-white text-xs">Descrição</th>
                        <th style={{ width: "60px" }} className="h-10 px-1 text-center align-middle font-bold text-white text-xs">Setor</th>
                        <th style={{ width: "70px" }} className="h-10 px-1 text-center align-middle font-bold text-white text-xs">Status</th>
                        <th style={{ width: "40px" }} className="h-10 px-1 text-center align-middle font-bold text-white text-xs">Conformidade</th>
                        <th style={{ width: "60px" }} className="h-10 px-1 text-center align-middle font-bold text-white text-xs">Valor Estimado</th>
                        <th style={{ width: "60px" }} className="h-10 px-1 text-center align-middle font-bold text-white text-xs">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {filtered.length === 0 ? (
                        <tr><td colSpan={7} className="p-4 text-center py-8 text-muted-foreground">Nenhuma contratação encontrada.</td></tr>
                      ) : (
                        paginated.map((r) => (
                          <tr key={r.id} className="border-b transition-colors hover:bg-muted/40">
                            <td className="p-1 align-middle text-xs text-muted-foreground whitespace-nowrap text-center">
                              {(r as any).codigo?.toUpperCase().replace(/^PCA-/, "").replace(/-2026$/, "") || String(r.id).slice(-4).toUpperCase()}
                            </td>
                            <td className="p-1 align-middle" style={{ overflow: "hidden" }}><div className="truncate" title={r.descricao}>{r.descricao}</div></td>
                            <td className="p-1 align-middle text-center text-xs" style={{ overflow: "hidden" }}><div className="truncate" title={r.setor_requisitante || "-"}>{r.setor_requisitante || "-"}</div></td>
                            <td className="p-1 align-middle text-center">
                              {(() => { const s = statusLabel(r); const b = getStatusBadge(s); return <Badge variant={b.variant as any} className={cn("text-[10px] px-1 h-5", b.className)}>{s}</Badge>; })()}
                            </td>
                            <td className="p-1 align-middle text-center">
                              {(() => { const b = conformityBadge(confMap[r.id]); return <Badge variant={b.variant as any} className={cn("text-[10px] px-1 h-5", b.className)}>{b.text}</Badge>; })()}
                            </td>
                            <td className="p-1 align-middle text-right text-xs">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(r.valor_estimado) || 0)}</td>
                            <td className="p-1 align-middle text-center">
                              <Button size="xs" className="h-7 px-2 text-[11px]" onClick={() => openChecklist(r)}>Auditar</Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between mt-2 px-1">
                  <div className="text-xs text-muted-foreground">Página {page}</div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="xs" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Anterior</Button>
                    <Button variant="outline" size="xs" onClick={() => setPage((p) => (p * pageSize >= filtered.length ? p : p + 1))} disabled={page * pageSize >= filtered.length}>Próxima</Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Dialog open={!!openAudit} onOpenChange={() => setOpenAudit(null)}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden [&>button]:text-white">
            <DialogHeader className="bg-sidebar p-4">
              <div className="flex items-center justify-between pr-8">
                <div>
                  <DialogTitle className="text-white text-lg">Auditoria de Conformidade</DialogTitle>
                  <DialogDescription className="text-white/80 text-xs">Verificação de requisitos das fases de licitação e execução.</DialogDescription>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/90 bg-white/10 px-2 py-1 rounded">
                  <span className="font-semibold">SEI:</span>
                  <span>{openAudit?.sei || "—"}</span>
                  {openAudit?.sei && (
                    <Button
                      variant="ghost"
                      size="xs"
                      className="h-5 w-5 p-0 hover:bg-white/20 text-white"
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
                  )}
                </div>
              </div>
            </DialogHeader>
            
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-6 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b pb-1">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-primary">1. Licitação e Contratação</h3>
                    <Badge variant="outline" className="text-[10px] h-4 px-1 opacity-70">
                      {FASE_LICITACAO_CONTRATACAO.length} itens
                    </Badge>
                  </div>
                  <div className="grid gap-1">
                    {FASE_LICITACAO_CONTRATACAO.map((it) => (
                      <label key={it.key} className="flex items-start gap-2 text-[13px] text-foreground/90 cursor-pointer hover:bg-muted/50 p-1 rounded transition-colors group">
                        <Checkbox 
                          id={it.key}
                          className="mt-0.5 h-3.5 w-3.5"
                          checked={!!auditState[it.key]} 
                          onCheckedChange={(v) => setAuditState((s) => ({ ...s, [it.key]: !!v }))} 
                        />
                        <span className="leading-tight group-hover:text-primary transition-colors">{it.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b pb-1">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-primary">2. Execução Contratual</h3>
                    <Badge variant="outline" className="text-[10px] h-4 px-1 opacity-70">
                      {FASE_EXECUCAO.length} itens
                    </Badge>
                  </div>
                  <div className="grid gap-1">
                    {FASE_EXECUCAO.map((it) => (
                      <label key={it.key} className="flex items-start gap-2 text-[13px] text-foreground/90 cursor-pointer hover:bg-muted/50 p-1 rounded transition-colors group">
                        <Checkbox 
                          id={it.key}
                          className="mt-0.5 h-3.5 w-3.5"
                          checked={!!auditState[it.key]} 
                          onCheckedChange={(v) => setAuditState((s) => ({ ...s, [it.key]: !!v }))} 
                        />
                        <span className="leading-tight group-hover:text-primary transition-colors">{it.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-end gap-4 pt-2 border-t">
                <div className="flex-1 space-y-1">
                  <label htmlFor="audit-notes" className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Observações e Apontamentos</label>
                  <Textarea 
                    id="audit-notes"
                    value={auditNotes} 
                    onChange={(e) => setAuditNotes(e.target.value)} 
                    rows={2} 
                    placeholder="Registre aqui observações relevantes encontradas durante a auditoria..." 
                    className="text-sm resize-none focus-visible:ring-primary min-h-[60px]" 
                  />
                </div>
                <div className="flex flex-col gap-2 pb-0.5">
                  <Button size="sm" className="w-24 font-bold" onClick={saveChecklist}>Salvar</Button>
                  <Button variant="ghost" size="sm" className="w-24 text-xs h-8" onClick={() => setOpenAudit(null)}>Cancelar</Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default AvaliacaoConformidade;
