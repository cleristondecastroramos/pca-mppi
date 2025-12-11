import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "@/components/KPICard";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useEffect, useMemo, useState } from "react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend } from "@/components/ui/chart";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, LabelList, PieChart, Pie, Cell, Legend } from "recharts";
import { Loader2, FileText, CheckCircle, DollarSign } from "lucide-react";

type Contratacao = Tables<"contratacoes">;

const ResultadosAlcancados = () => {
  const [rows, setRows] = useState<Contratacao[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [metricTipo, setMetricTipo] = useState<"quantidade" | "valor_contratado">("valor_contratado");
  const [metricClasse, setMetricClasse] = useState<"quantidade" | "valor_contratado">("valor_contratado");

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("contratacoes")
          .select("id, descricao, setor_requisitante, tipo_contratacao, classe, etapa_processo, valor_contratado")
          .order("created_at", { ascending: false });
        if (error) throw error;
        if (mounted) setRows((data as any) || []);
      } catch (e) {
        // noop toast to keep minimal
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

  const concluidas = useMemo(() => rows.filter((r) => r.etapa_processo === "Concluído"), [rows]);
  const totalEstimadoConcluido = useMemo(() => concluidas.reduce((s, r) => s + (r.valor_contratado || 0), 0), [concluidas]);
  const taxaConclusao = useMemo(() => {
    const total = rows.length || 1;
    return Math.round((concluidas.length / total) * 100);
  }, [rows, concluidas]);

  const fmtBRL = (n: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

  const dadosPorTipo = useMemo(() => {
    const map = new Map<string, { qtd: number; valor: number }>();
    concluidas.forEach((r) => {
      const k = r.tipo_contratacao || "Não informado";
      const cur = map.get(k) || { qtd: 0, valor: 0 };
      cur.qtd += 1;
      cur.valor += r.valor_contratado || 0;
      map.set(k, cur);
    });
    return Array.from(map.entries()).map(([name, v]) => ({ name, value: metricTipo === "quantidade" ? v.qtd : v.valor }));
  }, [concluidas, metricTipo]);

  const dadosPorClasse = useMemo(() => {
    const map = new Map<string, { qtd: number; valor: number }>();
    concluidas.forEach((r) => {
      const k = r.classe || "Não informado";
      const cur = map.get(k) || { qtd: 0, valor: 0 };
      cur.qtd += 1;
      cur.valor += r.valor_contratado || 0;
      map.set(k, cur);
    });
    return Array.from(map.entries()).map(([name, v]) => ({ name, value: metricClasse === "quantidade" ? v.qtd : v.valor }));
  }, [concluidas, metricClasse]);

  const dadosSetor = useMemo(() => {
    const map = new Map<string, number>();
    concluidas.forEach((r) => {
      const k = r.setor_requisitante || "Não informado";
      map.set(k, (map.get(k) || 0) + (r.valor_contratado || 0));
    });
    return Array.from(map.entries()).map(([setor, valor]) => ({ setor, valor }));
  }, [concluidas]);

  const pieColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Resultados Alcançados</h1>
            <p className="text-sm text-muted-foreground">Painel de resultados de materiais e serviços concluídos.</p>
          </div>
        </div>

        <div className="grid gap-3 grid-cols-1 md:grid-cols-6 lg:grid-cols-6">
          <div className="md:col-span-1 lg:col-span-1">
            <KPICard title="Demandas Concluídas" value={loading ? "—" : concluidas.length} icon={FileText} variant="success" />
          </div>
          <div className="md:col-span-2 lg:col-span-2">
            <KPICard title="Valor Contratado" value={loading ? "—" : fmtBRL(totalEstimadoConcluido)} icon={DollarSign} variant="info" />
          </div>
          <div className="md:col-span-1 lg:col-span-1">
            <KPICard title="Taxa de Conclusão" value={loading ? "—" : `${taxaConclusao}%`} icon={CheckCircle} variant="default" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="space-y-0">
              <div className="flex w-full items-start justify-between">
                <CardTitle className="text-sm">Distribuição por Tipo de Contratação</CardTitle>
                <div className="flex flex-col gap-1 items-end">
                  <Button size="xs" className="text-[10px] leading-3 w-[160px]" variant={metricTipo === "quantidade" ? "default" : "outline"} onClick={() => setMetricTipo("quantidade")}>Número de processos</Button>
                  <Button size="xs" className="text-[10px] leading-3 w-[160px]" variant={metricTipo === "valor_contratado" ? "default" : "outline"} onClick={() => setMetricTipo("valor_contratado")}>Valores contratados</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2 pb-2">
              <ChartContainer config={{ tipo: { label: "Tipo", color: "hsl(var(--chart-3))" } }} className="w-full !aspect-auto h-[220px] min-h-[220px] overflow-visible" style={{ height: 220 }}>
                {(() => {
                  const data = dadosPorTipo.length ? dadosPorTipo : [{ name: "Sem dados", value: 1 }];
                  const formatter = (v: number) => (metricTipo === "valor_contratado" ? fmtBRL(v) : v);
                  return (
                    <PieChart width={400} height={220}>
                      <ChartTooltip content={<ChartTooltipContent formatter={(value: number) => <span>{formatter(value as number)}</span>} />} />
                      <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10, lineHeight: "12px", marginTop: 6 }} />
                      <Pie data={data} dataKey="value" nameKey="name" innerRadius={54} outerRadius={94} labelLine={false}>
                        {data.map((_: any, index: number) => (<Cell key={`cell-tipo-${index}`} fill={pieColors[index % pieColors.length]} />))}
                      </Pie>
                    </PieChart>
                  );
                })()}
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-0">
              <div className="flex w-full items-start justify-between">
                <CardTitle className="text-sm">Distribuição por Classe</CardTitle>
                <div className="flex flex-col gap-1 items-end">
                  <Button size="xs" className="text-[10px] leading-3 w-[160px]" variant={metricClasse === "quantidade" ? "default" : "outline"} onClick={() => setMetricClasse("quantidade")}>Número de processos</Button>
                  <Button size="xs" className="text-[10px] leading-3 w-[160px]" variant={metricClasse === "valor_contratado" ? "default" : "outline"} onClick={() => setMetricClasse("valor_contratado")}>Valores contratados</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2 pb-2">
              <ChartContainer config={{ classe: { label: "Classe", color: "hsl(var(--chart-1))" } }} className="w-full !aspect-auto h-[220px] min-h-[220px] overflow-visible" style={{ height: 220 }}>
                {(() => {
                  const data = dadosPorClasse.length ? dadosPorClasse : [{ name: "Sem dados", value: 1 }];
                  const formatter = (v: number) => (metricClasse === "valor_contratado" ? fmtBRL(v) : v);
                  return (
                    <PieChart width={400} height={220}>
                      <ChartTooltip content={<ChartTooltipContent formatter={(value: number) => <span>{formatter(value as number)}</span>} />} />
                      <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10, lineHeight: "12px", marginTop: 6 }} />
                      <Pie data={data} dataKey="value" nameKey="name" innerRadius={54} outerRadius={94} labelLine={false}>
                        {data.map((_: any, index: number) => (<Cell key={`cell-classe-${index}`} fill={pieColors[index % pieColors.length]} />))}
                      </Pie>
                    </PieChart>
                  );
                })()}
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Valores contratados por Setor</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ valores: { label: "Valores (R$)", color: "hsl(var(--chart-2))" } }} className="w-full !aspect-auto h-[260px] min-h-[260px] overflow-visible" style={{ height: 260 }}>
                {(() => {
                  const chartData = dadosSetor.length ? dadosSetor : [{ setor: "Sem dados", valor: 1 }];
                  return (
                    <BarChart data={chartData} width={400} height={260} margin={{ top: 24, right: 16, bottom: 8, left: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="setor" />
                      <YAxis hide domain={[0, 'dataMax + 1']} />
                      <ChartTooltip content={<ChartTooltipContent formatter={(v: number) => <span>{fmtBRL(v)}</span>} />} />
                      <Bar dataKey="valor" fill="var(--color-valores)">
                        <LabelList dataKey="valor" position="top" formatter={(v: number) => fmtBRL(v)} />
                      </Bar>
                    </BarChart>
                  );
                })()}
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Itens contratados/adquiridos</CardTitle>
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
                      <TableHead className="w-[140px]">Tipo</TableHead>
                      <TableHead className="w-[140px]">Classe</TableHead>
                      <TableHead className="w-[160px]">Valor Contratado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {concluidas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Sem itens concluídos.</TableCell>
                      </TableRow>
                    ) : (
                      concluidas.map((r) => (
                        <TableRow key={r.id} className="hover:bg-muted/40">
                          <TableCell><div className="truncate" title={r.descricao}>{r.descricao}</div></TableCell>
                          <TableCell>{r.setor_requisitante || "-"}</TableCell>
                          <TableCell>{r.tipo_contratacao || "-"}</TableCell>
                          <TableCell>{r.classe || "-"}</TableCell>
                          <TableCell className="text-right">{fmtBRL(r.valor_contratado || 0)}</TableCell>
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

export default ResultadosAlcancados;
