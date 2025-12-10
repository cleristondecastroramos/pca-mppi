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
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, LabelList, PieChart, Pie, Cell, Legend } from "recharts";

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

// Ordem fixa das legendas dos gráficos de pizza
const FIXED_ORDER_UO = ["PGJ", "FMMP", "FEPDC"];
const FIXED_ORDER_TIPO = [
  "Nova Contratação",
  "Renovação",
  "Aditivo Quantitativo",
  "Repactuação",
];
const FIXED_ORDER_CLASSE = [
  "Material de Consumo",
  "Material Permanente",
  "Serviço",
  "Serviço de TI",
  "Engenharia",
  "Obra",
];

type PieItem = { name: string; value: number };
const sortByFixedOrder = (arr: PieItem[], order: string[]): PieItem[] => {
  const fixed: PieItem[] = [];
  const others: PieItem[] = [];
  for (const item of arr) {
    if (order.includes(item.name)) fixed.push(item);
    else others.push(item);
  }
  fixed.sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
  // Outros rótulos fora da ordem fixa aparecem ao final em ordem alfabética
  others.sort((a, b) => a.name.localeCompare(b.name));
  return [...fixed, ...others];
};

// Abreviação robusta para rótulos das classes na legenda
const normalizeStr = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const abbreviateClasseLabel = (value: string) => {
  const n = normalizeStr(value);
  if (n.includes("material de consumo")) return "Mat. Consumo";
  if (n.includes("material permanente")) return "Mat. Permanente";
  return value;
};

