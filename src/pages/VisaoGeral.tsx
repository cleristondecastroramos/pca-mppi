import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { KPICard } from "@/components/KPICard";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useMemo, useState } from "react";
import type { Tables } from "@/integrations/supabase/types";
import { FileText, DollarSign, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";

const ALL_VALUE = "__all__";

type Contratacao = Pick<
  Tables<"contratacoes">,
  | "id"
  | "valor_estimado"
  | "valor_contratado"
  | "modalidade"
  | "unidade_orcamentaria"
  | "setor_requisitante"
  | "tipo_contratacao"
  | "tipo_recurso"
  | "classe"
  | "grau_prioridade"
  | "normativo"
  | "etapa_processo"
>;

type Filtros = {
  unidade_orcamentaria?: string;
  setor_requisitante?: string;
  tipo_contratacao?: string;
  tipo_recurso?: string;
  classe?: string;
  grau_prioridade?: string;
  normativo?: string;
  modalidade?: string;
  etapa_processo?: string; // "Status Atual"
};

const formatCurrencyBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const VisaoGeral = () => {
  const [rows, setRows] = useState<Contratacao[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const defaultFiltros: Filtros = {
    unidade_orcamentaria: ALL_VALUE,
    setor_requisitante: ALL_VALUE,
    tipo_contratacao: ALL_VALUE,
    tipo_recurso: ALL_VALUE,
    classe: ALL_VALUE,
    grau_prioridade: ALL_VALUE,
    normativo: ALL_VALUE,
    modalidade: ALL_VALUE,
    etapa_processo: ALL_VALUE,
  };
  const [filtros, setFiltros] = useState<Filtros>(defaultFiltros);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [kpiModalidade, setKpiModalidade] = useState<Array<{ modalidade: string; total_demandas: number; total_estimado: number; total_contratado: number }>>([]);
  const [kpiStatus, setKpiStatus] = useState<Array<{ etapa_processo: string; total_demandas: number; total_estimado: number; total_contratado: number }>>([]);
  const [distinctOptionsRpc, setDistinctOptionsRpc] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      let query = supabase
        .from("contratacoes")
        .select(
          [
            "id",
            "valor_estimado",
            "valor_contratado",
            "modalidade",
            "unidade_orcamentaria",
            "setor_requisitante",
            "tipo_contratacao",
            "tipo_recurso",
            "classe",
            "grau_prioridade",
            "normativo",
            "etapa_processo",
          ].join(","),
          { count: "exact" }
        );
      if (filtros.unidade_orcamentaria && filtros.unidade_orcamentaria !== ALL_VALUE) query = query.eq("unidade_orcamentaria", filtros.unidade_orcamentaria);
      if (filtros.setor_requisitante && filtros.setor_requisitante !== ALL_VALUE) query = query.eq("setor_requisitante", filtros.setor_requisitante);
      if (filtros.tipo_contratacao && filtros.tipo_contratacao !== ALL_VALUE) query = query.eq("tipo_contratacao", filtros.tipo_contratacao);
      if (filtros.tipo_recurso && filtros.tipo_recurso !== ALL_VALUE) query = query.eq("tipo_recurso", filtros.tipo_recurso);
      if (filtros.classe && filtros.classe !== ALL_VALUE) query = query.eq("classe", filtros.classe);
      if (filtros.grau_prioridade && filtros.grau_prioridade !== ALL_VALUE) query = query.eq("grau_prioridade", filtros.grau_prioridade);
      if (filtros.normativo && filtros.normativo !== ALL_VALUE) query = query.eq("normativo", filtros.normativo);
      if (filtros.modalidade && filtros.modalidade !== ALL_VALUE) query = query.eq("modalidade", filtros.modalidade);
      if (filtros.etapa_processo && filtros.etapa_processo !== ALL_VALUE) query = query.eq("etapa_processo", filtros.etapa_processo);
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await query.range(from, to);
      if (error) {
        setError(error.message);
      } else {
        setRows((data as Contratacao[]) || []);
        setTotalCount(count || 0);
      }

      const { data: porModalidade } = await supabase.rpc("kpi_contratacoes_por_modalidade", {
        p_unidade_orcamentaria: filtros.unidade_orcamentaria || null,
        p_setor_requisitante: filtros.setor_requisitante || null,
        p_tipo_contratacao: filtros.tipo_contratacao || null,
        p_tipo_recurso: filtros.tipo_recurso || null,
        p_classe: filtros.classe || null,
        p_grau_prioridade: filtros.grau_prioridade || null,
        p_normativo: filtros.normativo || null,
        p_etapa_processo: filtros.etapa_processo || null,
      });
      setKpiModalidade((porModalidade as any) || []);
      const { data: porStatus } = await supabase.rpc("kpi_contratacoes_por_status", {
        p_unidade_orcamentaria: filtros.unidade_orcamentaria || null,
        p_setor_requisitante: filtros.setor_requisitante || null,
        p_tipo_contratacao: filtros.tipo_contratacao || null,
        p_tipo_recurso: filtros.tipo_recurso || null,
        p_classe: filtros.classe || null,
        p_grau_prioridade: filtros.grau_prioridade || null,
        p_normativo: filtros.normativo || null,
        p_etapa_processo: filtros.etapa_processo || null,
      });
      setKpiStatus((porStatus as any) || []);
      setLoading(false);
    };
    fetchData();
  }, [filtros, page, pageSize]);

  useEffect(() => {
    const fetchDistinct = async () => {
      const { data } = await supabase.rpc("contratacoes_distinct");
      if (data) setDistinctOptionsRpc(data as any);
    };
    fetchDistinct();
  }, []);

  const distinctOptions = useMemo(() => {
    if (distinctOptionsRpc) {
      return {
        unidade_orcamentaria: distinctOptionsRpc.unidade_orcamentaria || [],
        setor_requisitante: distinctOptionsRpc.setor_requisitante || [],
        tipo_contratacao: distinctOptionsRpc.tipo_contratacao || [],
        tipo_recurso: distinctOptionsRpc.tipo_recurso || [],
        classe: distinctOptionsRpc.classe || [],
        grau_prioridade: distinctOptionsRpc.grau_prioridade || [],
        normativo: distinctOptionsRpc.normativo || [],
        modalidade: distinctOptionsRpc.modalidade || [],
        etapa_processo: distinctOptionsRpc.etapa_processo || [],
      };
    }
    const build = (key: keyof Contratacao) => {
      const s = new Set<string>();
      rows.forEach((r) => {
        const v = r[key] as unknown as string | null;
        if (v && String(v).trim() !== "") s.add(String(v));
      });
      return Array.from(s).sort((a, b) => a.localeCompare(b, "pt-BR"));
    };
    return {
      unidade_orcamentaria: build("unidade_orcamentaria"),
      setor_requisitante: build("setor_requisitante"),
      tipo_contratacao: build("tipo_contratacao"),
      tipo_recurso: build("tipo_recurso"),
      classe: build("classe"),
      grau_prioridade: build("grau_prioridade"),
      normativo: build("normativo"),
      modalidade: build("modalidade"),
      etapa_processo: build("etapa_processo"),
    };
  }, [rows, distinctOptionsRpc]);

  const filteredRows = rows; // filtros aplicados server-side

  const kpis = useMemo(() => {
    const totalDemandas = filteredRows.length;
    const totalEstimado = filteredRows.reduce((sum, r) => sum + (r.valor_estimado || 0), 0);
    const totalContratado = filteredRows.reduce((sum, r) => sum + (r.valor_contratado || 0), 0);
    const totalConcluidas = filteredRows.filter((r) => r.etapa_processo === "Concluído").length;
    return { totalDemandas, totalEstimado, totalContratado, totalConcluidas };
  }, [filteredRows]);

  const andamentoPorEtapa = useMemo(() => {
    const etapas = ["Planejamento", "Em Licitação", "Contratado", "Concluído"] as const;
    const counts = Object.fromEntries(etapas.map((e) => [e, 0])) as Record<typeof etapas[number], number>;
    filteredRows.forEach((r) => {
      if (r.etapa_processo && (counts as any)[r.etapa_processo] !== undefined) {
        counts[r.etapa_processo as typeof etapas[number]] += 1;
      }
    });
    const total = filteredRows.length || 1;
    return etapas.map((etapa) => ({
      etapa,
      count: counts[etapa],
      percentage: Math.round((counts[etapa] / total) * 100),
    }));
  }, [filteredRows]);

  const distribuicaoPorClasse = useMemo(() => {
    const map = new Map<string, number>();
    filteredRows.forEach((r) => {
      const key = r.classe || "Não informado";
      map.set(key, (map.get(key) || 0) + (r.valor_estimado || 0));
    });
    const total = Array.from(map.values()).reduce((a, b) => a + b, 0) || 1;
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value, percentage: Math.round((value / total) * 100) }))
      .sort((a, b) => b.percentage - a.percentage);
  }, [filteredRows]);

  const setFiltro = (key: keyof Filtros, value: string) => {
    setFiltros((prev) => ({ ...prev, [key]: value }));
  };

  const clearFiltros = () => setFiltros(defaultFiltros);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Visão Geral</h1>
            <p className="text-sm text-muted-foreground">Resumo e panorama geral do PCA 2026.</p>
          </div>
          <Button size="xs" variant="outline" onClick={clearFiltros}>Limpar filtros</Button>
        </div>
        
        {/* Barra de filtros discretos */}
        <Card>
          <CardContent className="p-2">
            <div className="flex flex-wrap md:flex-nowrap gap-2">
              <div className="w-24 shrink-0">
                <div className="text-[10px] text-black px-1">UO:</div>
                <Select onValueChange={(v) => setFiltro("unidade_orcamentaria", v)} value={filtros.unidade_orcamentaria}>
                  <SelectTrigger className="h-8 w-[90px] truncate px-2 text-xs">
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem className="text-xs" value={ALL_VALUE}>Todos</SelectItem>
                    {distinctOptions.unidade_orcamentaria.map((opt) => (
                      <SelectItem className="text-xs" key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[110px] shrink-0">
                <div className="text-[10px] text-black px-1">Setor Requisitante:</div>
                <Select onValueChange={(v) => setFiltro("setor_requisitante", v)} value={filtros.setor_requisitante}>
                  <SelectTrigger className="h-8 w-[96px] truncate px-2 text-xs">
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem className="text-xs" value={ALL_VALUE}>Todos</SelectItem>
                    {distinctOptions.setor_requisitante.map((opt) => (
                      <SelectItem className="text-xs" key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[140px] shrink-0 -ml-1">
                <div className="text-[10px] text-black px-1">Tipo de Contratação:</div>
                <Select onValueChange={(v) => setFiltro("tipo_contratacao", v)} value={filtros.tipo_contratacao}>
                  <SelectTrigger className="h-8 w-full truncate px-2 text-xs">
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem className="text-xs" value={ALL_VALUE}>Todos</SelectItem>
                    {distinctOptions.tipo_contratacao.map((opt) => (
                      <SelectItem className="text-xs" key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[110px] shrink-0">
                <div className="text-[10px] text-black px-1">Tipo de Recurso:</div>
                <Select onValueChange={(v) => setFiltro("tipo_recurso", v)} value={filtros.tipo_recurso}>
                  <SelectTrigger className="h-8 w-[96px] truncate px-2 text-xs">
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem className="text-xs" value={ALL_VALUE}>Todos</SelectItem>
                    {distinctOptions.tipo_recurso.map((opt) => (
                      <SelectItem className="text-xs" key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[150px] shrink-0 -ml-1">
                <div className="text-[10px] text-black px-1">Classe de Material:</div>
                <Select onValueChange={(v) => setFiltro("classe", v)} value={filtros.classe}>
                  <SelectTrigger className="h-8 w-full truncate px-2 text-xs">
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem className="text-xs" value={ALL_VALUE}>Todos</SelectItem>
                    {distinctOptions.classe.map((opt) => (
                      <SelectItem className="text-xs" key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[110px] shrink-0">
                <div className="text-[10px] text-black px-1">Grau de Prioridade:</div>
                <Select onValueChange={(v) => setFiltro("grau_prioridade", v)} value={filtros.grau_prioridade}>
                  <SelectTrigger className="h-8 w-[96px] truncate px-2 text-xs">
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem className="text-xs" value={ALL_VALUE}>Todos</SelectItem>
                    {distinctOptions.grau_prioridade.map((opt) => (
                      <SelectItem className="text-xs" key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[110px] shrink-0 -ml-1">
                <div className="text-[10px] text-black px-1">Normativo:</div>
                <Select onValueChange={(v) => setFiltro("normativo", v)} value={filtros.normativo}>
                  <SelectTrigger className="h-8 w-[96px] truncate px-2 text-xs">
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem className="text-xs" value={ALL_VALUE}>Todos</SelectItem>
                    {distinctOptions.normativo.map((opt) => (
                      <SelectItem className="text-xs" key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[140px] shrink-0 -ml-1">
                <div className="text-[10px] text-black px-1">Modalidade de Contratação:</div>
                <Select onValueChange={(v) => setFiltro("modalidade", v)} value={filtros.modalidade}>
                  <SelectTrigger className="h-8 w-full truncate px-2 text-xs">
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem className="text-xs" value={ALL_VALUE}>Todos</SelectItem>
                    {distinctOptions.modalidade.map((opt) => (
                      <SelectItem className="text-xs" key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[110px] shrink-0">
                <div className="text-[10px] text-black px-1">Status Atual:</div>
                <Select onValueChange={(v) => setFiltro("etapa_processo", v)} value={filtros.etapa_processo}>
                  <SelectTrigger className="h-8 w-[96px] truncate px-2 text-xs">
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem className="text-xs" value={ALL_VALUE}>Todos</SelectItem>
                    {distinctOptions.etapa_processo.map((opt) => (
                      <SelectItem className="text-xs" key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPIs (reposicionados logo abaixo dos filtros) */}
        <div className="grid gap-3 grid-cols-1 md:grid-cols-6 lg:grid-cols-6">
          <div className="md:col-span-1 lg:col-span-1">
            <KPICard
              title="Total de Demandas"
              value={loading ? "—" : kpis.totalDemandas}
              icon={FileText}
              variant="default"
            />
          </div>
          <div className="md:col-span-2 lg:col-span-2">
            <KPICard
              title="Valor Total Estimado"
              value={loading ? "—" : formatCurrencyBRL(kpis.totalEstimado)}
              icon={DollarSign}
              variant="info"
            />
          </div>
          <div className="md:col-span-2 lg:col-span-2">
            <KPICard
              title="Valor Total Contratado"
              value={loading ? "—" : formatCurrencyBRL(kpis.totalContratado)}
              icon={CheckCircle}
              variant="success"
            />
          </div>
          <div className="md:col-span-1 lg:col-span-1">
            <KPICard
              title="Demandas Concluídas"
              value={loading ? "—" : kpis.totalConcluidas}
              icon={CheckCircle}
              variant="success"
            />
          </div>
        </div>

        {/* Cards informativos: Andamento por Etapa e Distribuição por Classe (agora abaixo dos KPIs) */}
        <div className="grid gap-3 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Andamento por Etapa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {andamentoPorEtapa.map((item) => (
                <div key={item.etapa} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.etapa}</span>
                    <span className="font-medium">{item.count} ({item.percentage}%)</span>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Classe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {distribuicaoPorClasse.map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-medium">{formatCurrencyBRL(item.value)}</span>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Paginação */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Página {page} de {totalPages} • {totalCount} itens</div>
          <div className="flex gap-2">
            <Button size="xs" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Anterior</Button>
            <Button size="xs" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Próxima</Button>
          </div>
        </div>

        {/* Gráficos e indicadores */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Demandas por Modalidade</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ demandas: { label: "Demandas", color: "hsl(var(--chart-1))" } }}>
                <BarChart data={kpiModalidade}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="modalidade" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="total_demandas" fill="var(--color-demandas)" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Demandas por Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ demandas: { label: "Demandas", color: "hsl(var(--chart-2))" } }}>
                <BarChart data={kpiStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="etapa_processo" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="total_demandas" fill="var(--color-demandas)" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default VisaoGeral;