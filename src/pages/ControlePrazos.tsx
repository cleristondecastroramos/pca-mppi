import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CalendarDays, Loader2, Eraser } from "lucide-react";

type Contratacao = Tables<"contratacoes">;

const PRAZO_FIELDS: Array<keyof Contratacao> = [
  "data_entrada_clc" as any,
  "data_devolucao_fiscal" as any,
  "data_envio_pgea" as any,
  "data_finalizacao_licitacao" as any,
  "data_termino_contrato" as any,
];

const ControlePrazos = () => {
  const [rows, setRows] = useState<Contratacao[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [editing, setEditing] = useState<{ id: string; field: keyof Contratacao } | null>(null);
  const [dateValue, setDateValue] = useState<Date | undefined>(undefined);

  const toDateOnlyStringFromDate = (dt: Date) => {
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const d = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const parseDateOnlyToDate = (s: string) => {
    const [y, m, d] = s.split("-").map(Number);
    const date = new Date();
    date.setFullYear(y, (m || 1) - 1, d || 1);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const formatDateBR = (s: string | null) => {
    if (!s) return "—";
    const [y, m, d] = s.split("-");
    return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
  };

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("contratacoes")
          .select(
            [
              "id",
              "descricao",
              "setor_requisitante",
              "sobrestado",
              "etapa_processo",
              "data_entrada_clc",
              "data_devolucao_fiscal",
              "data_envio_pgea",
              "data_finalizacao_licitacao",
              "data_termino_contrato",
            ].join(","),
          )
          .order("created_at", { ascending: false });
        if (error) throw error;
        if (mounted) setRows((data as any) || []);
      } catch (e: any) {
        toast.error("Erro ao carregar prazos", { description: e.message || String(e) });
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

  const diffDays = (dateStr: string | null) => {
    if (!dateStr) return null;
    const target = parseDateOnlyToDate(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ms = target.getTime() - today.getTime();
    return Math.round(ms / (1000 * 60 * 60 * 24));
  };

  const statusForDate = (dateStr: string | null) => {
    const d = diffDays(dateStr);
    if (d === null) return { label: "sem data", variant: "secondary" } as any;
    if (d < 0) return { label: `${Math.abs(d)}d atrasado`, variant: "destructive" } as any;
    if (d === 0) return { label: "vence hoje", variant: "secondary" } as any;
    if (d <= 7) return { label: `${d}d`, variant: "secondary" } as any;
    if (d <= 30) return { label: `${d}d`, variant: "secondary" } as any;
    return { label: `${d}d`, variant: "secondary" } as any;
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const arr = rows.filter((r) => {
      const matches =
        r.descricao.toLowerCase().includes(q) ||
        (r.setor_requisitante || "").toLowerCase().includes(q);
      if (!matches) return false;
      if (statusFilter === "todos") return true;
      const allDiffs = PRAZO_FIELDS.map((f) => diffDays(r[f] as any)).filter((x) => x !== null) as number[];
      if (statusFilter === "atrasados") return allDiffs.some((d) => d < 0);
      if (statusFilter === "proximos7") return allDiffs.some((d) => d !== null && d! <= 7 && d! >= 0);
      if (statusFilter === "proximos30") return allDiffs.some((d) => d !== null && d! <= 30 && d! >= 0);
      return true;
    });
    return arr;
  }, [rows, search, statusFilter]);

  const openEdit = (row: Contratacao, field: keyof Contratacao) => {
    setEditing({ id: row.id, field });
    const v = row[field] as any;
    setDateValue(v ? parseDateOnlyToDate(String(v)) : undefined);
  };

  const saveDate = async () => {
    if (!editing) return;
    try {
      const { data: userData } = await supabase.auth.getUser();
      const iso = dateValue ? toDateOnlyStringFromDate(dateValue) : null;
      const { data: before } = await supabase.from("contratacoes").select("*").eq("id", editing.id).single();
      const update: any = { [editing.field as string]: iso };
      if (editing.field === "data_finalizacao_licitacao" && iso) {
        update.etapa_processo = "Concluído";
        update.sobrestado = false;
      }
      if (editing.field === "data_entrada_clc" && iso) {
        update.etapa_processo = "Em Licitação";
        update.sobrestado = false;
      }
      const { error } = await supabase.from("contratacoes").update(update).eq("id", editing.id);
      if (error) throw error;
      if (userData.user) {
        await supabase.from("contratacoes_historico").insert({
          contratacao_id: editing.id,
          user_id: userData.user.id,
          acao: "Atualização de prazo",
          dados_anteriores: before,
          dados_novos: { ...(before || {}), ...update },
        });
      }
      toast.success("Prazo atualizado");
      setEditing(null);
      setDateValue(undefined);
      const { data } = await supabase
        .from("contratacoes")
        .select("id, descricao, setor_requisitante, sobrestado, etapa_processo, data_entrada_clc, data_devolucao_fiscal, data_envio_pgea, data_finalizacao_licitacao, data_termino_contrato")
        .order("created_at", { ascending: false });
      setRows((data as any) || []);
    } catch (e: any) {
      toast.error("Falha ao salvar prazo", { description: e.message || String(e) });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Controle de Prazos</h1>
            <p className="text-sm text-muted-foreground">Acompanhe prazos e compromissos por contratação.</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-3">
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex-1 min-w-[220px]">
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por descrição ou setor" />
              </div>
              <div className="w-[200px]">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="atrasados">Atrasados</SelectItem>
                    <SelectItem value="proximos7">Próximos 7 dias</SelectItem>
                    <SelectItem value="proximos30">Próximos 30 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prazos das Contratações</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-40 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Carregando prazos...
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-card overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[280px]">Descrição</TableHead>
                      <TableHead className="w-[120px]">Setor</TableHead>
                      <TableHead className="w-[120px]">Status</TableHead>
                      <TableHead className="w-[160px]">Entrada CLC</TableHead>
                      <TableHead className="w-[160px]">Devolução Fiscal</TableHead>
                      <TableHead className="w-[160px]">Envio PGEA</TableHead>
                      <TableHead className="w-[180px]">Finalização Licitação</TableHead>
                      <TableHead className="w-[160px]">Término Contrato</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhuma contratação encontrada.</TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((r) => (
                        <TableRow key={r.id} className="hover:bg-muted/40">
                          <TableCell>
                            <div className="truncate" title={r.descricao}>{r.descricao}</div>
                          </TableCell>
                          <TableCell>{r.setor_requisitante || "-"}</TableCell>
                          <TableCell>{(() => {
                            const c = r;
                            if ((c as any).sobrestado === true) return "sobrestado";
                            if (c.etapa_processo === "Em Licitação" || c.etapa_processo === "Contratado") return "em andamento";
                            if (c.etapa_processo === "Concluído") return "concluído";
                            return "não iniciado";
                          })()}</TableCell>
                          {["data_entrada_clc","data_devolucao_fiscal","data_envio_pgea","data_finalizacao_licitacao","data_termino_contrato"].map((field) => {
                            const f = field as keyof Contratacao;
                            const val = r[f] as any as string | null;
                            const s = statusForDate(val);
                            return (
                              <TableCell key={field}>
                                <div className="flex items-center gap-2">
                                  <Badge variant={s.variant as any} className="text-[11px] px-2 py-0.5">
                                    {formatDateBR(val)}
                                  </Badge>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button variant="outline" size="xs" className="px-2" onClick={() => openEdit(r, f)}>
                                        <CalendarDays className="h-3 w-3" />
                                      </Button>
                                    </PopoverTrigger>                                    {editing && editing.id === r.id && editing.field === f && (
                                      <PopoverContent className="w-[230px] p-1" align="end" sideOffset={10}>
                                        <div className="space-y-2">
                                          <div className="flex justify-end">
                                            <Button
                                              variant="ghost"
                                              size="xs"
                                              className="px-2"
                                              onClick={() => { setDateValue(undefined); saveDate(); }}
                                              title="Limpar data"
                                            >
                                              <Eraser className="h-3 w-3" />
                                            </Button>
                                          </div>
                                          <Calendar
                                            mode="single"
                                            selected={dateValue}
                                            onSelect={setDateValue as any}
                                            showOutsideDays={false}
                                            className="p-1"
                                            classNames={{
                                              caption: "flex justify-center items-center pt-0",
                                              caption_label: "text-xs font-medium",
                                              nav_button: "h-5 w-5 p-0 opacity-70 hover:opacity-100",
                                              head_row: "flex",
                                              head_cell: "text-muted-foreground rounded-md w-7 font-normal text-[10px]",
                                              row: "flex w-full mt-1",
                                              cell: "h-7 w-7 text-center text-[11px] p-0",
                                              day: "h-7 w-7 p-0 font-normal",
                                            }}
                                          />
                                          <div className="flex gap-2 justify-end">
                                            <Button variant="ghost" size="xs" onClick={() => { setEditing(null); setDateValue(undefined); }}>Cancelar</Button>
                                            <Button size="xs" onClick={saveDate}>Salvar</Button>
                                          </div>
                                        </div>
                                      </PopoverContent>
                                    )}
                                  </Popover>
                                </div>
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ControlePrazos;
