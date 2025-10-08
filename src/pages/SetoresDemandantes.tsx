import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";
import { KPICard } from "@/components/KPICard";
import { ClipboardList, DollarSign } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Row = {
  id: string;
  descricao?: string | null;
  setor_requisitante: string;
  classe: string;
  valor_estimado: number;
  valor_contratado?: number | null;
  ajuste_orcamentario?: number | null;
  saldo_orcamentario?: number | null;
  modalidade: string;
  etapa_processo?: string | null;
};

const setores = [
  "CAA",
  "CCF",
  "CCS",
  "CEAF",
  "CLC",
  "CONINT",
  "CPPT",
  "CRH",
  "CTI",
  "GAECO",
  "GSI",
  "PLANEJAMENTO",
  "PROCON",
];

const ALL = "__all__";

const formatCurrencyBRL = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

const mapSetorName = (setor: string) => {
  if (setor === "PLANEJAMENTO") return "PLAN";
  return setor;
};

const formatId = (id: string) => {
  return `#${id.slice(-8)}`;
};

const SetoresDemandantes = () => {
  const [setor, setSetor] = useState<string | undefined>(undefined);
  const [tipoContratacao, setTipoContratacao] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [rows, setRows] = useState<Row[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalCount, setTotalCount] = useState(0);
  const [kpiResumo, setKpiResumo] = useState<any | null>(null);
  const [kpiModalidade, setKpiModalidade] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const filtros = useMemo(() => ({ setor_requisitante: setor, tipo_contratacao: tipoContratacao, etapa_processo: status }), [setor, tipoContratacao, status]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      let query = supabase
        .from("contratacoes")
        .select([
          "id",
          "descricao",
          "setor_requisitante",
          "classe",
          "valor_estimado",
          "valor_contratado",
          "ajuste_orcamentario",
          "saldo_orcamentario",
          "modalidade",
          "etapa_processo",
        ].join(","), { count: "exact" });

      if (filtros.setor_requisitante) query = query.eq("setor_requisitante", filtros.setor_requisitante);
      if (filtros.tipo_contratacao) query = query.eq("tipo_contratacao", filtros.tipo_contratacao);
      if (filtros.etapa_processo) query = query.eq("etapa_processo", filtros.etapa_processo);

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await query.range(from, to);
      if (!error && data) {
        setRows(data as Row[]);
        setTotalCount(count || 0);
      }

      const { data: resumo } = await supabase.rpc("resumo_financeiro_contratacoes", {
        p_setor_requisitante: filtros.setor_requisitante || null,
        p_tipo_contratacao: filtros.tipo_contratacao || null,
      });
      setKpiResumo(resumo && resumo[0] ? resumo[0] : null);

      const { data: porModalidade } = await supabase.rpc("kpi_contratacoes_por_modalidade", {
        p_setor_requisitante: filtros.setor_requisitante || null,
        p_tipo_contratacao: filtros.tipo_contratacao || null,
      });
      setKpiModalidade((porModalidade as any) || []);
      setLoading(false);
    };
    fetchData();
  }, [page, pageSize, filtros]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Setores Demandantes</h1>
            <p className="text-sm text-muted-foreground">Visualize demandas por setor e tipo.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setSetor(undefined); setTipoContratacao(undefined); setStatus(undefined); setPage(1); }}>Limpar filtros</Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-2">
            <div className="flex items-start gap-3 overflow-x-auto whitespace-nowrap">
              <div className="basis-[38%] min-w-[440px] shrink-0">
                <div className="text-[11px] text-muted-foreground px-1">Setor:</div>
                <div className="flex flex-nowrap gap-1 overflow-x-auto whitespace-nowrap py-1">
                  {setores.map((s) => (
                    <Button
                      key={s}
                      variant={setor === s ? "default" : "secondary"}
                      size="xs"
                      onClick={() => { setSetor(setor === s ? undefined : s); setPage(1); }}
                    >
                      {mapSetorName(s)}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="basis-[31%] min-w-[360px] shrink-0">
                <div className="text-[11px] text-muted-foreground px-1">Tipo de Contratação:</div>
                <div className="flex flex-nowrap gap-1 overflow-x-auto whitespace-nowrap py-1">
                  {[ALL, "Nova Contratação", "Renovação", "Aditivo Quantitativo", "Repactuação"].map((t) => (
                    <Button
                      key={t}
                      variant={tipoContratacao === (t === ALL ? undefined : t) ? "default" : "secondary"}
                      size="xs"
                      onClick={() => { setTipoContratacao(t === ALL ? undefined : t); setPage(1); }}
                    >
                      {t === ALL ? "Todos" : t}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="basis-[31%] min-w-[360px] shrink-0">
                <div className="text-[11px] text-muted-foreground px-1">Status:</div>
                <div className="flex flex-nowrap gap-1 overflow-x-auto whitespace-nowrap py-1">
                  {[ALL, "Planejamento", "Em Andamento", "Concluído", "Sobrestado"].map((st) => (
                    <Button
                      key={st}
                      variant={status === (st === ALL ? undefined : st) ? "default" : "secondary"}
                      size="xs"
                      onClick={() => { setStatus(st === ALL ? undefined : st); setPage(1); }}
                    >
                      {st === ALL ? "Todos" : st}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <KPICard title="Quantidade de Demandas" value={kpiResumo?.total_demandas || rows.length} icon={ClipboardList}>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="flex flex-col items-center">
                <span className="text-red-600 font-semibold">não iniciados</span>
                <span>{kpiResumo?.count_planejamento || 0}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-yellow-600 font-semibold">em andamento</span>
                <span>{kpiResumo?.count_em_andamento || 0}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-green-600 font-semibold">concluídos</span>
                <span>{kpiResumo?.count_concluidos || 0}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-blue-600 font-semibold">sobrestados</span>
                <span>{kpiResumo?.count_sobrestados || 0}</span>
              </div>
            </div>
          </KPICard>

          <KPICard title="Valor Estimado" value={formatCurrencyBRL(kpiResumo?.valor_estimado || rows.reduce((s, r) => s + (r.valor_estimado || 0), 0))} icon={DollarSign}>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <div className="font-semibold">Valor Executado</div>
                <div>
                  {formatCurrencyBRL(kpiResumo?.valor_contratado || rows.reduce((s, r) => s + (r.valor_contratado || 0), 0))}
                  {" "}
                  <span className="text-muted-foreground">
                    {(() => {
                      const est = kpiResumo?.valor_estimado || rows.reduce((s, r) => s + (r.valor_estimado || 0), 0);
                      const exec = kpiResumo?.valor_contratado || rows.reduce((s, r) => s + (r.valor_contratado || 0), 0);
                      const pct = est ? (exec / est) * 100 : 0;
                      return `${pct.toFixed(1)}%`;
                    })()}
                  </span>
                </div>
              </div>
              <div>
                <div className="font-semibold">Ajuste orçamentário</div>
                <div>{formatCurrencyBRL(kpiResumo?.ajuste_orcamentario || rows.reduce((s, r) => s + (r.ajuste_orcamentario || 0), 0))}</div>
              </div>
              <div>
                <div className="font-semibold">Saldo Financeiro</div>
                <div>{formatCurrencyBRL(kpiResumo?.saldo_orcamentario || rows.reduce((s, r) => s + (r.saldo_orcamentario || 0), 0))}</div>
              </div>
            </div>
          </KPICard>

          <Card>
            <CardHeader>
              <CardTitle>Demandas por Modalidade</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  total_demandas: { label: "Demandas", color: "hsl(var(--chart-1))" },
                }}
                className="aspect-auto h-[180px] w-full"
              >
                <BarChart data={kpiModalidade} margin={{ left: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="modalidade" tickLine={false} axisLine={false} interval={0} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent nameKey="total_demandas" />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="total_demandas" fill="var(--color-total_demandas)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Demandas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tipo de Material/Serviço</TableHead>
                    <TableHead>Valor Estimado</TableHead>
                    <TableHead>Valor Executado</TableHead>
                    <TableHead>Ajuste Orçamentário</TableHead>
                    <TableHead>Saldo Orçamentário</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{formatId(r.id)}</TableCell>
                      <TableCell>{r.descricao}</TableCell>
                      <TableCell>{formatCurrencyBRL(r.valor_estimado)}</TableCell>
                      <TableCell>{formatCurrencyBRL(r.valor_contratado || 0)}</TableCell>
                      <TableCell>{formatCurrencyBRL(r.ajuste_orcamentario || 0)}</TableCell>
                      <TableCell>{formatCurrencyBRL(r.saldo_orcamentario || 0)}</TableCell>
                      <TableCell>{r.etapa_processo || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
              <div>
                Página {page} de {totalPages} • {totalCount} itens
              </div>
              <div className="flex gap-2">
                <Button size="xs" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  Anterior
                </Button>
                <Button size="xs" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                  Próxima
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SetoresDemandantes;