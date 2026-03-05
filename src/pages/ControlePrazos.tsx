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
import { CalendarDays, Loader2, Eraser, AlertCircle, CheckCircle2, Clock, Calendar as CalendarIcon, Filter } from "lucide-react";
import { ptBR } from "date-fns/locale";

type Contratacao = Tables<"contratacoes"> & { 
  data_prevista_contratacao?: string | null;
  codigo?: string | null; 
};

const ControlePrazos = () => {
  const [rows, setRows] = useState<Contratacao[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [monthFilter, setMonthFilter] = useState<string>("todos");
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

  const fetchData = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const { data, error } = await supabase
        .from("contratacoes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setRows((data as any) || []);
    } catch (e: any) {
      toast.error("Erro ao carregar prazos", { description: e.message || String(e) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') fetchData();
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const getPrazoStatus = (contratacao: Contratacao) => {
    const dataPrevistaStr = contratacao.data_prevista_contratacao;
    if (!dataPrevistaStr) return { label: "Sem data prevista", variant: "secondary", color: "bg-gray-100 text-gray-700" };

    const dataPrevista = parseDateOnlyToDate(dataPrevistaStr);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    // Diferença em dias: Data Prevista - Hoje
    const diffTime = dataPrevista.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const isConcluido = contratacao.etapa_processo === "Concluído" || contratacao.etapa_processo === "Contratado";
    const isNaoIniciado = !isConcluido && contratacao.etapa_processo !== "Em Licitação";

    // Regra de Atraso: Data prevista passou e não está concluído
    if (diffDays < 0 && !isConcluido) {
      return { 
        label: `Atrasado (${Math.abs(diffDays)}d)`, 
        variant: "destructive",
        color: "bg-red-100 text-red-700 border-red-200"
      };
    }

    // Regra de Alerta: Faltam 120 dias ou menos e ainda não iniciou
    if (diffDays >= 0 && diffDays <= 120 && isNaoIniciado) {
      return { 
        label: "Atenção (Prazo Curto)", 
        variant: "warning",
        color: "bg-amber-100 text-amber-700 border-amber-200"
      };
    }

    if (isConcluido) {
      return { 
        label: "Concluído", 
        variant: "success",
        color: "bg-green-100 text-green-700 border-green-200"
      };
    }

    return { 
      label: "No Prazo", 
      variant: "outline",
      color: "bg-blue-50 text-blue-700 border-blue-200"
    };
  };

  const kpis = useMemo(() => {
    let total = 0;
    let atrasados = 0;
    let alertas = 0;
    let concluidos = 0;

    rows.forEach(r => {
      total++;
      const status = getPrazoStatus(r);
      if (status.variant === "destructive") atrasados++;
      if (status.variant === "warning") alertas++;
      if (status.variant === "success") concluidos++;
    });

    return { total, atrasados, alertas, concluidos };
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesSearch =
        r.descricao.toLowerCase().includes(q) ||
        (r.setor_requisitante || "").toLowerCase().includes(q) ||
        r.codigo?.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q);
      
      if (!matchesSearch) return false;

      const status = getPrazoStatus(r);
      
      if (statusFilter !== "todos") {
        if (statusFilter === "atrasados" && status.variant !== "destructive") return false;
        if (statusFilter === "alertas" && status.variant !== "warning") return false;
        if (statusFilter === "concluidos" && status.variant !== "success") return false;
        if (statusFilter === "no_prazo" && status.variant !== "outline") return false;
      }

      if (monthFilter !== "todos") {
        if (!r.data_prevista_contratacao) return false;
        const [y, m] = r.data_prevista_contratacao.split("-");
        const monthYear = `${m}/${y}`;
        if (monthYear !== monthFilter) return false;
      }

      return true;
    });
  }, [rows, search, statusFilter, monthFilter]);

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    rows.forEach(r => {
      if (r.data_prevista_contratacao) {
        const [y, m] = r.data_prevista_contratacao.split("-");
        months.add(`${y}-${m}`);
      }
    });
    return Array.from(months).sort().map(ym => {
      const [y, m] = ym.split("-");
      return `${m}/${y}`;
    });
  }, [rows]);

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
      
      const update: any = { [editing.field as string]: iso };
      
      const { error } = await supabase.from("contratacoes").update(update).eq("id", editing.id);
      if (error) throw error;
      
      toast.success("Data atualizada com sucesso");
      setEditing(null);
      setDateValue(undefined);
      fetchData();
    } catch (e: any) {
      toast.error("Falha ao salvar data", { description: e.message || String(e) });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" />
              Controle de Prazos
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitoramento estratégico de datas previstas para contratação.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchData}>
              <Loader2 className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Monitoradas</p>
                <p className="text-2xl font-bold text-blue-700">{kpis.total}</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-blue-100" />
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-amber-500 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Atenção (120 dias)</p>
                <p className="text-2xl font-bold text-amber-700">{kpis.alertas}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-amber-100" />
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Atrasadas</p>
                <p className="text-2xl font-bold text-red-700">{kpis.atrasados}</p>
              </div>
              <Clock className="h-8 w-8 text-red-100" />
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Concluídas</p>
                <p className="text-2xl font-bold text-green-700">{kpis.concluidos}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-100" />
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 w-full relative">
                <Input 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                  placeholder="Buscar por descrição, objeto, setor ou ID..." 
                  className="pl-9"
                />
                <Filter className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status do Prazo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value="atrasados">🔴 Atrasados</SelectItem>
                    <SelectItem value="alertas">🟡 Atenção (120 dias)</SelectItem>
                    <SelectItem value="no_prazo">🔵 No Prazo</SelectItem>
                    <SelectItem value="concluidos">🟢 Concluídos</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={monthFilter} onValueChange={setMonthFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Mês Previsto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Meses</SelectItem>
                    {availableMonths.map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela */}
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Detalhamento de Prazos</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-40 text-muted-foreground">
                <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                Carregando dados...
              </div>
            ) : (
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[8%]">ID</TableHead>
                      <TableHead className="w-[50%]">Objeto / Descrição</TableHead>
                      <TableHead className="w-[10%]">Setor</TableHead>
                      <TableHead className="w-[12%]">Status Processo</TableHead>
                      <TableHead className="w-[12%] text-center">Data Prevista</TableHead>
                      <TableHead className="w-[16%] text-center">Situação do Prazo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                          Nenhum registro encontrado com os filtros atuais.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((r) => {
                        const status = getPrazoStatus(r);
                        return (
                          <TableRow key={r.id} className="hover:bg-muted/30">
                            <TableCell className="font-mono text-xs text-muted-foreground">{r.codigo || r.id.slice(-8)}</TableCell>
                        <TableCell>
                          <div className="font-medium truncate max-w-[500px]" title={r.descricao}>{r.descricao}</div>
                        </TableCell>
                            <TableCell>{r.setor_requisitante}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs font-normal">
                                {r.etapa_processo || "Não iniciado"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-2">
                                <span className={!r.data_prevista_contratacao ? "text-muted-foreground italic text-xs" : "font-medium"}>
                                  {formatDateBR(r.data_prevista_contratacao)}
                                </span>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-50 hover:opacity-100" onClick={() => openEdit(r, "data_prevista_contratacao")}>
                                      <CalendarDays className="h-3 w-3" />
                                    </Button>
                                  </PopoverTrigger>
                                  {editing && editing.id === r.id && editing.field === "data_prevista_contratacao" && (
                                    <PopoverContent className="w-auto p-0" align="end">
                                      <div className="p-3 bg-background border rounded-md shadow-lg space-y-3">
                                        <h4 className="font-medium text-sm">Editar Data Prevista</h4>
                                        <Calendar
                                          mode="single"
                                          selected={dateValue}
                                          onSelect={setDateValue}
                                          initialFocus
                                        />
                                        <div className="flex justify-end gap-2">
                                          <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Cancelar</Button>
                                          <Button size="sm" onClick={saveDate}>Salvar</Button>
                                        </div>
                                      </div>
                                    </PopoverContent>
                                  )}
                                </Popover>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${status.color}`}>
                                {status.label}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
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
