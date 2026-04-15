import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KPICard } from "@/components/KPICard";
import { ClipboardList, DollarSign, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Row = {
  id: string;
  codigo?: string | null;
  descricao?: string | null;
  setor_requisitante: string;
  classe: string;
  valor_estimado: number;
  valor_contratado?: number | null;
  saldo_orcamentario?: number | null;
  valor_executado?: number | null;
  modalidade: string;
  tipo_contratacao?: string | null;
  etapa_processo?: string | null;
  sobrestado?: boolean | null;
  data_prevista_contratacao?: string | null;
  grau_prioridade?: string | null;
  parent_id?: string | null;
  parent?: { codigo: string | null } | null;
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

const parseCurrency = (val: string | number | null | undefined): number => {
  if (!val) return 0;
  if (typeof val === "number") return val;
  
  const strVal = String(val).trim();
  
  if (strVal.includes(",")) {
    const clean = strVal.replace(/\./g, "").replace(/[^\d,-]/g, "");
    const dot = clean.replace(",", ".");
    const num = parseFloat(dot);
    return isNaN(num) ? 0 : num;
  }
  
  const clean = strVal.replace(/[^\d.-]/g, "");
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
};

const calcExecutado = (r: Row) => {
  return r.valor_executado || 0;
};

const calcSaldo = (r: Row) => {
  const executado = calcExecutado(r);
  if (r.etapa_processo === "Cancelada") return 0;
  return (r.valor_estimado || 0) - executado;
};

const mapSetorName = (setor: string) => {
  if (setor === "PLANEJAMENTO") return "PLAN";
  return setor;
};

const formatId = (id: string, codigo?: string | null) => {
  if (!codigo) return id.slice(-4).toUpperCase();
  return codigo.toUpperCase().replace(/^PCA-/, "").replace(/-2026$/, "");
};

// ─── Helpers de data ─────────────────────────────────────────────────────────

const formatDateBR = (s: string | null | undefined): string => {
  if (!s) return "—";
  const [y, m, d] = s.split("-");
  return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
};

/**
 * Calcula a data prevista de início do processo com base na modalidade,
 * usando a mesma lógica adotada em PrioridadesAtencao e ControlePrazos.
 */
const calculateStartDate = (tipo: string | null | undefined, mod: string | null | undefined, termino: string | null | undefined): string | null => {
  if (!termino) return null;
  let date: Date;
  if (termino.includes("-") && termino.length === 10) {
    const [year, month, day] = termino.split("-").map(Number);
    date = new Date(year, month - 1, day);
  } else {
    date = new Date(termino);
  }
  let days = 120;
  if (tipo === "Nova Contratação") {
    if (mod === "Pregão Eletrônico" || mod === "Concorrência") {
      days = 150;
    } else if (mod === "Dispensa" || mod === "Inexigibilidade" || mod === "ARP (própria)" || mod === "ARP (carona)") {
      days = 90;
    }
  }
  date.setDate(date.getDate() - days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// ─── Lógica de Status e Prazo ─────────────────────────────────────────────────

type StatusInfo = {
  label: string;
  color: string;         // Tailwind bg class
  textColor: string;     // Tailwind text class
  borderColor: string;   // Tailwind border class
  dotClass: string;      // Classes para o círculo
  description: string;
};

type DeadlineInfo = {
  label: string;
  badgeClass: string;
  dataInicio: string | null;
  dataConclusao: string;
  diffDays: number;
  referencia: "inicio" | "conclusao";
} | null;

const getStatusInfo = (r: Row): StatusInfo => {
  if (r.sobrestado) {
    return {
      label: "Sobrestado",
      color: "bg-orange-500",
      textColor: "text-orange-700",
      borderColor: "border-orange-400",
      dotClass: "bg-orange-500",
      description: "Processo suspenso temporariamente.",
    };
  }
  const etapa = r.etapa_processo;
  if (!etapa || etapa === "Planejamento") {
    return {
      label: "Não Iniciado",
      color: "bg-slate-400",
      textColor: "text-slate-600",
      borderColor: "border-slate-400",
      dotClass: "bg-slate-400",
      description: "O processo ainda não foi iniciado.",
    };
  }
  if (etapa === "Iniciado") {
    return {
      label: "Iniciado",
      color: "bg-blue-400",
      textColor: "text-blue-700",
      borderColor: "border-blue-400",
      dotClass: "bg-blue-400",
      description: "O processo foi iniciado pelo setor requisitante.",
    };
  }
  if (etapa === "Retornado para Diligência") {
    return {
      label: "Retornado",
      color: "bg-yellow-500",
      textColor: "text-yellow-700",
      borderColor: "border-yellow-400",
      dotClass: "bg-yellow-500",
      description: "Processo retornado ao setor para diligência.",
    };
  }
  if (etapa === "Em Licitação" || etapa === "Contratado") {
    return {
      label: "Em Andamento",
      color: "bg-indigo-500",
      textColor: "text-indigo-700",
      borderColor: "border-indigo-400",
      dotClass: "bg-indigo-500",
      description: "Processo em fase de licitação ou contratação.",
    };
  }
  if (etapa === "Concluído") {
    return {
      label: "Concluído",
      color: "bg-emerald-500",
      textColor: "text-emerald-700",
      borderColor: "border-emerald-400",
      dotClass: "bg-emerald-500",
      description: "Processo finalizado com sucesso.",
    };
  }
  return {
    label: etapa,
    color: "bg-slate-300",
    textColor: "text-slate-600",
    borderColor: "border-slate-300",
    dotClass: "bg-slate-300",
    description: "",
  };
};

/** 
 * Calcula situação de prazo:
 * - Processos Não Iniciados (null / Planejamento): dias até a DATA DE INÍCIO prevista.
 * - Processos Em Andamento (Iniciado, Retornado, Em Licitação, Contratado): dias até a DATA DE CONCLUSÃO.
 * - null: concluído, cancelado, sobrestado ou sem data.
 */
const getDeadlineInfo = (r: Row): DeadlineInfo => {
  if (
    r.etapa_processo === "Concluído" ||
    r.etapa_processo === "Cancelada" ||
    r.sobrestado
  ) return null;

  if (!r.data_prevista_contratacao) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dataInicio = calculateStartDate(r.tipo_contratacao, r.modalidade, r.data_prevista_contratacao);
  const dataConclusao = formatDateBR(r.data_prevista_contratacao);

  // Determina se o processo já foi iniciado
  const estaEmAndamento =
    r.etapa_processo === "Iniciado" ||
    r.etapa_processo === "Retornado para Diligência" ||
    r.etapa_processo === "Em Licitação" ||
    r.etapa_processo === "Contratado";

  // Escolhe a data de referência para o cálculo de dias
  let refDate: Date;
  let referencia: "inicio" | "conclusao";

  if (estaEmAndamento || !dataInicio) {
    // Em andamento → conta até a conclusão
    refDate = new Date(r.data_prevista_contratacao + "T00:00:00");
    referencia = "conclusao";
  } else {
    // Não iniciado → conta até o início previsto
    refDate = new Date(dataInicio + "T00:00:00");
    referencia = "inicio";
  }

  const diffDays = Math.ceil((refDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      label: "Atrasado",
      badgeClass: "bg-red-100 text-red-700 border border-red-300",
      dataInicio,
      dataConclusao,
      diffDays,
      referencia,
    };
  }
  if (diffDays <= 30) {
    return {
      label: "Atenção",
      badgeClass: "bg-amber-100 text-amber-700 border border-amber-300",
      dataInicio,
      dataConclusao,
      diffDays,
      referencia,
    };
  }
  return {
    label: "No Prazo",
    badgeClass: "bg-emerald-100 text-emerald-700 border border-emerald-300",
    dataInicio,
    dataConclusao,
    diffDays,
    referencia,
  };
};

// ─── Componente StatusCell ────────────────────────────────────────────────────

const StatusCell = ({ row }: { row: Row }) => {
  const status = getStatusInfo(row);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-1.5 cursor-default justify-center">
          <span
            className={`inline-block h-2.5 w-2.5 rounded-full shrink-0 ${status.dotClass} shadow-sm ring-1 ring-black/10`}
          />
          <span className={`text-xs font-medium ${status.textColor}`}>
            {status.label}
          </span>
        </div>
      </TooltipTrigger>
      {status.description && (
        <TooltipContent side="left" className="max-w-[200px] text-xs">
          {status.description}
        </TooltipContent>
      )}
    </Tooltip>
  );
};

const DeadlineCell = ({ row }: { row: Row }) => {
  const deadline = getDeadlineInfo(row);

  if (!deadline) return <span className="text-xs text-muted-foreground">—</span>;

  const diasLabel = (() => {
    const abs = Math.abs(deadline.diffDays);
    const alvo = deadline.referencia === "inicio" ? "p/ início" : "p/ conclusão";
    if (deadline.diffDays < 0) {
      const ref = deadline.referencia === "inicio" ? "início" : "conclusão";
      return `Atrasado no ${ref} há ${abs} dia(s)`;
    }
    return `Faltam ${abs} dia(s) ${alvo}`;
  })();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full cursor-default ${deadline.badgeClass}`}
        >
          {deadline.label}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs p-3 space-y-1.5 max-w-[240px]">
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">🚀 Início previsto:</span>
          <span className="font-semibold">{formatDateBR(deadline.dataInicio)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">🏁 Conclusão prevista:</span>
          <span className="font-semibold">{deadline.dataConclusao}</span>
        </div>
        <div className="border-t border-border pt-1 mt-1 font-semibold text-center">
          {diasLabel}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

// ─── Componente Principal ─────────────────────────────────────────────────────

const SetoresDemandantes = () => {
  const [setor, setSetor] = useState<string | undefined>(undefined);
  const [tipoContratacao, setTipoContratacao] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [rows, setRows] = useState<Row[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalCount, setTotalCount] = useState(0);
  const [kpiResumo, setKpiResumo] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const filtros = useMemo(() => ({ setor_requisitante: setor, tipo_contratacao: tipoContratacao, etapa_processo: status }), [setor, tipoContratacao, status]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ArrowUpDown className="inline ml-1 h-3 w-3 opacity-40" />;
    return sortOrder === "asc"
      ? <ArrowUp className="inline ml-1 h-3 w-3 opacity-90" />
      : <ArrowDown className="inline ml-1 h-3 w-3 opacity-90" />;
  };

  const statusCategoryMap: Record<string, { etapas: string[]; sobrestado?: boolean }> = {
    "não iniciado": { etapas: ["Planejamento"], sobrestado: false },
    "em andamento": { etapas: ["Em Licitação", "Contratado"], sobrestado: false },
    "concluído": { etapas: ["Concluído"], sobrestado: false },
    "sobrestado": { etapas: [], sobrestado: true },
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      let query = supabase
        .from("contratacoes")
        .select([
          "id",
          "codigo",
          "descricao",
          "setor_requisitante",
          "classe",
          "valor_estimado",
          "valor_contratado",
          "valor_executado",
          "saldo_orcamentario",
          "modalidade",
          "etapa_processo",
          "sobrestado",
          "data_prevista_contratacao",
          "tipo_contratacao",
          "grau_prioridade",
          "parent_id",
          "parent:parent_id(codigo)"
        ].join(","), { count: "exact" })
        .neq("srp", true);

      if (filtros.setor_requisitante) query = query.eq("setor_requisitante", filtros.setor_requisitante);
      if (filtros.tipo_contratacao) query = query.eq("tipo_contratacao", filtros.tipo_contratacao);
      if (filtros.etapa_processo) {
        const cat = statusCategoryMap[filtros.etapa_processo];
        if (cat && cat.etapas.length > 0) {
          query = query.in("etapa_processo", cat.etapas);
        } else if (!cat) {
          query = query.eq("etapa_processo", filtros.etapa_processo);
        }
      }

      // Adiciona ordenação
      query = query.order(sortField, { ascending: sortOrder === "asc" });

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await query.range(from, to);
      if (!error && data) {
        setRows(data as unknown as Row[]);
        setTotalCount(count || 0);
        
        let kpiQuery = supabase
          .from("contratacoes")
          .select("valor_estimado, valor_contratado, valor_executado, etapa_processo, sobrestado")
          .neq("srp", true);
        
        if (filtros.setor_requisitante) kpiQuery = kpiQuery.eq("setor_requisitante", filtros.setor_requisitante);
        if (filtros.tipo_contratacao) kpiQuery = kpiQuery.eq("tipo_contratacao", filtros.tipo_contratacao);
        if (filtros.etapa_processo) {
          const cat = statusCategoryMap[filtros.etapa_processo];
          if (cat) {
            if (cat.sobrestado) {
              kpiQuery = kpiQuery.eq("sobrestado", true);
            } else if (cat.etapas.length > 0) {
              kpiQuery = kpiQuery.in("etapa_processo", cat.etapas);
            }
          } else {
            kpiQuery = kpiQuery.eq("etapa_processo", filtros.etapa_processo);
          }
        }
        
        const { data: allData } = await kpiQuery;
        if (allData) {
          const resumo = {
            total_demandas: allData.filter((r) => r.sobrestado !== true).length,
            valor_estimado: allData
              .filter((r) => r.sobrestado !== true)
              .reduce((sum, r) => sum + (r.valor_estimado || 0), 0),
            valor_contratado: allData
              .filter((r) => r.sobrestado !== true)
              .reduce((sum, r) => sum + calcExecutado(r as unknown as Row), 0),
            saldo_orcamentario: allData
              .filter((r) => r.sobrestado !== true)
              .reduce((sum, r) => sum + ((r.valor_estimado || 0) - calcExecutado(r as unknown as Row)), 0),
            count_planejamento: allData.filter(r => r.sobrestado !== true && (r.etapa_processo === "Planejamento" || !r.etapa_processo)).length,
            count_em_andamento: allData.filter(r => r.sobrestado !== true && ["Em Licitação", "Contratado"].includes(r.etapa_processo || "")).length,
            count_concluidos: allData.filter(r => r.sobrestado !== true && r.etapa_processo === "Concluído").length,
            count_sobrestados: allData.filter(r => r.sobrestado === true).length,
          };
          setKpiResumo(resumo);
        }
      }

      setLoading(false);
    };
    fetchData();
  }, [page, pageSize, filtros, sortField, sortOrder]);

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
            <Button variant="outline" onClick={() => { setSetor(undefined); setTipoContratacao(undefined); setStatus(undefined); setSortField("created_at"); setSortOrder("desc"); setPage(1); }}>Limpar filtros</Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-2">
            <div className="flex items-start gap-2 overflow-x-auto whitespace-nowrap">
              <div className="shrink-0">
                <div className="text-[11px] text-muted-foreground px-0.5">Setor:</div>
                <div className="flex flex-nowrap gap-0.5 overflow-x-auto whitespace-nowrap py-0.5">
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
              <div className="shrink-0 ml-24">
                <div className="text-[11px] text-muted-foreground px-0.5">Tipo de Contratação:</div>
                <div className="flex flex-nowrap gap-0.5 overflow-x-auto whitespace-nowrap py-0.5">
                  {["Nova Contratação", "Renovação", "Aditivo Quantitativo", "Repactuação", "Apostilamento", "Indeterminado"].map((t) => (
                    <Button
                      key={t}
                      variant={tipoContratacao === t ? "default" : "secondary"}
                      size="xs"
                      onClick={() => { setTipoContratacao(tipoContratacao === t ? undefined : t); setPage(1); }}
                    >
                      {t}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="shrink-0 ml-24">
                <div className="text-[11px] text-muted-foreground px-0.5">Status:</div>
                <div className="flex flex-nowrap gap-0.5 overflow-x-auto whitespace-nowrap py-0.5">
                  {["não iniciado", "em andamento", "concluído"].map((st) => (
                    <Button
                      key={st}
                      variant={status === st ? "default" : "secondary"}
                      size="xs"
                      onClick={() => { setStatus(status === st ? undefined : st); setPage(1); }}
                    >
                      {st}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <KPICard 
            title="Quantidade de Demandas" 
            value={kpiResumo?.total_demandas || rows.filter(r => r.sobrestado !== true).length} 
            icon={ClipboardList} 
          />

          <KPICard 
            title="Valor Estimado" 
            value={formatCurrencyBRL(kpiResumo?.valor_estimado || rows.filter(r => r.sobrestado !== true).reduce((s, r) => s + (r.valor_estimado || 0), 0))} 
            icon={DollarSign} 
          />

          {(() => {
            const executado = kpiResumo?.valor_contratado || rows.filter(r => r.sobrestado !== true).reduce((s, r) => s + calcExecutado(r), 0);
            const estimado  = kpiResumo?.valor_estimado  || rows.filter(r => r.sobrestado !== true).reduce((s, r) => s + (r.valor_estimado || 0), 0);
            const pct = estimado > 0 ? Math.min((executado / estimado) * 100, 100) : 0;
            const variant = pct >= 80 ? "success" : pct >= 40 ? "info" : "default";
            return (
              <KPICard
                title="Valor Executado"
                value={formatCurrencyBRL(executado)}
                icon={DollarSign}
                variant={variant}
                progress={pct}
                description={`${pct.toFixed(1)}% do valor estimado já foi executado.`}
              />
            );
          })()}

          {(() => {
            const kpiSaldo = kpiResumo?.saldo_orcamentario;
            const fallbackSaldo = rows.filter(r => r.sobrestado !== true).reduce((s, r) => s + calcSaldo(r), 0);
            const saldo = (kpiSaldo !== undefined && kpiSaldo !== null && kpiSaldo !== 0)
              ? kpiSaldo
              : fallbackSaldo;
            const estimado = kpiResumo?.valor_estimado || rows.filter(r => r.sobrestado !== true).reduce((s, r) => s + (r.valor_estimado || 0), 0);
            const pct = estimado > 0 ? Math.max(0, Math.min((saldo / estimado) * 100, 100)) : 0;
            const variant = saldo < 0 ? "danger" : pct <= 20 ? "warning" : "success";
            return (
              <KPICard
                title="Saldo Orçamentário"
                value={formatCurrencyBRL(saldo)}
                icon={DollarSign}
                variant={variant}
                progress={pct}
                description={`${pct.toFixed(1)}% do valor estimado ainda disponível.`}
              />
            );
          })()}
        </div>

        <Tabs defaultValue="ativas" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="ativas">Demandas Ativas</TabsTrigger>
            <TabsTrigger value="suspensas">Demandas Suspensas</TabsTrigger>
          </TabsList>

          <TabsContent value="ativas" className="space-y-4">
            {/* Legenda dos status */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground px-1">
          <span className="font-medium text-foreground">Status:</span>
          {[
            { dot: "bg-slate-400", label: "Não Iniciado" },
            { dot: "bg-blue-400", label: "Iniciado" },
            { dot: "bg-yellow-500", label: "Retornado" },
            { dot: "bg-indigo-500", label: "Em Andamento" },
            { dot: "bg-emerald-500", label: "Concluído" },
          ].map(({ dot, label }) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
              {label}
            </span>
          ))}
          <span className="ml-4 font-medium text-foreground">Prazo:</span>
          {[
            { cls: "bg-emerald-100 text-emerald-700 border border-emerald-300", label: "No Prazo" },
            { cls: "bg-amber-100 text-amber-700 border border-amber-300", label: "Atenção (≤30d)" },
            { cls: "bg-red-100 text-red-700 border border-red-300", label: "Atrasado" },
          ].map(({ cls, label }) => (
            <span key={label} className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${cls}`}>
              {label}
            </span>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Demandas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary hover:bg-primary/90">
                    <TableHead 
                      className="text-center text-primary-foreground font-semibold w-[80px] cursor-pointer select-none"
                      onClick={() => handleSort("codigo")}
                    >
                      Cod. PCA <SortIcon field="codigo" />
                    </TableHead>
                    <TableHead 
                      className="text-center text-primary-foreground font-semibold w-[320px] max-w-[320px] cursor-pointer select-none"
                      onClick={() => handleSort("descricao")}
                    >
                      Tipo de Material/Serviço <SortIcon field="descricao" />
                    </TableHead>
                    <TableHead 
                      className="text-center text-primary-foreground font-semibold w-[120px] cursor-pointer select-none"
                      onClick={() => handleSort("valor_estimado")}
                    >
                      Valor Estimado <SortIcon field="valor_estimado" />
                    </TableHead>
                    <TableHead className="text-center text-primary-foreground font-semibold w-[120px]">Valor Executado</TableHead>
                    <TableHead className="text-center text-primary-foreground font-semibold w-[120px]">Saldo Orçamentário</TableHead>
                    <TableHead 
                      className="text-center text-primary-foreground font-semibold w-[120px] cursor-pointer select-none"
                      onClick={() => handleSort("etapa_processo")}
                    >
                      Status <SortIcon field="etapa_processo" />
                    </TableHead>
                    <TableHead 
                      className="text-center text-primary-foreground font-semibold w-[100px] cursor-pointer select-none"
                      onClick={() => handleSort("data_prevista_contratacao")}
                    >
                      Prazo <SortIcon field="data_prevista_contratacao" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.filter(r => r.sobrestado !== true).map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-sm text-muted-foreground text-center">{formatId(r.id, r.codigo)}</TableCell>
                      <TableCell className="w-[320px] max-w-[320px] truncate" title={r.descricao ?? ""}>{r.descricao}</TableCell>
                      <TableCell className="text-right">{formatCurrencyBRL(r.valor_estimado)}</TableCell>
                      <TableCell className="text-right">{formatCurrencyBRL(calcExecutado(r))}</TableCell>
                      <TableCell className={`text-right ${calcSaldo(r) < 0 ? "text-destructive font-medium" : ""}`}>
                        {formatCurrencyBRL(calcSaldo(r))}
                      </TableCell>
                      <TableCell className="text-center align-middle">
                        <StatusCell row={r} />
                      </TableCell>
                      <TableCell className="text-center align-middle">
                        <DeadlineCell row={r} />
                      </TableCell>
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
        </TabsContent>

        <TabsContent value="suspensas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Demandas Suspensas (Estacionadas)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary hover:bg-primary/90">
                      <TableHead className="text-center text-primary-foreground font-semibold w-[80px]">Cod. PCA</TableHead>
                      <TableHead className="text-center text-primary-foreground font-semibold w-[320px] max-w-[320px]">Tipo de Material/Serviço</TableHead>
                      <TableHead className="text-center text-primary-foreground font-semibold w-[120px]">Valor Retido</TableHead>
                      <TableHead className="text-center text-primary-foreground font-semibold w-[150px]">Origem (Demanda Pai)</TableHead>
                      <TableHead className="text-center text-primary-foreground font-semibold w-[120px]">Status Original</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.filter(r => r.sobrestado === true).map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="text-sm text-muted-foreground text-center line-through opacity-70">
                          {formatId(r.id, r.codigo)}
                        </TableCell>
                        <TableCell className="w-[320px] max-w-[320px] truncate" title={r.descricao ?? ""}>{r.descricao}</TableCell>
                        <TableCell className="text-right text-orange-600 font-medium">{formatCurrencyBRL(r.valor_estimado)}</TableCell>
                        <TableCell className="text-center">
                          {r.parent_id ? (
                            <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2 py-1 rounded">
                              Origem: {r.parent?.codigo ? formatId(r.parent_id, r.parent.codigo) : r.parent_id.slice(-4).toUpperCase()}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">Suspensão Total</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center align-middle">
                          <span className="text-[10px] font-semibold bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                            {r.etapa_processo}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                    {rows.filter(r => r.sobrestado === true).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          Nenhuma demanda suspensa ou sobrestada pelos filtros atuais.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SetoresDemandantes;