const mapSetorName = (setor: string) => {
  if (setor === "PLANEJAMENTO") return "PLAN";
  return setor;
};

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
  const [metric, setMetric] = useState<"quantidade" | "valor_estimado">("quantidade");
  const [metricPieClasse, setMetricPieClasse] = useState<"quantidade" | "valor_estimado">("quantidade");
  const [metricPieUO, setMetricPieUO] = useState<"quantidade" | "valor_estimado">("quantidade");
  const [metricPieTipo, setMetricPieTipo] = useState<"quantidade" | "valor_estimado">("quantidade");

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
      if (filtros.etapa_processo && filtros.etapa_processo !== ALL_VALUE) {
        const STATUS_CATEGORY_MAP: Record<string, { etapas: string[]; sobrestado?: boolean }> = {
          "não iniciado": { etapas: ["Planejamento"], sobrestado: false },
          "em andamento": { etapas: ["Em Licitação", "Contratado"], sobrestado: false },
          "concluído": { etapas: ["Concluído"], sobrestado: false },
          "sobrestado": { etapas: [], sobrestado: true },
        };
        const cat = STATUS_CATEGORY_MAP[filtros.etapa_processo];
        if (cat) {
          if (cat.sobrestado) {
            query = query.eq("sobrestado", true);
          } else if (filtros.etapa_processo === "não iniciado") {
            // Include null etapa_processo as "não iniciado" and exclude sobrestados
            query = query.or("etapa_processo.is.null,etapa_processo.eq.Planejamento").neq("sobrestado", true);
          } else if (cat.etapas.length > 0) {
            query = query.in("etapa_processo", cat.etapas);
          }
        } else {
          query = query.eq("etapa_processo", filtros.etapa_processo);
        }
      }
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await query.range(from, to);
      if (error) {
        setError(error.message);
      } else {
        setRows((data as unknown as Contratacao[]) || []);
        setTotalCount(count || 0);
      }

      // Calculate KPIs client-side from all data (fetch without pagination for aggregates)
      let allQuery = supabase
        .from("contratacoes")
        .select("modalidade, etapa_processo, valor_estimado, valor_contratado");
      
      if (filtros.unidade_orcamentaria && filtros.unidade_orcamentaria !== ALL_VALUE) allQuery = allQuery.eq("unidade_orcamentaria", filtros.unidade_orcamentaria);
      if (filtros.setor_requisitante && filtros.setor_requisitante !== ALL_VALUE) allQuery = allQuery.eq("setor_requisitante", filtros.setor_requisitante);
      if (filtros.tipo_contratacao && filtros.tipo_contratacao !== ALL_VALUE) allQuery = allQuery.eq("tipo_contratacao", filtros.tipo_contratacao);
      if (filtros.tipo_recurso && filtros.tipo_recurso !== ALL_VALUE) allQuery = allQuery.eq("tipo_recurso", filtros.tipo_recurso);
      if (filtros.classe && filtros.classe !== ALL_VALUE) allQuery = allQuery.eq("classe", filtros.classe);
      if (filtros.grau_prioridade && filtros.grau_prioridade !== ALL_VALUE) allQuery = allQuery.eq("grau_prioridade", filtros.grau_prioridade);
      if (filtros.normativo && filtros.normativo !== ALL_VALUE) allQuery = allQuery.eq("normativo", filtros.normativo);
      if (filtros.modalidade && filtros.modalidade !== ALL_VALUE) allQuery = allQuery.eq("modalidade", filtros.modalidade);
      
      const { data: allData } = await allQuery;
      
      if (allData) {
        // Group by modalidade
        const modalidadeMap = new Map<string, { total_demandas: number; total_estimado: number; total_contratado: number }>();
        allData.forEach((r) => {
          const key = r.modalidade || "Não informado";
          const existing = modalidadeMap.get(key) || { total_demandas: 0, total_estimado: 0, total_contratado: 0 };
          existing.total_demandas += 1;
          existing.total_estimado += r.valor_estimado || 0;
          existing.total_contratado += r.valor_contratado || 0;
          modalidadeMap.set(key, existing);
        });
        setKpiModalidade(Array.from(modalidadeMap.entries()).map(([modalidade, vals]) => ({ modalidade, ...vals })));
        
        // Group by etapa_processo (status)
        const statusMap = new Map<string, { total_demandas: number; total_estimado: number; total_contratado: number }>();
        allData.forEach((r) => {
          const key = r.etapa_processo || "Não informado";
          const existing = statusMap.get(key) || { total_demandas: 0, total_estimado: 0, total_contratado: 0 };
          existing.total_demandas += 1;
          existing.total_estimado += r.valor_estimado || 0;
          existing.total_contratado += r.valor_contratado || 0;
          statusMap.set(key, existing);
        });
        setKpiStatus(Array.from(statusMap.entries()).map(([etapa_processo, vals]) => ({ etapa_processo, ...vals })));
      }
      
      setLoading(false);
    };
    fetchData();
  }, [filtros, page, pageSize]);

  useEffect(() => {
    const fetchDistinct = async () => {
      // Fetch distinct values client-side
      const { data } = await supabase
        .from("contratacoes")
        .select("unidade_orcamentaria, setor_requisitante, tipo_contratacao, tipo_recurso, classe, grau_prioridade, normativo, modalidade, etapa_processo");
      
      if (data) {
        const distinctValues = {
          unidade_orcamentaria: [...new Set(data.map(r => r.unidade_orcamentaria).filter(Boolean))],
          setor_requisitante: [...new Set(data.map(r => r.setor_requisitante).filter(Boolean))],
          tipo_contratacao: [...new Set(data.map(r => r.tipo_contratacao).filter(Boolean))],
          tipo_recurso: [...new Set(data.map(r => r.tipo_recurso).filter(Boolean))],
          classe: [...new Set(data.map(r => r.classe).filter(Boolean))],
          grau_prioridade: [...new Set(data.map(r => r.grau_prioridade).filter(Boolean))],
          normativo: [...new Set(data.map(r => r.normativo).filter(Boolean))],
          modalidade: [...new Set(data.map(r => r.modalidade).filter(Boolean))],
          etapa_processo: [...new Set(data.map(r => r.etapa_processo).filter(Boolean))],
        };
        setDistinctOptionsRpc(distinctValues);
      }
    };
    fetchDistinct();
  }, []);

  const distinctOptions = useMemo(() => {
    if (distinctOptionsRpc) {
      const PRIORITY_UO = ["PGJ", "FMMP", "FEPDC"];
      const rawUO: string[] = distinctOptionsRpc.unidade_orcamentaria || [];
      const orderedUO: string[] = [
        ...PRIORITY_UO.filter((x) => rawUO.includes(x)),
        ...rawUO.filter((x) => !PRIORITY_UO.includes(x)).sort((a, b) => a.localeCompare(b, "pt-BR")),
      ];
      const PRIORITY_PRIORIDADE = ["Alta", "Média", "Baixa"];
      const rawPrioridade: string[] = distinctOptionsRpc.grau_prioridade || [];
      const orderedPrioridade: string[] = [
        ...PRIORITY_PRIORIDADE.filter((x) => rawPrioridade.includes(x)),
        ...rawPrioridade
          .filter((x) => !PRIORITY_PRIORIDADE.includes(x))
          .sort((a, b) => a.localeCompare(b, "pt-BR")),
      ];
      return {
        unidade_orcamentaria: orderedUO,
        setor_requisitante: distinctOptionsRpc.setor_requisitante || [],
        tipo_contratacao: distinctOptionsRpc.tipo_contratacao || [],
        tipo_recurso: distinctOptionsRpc.tipo_recurso || [],
        classe: distinctOptionsRpc.classe || [],
        grau_prioridade: orderedPrioridade,
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
    const PRIORITY_UO = ["PGJ", "FMMP", "FEPDC"];
    const rawUO = build("unidade_orcamentaria");
    const orderedUO = [
      ...PRIORITY_UO.filter((x) => rawUO.includes(x)),
      ...rawUO.filter((x) => !PRIORITY_UO.includes(x)).sort((a, b) => a.localeCompare(b, "pt-BR")),
    ];
    const PRIORITY_PRIORIDADE = ["Alta", "Média", "Baixa"];
    const rawPrioridade = build("grau_prioridade");
    const orderedPrioridade = [
      ...PRIORITY_PRIORIDADE.filter((x) => rawPrioridade.includes(x)),
      ...rawPrioridade
        .filter((x) => !PRIORITY_PRIORIDADE.includes(x))
        .sort((a, b) => a.localeCompare(b, "pt-BR")),
    ];
    return {
      unidade_orcamentaria: orderedUO,
      setor_requisitante: build("setor_requisitante"),
      tipo_contratacao: build("tipo_contratacao"),
      tipo_recurso: build("tipo_recurso"),
      classe: build("classe"),
      grau_prioridade: orderedPrioridade,
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

  const distribuicaoPorClasseQuantidade = useMemo(() => {
    const map = new Map<string, number>();
    filteredRows.forEach((r) => {
      const key = r.classe || "Não informado";
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredRows]);

  const dadosQuantidadePorSetor = useMemo(() => {
    const map = new Map<string, number>();
    filteredRows.forEach((r) => {
      const setor = r.setor_requisitante || "Não informado";
      map.set(setor, (map.get(setor) || 0) + 1);
    });
    const result = Array.from(map.entries())
      .map(([setor, quantidade]) => ({ setor: mapSetorName(setor), quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade);
    return result.length > 0 ? result : [{ setor: "Sem dados", quantidade: 1 }];
  }, [filteredRows]);

  const dadosValoresPorSetor = useMemo(() => {
    const map = new Map<string, number>();
    filteredRows.forEach((r) => {
      const setor = r.setor_requisitante || "Não informado";
      map.set(setor, (map.get(setor) || 0) + (r.valor_estimado || 0));
    });
    const result = Array.from(map.entries())
      .map(([setor, valor_estimado]) => ({ setor: mapSetorName(setor), valor_estimado }))
      .sort((a, b) => b.valor_estimado - a.valor_estimado);
    return result.length > 0 ? result : [{ setor: "Sem dados", valor_estimado: 1000 }];
  }, [filteredRows]);

  // Dados para os novos gráficos de pizza
  const dadosValoresPorUO = useMemo(() => {
    const map = new Map<string, number>();
    filteredRows.forEach((r) => {
      const uo = r.unidade_orcamentaria || "Não informado";
      map.set(uo, (map.get(uo) || 0) + (r.valor_estimado || 0));
    });
    const result = Array.from(map.entries()).map(([name, value]) => ({ name, value }));
    const ordered = sortByFixedOrder(result, FIXED_ORDER_UO);
    return ordered.length > 0 ? ordered : [{ name: "Sem dados", value: 1 }];
  }, [filteredRows]);

  const dadosQuantidadePorUO = useMemo(() => {
    const map = new Map<string, number>();
    filteredRows.forEach((r) => {
      const uo = r.unidade_orcamentaria || "Não informado";
      map.set(uo, (map.get(uo) || 0) + 1);
    });
    const result = Array.from(map.entries()).map(([name, value]) => ({ name, value }));
    const ordered = sortByFixedOrder(result, FIXED_ORDER_UO);
    return ordered.length > 0 ? ordered : [{ name: "Sem dados", value: 1 }];
  }, [filteredRows]);

  const dadosValoresPorTipoContratacao = useMemo(() => {
    const map = new Map<string, number>();
    filteredRows.forEach((r) => {
      const tipo = r.tipo_contratacao || "Não informado";
      map.set(tipo, (map.get(tipo) || 0) + (r.valor_estimado || 0));
    });
    const result = Array.from(map.entries()).map(([name, value]) => ({ name, value }));
    const ordered = sortByFixedOrder(result, FIXED_ORDER_TIPO);
    return ordered.length > 0 ? ordered : [{ name: "Sem dados", value: 1 }];
  }, [filteredRows]);

  const dadosQuantidadePorTipoContratacao = useMemo(() => {
    const map = new Map<string, number>();
    filteredRows.forEach((r) => {
      const tipo = r.tipo_contratacao || "Não informado";
      map.set(tipo, (map.get(tipo) || 0) + 1);
    });
    const result = Array.from(map.entries()).map(([name, value]) => ({ name, value }));
    const ordered = sortByFixedOrder(result, FIXED_ORDER_TIPO);
    return ordered.length > 0 ? ordered : [{ name: "Sem dados", value: 1 }];
  }, [filteredRows]);

  // Dados para Classe (valores e quantidade) usados no terceiro gráfico de pizza
  const dadosValoresPorClasse = useMemo(() => {
    const map = new Map<string, number>();
    filteredRows.forEach((r) => {
      const classe = r.classe || "Não informado";
      map.set(classe, (map.get(classe) || 0) + (r.valor_estimado || 0));
    });
    const result = Array.from(map.entries()).map(([name, value]) => ({ name, value }));
    const ordered = sortByFixedOrder(result, FIXED_ORDER_CLASSE);
    return ordered.length > 0 ? ordered : [{ name: "Sem dados", value: 1 }];
  }, [filteredRows]);

  const dadosQuantidadePorClasse = useMemo(() => {
    const map = new Map<string, number>();
    filteredRows.forEach((r) => {
      const classe = r.classe || "Não informado";
      map.set(classe, (map.get(classe) || 0) + 1);
    });
    const result = Array.from(map.entries()).map(([name, value]) => ({ name, value }));
    const ordered = sortByFixedOrder(result, FIXED_ORDER_CLASSE);
    return ordered.length > 0 ? ordered : [{ name: "Sem dados", value: 1 }];
  }, [filteredRows]);

  const pieColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

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
        </div>
        
        {/* Barra de filtros discretos */}
        <Card>
          <CardContent className="p-2">
            <div className="flex flex-wrap md:flex-nowrap gap-2 items-center">
              <div className="w-28 shrink-0">
                <div className="text-[10px] text-black px-1">UO:</div>
                <Select onValueChange={(v) => setFiltro("unidade_orcamentaria", v)} value={filtros.unidade_orcamentaria}>
                  <SelectTrigger className="h-9 w-[110px] truncate px-3 text-sm">
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
              <div className="w-[130px] shrink-0">
                <div className="text-[10px] text-black px-1">Setor Requisitante:</div>
                <Select onValueChange={(v) => setFiltro("setor_requisitante", v)} value={filtros.setor_requisitante}>
                  <SelectTrigger className="h-9 w-[120px] truncate px-3 text-sm">
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem className="text-xs" value={ALL_VALUE}>Todos</SelectItem>
                    {distinctOptions.setor_requisitante.map((opt) => (
                      <SelectItem className="text-xs" key={opt} value={opt}>{mapSetorName(opt)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[160px] shrink-0 -ml-1">
                <div className="text-[10px] text-black px-1">Tipo de Contratação:</div>
                <Select onValueChange={(v) => setFiltro("tipo_contratacao", v)} value={filtros.tipo_contratacao}>
                  <SelectTrigger className="h-9 w-full truncate px-3 text-sm">
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
              <div className="w-[130px] shrink-0">
                <div className="text-[10px] text-black px-1">Tipo de Recurso:</div>
                <Select onValueChange={(v) => setFiltro("tipo_recurso", v)} value={filtros.tipo_recurso}>
                  <SelectTrigger className="h-9 w-[120px] truncate px-3 text-sm">
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
              <div className="w-[170px] shrink-0 -ml-1">
                <div className="text-[10px] text-black px-1">Classe de Material:</div>
                <Select onValueChange={(v) => setFiltro("classe", v)} value={filtros.classe}>
                  <SelectTrigger className="h-9 w-full truncate px-3 text-sm">
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
              <div className="w-[130px] shrink-0">
                <div className="text-[10px] text-black px-1">Grau de Prioridade:</div>
                <Select onValueChange={(v) => setFiltro("grau_prioridade", v)} value={filtros.grau_prioridade}>
                  <SelectTrigger className="h-9 w-[120px] truncate px-3 text-sm">
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
              <div className="w-[130px] shrink-0 -ml-1">
                <div className="text-[10px] text-black px-1">Normativo:</div>
                <Select onValueChange={(v) => setFiltro("normativo", v)} value={filtros.normativo}>
                  <SelectTrigger className="h-9 w-[120px] truncate px-3 text-sm">
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
              <div className="w-[160px] shrink-0 -ml-1">
                <div className="text-[10px] text-black px-1">Modalidade de Contratação:</div>
                <Select onValueChange={(v) => setFiltro("modalidade", v)} value={filtros.modalidade}>
                  <SelectTrigger className="h-9 w-full truncate px-3 text-sm">
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
              <div className="w-[130px] shrink-0">
                <div className="text-[10px] text-black px-1">Status Atual:</div>
                <Select onValueChange={(v) => setFiltro("etapa_processo", v)} value={filtros.etapa_processo}>
                  <SelectTrigger className="h-9 w-[120px] truncate px-3 text-sm">
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem className="text-xs" value={ALL_VALUE}>Todos</SelectItem>
                    <SelectItem className="text-xs" value="não iniciado">não iniciado</SelectItem>
                    <SelectItem className="text-xs" value="em andamento">em andamento</SelectItem>
                    <SelectItem className="text-xs" value="concluído">concluído</SelectItem>
                    <SelectItem className="text-xs" value="sobrestado">sobrestado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="ml-auto shrink-0">
                <Button size="xs" variant="outline" onClick={clearFiltros} className="h-9">Limpar filtros</Button>
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

        {/* Gráfico único com alternância: Demandas vs Valores por Setor */}
        <div className="grid gap-6">
          <Card>
            <CardHeader className="space-y-0">
              <div className="flex w-full items-start justify-between">
                <CardTitle className="text-sm">Distribuição por Setor</CardTitle>
                <div className="flex flex-col gap-1 items-end">
                  <Button
                    size="xs"
                    className="text-[10px] leading-3 w-[160px]"
                    variant={metric === "quantidade" ? "default" : "outline"}
                    onClick={() => setMetric("quantidade")}
                  >
                    Número de processos
                  </Button>
                  <Button
                    size="xs"
                    className="text-[10px] leading-3 w-[160px]"
                    variant={metric === "valor_estimado" ? "default" : "outline"}
                    onClick={() => setMetric("valor_estimado")}
                  >
                    Valores estimados
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  demandas: { label: "Demandas", color: "hsl(var(--chart-1))" },
                  valores: { label: "Valores (R$)", color: "hsl(var(--chart-2))" },
                }}
                className="w-full !aspect-auto h-[260px] min-h-[260px] overflow-visible"
                style={{ height: 260 }}
              >
                {(() => {
                  const chartData = metric === "quantidade" ? dadosQuantidadePorSetor : dadosValoresPorSetor;
                  const dataKey = metric === "quantidade" ? "quantidade" : "valor_estimado";
                  const fillColor = metric === "quantidade" ? "var(--color-demandas)" : "var(--color-valores)";
                  const formatter = (value: number) => (metric === "valor_estimado" ? formatCurrencyBRL(value) : value);
                  return (
                    <BarChart data={chartData} width={400} height={260} margin={{ top: 24, right: 16, bottom: 8, left: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="setor" />
                      <YAxis hide domain={[0, 'dataMax + 1']} />
                      <ChartTooltip
                        content={<ChartTooltipContent formatter={(v: number) => <span>{formatter(v)}</span>} />}
                      />
                      <Bar dataKey={dataKey} fill={fillColor}>
                        <LabelList dataKey={dataKey} position="top" formatter={formatter as any} />
                      </Bar>
                    </BarChart>
                  );
                })()}
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos de Pizza: UO, Tipo de Contratação e Classe */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Distribuição por Classe (Pizza) */}
          <Card>
            <CardHeader className="space-y-0">
              <div className="flex w-full items-start justify-between">
                <CardTitle className="text-sm">Distribuição por UO</CardTitle>
                <div className="flex flex-col gap-1 items-end">
                  <Button
                    size="xs"
                    className="text-[10px] leading-3 w-[160px]"
                    variant={metricPieUO === "quantidade" ? "default" : "outline"}
                    onClick={() => setMetricPieUO("quantidade")}
                  >
                    Número de processos
                  </Button>
                  <Button
                    size="xs"
                    className="text-[10px] leading-3 w-[160px]"
                    variant={metricPieUO === "valor_estimado" ? "default" : "outline"}
                    onClick={() => setMetricPieUO("valor_estimado")}
                  >
                    Valores estimados
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2 pb-2">
              <ChartContainer
                config={{ uo: { label: "UO", color: "hsl(var(--chart-2))" } }}
                className="w-full !aspect-auto h-[220px] min-h-[220px] overflow-visible"
                style={{ height: 220 }}
              >
                {(() => {
                  const chartData = (metricPieUO === "valor_estimado" ? dadosValoresPorUO : dadosQuantidadePorUO) as any[];
                  const data = chartData.length ? chartData : [{ name: "Sem dados", value: 1 }];
                  const formatter = (v: number) => (metricPieUO === "valor_estimado" ? formatCurrencyBRL(v) : v);
                  return (
                    <PieChart width={400} height={220}>
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value: number) => (
                              <span>{formatter(value as number)}</span>
                            )}
                          />
                        }
                      />
                      <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: 10, lineHeight: "12px", marginTop: 6 }}
                        formatter={(value: string) => {
                          const short = value.length > 18 ? value.slice(0, 18) + "…" : value
                          return <span title={value}>{short}</span>
                        }}
                      />
                      <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={54}
                        outerRadius={94}
                        labelLine={false}
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                          const RADIAN = Math.PI / 180;
                          const radius = (innerRadius as number) + ((outerRadius as number) - (innerRadius as number)) * 0.5;
                          const x = (cx as number) + radius * Math.cos(-(midAngle as number) * RADIAN);
                          const y = (cy as number) + radius * Math.sin(-(midAngle as number) * RADIAN);
                          const pct = Math.round(((percent as number) || 0) * 100);
                          return (
                            <text x={x} y={y} fill="#111827" textAnchor="middle" dominantBaseline="central" fontSize={10}>
                              {pct}%
                            </text>
                          );
                        }}
                      >
                        {data.map((_: any, index: number) => (
                          <Cell key={`cell-uo-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  );
                })()}
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Distribuição por Tipo de Contratação (Pizza) */}
          <Card>
            <CardHeader className="space-y-0">
              <div className="flex w-full items-start justify-between">
                <CardTitle className="text-sm">Distribuição por Tipo de Contratação</CardTitle>
                <div className="flex flex-col gap-1 items-end">
                  <Button
                    size="xs"
                    className="text-[10px] leading-3 w-[160px]"
                    variant={metricPieTipo === "quantidade" ? "default" : "outline"}
                    onClick={() => setMetricPieTipo("quantidade")}
                  >
                    Número de processos
                  </Button>
                  <Button
                    size="xs"
                    className="text-[10px] leading-3 w-[160px]"
                    variant={metricPieTipo === "valor_estimado" ? "default" : "outline"}
                    onClick={() => setMetricPieTipo("valor_estimado")}
                  >
                    Valores estimados
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2 pb-2">
              <ChartContainer
                config={{ tipo: { label: "Tipo", color: "hsl(var(--chart-3))" } }}
                className="w-full !aspect-auto h-[220px] min-h-[220px] overflow-visible"
                style={{ height: 220 }}
              >
                {(() => {
                  const chartData = (metricPieTipo === "valor_estimado" ? dadosValoresPorTipoContratacao : dadosQuantidadePorTipoContratacao) as any[];
                  const data = chartData.length ? chartData : [{ name: "Sem dados", value: 1 }];
                  const formatter = (v: number) => (metricPieTipo === "valor_estimado" ? formatCurrencyBRL(v) : v);
                  return (
                    <PieChart width={400} height={220}>
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value: number) => (
                              <span>{formatter(value as number)}</span>
                            )}
                          />
                        }
                      />
                      <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: 10, lineHeight: "12px", marginTop: 6 }}
                        formatter={(value: string) => {
                          const short = value.length > 18 ? value.slice(0, 18) + "…" : value;
                          return <span title={value}>{short}</span>
                        }}
                      />
                      <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={54}
                        outerRadius={94}
                        labelLine={false}
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                          const RADIAN = Math.PI / 180;
                          const radius = (innerRadius as number) + ((outerRadius as number) - (innerRadius as number)) * 0.5;
                          const x = (cx as number) + radius * Math.cos(-(midAngle as number) * RADIAN);
                          const y = (cy as number) + radius * Math.sin(-(midAngle as number) * RADIAN);
                          const pct = Math.round(((percent as number) || 0) * 100);
                          return (
                            <text x={x} y={y} fill="#111827" textAnchor="middle" dominantBaseline="central" fontSize={10}>
                              {pct}%
                            </text>
                          );
                        }}
                      >
                        {data.map((_: any, index: number) => (
                          <Cell key={`cell-tipo-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  );
                })()}
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Distribuição por Classe (Pizza) */}
          <Card>
            <CardHeader className="space-y-0">
              <div className="flex w-full items-start justify-between">
                <CardTitle className="text-sm">Distribuição por Classe</CardTitle>
                <div className="flex flex-col gap-1 items-end">
                  <Button
                    size="xs"
                    className="text-[10px] leading-3 w-[160px]"
                    variant={metricPieClasse === "quantidade" ? "default" : "outline"}
                    onClick={() => setMetricPieClasse("quantidade")}
                  >
                    Número de processos
                  </Button>
                  <Button
                    size="xs"
                    className="text-[10px] leading-3 w-[160px]"
                    variant={metricPieClasse === "valor_estimado" ? "default" : "outline"}
                    onClick={() => setMetricPieClasse("valor_estimado")}
                  >
                    Valores estimados
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2 pb-2">
              <ChartContainer
                config={{ classe: { label: "Classe", color: "hsl(var(--chart-1))" } }}
                className="w-full !aspect-auto h-[220px] min-h-[220px] overflow-visible"
                style={{ height: 220 }}
              >
                {(() => {
                  const chartData = (metricPieClasse === "valor_estimado" ? dadosValoresPorClasse : dadosQuantidadePorClasse) as any[];
                  const data = chartData.length ? chartData : [{ name: "Sem dados", value: 1 }];
                  const formatter = (v: number) => (metricPieClasse === "valor_estimado" ? formatCurrencyBRL(v) : v);
                  return (
                    <PieChart width={400} height={220}>
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value: number) => (
                              <span>{formatter(value as number)}</span>
                            )}
                          />
                        }
                      />
                      <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: 10, lineHeight: "12px", marginTop: 6 }}
                        content={({ payload }) => (
                          <div className="flex items-center justify-center gap-4 pt-3">
                            {(payload || []).map((item: any) => {
                              const original = item?.payload?.name ?? item?.value;
                              let label = abbreviateClasseLabel(original || "");
                              if (label.length > 18) label = label.slice(0, 18) + "…";
                              const color = item?.color || item?.payload?.fill;
                              return (
                                <div key={original} className="flex items-center gap-1.5">
                                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                                  <span title={original}>{label}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      />
                      <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={54}
                        outerRadius={94}
                        labelLine={false}
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                          const RADIAN = Math.PI / 180;
                          const radius = (innerRadius as number) + ((outerRadius as number) - (innerRadius as number)) * 0.5;
                          const x = (cx as number) + radius * Math.cos(-(midAngle as number) * RADIAN);
                          const y = (cy as number) + radius * Math.sin(-(midAngle as number) * RADIAN);
                          const pct = Math.round(((percent as number) || 0) * 100);
                          return (
                            <text x={x} y={y} fill="#111827" textAnchor="middle" dominantBaseline="central" fontSize={10}>
                              {pct}%
                            </text>
                          );
                        }}
                      >
                        {data.map((_: any, index: number) => (
                          <Cell key={`cell-classe-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  );
                })()}
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Paginação removida a pedido: botões e contador no rodapé */}
      </div>
    </Layout>
  );
};

export default VisaoGeral;