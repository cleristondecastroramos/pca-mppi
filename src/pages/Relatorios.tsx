import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

const Relatorios = () => {
  const [status, setStatus] = useState<string>("todos");
  const [setor, setSetor] = useState<string>("todos");
  const [range, setRange] = useState<DateRange | undefined>({ from: undefined, to: undefined });
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [fetching, setFetching] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setFetching(true);
      try {
        const { data, error } = await supabase
          .from("contratacoes")
          .select("id, descricao, setor_requisitante, etapa_processo, sobrestado, created_at, data_finalizacao_licitacao, valor_contratado");
        if (error) throw error;
        if (mounted) setRows(data || []);
      } catch (e) {
        toast.error("Erro ao carregar dados", { description: String(e) });
      } finally {
        if (mounted) setFetching(false);
      }
    };
    fetchData();
    const { data: sub } = supabase.auth.onAuthStateChange(() => fetchData());
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const statusLabel = (r: any) => {
    if (r.sobrestado === true) return "sobrestado";
    if (r.etapa_processo === "Concluído") return "concluído";
    if (r.etapa_processo === "Em Licitação" || r.etapa_processo === "Contratado") return "em andamento";
    return "não iniciado";
  };

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const s = statusLabel(r);
      if (status !== "todos" && s !== status) return false;
      if (setor && setor !== "todos") {
        const v = (r.setor_requisitante || "").toLowerCase();
        if (!v.includes(setor.toLowerCase())) return false;
      }
      if (range?.from && range?.to) {
        const base = r.data_finalizacao_licitacao || r.created_at;
        if (!base) return false;
        const d = new Date(String(base));
        const from = new Date(range.from); from.setHours(0, 0, 0, 0);
        const to = new Date(range.to); to.setHours(23, 59, 59, 999);
        if (d < from || d > to) return false;
      }
      return true;
    });
  }, [rows, status, setor, range]);

  async function handleGenerate(tipo: "pdf" | "csv") {
    setLoading(true);
    toast.message("Gerando relatório...", { description: `Preparando ${tipo.toUpperCase()} com ${filtered.length} registros.` });
    try {
      if (tipo === "csv") {
        const header = ["ID", "Descrição", "Setor", "Status", "Data", "Valor Contratado"].join(",");
        const lines = filtered.map((r) => {
          const s = statusLabel(r);
          const base = r.data_finalizacao_licitacao || r.created_at || "";
          const data = base ? new Date(String(base)).toLocaleDateString("pt-BR") : "";
          const desc = String(r.descricao || "").replace(/"/g, '""');
          return [r.id, `"${desc}"`, r.setor_requisitante || "", s, data, String(r.valor_contratado || 0)].join(",");
        });
        const csv = [header, ...lines].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "relatorio.csv";
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const w = window.open("", "_blank", "noopener,noreferrer");
        if (w) {
          const logo = `${location.origin}/logo-mppi.png`;
          const rowsHtml = filtered
            .map((r) => `<tr>
              <td>${r.id}</td>
              <td>${(r.descricao || "").replace(/</g, "&lt;")}</td>
              <td>${r.setor_requisitante || ""}</td>
              <td>${statusLabel(r)}</td>
              <td>${new Date(String(r.data_finalizacao_licitacao || r.created_at || "")).toLocaleDateString("pt-BR")}</td>
              <td>${new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(r.valor_contratado || 0)}</td>
            </tr>`) 
            .join("");
          const today = new Date().toLocaleString('pt-BR');
          const title = `Relatório de Contratações (${filtered.length} registros)`;
          w.document.write(`<!doctype html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>${title}</title>
              <style>
                body{font-family:system-ui,Segoe UI,Arial;margin:24px;color:#111}
                header{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:12px;margin-bottom:16px}
                header .brand{display:flex;align-items:center;gap:12px}
                header img{height:40px;width:auto;border-radius:4px}
                header .title{font-size:16px;font-weight:600}
                header .meta{font-size:11px;color:#6b7280}
                table{width:100%;border-collapse:collapse;margin-top:8px}
                th{background:#f9fafb;text-align:left}
                td,th{border:1px solid #e5e7eb;padding:6px 8px;font-size:12px}
                tfoot td{font-weight:600}
              </style>
            </head>
            <body>
              <header>
                <div class="brand">
                  <img src="${logo}" alt="MPPI" />
                  <div>
                    <div class="title">Ministério Público do Estado do Piauí</div>
                    <div class="meta">${title} • ${today}</div>
                  </div>
                </div>
              </header>
              <table>
                <thead>
                  <tr><th>ID</th><th>Descrição</th><th>Setor</th><th>Status</th><th>Data</th><th>Valor</th></tr>
                </thead>
                <tbody>${rowsHtml}</tbody>
              </table>
            </body>
            </html>`);
          w.document.close();
          w.print();
        }
      }
      toast.success("Relatório pronto", { description: `Exportado ${tipo.toUpperCase()}.` });
    } catch (e) {
      toast.error("Falha na geração", { description: "Tente novamente mais tarde." });
    } finally {
      setLoading(false);
    }
  }
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Relatórios</h1>
            <p className="text-sm text-muted-foreground">Geração e exportação de relatórios.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtros e Período</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-4">
              <div>
                <label className="text-sm text-muted-foreground">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="mt-1 h-9">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="não iniciado">não iniciado</SelectItem>
                    <SelectItem value="em andamento">em andamento</SelectItem>
                    <SelectItem value="concluído">concluído</SelectItem>
                    <SelectItem value="sobrestado">sobrestado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Setor</label>
                <Input className="mt-1" placeholder="Ex.: TI, Engenharia" value={setor} onChange={(e) => setSetor(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-muted-foreground">Período</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button size="xs" variant="outline" className="mt-1 w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {range?.from && range?.to
                        ? `${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`
                        : "Selecione intervalo"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={range}
                      onSelect={setRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="xs" onClick={() => handleGenerate("pdf")} disabled={loading} className="bg-primary hover:bg-primary-dark">
                Exportar PDF
              </Button>
              <Button size="xs" onClick={() => handleGenerate("csv")} disabled={loading} variant="outline">
                Exportar CSV
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">A geração é assíncrona e mostra feedback com toasts.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pré-visualização</CardTitle>
          </CardHeader>
          <CardContent>
            {fetching ? (
              <div className="flex items-center justify-center h-40 text-muted-foreground">Carregando dados...</div>
            ) : (
              <div className="rounded-lg border border-border bg-card overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Descrição</TableHead>
                      <TableHead className="w-[120px]">Setor</TableHead>
                      <TableHead className="w-[120px]">Status</TableHead>
                      <TableHead className="w-[120px]">Data</TableHead>
                      <TableHead className="w-[160px]">Valor Contratado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum registro com os filtros atuais.</TableCell></TableRow>
                    ) : (
                      filtered.map((r) => (
                        <TableRow key={r.id} className="hover:bg-muted/40">
                          <TableCell><div className="truncate" title={r.descricao}>{r.descricao}</div></TableCell>
                          <TableCell>{r.setor_requisitante || "-"}</TableCell>
                          <TableCell>{statusLabel(r)}</TableCell>
                          <TableCell>{(() => { const base = r.data_finalizacao_licitacao || r.created_at || ""; return base ? new Date(String(base)).toLocaleDateString("pt-BR") : "-"; })()}</TableCell>
                          <TableCell className="text-right">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(r.valor_contratado || 0)}</TableCell>
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

export default Relatorios;
