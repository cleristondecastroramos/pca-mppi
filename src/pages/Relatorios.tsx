import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { translateError } from "@/lib/utils/error-translations";
import { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon, FileText, BarChart3, ClipboardList, BadgeCheck, DollarSign, FileSearch, CalendarDays, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const Relatorios = () => {
  const [status, setStatus] = useState<string>("todos");
  const [setor, setSetor] = useState<string>("todos");
  const [range, setRange] = useState<DateRange | undefined>({ from: undefined, to: undefined });
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [fetching, setFetching] = useState<boolean>(true);
  const [reportType, setReportType] = useState<string>("detalhado");
  const [filtros, setFiltros] = useState<any>({
    unidade_orcamentaria: "__all__",
    setor_requisitante: "__all__",
    tipo_contratacao: "__all__",
    tipo_recurso: "__all__",
    classe: "__all__",
    grau_prioridade: "__all__",
    normativo: "__all__",
    modalidade: "__all__",
    etapa_processo: "__all__",
    srp: "__all__",
  });

  const formatId = (id: any, codigo?: any) => {
    if (!codigo) return String(id).slice(-4);
    return String(codigo).replace(/^PCA-/, "").replace(/-2026$/, "");
  };
  const selectBase =
    "id, codigo, descricao, unidade_orcamentaria, setor_requisitante, tipo_contratacao, tipo_recurso, classe, grau_prioridade, normativo, modalidade, srp, numero_sei_contratacao, etapa_processo, sobrestado, created_at, data_finalizacao_licitacao, valor_estimado, valor_contratado, data_prevista_contratacao";
  const selectWithExecutado = `${selectBase}, valor_executado`;
  const fetchAllContratacoes = async () => {
    const q1 = await supabase.from("contratacoes").select(selectWithExecutado);
    if (q1.error) {
      const q2 = await supabase.from("contratacoes").select(selectBase);
      if (q2.error) throw q2.error;
      return q2.data || [];
    }
    return q1.data || [];
  };
  const normalizeNormativoRecords = async () => {
    try {
      const upd14 = await supabase
        .from("contratacoes")
        .update({ normativo: "14.133/2021" })
        .or(
          [
            "normativo.ilike.%14.133%",
            "normativo.ilike.%14133%",
            "normativo.ilike.%Lei 14.133%",
            "normativo.ilike.%14 133%",
            "normativo.ilike.%14133/2021%",
          ].join(","),
        )
        .select("id");
      const upd8666 = await supabase
        .from("contratacoes")
        .update({ normativo: "8.666/1993" })
        .or(
          [
            "normativo.ilike.%8.666%",
            "normativo.ilike.%8666%",
            "normativo.ilike.%Lei 8.666%",
            "normativo.ilike.%8 666%",
            "normativo.ilike.%1993%",
          ].join(","),
        )
        .select("id");
      const c1 = Array.isArray(upd14.data) ? upd14.data.length : 0;
      const c2 = Array.isArray(upd8666.data) ? upd8666.data.length : 0;
      if (c1 + c2 > 0) toast.success("Normativo normalizado", { description: `Atualizados ${c1 + c2} registros.` });
    } catch (e: any) {
      toast.error("Falha ao normalizar normativo", { description: translateError(e.message || String(e)) });
    }
  };

  const distinctOptions = useMemo(() => {
    const pick = (key: string) => {
      const s = new Set<string>();
      rows.forEach((r) => {
        const v = r[key];
        if (v !== null && v !== undefined && String(v).trim() !== "") s.add(String(v));
      });
      return Array.from(s).sort((a, b) => a.localeCompare(b, "pt-BR"));
    };
    const PRIORITY_UO = ["PGJ", "FMMP", "FEPDC"];
    const rawUO = pick("unidade_orcamentaria");
    const uo = [
      ...PRIORITY_UO.filter((x) => rawUO.includes(x)),
      ...rawUO.filter((x) => !PRIORITY_UO.includes(x)).sort((a, b) => a.localeCompare(b, "pt-BR")),
    ];
    const prioridadeOrder = ["Alta", "Média", "Baixa"];
    const grau = Array.from(new Set(pick("grau_prioridade"))).sort((a, b) => prioridadeOrder.indexOf(a) - prioridadeOrder.indexOf(b));
    return {
      unidade_orcamentaria: uo,
      setor_requisitante: pick("setor_requisitante"),
      tipo_contratacao: pick("tipo_contratacao"),
      tipo_recurso: pick("tipo_recurso"),
      classe: pick("classe"),
      grau_prioridade: grau,
      normativo: pick("normativo"),
      modalidade: pick("modalidade"),
    };
  }, [rows]);

  const mapSetorName = (setor: string) => {
    if (setor === "PLANEJAMENTO") return "PLAN";
    return setor;
  };

  const statusLabel = (r: any) => {
    if (r.sobrestado === true) return "sobrestado";
    if (r.etapa_processo === "Concluído") return "concluído";
    if (r.etapa_processo === "Em Licitação" || r.etapa_processo === "Contratado") return "em andamento";
    return "não iniciado";
  };

  const applyFilters = (list: any[]) => {
    return list.filter((r) => {
      if (filtros.unidade_orcamentaria !== "__all__" && r.unidade_orcamentaria !== filtros.unidade_orcamentaria) return false;
      if (filtros.setor_requisitante !== "__all__" && r.setor_requisitante !== filtros.setor_requisitante) return false;
      if (filtros.tipo_contratacao !== "__all__" && r.tipo_contratacao !== filtros.tipo_contratacao) return false;
      if (filtros.tipo_recurso !== "__all__" && r.tipo_recurso !== filtros.tipo_recurso) return false;
      if (filtros.classe !== "__all__" && r.classe !== filtros.classe) return false;
      if (filtros.grau_prioridade !== "__all__" && r.grau_prioridade !== filtros.grau_prioridade) return false;
      if (filtros.normativo !== "__all__" && r.normativo !== filtros.normativo) return false;
      if (filtros.modalidade !== "__all__" && r.modalidade !== filtros.modalidade) return false;
      if (filtros.etapa_processo !== "__all__") {
        const s = statusLabel(r);
        if (s !== filtros.etapa_processo) return false;
      }
      if (filtros.srp !== "__all__") {
        const isSrp = r.srp === true || r.srp === "true" || r.srp === "Sim";
        if ((isSrp ? "Sim" : "Não") !== filtros.srp) return false;
      }
      return true;
    });
  };
  const clearFiltros = () =>
    setFiltros({
      unidade_orcamentaria: "__all__",
      setor_requisitante: "__all__",
      tipo_contratacao: "__all__",
      tipo_recurso: "__all__",
      classe: "__all__",
      grau_prioridade: "__all__",
      normativo: "__all__",
      modalidade: "__all__",
      etapa_processo: "__all__",
      srp: "__all__",
    });

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

  const calculateConformity = (data: Record<string, any>) => {
    const total: number = CHECKLIST_ITEMS.length;
    if (total === 0) return 0;
    let checked = 0;
    CHECKLIST_ITEMS.forEach((item) => {
      if (data[item.key]) checked++;
    });
    return Math.round((checked / total) * 100);
  };

  const getPrazoStatus = (contratacao: any) => {
    const dataPrevistaStr = contratacao.data_prevista_contratacao;
    if (!dataPrevistaStr) return { label: "Sem data prevista", variant: "secondary" };

    const [y, m, d] = dataPrevistaStr.split("-").map(Number);
    const dataPrevista = new Date(y, (m || 1) - 1, d || 1);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const diffTime = dataPrevista.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const isConcluido = contratacao.etapa_processo === "Concluído" || contratacao.etapa_processo === "Contratado";
    const isNaoIniciado = !isConcluido && contratacao.etapa_processo !== "Em Licitação";

    if (diffDays < 0 && !isConcluido) {
      return {
        label: `Atrasado (${Math.abs(diffDays)}d)`,
        variant: "destructive"
      };
    }

    if (diffDays >= 0 && diffDays <= 120 && isNaoIniciado) {
      return {
        label: "Atenção (Prazo Curto)",
        variant: "warning"
      };
    }

    if (isConcluido) {
      return {
        label: "Concluído",
        variant: "success"
      };
    }

    return {
      label: "No Prazo",
      variant: "outline"
    };
  };

  const REPORT_TYPES: Record<
    string,
    {
      label: string;
      description: string;
      icon: any;
      columns: string[];
      csvColumns: string[];
      mapRow: (r: any) => (string | number)[];
      title: (count: number) => string;
    }
  > = {
    pca_2_0: {
      label: "Documento — PCA 2026 (Versão 2.0)",
      description: "Versão oficial, moderna e profissional do Plano de Contratações Anual do MPPI.",
      icon: FileText,
      columns: ["Cod. PCA", "Descrição", "Setor Demandante", "UO", "Tipo de Contratação", "Grau de Prioridade", "Valor Planejado"],
      csvColumns: ["Cod. PCA", "Descrição", "Setor Demandante", "UO", "Tipo de Contratação", "Grau de Prioridade", "Valor Planejado"],
      mapRow: (r) => [
        formatId(r.id, r.codigo),
        r.descricao || "",
        r.setor_requisitante || "",
        r.unidade_orcamentaria || "",
        r.tipo_contratacao || "",
        r.grau_prioridade || "",
        r.valor_estimado || 0,
      ],
      title: (n) => `Plano de Contratações Anual — PCA 2026 (Lista de ${n} Itens)`,
    },
    detalhado: {
      label: "Contratações — Detalhado",
      description: "Listagem completa com Cod. PCA, descrição, setor, prioridade e valores (estimado e executado).",
      icon: FileText,
      columns: ["Cod. PCA", "Descrição", "Setor", "Prioridade", "Valor Estimado", "Valor Executado", "Data Prevista"],
      csvColumns: ["Cod. PCA", "Descrição", "Setor", "Prioridade", "Valor Estimado", "Valor Executado", "Data Prevista"],
      mapRow: (r) => [
        formatId(r.id, r.codigo),
        String(r.descricao || ""),
        r.setor_requisitante || "",
        r.grau_prioridade || "",
        r.valor_estimado || 0,
        (r as any).valor_executado ?? r.valor_contratado ?? 0,
        r.data_prevista_contratacao || "",
      ],
      title: (n) => `Relatório Detalhado de Contratações (${n} registros)`,
    },
    por_status: {
      label: "Contratações — Por Status",
      description: "Listagem focada no status e andamento das contratações.",
      icon: BarChart3,
      columns: ["Cod. PCA", "Descrição", "Setor", "Status", "Situação"],
      csvColumns: ["Cod. PCA", "Descrição", "Setor", "Status", "Situação"],
      mapRow: (r) => {
        const status = getPrazoStatus(r);
        return [
          formatId(r.id, r.codigo),
          String(r.descricao || ""),
          String(r.setor_requisitante || ""),
          statusLabel(r),
          status.label,
        ];
      },
      title: (n) => `Relatório por Status (${n} registros)`,
    },
    por_setor: {
      label: "Contratações — Por Setor",
      description: "Listagem agrupável por setor requisitante.",
      icon: ClipboardList,
      columns: ["Cod. PCA", "Descrição", "Setor", "Status", "Valor Estimado", "Valor Executado"],
      csvColumns: ["Cod. PCA", "Descrição", "Setor", "Status", "Valor Estimado", "Valor Executado"],
      mapRow: (r) => [
        formatId(r.id, r.codigo),
        String(r.descricao || ""),
        r.setor_requisitante || "",
        r.sobrestado === true
          ? "sobrestado"
          : r.etapa_processo === "Concluído"
            ? "concluído"
            : r.etapa_processo === "Em Licitação" || r.etapa_processo === "Contratado"
              ? "em andamento"
              : "não iniciado",
        r.valor_estimado || 0,
        (r as any).valor_executado ?? r.valor_contratado ?? 0,
      ],
      title: (n) => `Relatório por Setor (${n} registros)`,
    },
    prioridades: {
      label: "Demandas — Por Prioridade",
      description: "Visão por grau de prioridade (Alta, Média, Baixa).",
      icon: BadgeCheck,
      columns: ["Cod. PCA", "Descrição", "Prioridade", "Setor", "Status", "Valor Estimado"],
      csvColumns: ["Cod. PCA", "Descrição", "Prioridade", "Setor", "Status", "Valor Estimado"],
      mapRow: (r) => [
        formatId(r.id, r.codigo),
        String(r.descricao || ""),
        r.grau_prioridade || "",
        r.setor_requisitante || "",
        r.sobrestado === true
          ? "sobrestado"
          : r.etapa_processo === "Concluído"
            ? "concluído"
            : r.etapa_processo === "Em Licitação" || r.etapa_processo === "Contratado"
              ? "em andamento"
              : "não iniciado",
        r.valor_estimado || 0,
      ],
      title: (n) => `Relatório por Prioridade (${n} registros)`,
    },
    valores: {
      label: "Financeiro — Estimado vs Contratado",
      description: "Comparativo financeiro entre valores estimados e contratados.",
      icon: DollarSign,
      columns: ["Cod. PCA", "Descrição", "Valor Estimado", "Valor Contratado", "Valor Executado"],
      csvColumns: ["Cod. PCA", "Descrição", "Valor Estimado", "Valor Contratado", "Valor Executado"],
      mapRow: (r) => [
        formatId(r.id, r.codigo),
        String(r.descricao || ""),
        r.valor_estimado || 0,
        r.valor_contratado || 0,
        (r as any).valor_executado ?? r.valor_contratado ?? 0,
      ],
      title: (n) => `Relatório Financeiro (${n} registros)`,
    },
    sei: {
      label: "SEI — Processos por Contratação",
      description: "Relação de contratações com seus números de SEI para consulta.",
      icon: FileSearch,
      columns: ["Cod. PCA", "Descrição", "SEI", "Status"],
      csvColumns: ["Cod. PCA", "Descrição", "SEI", "Status"],
      mapRow: (r) => [
        formatId(r.id, r.codigo),
        String(r.descricao || ""),
        r.numero_sei_contratacao || "",
        r.sobrestado === true
          ? "sobrestado"
          : r.etapa_processo === "Concluído"
            ? "concluído"
            : r.etapa_processo === "Em Licitação" || r.etapa_processo === "Contratado"
              ? "em andamento"
              : "não iniciado",
      ],
      title: (n) => `Relatório SEI (${n} registros)`,
    },
    auditoria: {
      label: "Auditoria — Conformidade",
      description: "Relatório de conformidade com itens de checklist de auditoria.",
      icon: BadgeCheck,
      columns: ["Cod. PCA", "Descrição", "Setor", "Conformidade", "Status"],
      csvColumns: ["Cod. PCA", "Descrição", "Setor", "Conformidade", "Status"],
      mapRow: (r) => [
        formatId(r.id, r.codigo),
        String(r.descricao || ""),
        r.setor_requisitante || "",
        `${(r as any).conformidade || 0}%`,
        r.sobrestado === true ? "sobrestado" : r.etapa_processo,
      ],
      title: (n) => `Relatório de Auditoria (${n} registros)`,
    },
    prazos_criticos: {
      label: "Prazos — Críticos e Alertas",
      description: "Relatório focado em processos atrasados ou com prazo curto.",
      icon: AlertCircle,
      columns: ["Cod. PCA", "Descrição", "Setor", "Data Prevista", "Situação"],
      csvColumns: ["Cod. PCA", "Descrição", "Setor", "Data Prevista", "Situação"],
      mapRow: (r) => {
        const status = getPrazoStatus(r);
        return [
          formatId(r.id, r.codigo),
          String(r.descricao || ""),
          r.setor_requisitante || "",
          r.data_prevista_contratacao ? (() => {
            const [y, m, d] = r.data_prevista_contratacao.split("-").map(Number);
            return new Date(y, m - 1, d).toLocaleDateString("pt-BR");
          })() : "—",
          status.label
        ];
      },
      title: (n) => `Relatório de Prazos Críticos (${n} registros)`,
    },
  };

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setFetching(true);
      try {
        const data = await fetchAllContratacoes();
        if (mounted) setRows(data || []);
      } catch (e: any) {
        toast.error("Erro ao carregar dados", { description: translateError(e.message || String(e)) });
      } finally {
        if (mounted) setFetching(false);
      }
    };
    fetchData();
    const { data: sub } = supabase.auth.onAuthStateChange(() => fetchData());
    normalizeNormativoRecords();
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // removido filtro legacy; filtros atuais aplicados por applyFilters

  async function handleGenerate(tipo: "pdf" | "csv", keyOverride?: string) {
    const rType = keyOverride || reportType;
    // Removido setReportType para evitar re-renderizações desnecessárias durante a geração

    let pdfWindow: Window | null = null;
    if (tipo === "pdf") {
      // Usamos _blank para garantir sempre uma nova aba
      pdfWindow = window.open("", "_blank");
      if (pdfWindow) {
        pdfWindow.document.write(`
          <html>
            <head>
              <title>Gerando Relatório...</title>
              <style>
                body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f9fafb; color: #111; }
                .loading { text-align: center; }
                .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 20px; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
              </style>
            </head>
            <body>
              <div class="loading">
                <div class="spinner"></div>
                <h2>Gerando Relatório...</h2>
                <p>Por favor aguarde enquanto os dados são processados.</p>
              </div>
            </body>
          </html>
        `);
      } else {
        toast.error("Pop-up bloqueado", { description: "Permita pop-ups para visualizar o relatório." });
        return;
      }
    }

    setLoading(true);
    toast.message("Gerando relatório...", { description: `Preparando ${tipo.toUpperCase()}...` });
    try {

      const def = REPORT_TYPES[rType];
      let sourceRows = applyFilters(rows.length ? rows : await fetchAllContratacoes());

      if (rType === 'auditoria') {
        const ids = sourceRows.map(r => r.id);
        if (ids.length) {
          // Batch requests to avoid URL length limits
          const batchSize = 50;
          const promises = [];
          for (let i = 0; i < ids.length; i += batchSize) {
            const batch = ids.slice(i, i + batchSize);
            promises.push(supabase.from("contratacoes_conformidade").select("*").in("contratacao_id", batch));
          }

          const results = await Promise.all(promises);
          const confAll: any[] = [];
          for (const res of results) {
            if (res.error) throw res.error;
            if (res.data) confAll.push(...res.data);
          }

          const map: Record<string, number> = {};
          confAll.forEach((c: any) => {
            map[c.contratacao_id] = calculateConformity(c);
          });

          sourceRows = sourceRows.map(r => ({
            ...r,
            conformidade: map[r.id] || 0
          }));
        }
      } else if (rType === 'prazos_criticos') {
        sourceRows = sourceRows.filter(r => {
          const status = getPrazoStatus(r);
          return status.variant === 'destructive' || status.variant === 'warning';
        });
        sourceRows.sort((a, b) => {
          const sa = getPrazoStatus(a);
          const sb = getPrazoStatus(b);
          if (sa.variant === sb.variant) return 0;
          if (sa.variant === 'destructive') return -1;
          return 1;
        });
      }

      if (tipo === "csv") {
        const header = def.csvColumns.join(",");
        const lines = sourceRows.map((r) => {
          const data = def.mapRow(r).map((v) => {
            if (typeof v === "string") return `"${String(v).replace(/\"/g, '""')}"`;
            return String(v);
          });
          return data.join(",");
        });
        const csv = [header, ...lines].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `relatorio_${rType}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (rType === "pca_2_0") {
        const logo = `${location.origin}/logo-mppi.png`;
        const mapaEstrategico = `${location.origin}/Mapa-Estrategico.jpg`;
        const today = new Date().toLocaleDateString('pt-BR');

        // Calcular métricas para o documento
        const totalDemandas = sourceRows.length;
        const totalEstimado = sourceRows.reduce((sum, r) => sum + (Number(r.valor_estimado) || 0), 0);
        const formatCurrency = (v: any) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v) || 0);

        // -- Cálculos para as tabelas da seção 4 --

        // Função auxiliar para normalizar nomes de setores
        const normalizeSector = (s: string) => {
          if (s === "PLANEJAMENTO") return "PLAN";
          return s;
        };

        // TABELA 01 e TABELA 3 & 4: Agrupamento por Setor e UO
        const sectorData: Record<string, {
          totalQty: number;
          newQty: number;
          newVal: number;
          renQty: number;
          renVal: number;
          uoVals: Record<string, number>;
          uoRenVals: Record<string, number>;
        }> = {};

        sourceRows.forEach(r => {
          const s = normalizeSector(r.setor_requisitante || "Outros");
          const uo = r.unidade_orcamentaria || "Outros";
          const isNew = r.tipo_contratacao === "Nova Contratação";
          const val = r.valor_estimado || 0;

          if (!sectorData[s]) {
            sectorData[s] = { totalQty: 0, newQty: 0, newVal: 0, renQty: 0, renVal: 0, uoVals: {}, uoRenVals: {} };
          }

          sectorData[s].totalQty++;
          if (isNew) {
            sectorData[s].newQty++;
            sectorData[s].newVal += val;
          } else {
            sectorData[s].renQty++;
            sectorData[s].renVal += val;
          }

          sectorData[s].uoVals[uo] = (sectorData[s].uoVals[uo] || 0) + val;
          if (!isNew) {
            sectorData[s].uoRenVals[uo] = (sectorData[s].uoRenVals[uo] || 0) + val;
          }
        });

        // TABELA 2: Por Tipo de Recurso
        const resourceMap: Record<string, number> = { "Investimento": 0, "Recorrente/Custeio": 0 };
        sourceRows.forEach(r => {
          const type = (r.tipo_recurso === "Investimento") ? "Investimento" : "Recorrente/Custeio";
          resourceMap[type] += (r.valor_estimado || 0);
        });

        // Totais por UO (para rodapé das tabelas 3 e 4)
        const uoTotalsMap: Record<string, number> = {};
        const uoRenTotalsMap: Record<string, number> = {};
        sourceRows.forEach(r => {
          const uo = r.unidade_orcamentaria || "Outros";
          uoTotalsMap[uo] = (uoTotalsMap[uo] || 0) + (r.valor_estimado || 0);
          if (r.tipo_contratacao !== "Nova Contratação") {
            uoRenTotalsMap[uo] = (uoRenTotalsMap[uo] || 0) + (r.valor_estimado || 0);
          }
        });

        // Gerar HTML das tabelas calculadas
        const sortedSectors = Object.keys(sectorData).sort((a, b) => sectorData[b].newVal + sectorData[b].renVal - (sectorData[a].newVal + sectorData[a].renVal));

        const table01Html = sortedSectors.map(s => {
          const d = sectorData[s];
          const totalVal = d.newVal + d.renVal;
          return `
            <tr>
              <td>${s}</td>
              <td class="text-center">${d.totalQty}</td>
              <td class="text-center">${d.newQty}</td>
              <td class="text-right">${formatCurrency(d.newVal)}</td>
              <td class="text-center">${d.renQty}</td>
              <td class="text-right">${formatCurrency(d.renVal)}</td>
              <td class="text-right">${formatCurrency(totalVal)}</td>
              <td class="text-center">${((totalVal / (totalEstimado || 1)) * 100).toFixed(2)}%</td>
            </tr>`;
        }).join("");

        const pgjVal = uoTotalsMap["PGJ"] || 0;
        const fmmpVal = uoTotalsMap["FMMP"] || 0;
        const fepdcVal = uoTotalsMap["FEPDC"] || 0;
        const otherVal = Math.max(0, totalEstimado - (pgjVal + fmmpVal + fepdcVal));

        const pPGJ = totalEstimado > 0 ? (pgjVal / totalEstimado) * 100 : 0;
        const pFMMP = totalEstimado > 0 ? (fmmpVal / totalEstimado) * 100 : 0;
        const pFEPDC = totalEstimado > 0 ? (fepdcVal / totalEstimado) * 100 : 0;
        const pOther = totalEstimado > 0 ? (otherVal / totalEstimado) * 100 : 0;

        const table02Html = Object.entries(resourceMap).map(([type, val]) => `
          <tr>
            <td>${type}</td>
            <td class="text-right">${formatCurrency(val)}</td>
            <td class="text-center">${((val / (totalEstimado || 1)) * 100).toFixed(0)}%</td>
          </tr>
        `).join("");

        const distinctUOs = ["PGJ", "FMMP", "FEPDC"];

        const table03Html = sortedSectors.map(s => {
          const d = sectorData[s];
          return `
            <tr>
              <td>${s}</td>
              ${distinctUOs.map(uo => `<td class="text-right">${formatCurrency(d.uoVals[uo] || 0)}</td>`).join("")}
            </tr>`;
        }).join("");

        const table04Html = sortedSectors.filter(s => sectorData[s].renQty > 0).map(s => {
          const d = sectorData[s];
          return `
            <tr>
              <td>${s}</td>
              ${distinctUOs.map(uo => `<td class="text-right">${formatCurrency(d.uoRenVals[uo] || 0)}</td>`).join("")}
            </tr>`;
        }).join("");

        const rowsHtml = sourceRows.map(r => {
          const data = def.mapRow(r);
          return `
            <tr>
              <td class="text-center" style="width: 12%;">${data[0]}</td>
              <td class="text-left" style="width: 35%;">${data[1]}</td>
              <td class="text-left" style="width: 15%;">${data[2]}</td>
              <td class="text-center" style="width: 10%;">${data[3]}</td>
              <td class="text-center" style="width: 10%;">${data[4]}</td>
              <td class="text-center" style="width: 8%;">${data[5]}</td>
              <td class="text-right" style="width: 10%;">${formatCurrency(Number(data[6]))}</td>
            </tr>
          `;
        }).join("");

        const html = `<!doctype html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>PCA 2026 - Versão 2.0 - MPPI</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
              * { box-sizing: border-box; font-family: 'Inter', sans-serif; }
              body { margin: 0; color: #1f2937; background: #fff; line-height: 1.5; text-align: justify; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              
              .cover { position: relative; height: 297mm; display: flex; flex-direction: column; justify-content: flex-start; padding: 10mm 20mm 20mm 35mm; text-align: center; background: white; z-index: 100; overflow: hidden; page: cover; }
              .cover-bar { position: absolute; top: 0; left: 0; bottom: 0; width: 15mm; background: #D9415D !important; z-index: 110; -webkit-print-color-adjust: exact; }
              .logo { margin-top: 10mm; margin-bottom: 30mm; }
              .logo img { height: 80px; }
              .title-box { margin-top: 20mm; }
              .main-title { font-size: 32pt; font-weight: 700; color: #111827; margin: 0; text-transform: uppercase; letter-spacing: 2px; }
              .sub-title { font-size: 18pt; font-weight: 500; color: #D9415D; margin-top: 10mm; }
              .version-badge { display: inline-block; background: #D9415D; color: #fff; padding: 4px 16px; border-radius: 99px; font-size: 14pt; margin-top: 5mm; }
              .footer-cover { font-size: 12pt; color: #6b7280; }
              
              .page-break { page-break-before: always; }
              .main-content { position: relative; z-index: 10; }
              .section { padding: 0 0 10mm; }
              p { text-align: justify; }
              h2 { color: #D9415D; border-bottom: 2px solid #D9415D; padding-bottom: 8px; font-size: 20pt; margin-top: 0; text-align: left; }
              .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 5mm; }
              .summary-card { padding: 12px 20px; border: 1px solid #e5e7eb; border-radius: 12px; background: #f9fafb; text-align: center; }
              .summary-label { font-size: 8pt; color: #6b7280; font-weight: 600; text-transform: uppercase; }
              .summary-value { font-size: 18pt; font-weight: 700; color: #111827; margin-top: 2px; }
              
              .text-left { text-align: left; }
              .text-right { text-align: right; }
              .text-center { text-align: center; }
              
               table { width: 100%; border-collapse: collapse; margin-top: 4mm; font-size: 9pt; }
               th { border: 1px solid #000; padding: 8px; text-align: center; vertical-align: middle; background: #f8fafc; font-weight: 700; }
               td { border: 1px solid #000; padding: 8px; }
               .compact-table th, .compact-table td { padding: 4px 6px; }
              
              .report-table { width: 100%; border-collapse: collapse; table-layout: fixed; margin-top: 0 !important; border: none !important; }
              .report-table > thead > tr > th, 
              .report-table > tbody > tr > td, 
              .report-table > tfoot > tr > td { border: none !important; padding: 0 !important; }
              .report-footer { display: table-footer-group; }
              .footer-spacer { height: 10mm; }
              .footer-content { 
                border-top: 0.5px solid #D9415D; 
                padding-top: 2mm; 
                font-size: 8pt; 
                color: #6b7280; 
                display: flex; 
                justify-content: space-between; 
                width: 100%;
              }
              .page-number::after { content: counter(page); }
              
              @page { size: A4; margin: 20mm 20mm 15mm 20mm; }
              @page cover { size: A4; margin: 0; }
              @page landscape { size: A4 landscape; margin: 20mm 20mm 15mm 20mm; }
              .landscape-section { page: landscape; }
              @media print {
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="cover">
              <div class="cover-bar"></div>
              <div class="logo">
                <img src="${logo}" alt="MPPI Logo">
              </div>
              <div class="title-box">
                <h1 class="main-title">Plano de Contratações Anual</h1>
                <div class="sub-title">Ministério Público do Estado do Piauí</div>
                <div class="version-badge">Exercício 2026 - Versão 2.0</div>
              </div>
            </div> <!-- End cover -->
            
            <table class="report-table">
              <tfoot class="report-footer">
                <tr>
                  <td>
                    <div class="footer-spacer"></div>
                    <div class="footer-content">
                      <span>MPPI - Plano de Contratação Anual 2026 - Versão 2.0</span>
                      <span>Página <span class="page-number"></span></span>
                    </div>
                  </td>
                </tr>
              </tfoot>
              <tbody>
                <tr>
                  <td>
                    <div class="main-content">

            <div class="page-break section">
              <div style="text-align: left; max-width: 140mm; margin: 0 auto; padding-top: 10mm;">
                <h3 style="color: #D9415D; font-size: 14pt; margin-bottom: 8mm; text-transform: uppercase; border-bottom: 2px solid #D9415D; padding-bottom: 4px;">Ficha Técnica</h3>
                
                <div style="margin-bottom: 6mm;">
                  <strong style="display: block; font-size: 10pt; color: #111827; margin-bottom: 2px;">ADMINISTRAÇÃO SUPERIOR DO MPPI</strong>
                  <div style="font-size: 9pt; color: #4b5563;">
                    Cláudia Pessoa Marques da Rocha Seabra – Procuradora-Geral de Justiça<br>
                    Cleandro Alves de Moura - Subprocurador de Justiça Institucional<br>
                    Jorge Luiz da Costa Pessoa - Chefe de Gabinete<br>
                    Plínio Fabrício de Carvalho Fontes - Subprocurador de Justiça Administrativo<br>
                    Denise Costa Aguiar - Assessora de Planejamento e Gestão
                  </div>
                </div>

                <div style="margin-bottom: 6mm;">
                  <strong style="display: block; font-size: 10pt; color: #111827; margin-bottom: 2px;">GOVERNANÇA E GESTÃO DAS CONTRATAÇÕES</strong>
                  <div style="font-size: 9pt; color: #4b5563;">
                    Jorge Luiz da Costa Pessoa - Chefe de Gabinete<br>
                    Denise Costa Aguiar - Assessora de Planejamento e Gestão<br>
                    Afrânio Oliveira da Silva – Coordenador de Licitações e Contratos
                  </div>
                </div>

                <div style="margin-bottom: 6mm;">
                  <strong style="display: block; font-size: 10pt; color: #111827; margin-bottom: 2px;">ASSESSORIA PARA PROGRAMAÇÃO E GESTÃO ORÇAMENTÁRIA</strong>
                  <div style="font-size: 9pt; color: #4b5563;">
                    Clériston de Castro Ramos – Analista de Orçamento<br>
                    Italo Silva Vaz – Analista de Orçamento
                  </div>
                </div>

                <div style="margin-bottom: 6mm;">
                  <strong style="display: block; font-size: 10pt; color: #111827; margin-bottom: 2px;">EXPEDIENTE - CONTEÚDO E REDAÇÃO</strong>
                  <div style="font-size: 9pt; color: #4b5563;">
                    Afrânio Oliveira da Silva<br>
                    Clériston de Castro Ramos<br>
                    Ítalo Silva Vaz<br>
                    Maria Gabrielle da Costa Nascimento
                  </div>
                </div>

                <div style="margin-bottom: 6mm;">
                  <strong style="display: block; font-size: 10pt; color: #111827; margin-bottom: 2px;">PROJETO GRÁFICO - DIAGRAMAÇÃO E IMPRESSÃO</strong>
                  <div style="font-size: 9pt; color: #4b5563;">
                    Afrânio Oliveira da Silva<br>
                    Clériston de Castro Ramos<br>
                    Ítalo Silva Vaz<br>
                    Maria Gabrielle da Costa Nascimento
                  </div>
                </div>
              </div>
            </div>

            <div class="page-break section">
              <h2 style="margin-bottom: 10mm;">Lista de Termos e Siglas</h2>
              <div style="column-count: 1; font-size: 9pt;">
                <table style="margin-top: 0;">
                  <thead>
                    <tr>
                      <th style="width: 25%;">Sigla / Termo</th>
                      <th style="width: 75%;">Significado / Definição</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td><strong>Adjudicação</strong></td><td>Atribuição formal do objeto da licitação ao vencedor.</td></tr>
                    <tr><td><strong>Aditivo</strong></td><td>Instrumento para alteração de valor ou prazo de contratos vigentes.</td></tr>
                    <tr><td><strong>Apostilamento</strong></td><td>Anotação administrativa de ajustes contratuais que não exigem aditivo.</td></tr>
                    <tr><td><strong>ASSESPPLAGES</strong></td><td>Assessoria de Planejamento e Gestão</td></tr>
                    <tr><td><strong>CAA</strong></td><td>Coordenadoria de Apoio Administrativo</td></tr>
                    <tr><td><strong>CATSER</strong></td><td>Catálogo de Serviços</td></tr>
                    <tr><td><strong>CCF</strong></td><td>Coordenadoria de Contabilidade e Finanças</td></tr>
                    <tr><td><strong>CCS</strong></td><td>Coordenadoria de Comunicação Social</td></tr>
                    <tr><td><strong>CEAF</strong></td><td>Centro de Estudos e Aperfeiçoamento Funcional</td></tr>
                    <tr><td><strong>CLC</strong></td><td>Coordenadoria de Licitações e Contratos</td></tr>
                    <tr><td><strong>Código PCA</strong></td><td>Identificador único no formato PCA-XXXX-2026.</td></tr>
                    <tr><td><strong>Conformidade</strong></td><td>Verificação de requisitos documentais e legais.</td></tr>
                    <tr><td><strong>CONINT</strong></td><td>Controladoria Interna</td></tr>
                    <tr><td><strong>Contratação</strong></td><td>Processo formal de aquisição de bens ou serviços pelo MPPI.</td></tr>
                    <tr><td><strong>CPPT</strong></td><td>Coordenadoria de Perícias e Pareceres Técnicos</td></tr>
                    <tr><td><strong>CRH</strong></td><td>Coordenadoria de Recursos Humanos</td></tr>
                    <tr><td><strong>CTI</strong></td><td>Coordenadoria de Tecnologia da Informação</td></tr>
                    <tr><td><strong>Devolução</strong></td><td>Retorno do processo ao setor para correções.</td></tr>
                    <tr><td><strong>DFD</strong></td><td>Documento de Formalização de Demanda que oficializa a necessidade de compra.</td></tr>
                    <tr><td><strong>Dispensa de Licitação</strong></td><td>Contratação direta por baixo valor ou situações específicas em lei.</td></tr>
                    <tr><td><strong>Empenho</strong></td><td>Ato administrativo que reserva recursos orçamentários.</td></tr>
                    <tr><td><strong>Etapa do Processo</strong></td><td>Fase atual (Planejamento, Em Licitação, Contratado, Concluído).</td></tr>
                    <tr><td><strong>ETP</strong></td><td>Estudo Técnico Preliminar que analisa a viabilidade da solução escolhida.</td></tr>
                    <tr><td><strong>FEPDC</strong></td><td>Fundo Estadual de Proteção e Defesa do Consumidor</td></tr>
                    <tr><td><strong>FMMP</strong></td><td>Fundo de Modernização do Ministério Público</td></tr>
                    <tr><td><strong>GAECO</strong></td><td>Grupo de Atuação Especial de Combate ao Crime Organizado</td></tr>
                    <tr><td><strong>GSI</strong></td><td>Gabinete de Segurança Institucional</td></tr>
                    <tr><td><strong>Homologação</strong></td><td>Confirmação da validade jurídica do processo pela autoridade superior.</td></tr>
                    <tr><td><strong>Inexigibilidade</strong></td><td>Contratação direta quando não há possibilidade de competição.</td></tr>
                    <tr><td><strong>Mapa de Riscos</strong></td><td>Documento que identifica e mitiga riscos que podem afetar a contratação.</td></tr>
                    <tr><td><strong>Modalidade Licitatória</strong></td><td>Procedimento legal para seleção do fornecedor (ex: Pregão, Dispensa).</td></tr>
                    <tr><td><strong>MPPI</strong></td><td>Ministério Público do Estado do Piauí</td></tr>
                    <tr><td><strong>Normativo</strong></td><td>Lei de licitações que rege o processo (Lei 14.133 ou 8.666).</td></tr>
                    <tr><td><strong>PCA</strong></td><td>Plano de Contratações Anual</td></tr>
                    <tr><td><strong>PDM</strong></td><td>Padrão Descritivo de Material</td></tr>
                    <tr><td><strong>Pesquisa de Preços</strong></td><td>Levantamento de valores de mercado para balizar o custo estimado.</td></tr>
                    <tr><td><strong>PGEA</strong></td><td>Procedimento de Gestão Administrativa</td></tr>
                    <tr><td><strong>PGJ</strong></td><td>Procuradoria-Geral de Justiça</td></tr>
                    <tr><td><strong>PLAN / ASSESPPLAGES</strong></td><td>Assessoria de Planejamento e Gestão</td></tr>
                    <tr><td><strong>Pregão Eletrônico</strong></td><td>Leilão em formato eletrônico para aquisição de bens e serviços comuns.</td></tr>
                    <tr><td><strong>PROCON</strong></td><td>Programa de Proteção e Defesa do Consumidor</td></tr>
                    <tr><td><strong>Registro de Preços / SRP</strong></td><td>Sistema para registro formal de preços para futuras contratações.</td></tr>
                    <tr><td><strong>Repactuação</strong></td><td>Reajuste de preços para contratos de serviços contínuos com mão de obra.</td></tr>
                    <tr><td><strong>Saldo Orçamentário</strong></td><td>Recurso ainda disponível no orçamento do setor após os empenhos realizados.</td></tr>
                    <tr><td><strong>SEI</strong></td><td>Sistema Eletrônico de Informações</td></tr>
                    <tr><td><strong>Sobrestamento</strong></td><td>Paralisação temporária de um processo de contratação.</td></tr>
                    <tr><td><strong>SRP</strong></td><td>Sistema de Registro de Preços</td></tr>
                    <tr><td><strong>Termo de Referência / TR</strong></td><td>Documento que detalha o objeto, especificações e obrigações da contratação.</td></tr>
                    <tr><td><strong>Trava Orçamentária</strong></td><td>Mecanismo que bloqueia novas contratações quando o limite é atingido.</td></tr>
                    <tr><td><strong>UO</strong></td><td>Unidade Orçamentária</td></tr>
                    <tr><td><strong>Valor Contratado</strong></td><td>Valor efetivamente acordado no contrato.</td></tr>
                    <tr><td><strong>Valor Estimado</strong></td><td>Valor previsto para a contratação, antes do certame.</td></tr>
                    <tr><td><strong>Valor Executado</strong></td><td>Quantia exata de recursos orçamentários empenhada para cobrir despesa.</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="page-break section">
              <h2>1. Apresentação</h2>
              <p>O Plano de Contratações Anual (PCA) do Ministério Público do Estado do Piauí, referente ao exercício de 2026, consolida-se como o instrumento central de governança estruturante e planejamento logístico institucional. Alinhado aos preceitos da Nova Lei de Licitações e Contratos (Lei nº 14.133/2021), o PCA transcende a mera formalidade administrativa para atuar como um guia estratégico, assegurando que as aquisições e contratações de serviços e obras guardem estrita consonância com o Planejamento Estratégico e as diretrizes orçamentárias deste Parquet.</p>
              
              <p>Esta Versão 2.0 reflete um processo de amadurecimento na gestão de insumos, fundamentado em análises de dados precisas e na interlocução direta entre as unidades requisitantes e a Administração Superior. Por meio da racionalização de demandas e da busca contínua pela economia de escala e padronização, o plano visa otimizar a alocação de recursos públicos, mitigando riscos de descontinuidade administrativa e elevando os padrões de transparência, eficácia e eficiência operacional.</p>

              <p>As métricas consolidadas a seguir sintetizam a magnitude do planejamento para o próximo exercício, refletindo o compromisso do MPPI com a excelência e a responsabilidade na gestão da coisa pública.</p>

              <div class="summary-grid">
                <div class="summary-card">
                  <div class="summary-label">Total de Demandas</div>
                  <div class="summary-value">${totalDemandas}</div>
                </div>
                <div class="summary-card">
                  <div class="summary-label">Montante Planejado</div>
                  <div class="summary-value">${formatCurrency(totalEstimado)}</div>
                </div>
              </div>
              <p style="margin-top: 8mm;">Este panorama consolidado serve de base para as estratégias de contratação que serão detalhadas ao longo deste documento, assegurando que cada recurso empenhado esteja diretamente vinculado ao fortalecimento da atuação institucional e à excelência na gestão pública.</p>
            </div>

            <div class="page-break section">
              <h2>2. Considerações Iniciais</h2>
              <p>O Plano de Contratações Anual (PCA), um dos principais instrumentos da governança em contratações, compreende as demandas a serem realizadas no exercício, sejam elas relacionadas a bens, serviços ou obras. Além das demandas novas, contempla também todas as renovações de contratos do Órgão (serviços e fornecimentos continuados). Sua relevância foi ampliada pela Nova Lei de Licitações (Lei 14.133/2021), consolidando-o como peça fundamental para o alcance de resultados mais sustentáveis e eficientes.</p>
              
              <p>Para o exercício de 2026, o PCA-MPPI evoluciona de um planejamento estático para uma ferramenta de gestão ativa e dinâmica. Uma das grandes inovações deste ano é a migração da gestão, outrora realizada exclusivamente por planilhas de Business Intelligence (Power BI), para um <strong>sistema web próprio dedicado</strong>. Essa transição tecnológica permite um controle mais rigoroso e transparente, minimizando inconsistências e agilizando a tomada de decisão estratégica.</p>

              <p>A importância estratégica do acompanhamento e monitoramento da execução é reforçada pela instituição de <strong>reuniões mensais de acompanhamento</strong> envolvendo todas as unidades administrativas e técnicas. Esses encontros visam avaliar o progresso das contratações, identificar gargalos técnicos e garantir o estrito cumprimento do cronograma estabelecido. Ademais, o novo sistema implementa inovações cruciais como a definição de <strong>limites de utilização orçamentária</strong> e <strong>travas sistêmicas por setor</strong>, assegurando que a execução financeira guarde total sintonia com os parâmetros aprovados pela Administração Superior.</p>

              <p>Em suma, o PCA-2026 representa um salto qualitativo na governança institucional do Parquet, unindo tecnologia de ponta, monitoramento sistemático e disciplina fiscal para garantir a otimização dos recursos públicos e a transparência em todo o ciclo de contratação.</p>
              <p>O PCA é um documento dinâmico e deve acomodar ajustes estratégicos, caso surjam novas oportunidades ou desafios, devidamente justificados, ao longo do ano.</p>
              <p>Com a consolidação do PCA devidamente realizada nos termos do art. 11 do Ato PGJ nº 1381/2024, a Coordenadoria de Licitações e Contratos e a Assessoria de Planejamento e Gestão estabeleceram o Calendário de Contratações e Renovações de Contratos, cujas diretrizes e cronogramas encontram-se detalhados neste documento. Cada demanda possui agora uma data prevista para sua execução, permitindo um monitoramento rigoroso e sistêmico de todos os prazos. O cumprimento estrito deste cronograma é vital para a efetividade das ações institucionais planejadas, assegurando que as necessidades do MPPI sejam atendidas com tempestividade. Ressalte-se que todo este planejamento foi submetido e homologado pela Procuradora-Geral de Justiça, conferindo a segurança jurídica e administrativa necessária para sua plena execução.</p>
            </div>

            <div class="page-break section">
              <h2>3. Diretrizes da Política de Aquisições</h2>
              <p>A formulação do Plano de Contratações Anual para o exercício de 2026 fundamenta-se em diretrizes estratégicas que visam a excelência operacional e a integridade administrativa. Estas diretrizes orientam as unidades requisitantes na identificação de suas necessidades, assegurando que cada aquisição contribua para o interesse público e para o fortalecimento institucional do Ministério Público do Estado do Piauí:</p>
              <ul style="list-style-type: none; padding-left: 0; margin-top: 8mm;">
                <li style="margin-bottom: 6mm; display: flex; align-items: flex-start; gap: 12px;">
                  <span style="color: #D9415D; font-weight: bold; font-size: 14pt;">✓</span>
                  <div>
                    <strong style="display: block; color: #111827; margin-bottom: 2px;">Racionalização e Eficiência Logística:</strong>
                    <span>Busca-se a otimização das contratações por meio da centralização e do compartilhamento de demandas entre as unidades. O objetivo é alcançar economia de escala, promover a padronização de produtos e serviços e reduzir significativamente os custos processuais e administrativos.</span>
                  </div>
                </li>
                <li style="margin-bottom: 6mm; display: flex; align-items: flex-start; gap: 12px;">
                  <span style="color: #D9415D; font-weight: bold; font-size: 14pt;">✓</span>
                  <div>
                    <strong style="display: block; color: #111827; margin-bottom: 2px;">Alinhamento Estratégico Multissetorial:</strong>
                    <span>As contratações guardam estrita observância ao Plano Estratégico Institucional, ao Plano Diretor de Logística Sustentável (PLS) e às leis orçamentárias, garantindo que o gasto público esteja vinculado às prioridades reais da organização e subsidie adequadamente a LOA.</span>
                  </div>
                </li>
                <li style="margin-bottom: 6mm; display: flex; align-items: flex-start; gap: 12px;">
                  <span style="color: #D9415D; font-weight: bold; font-size: 14pt;">✓</span>
                  <div>
                    <strong style="display: block; color: #111827; margin-bottom: 2px;">Transparência e Controle Social:</strong>
                    <span>Promove-se a comunicação aberta, voluntária e transparente de todos os procedimentos e resultados. A publicidade ativa fortalece o acesso público à informação e assegura a integridade em todo o ciclo de vida das aquisições.</span>
                  </div>
                </li>
                <li style="margin-bottom: 6mm; display: flex; align-items: flex-start; gap: 12px;">
                  <span style="color: #D9415D; font-weight: bold; font-size: 14pt;">✓</span>
                  <div>
                    <strong style="display: block; color: #111827; margin-bottom: 2px;">Prevenção ao Fracionamento de Despesas:</strong>
                    <span>O planejamento antecipado permite identificar demandas assemelhadas, evitando o fracionamento indevido de despesas e garantindo a escolha da modalidade licitatória mais adequada, conforme os limites e critérios estabelecidos na Lei nº 14.133/2021.</span>
                  </div>
                </li>
                <li style="margin-bottom: 6mm; display: flex; align-items: flex-start; gap: 12px;">
                  <span style="color: #D9415D; font-weight: bold; font-size: 14pt;">✓</span>
                  <div>
                    <strong style="display: block; color: #111827; margin-bottom: 2px;">Interação com o Mercado Fornecedor:</strong>
                    <span>Ao sinalizar antecipadamente as intenções de compra, o MPPI amplia o diálogo com o mercado e incrementa a competitividade, incentivando a participação de um maior número de fornecedores qualificados.</span>
                  </div>
                </li>
                <li style="margin-bottom: 6mm; display: flex; align-items: flex-start; gap: 12px;">
                  <span style="color: #D9415D; font-weight: bold; font-size: 14pt;">✓</span>
                  <div>
                    <strong style="display: block; color: #111827; margin-bottom: 2px;">Gestão por Competências e Otimização:</strong>
                    <span>A política de aquisições foca no aperfeiçoamento da gestão por meio da capacitação contínua de servidores e na adoção de práticas de planejamento setorial que assegurem a plena potencialização dos recursos humanos e financeiros disponíveis.</span>
                  </div>
                </li>
              </ul>
            </div>

            <div class="page-break section">
              <h2>4. Do Plano de Contratação Anual</h2>
              <p>O Plano de Contratações Anual (PCA) do Ministério Público do Estado do Piauí e de seus fundos institucionais representa o ápice do planejamento preventivo e da governança de recursos. Com o propósito de elevar a eficiência no aproveitamento do erário, este documento consolida a estratégia de aquisições para o exercício de 2026, assegurando que cada demanda esteja estritamente vinculada à missão constitucional e aos objetivos estratégicos do Órgão.</p>
              
              <p>Este planejamento é fruto de um esforço multifuncional, envolvendo unidades administrativas e técnicas em um diálogo construtivo para alinhar as propostas orçamentárias (LOA) às reais necessidades finalísticas. O PCA não apenas identifica o que será contratado, mas também como essas contratações otimizarão os processos de trabalho e garantirão a sustentabilidade operacional da instituição.</p>

              <h3 style="font-size: 11pt; color: #111827; margin-top: 8mm; margin-bottom: 4mm;">4.1. Do Levantamento de Necessidades</h3>
              <p>A fase de levantamento de necessidades constitui o alicerce do PCA. Regulamentada pelo Ato PGJ nº 1381/2024, esta etapa envolveu a participação ativa de todas as unidades requisitantes, incluindo Promotorias, Procuradorias de Justiça e órgãos da Administração Superior. O processo iniciou-se com a abertura oficial por meio de expedientes técnicos (PGEA/SEI nº 19.21.0013.0025806/2025-68), orientando as unidades na formulação de suas propostas para o exercício vindouro.</p>
              
              <p>A metodologia adotada foi estruturada em ciclos de análise:</p>
              <ul style="list-style-type: none; padding-left: 0; margin-top: 4mm; margin-bottom: 6mm;">
                <li style="margin-bottom: 3mm; display: flex; align-items: flex-start; gap: 8px;">
                  <span style="color: #D9415D; font-weight: bold;">•</span>
                  <span><strong>Identificação Preliminar:</strong> Levantamento inicial de demandas recorrentes e novas necessidades pelas unidades requisitantes.</span>
                </li>
                <li style="margin-bottom: 3mm; display: flex; align-items: flex-start; gap: 8px;">
                  <span style="color: #D9415D; font-weight: bold;">•</span>
                  <span><strong>Compatibilização Técnica:</strong> Análise de viabilidade pela Coordenadoria de Licitações e Contratos, em conjunto com a Assessoria de Planejamento e Chefia de Gabinete.</span>
                </li>
                <li style="margin-bottom: 3mm; display: flex; align-items: flex-start; gap: 8px;">
                  <span style="color: #D9415D; font-weight: bold;">•</span>
                  <span><strong>Priorização Estratégica:</strong> Debate com a Alta Administração para seleção de itens prioritários em conformidade com as disponibilidades orçamentárias.</span>
                </li>
              </ul>

              <h3 style="font-size: 11pt; color: #111827; margin-top: 8mm; margin-bottom: 4mm;">4.2. Do Processamento e Tratamento dos Dados</h3>
              <p>Após a coleta de informações por meio de ferramentas sistêmicas e formulários padronizados, os dados foram submetidos a um rigoroso processo de tratamento e validação. Para o ciclo de 2026, o MPPI implementou inovações significativas no processamento de dados, migrando para um ecossistema de dados mais íntegro e visual. Tendo em vista a eficiência operacional, foram aprimorados os seguintes procedimentos:</p>
              
              <ul style="list-style-type: none; padding-left: 0; margin-top: 5mm; margin-bottom: 8mm;">
                <li style="margin-bottom: 4mm; display: flex; align-items: flex-start; gap: 8px;">
                  <span style="color: #D9415D; font-weight: bold;">✓</span>
                  <span><strong>Foco em Novas Demandas:</strong> O levantamento contemplou propostas de novas contratações e registros de preços, permitindo uma visão clara da expansão necessária para o exercício.</span>
                </li>
                <li style="margin-bottom: 4mm; display: flex; align-items: flex-start; gap: 8px;">
                  <span style="color: #D9415D; font-weight: bold;">✓</span>
                  <span><strong>Continuidade Contratual:</strong> Unidades demandantes reportaram pretensões de renovação e prorrogação, otimizando o fluxo de manutenção de serviços essenciais.</span>
                </li>
                <li style="margin-bottom: 4mm; display: flex; align-items: flex-start; gap: 8px;">
                  <span style="color: #D9415D; font-weight: bold;">✓</span>
                  <span><strong>Padronização Descritiva (PDM/CATSER):</strong> A utilização obrigatória de padrões descritivos facilitará o cadastramento no Portal Nacional de Contratações Públicas (PNCP), conforme as exigências da Lei 14.133/2021.</span>
                </li>
              </ul>

              <h3 style="font-size: 11pt; color: #111827; margin-top: 8mm; margin-bottom: 4mm;">4.3. Da Consolidação Estratégica</h3>
              <p>A consolidação final do PCA resultou de um ciclo de reuniões de alinhamento técnico e estratégico, unificando as metas de cada unidade gestora sob uma governança centralizada. Este processo assegurou a mitigação de riscos de fracionamento de despesas por meio da unificação de itens assemelhados, maximizando o ganho processual.</p>
              <p>Com base no orçamento aprovado, as demandas de unidades como CAA, CCF, CCS, CEAF, CLC, entre outras, foram tecnicamente apreciadas. O resultado é um documento robusto, devidamente revisado pela Chefia de Gabinete e homologado pela Procuradora-Geral de Justiça, pronto para guiar a execução administrativa com transparência e disciplina fiscal em 2026.</p>
            </div>

            <div class="page-break section">
              <h2>5. Perspectiva Orçamentária do PCA-2026</h2>
              <p>A perspectiva orçamentária do Plano de Contratações Anual para 2026 reflete a aplicação rigorosa dos princípios de responsabilidade fiscal e planejamento estratégico. O montante global planejado foi meticulosamente calculado para garantir a manutenção dos serviços essenciais e o suporte às novas iniciativas institucionais, mantendo-se em estrita consonância com os limites orçamentários previstos para o exercício.</p>

              <div style="display: flex; align-items: center; justify-content: center; gap: 40px; margin: 10mm 0; background: #f9fafb; padding: 25px; border-radius: 12px; border: 1px solid #e5e7eb;">
                <div style="width: 160px; height: 160px; border-radius: 50%; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); background: conic-gradient(
                  #2563eb 0% ${pPGJ}%, 
                  #dc2626 ${pPGJ}% ${pPGJ + pFMMP}%, 
                  #16a34a ${pPGJ + pFMMP}% ${pPGJ + pFMMP + pFEPDC}%, 
                  #6b7280 ${pPGJ + pFMMP + pFEPDC}% 100%
                ); -webkit-print-color-adjust: exact;"></div>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 14px; height: 14px; background: #2563eb; border-radius: 3px;"></div>
                    <span style="font-size: 9.5pt; font-weight: 600; color: #374151;">PGJ: ${formatCurrency(pgjVal)} (${pPGJ.toFixed(1)}%)</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 14px; height: 14px; background: #dc2626; border-radius: 3px;"></div>
                    <span style="font-size: 9.5pt; font-weight: 600; color: #374151;">FMMPPI: ${formatCurrency(fmmpVal)} (${pFMMP.toFixed(1)}%)</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 14px; height: 14px; background: #16a34a; border-radius: 3px;"></div>
                    <span style="font-size: 9.5pt; font-weight: 600; color: #374151;">FPDC: ${formatCurrency(fepdcVal)} (${pFEPDC.toFixed(1)}%)</span>
                  </div>
                  ${pOther > 0.1 ? `
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 14px; height: 14px; background: #6b7280; border-radius: 3px;"></div>
                    <span style="font-size: 9.5pt; font-weight: 600; color: #374151;">Outros: ${formatCurrency(otherVal)} (${pOther.toFixed(1)}%)</span>
                  </div>` : ''}
                  <div style="margin-top: 8px; padding-top: 8px; border-top: 1.5px solid #e5e7eb;">
                    <span style="font-size: 11pt; font-weight: 800; color: #111827;">Investimento Total: ${formatCurrency(totalEstimado)}</span>
                  </div>
                </div>
              </div>

              <p>O PCA-2026 compreende um total de <strong>${totalDemandas}</strong> demandas, distribuídas entre investimentos em modernização e o custeio necessário para a continuidade das atividades ministeriais. A tabela abaixo detalha a representatividade de cada unidade requisitante, evidenciando o equilíbrio entre as renovações contratuais e as novas necessidades de contratação.</p>
              
              <div style="margin-top: 5mm;">
                <p style="font-size: 8pt; font-weight: 700; color: #111827; margin-bottom: 1mm; text-transform: uppercase; letter-spacing: 0.5px;">Tabela 1: Detalhamento por Unidade Requisitante e Tipo de Contratação</p>
                <table class="compact-table" style="font-size: 7.5pt; border: 1.5px solid #000; border-collapse: collapse;">
                  <thead>
                    <tr>
                      <th rowspan="2" style="background: #f8fafc;">Unidade Requisitante</th>
                      <th rowspan="2" style="background: #f8fafc;">Qtd Itens</th>
                      <th colspan="2" style="background: #f8fafc;">Nova Contratação</th>
                      <th colspan="2" style="background: #f8fafc;">Renovação de Contrato</th>
                      <th rowspan="2" style="background: #f8fafc;">Valor Total</th>
                      <th rowspan="2" style="background: #f8fafc;">% PCA</th>
                    </tr>
                    <tr>
                      <th style="background: #f8fafc; border: 1.5px solid #000;">Qtd</th>
                      <th style="background: #f8fafc; border: 1.5px solid #000;">Valor</th>
                      <th style="background: #f8fafc; border: 1.5px solid #000;">Qtd</th>
                      <th style="background: #f8fafc; border: 1.5px solid #000;">Valor</th>
                    </tr>
                  </thead>
                  <tbody style="border: 1.5px solid #000;">
                    ${table01Html}
                  </tbody>
                  <tfoot>
                    <tr style="font-weight: bold; background: #f9fafb;">
                      <td>TOTAIS</td>
                      <td class="text-center">${totalDemandas}</td>
                      <td class="text-center">${sourceRows.filter(r => r.tipo_contratacao === 'Nova Contratação').length}</td>
                      <td class="text-right">${formatCurrency(sourceRows.filter(r => r.tipo_contratacao === 'Nova Contratação').reduce((s, r) => s + (r.valor_estimado || 0), 0))}</td>
                      <td class="text-center">${sourceRows.filter(r => r.tipo_contratacao !== 'Nova Contratação').length}</td>
                      <td class="text-right">${formatCurrency(sourceRows.filter(r => r.tipo_contratacao !== 'Nova Contratação').reduce((s, r) => s + (r.valor_estimado || 0), 0))}</td>
                      <td class="text-right">${formatCurrency(totalEstimado)}</td>
                      <td class="text-center">100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div style="margin-top: 22mm; page-break-inside: avoid;">
                <p style="font-size: 8pt; font-weight: 700; color: #111827; margin-bottom: 2mm; text-transform: uppercase;">TABELA 2: Representatividade quanto ao tipo de recurso no PCA</p>
                <table class="compact-table" style="border: 1.5px solid #000;">
                  <thead>
                    <tr>
                      <th style="border: 1.5px solid #000; background: #f8fafc;">Tipo</th>
                      <th style="border: 1.5px solid #000; background: #f8fafc;">Valor</th>
                      <th style="border: 1.5px solid #000; background: #f8fafc;">Percentual</th>
                    </tr>
                  </thead>
                  <tbody style="border: 1.5px solid #000;">
                    ${table02Html}
                  </tbody>
                </table>
              </div>

              <div style="margin-top: 22mm; page-break-inside: avoid;">
                <p style="font-size: 8pt; font-weight: 700; color: #111827; margin-bottom: 2mm; text-transform: uppercase;">TABELA 3: Representatividade dos valores totais do PCA por unidade orçamentária e Unidade Requisitante.</p>
                <table class="compact-table" style="border: 1.5px solid #000;">
                  <thead>
                    <tr>
                      <th style="border: 1.5px solid #000; background: #f8fafc;">Unidade Requisitante</th>
                      <th style="border: 1.5px solid #000; background: #f8fafc;">PGJ</th>
                      <th style="border: 1.5px solid #000; background: #f8fafc;">FMMP</th>
                      <th style="border: 1.5px solid #000; background: #f8fafc;">FEPDC</th>
                    </tr>
                  </thead>
                  <tbody style="border: 1.5px solid #000;">
                    ${table03Html}
                  </tbody>
                  <tfoot style="border: 1.5px solid #000;">
                    <tr style="font-weight: bold; background: #f9fafb;">
                      <td>VALORES TOTAIS</td>
                      <td class="text-right">${formatCurrency(uoTotalsMap["PGJ"] || 0)}</td>
                      <td class="text-right">${formatCurrency(uoTotalsMap["FMMP"] || 0)}</td>
                      <td class="text-right">${formatCurrency(uoTotalsMap["FEPDC"] || 0)}</td>
                    </tr>
                    <tr style="font-weight: bold; background: #f9fafb;">
                      <td>PERCENTUAL</td>
                      <td class="text-right">${((uoTotalsMap["PGJ"] || 0) / (totalEstimado || 1) * 100).toFixed(2)}%</td>
                      <td class="text-right">${((uoTotalsMap["FMMP"] || 0) / (totalEstimado || 1) * 100).toFixed(2)}%</td>
                      <td class="text-right">${((uoTotalsMap["FEPDC"] || 0) / (totalEstimado || 1) * 100).toFixed(2)}%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div style="margin-top: 22mm; page-break-inside: avoid;">
                <p style="font-size: 8pt; font-weight: 700; color: #111827; margin-bottom: 2mm; text-transform: uppercase;">TABELA 4: Representatividade do PCA das renovações de contratos por unidade orçamentária</p>
                <table class="compact-table" style="border: 1.5px solid #000;">
                  <thead>
                    <tr>
                      <th style="border: 1.5px solid #000; background: #f8fafc;">Unidade Requisitante</th>
                      <th style="border: 1.5px solid #000; background: #f8fafc;">PGJ</th>
                      <th style="border: 1.5px solid #000; background: #f8fafc;">FMMP</th>
                      <th style="border: 1.5px solid #000; background: #f8fafc;">FEPDC</th>
                    </tr>
                  </thead>
                  <tbody style="border: 1.5px solid #000;">
                    ${table04Html}
                  </tbody>
                  <tfoot style="border: 1.5px solid #000;">
                    <tr style="font-weight: bold; background: #f9fafb;">
                      <td>VALORES TOTAIS (Renov.)</td>
                      <td class="text-right">${formatCurrency(uoRenTotalsMap["PGJ"] || 0)}</td>
                      <td class="text-right">${formatCurrency(uoRenTotalsMap["FMMP"] || 0)}</td>
                      <td class="text-right">${formatCurrency(uoRenTotalsMap["FEPDC"] || 0)}</td>
                    </tr>
                    <tr style="font-weight: bold; background: #f9fafb;">
                      <td>PERCENTUAL</td>
                      <td class="text-right">${((uoRenTotalsMap["PGJ"] || 0) / (totalEstimado || 1) * 100).toFixed(2)}%</td>
                      <td class="text-right">${((uoRenTotalsMap["FMMP"] || 0) / (totalEstimado || 1) * 100).toFixed(2)}%</td>
                      <td class="text-right">${((uoRenTotalsMap["FEPDC"] || 0) / (totalEstimado || 1) * 100).toFixed(2)}%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <p style="margin-top: 8mm;">Em conclusão, o detalhamento orçamentário consolidado na presente seção demonstra o equilíbrio entre a expansão necessária para a modernização institucional e a prudência fiscal requerida para a continuidade dos serviços essenciais. A distribuição dos recursos entre as diversas Unidades Requisitantes e a correta classificação entre novas demandas e renovações contratuais asseguram ao Ministério Público do Estado do Piauí uma execução financeira previsível e eficiente. Este planejamento logístico-orçamentário, pautado pela transparência e pela otimização do erário, constitui-se como o alicerce fundamental para o cumprimento das metas estratégicas pactuadas para o exercício de 2026.</p>
            </div>

            <div class="page-break section">
              <h2>6. Alinhamento Estratégico</h2>
              <p>O Plano de Contratações Anual (PCA-2026) funciona como o principal instrumento de viabilização tática da estratégia institucional do Ministério Público do Estado do Piauí. Cada demanda consolidada neste documento foi criteriosamente avaliada sob o prisma de sua contribuição para os Objetivos Estratégicos estabelecidos no Ciclo 2020–2029, garantindo que o dispêndio de recursos públicos esteja intrinsecamente vinculado à entrega de valor à sociedade piauiense.</p>
              
              <p>Em estrita observância à Resolução CNMP nº 147/2016, que institui a Estratégia Nacional do Ministério Público, o alinhamento aqui demonstrado assegura que as aquisições e contratações de serviços reforcem a atuação finalística e aprimorem a governança corporativa. A integração sistêmica entre o planejamento logístico e o Mapa Estratégico reflete o compromisso deste Parquet com a eficiência administrativa e a busca contínua por resultados institucionais de alto impacto.</p>

              <div style="margin-top: 10mm; text-align: center;">
                <p style="font-size: 8pt; font-weight: 600; margin-bottom: 4mm; color: #374151;">MAPA ESTRATÉGICO INSTITUCIONAL (2020-2029)</p>
                <img src="${mapaEstrategico}" style="width: 100%; max-width: 180mm; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);" alt="Mapa Estratégico MPPI">
              </div>
            </div>

            <div class="page-break section">
              <h2>7. Alocação de Recursos para Novos Certames por Vencimento Improrrogável</h2>
              <p>Em estrita observância aos limites temporais estabelecidos pela legislação vigente e pelas diretrizes normativas da Administração Superior, as contratações relacionadas abaixo atingirão o termo final de sua vigência máxima permitida ao longo do exercício de 2026. Ante a impossibilidade jurídica de novas prorrogações aditivas, torna-se imperativa a deflagração tempestiva de novos procedimentos licitatórios. Este planejamento preventivo visa assegurar a continuidade ininterrupta de serviços e fornecimentos essenciais à manutenção das atividades institucionais deste Parquet.</p>
              
              <div style="margin-top: 5mm;">
                <p style="font-size: 8pt; font-weight: 700; color: #111827; margin-bottom: 2mm; text-transform: uppercase;">TABELA 5: Contratos que exigem novo certame em 2026</p>
                <table>
                  <thead>
                    <tr>
                      <th style="background: #f8fafc;">Objeto</th>
                      <th style="background: #f8fafc;">Unidade Orçamentária</th>
                      <th style="background: #f8fafc;">Unidade Requisitante</th>
                      <th style="background: #f8fafc;">Número do Contrato</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Contratação de Transporte Intermunicipal de Carga - PAC correios.</td>
                      <td class="text-center">PGJ</td>
                      <td class="text-center">CAA</td>
                      <td class="text-center">52/2021</td>
                    </tr>
                    <tr>
                      <td>Prestação de Serviço de Coleta de Lixo do MP-PI em Teresina</td>
                      <td class="text-center">PGJ</td>
                      <td class="text-center">CAA</td>
                      <td class="text-center">76/2021</td>
                    </tr>
                    <tr>
                      <td>Serviços de manutenção preventiva e corretiva, com o fornecimento de peças, para 2 (dois) motores-geradores de energia elétrica</td>
                      <td class="text-center">PGJ</td>
                      <td class="text-center">CAA</td>
                      <td class="text-center">79/2021</td>
                    </tr>
                    <tr>
                      <td>link de internet</td>
                      <td class="text-center">PGJ</td>
                      <td class="text-center">CTI</td>
                      <td class="text-center">15/2021</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="page-break section">
              <h2>8. Contratações de Serviços Públicos com Vigência por Prazo Indeterminado</h2>
              <p>As contratações de serviços públicos essenciais, operados sob regime de monopólio ou caracterizados como utilidade pública de natureza contínua (tais como fornecimento de energia elétrica, saneamento básico e serviços postais), são regidas por marcos regulatórios específicos que facultam a vigência por prazo indeterminado. Tais instrumentos são fundamentais para a estabilidade da infraestrutura operacional do MPPI, e o seu monitoramento é focado na fidedignidade da prestação e na conformidade com as estruturas tarifárias vigentes fixadas pelas agências reguladoras.</p>
              
              <div style="margin-top: 5mm;">
                <p style="font-size: 8pt; font-weight: 700; color: #111827; margin-bottom: 2mm; text-transform: uppercase;">TABELA 6: Relação de Contratos com Prazo Indeterminado</p>
                <table style="font-size: 7.5pt;">
                  <thead>
                    <tr>
                      <th style="background: #f8fafc;">Objeto</th>
                      <th style="background: #f8fafc;">UO</th>
                      <th style="background: #f8fafc;">Unidade Requisitante</th>
                      <th style="background: #f8fafc;">Contrato</th>
                      <th style="background: #f8fafc;">Valor Anual Previsto</th>
                      <th style="background: #f8fafc;">Término</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Fornecimento de Água Tratada e tratamento de Esgoto - SAAE OEIRAS</td>
                      <td class="text-center">PGJ</td>
                      <td class="text-center">CAA</td>
                      <td class="text-center">45/2018</td>
                      <td class="text-right">R$ 2.000,00</td>
                      <td class="text-center">Indeterminado</td>
                    </tr>
                    <tr>
                      <td>Fornecimento de Água Tratada e Tratamento de Esgoto - SAAE CAMPO MAIOR</td>
                      <td class="text-center">PGJ</td>
                      <td class="text-center">CAA</td>
                      <td class="text-center">55/2019</td>
                      <td class="text-right">R$ 1.000,00</td>
                      <td class="text-center">Indeterminado</td>
                    </tr>
                    <tr>
                      <td>Fornecimento de Água Tratada e Tratamento de Esgoto Sanitário - Águas de Teresina</td>
                      <td class="text-center">PGJ</td>
                      <td class="text-center">CAA</td>
                      <td class="text-center">58/2019</td>
                      <td class="text-right">R$ 160.000,00</td>
                      <td class="text-center">Indeterminado</td>
                    </tr>
                    <tr>
                      <td>Fornecimento de Energia elétrica - Equatorial</td>
                      <td class="text-center">FMMPPI</td>
                      <td class="text-center">CPPT</td>
                      <td class="text-center">88/2025</td>
                      <td class="text-right">R$ 1.680.000,00</td>
                      <td class="text-center">Indeterminado</td>
                    </tr>
                    <tr>
                      <td>Contratação de produtos e serviços por meio de pacote de Serviço dos correios</td>
                      <td class="text-center">PGJ</td>
                      <td class="text-center">CAA</td>
                      <td class="text-center">76/2024</td>
                      <td class="text-right">R$ 74.000,00</td>
                      <td class="text-center">Indeterminado</td>
                    </tr>
                    <tr>
                      <td>Contratação de serviços de fornecimento de água tratada e coleta de esgoto sanitário para os imóveis sedes do Ministério Público do Estado do Piauí localizadas no interior do Estado - ÁGUAS DO PIAUÍ</td>
                      <td class="text-center">PGJ</td>
                      <td class="text-center">CAA</td>
                      <td class="text-center">96/2025</td>
                      <td class="text-right">R$ 450.259,20</td>
                      <td class="text-center">Indeterminado</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="page-break section">
              <h2>9. Metodologia de Monitoramento e Gestão de Riscos da Execução do PCA</h2>
              <p>O modelo de governança do PCA-2026 fundamenta-se nas disposições do art. 17 do Ato PGJ nº 1381/2024, estabelecendo um ciclo de controle rigoroso e preventivo. O monitoramento sistemático objetiva antecipar eventuais óbices técnicos ou orçamentários que possam comprometer o cronograma de contratações. Por meio desta gestão de riscos, a Coordenadoria de Licitações e Contratos e a Assessoria de Planejamento mantêm a visibilidade total sobre o fluxo processual, garantindo a eficiência na aplicação dos recursos e o cumprimento das metas institucionais através das seguintes instâncias de controle:</p>
              
              <ul style="padding-left: 20px; list-style-type: square; margin-bottom: 6mm;">
                <li style="margin-bottom: 3mm;"><strong>Relatórios de Acompanhamento:</strong> Elaboração bimestral de diagnósticos (julho, setembro e novembro) para avaliação do status das demandas;</li>
                <li style="margin-bottom: 3mm;"><strong>Ações Corretivas:</strong> Reporte imediato à Administração Superior em casos de processos com risco de não execução tempestiva;</li>
                <li style="margin-bottom: 3mm;"><strong>Justificativa de Inexecução:</strong> Ao final do exercício, todas as demandas não realizadas deverão ser justificadas e, se necessário, reprogramadas para o PCA subsequente.</li>
              </ul>

              <p>Para mitigar riscos de descontinuidade administrativa e garantir o cumprimento do cronograma, foram estabelecidos prazos fatais para a remessa de Documentos de Formalização de Demanda (DFD) e Instruções Processuais, conforme detalhado na tabela de limites temporais abaixo:</p>
              
              <div style="margin-top: 5mm;">
                <p style="font-size: 8pt; font-weight: 700; color: #111827; margin-bottom: 2mm; text-transform: uppercase;">TABELA 7: Cronograma de Prazos Limites para Tramitação de Processos</p>
                <table>
                  <thead>
                    <tr>
                      <th style="background: #f8fafc;">Modalidades</th>
                      <th style="background: #f8fafc;">Prazo final para envio</th>
                      <th style="background: #f8fafc;">Observação</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Licitação</td>
                      <td class="text-center">Até 30/08/2026</td>
                      <td>Caso a demanda não seja enviada no prazo, deverá ser avaliado para inserir no PCA-2027</td>
                    </tr>
                    <tr>
                      <td>Dispensa</td>
                      <td class="text-center">Até 15/10/2026</td>
                      <td>—</td>
                    </tr>
                    <tr>
                      <td>Inexigibilidade</td>
                      <td class="text-center">Até 15/10/2026</td>
                      <td>—</td>
                    </tr>
                    <tr>
                      <td>Compra por ARP do MPPI</td>
                      <td class="text-center">Até 30/10/2026</td>
                      <td>—</td>
                    </tr>
                    <tr>
                      <td>Adesão a ARP de outros órgãos</td>
                      <td class="text-center">Até 15/10/2026</td>
                      <td>—</td>
                    </tr>
                    <tr>
                      <td>Prorrogações de contratos com vigência até mês de janeiro de 2027</td>
                      <td class="text-center">Até 30/09/2026</td>
                      <td>Caso esses contratos não sejam renovados, o MPPI ficará sem os serviços contratados</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p style="margin-top: 5mm; font-style: italic;">Os casos omissos e as situações excepcionais serão decididos pela Procuradora-Geral de Justiça-PI.</p>
            </div>

            <div class="page-break section">
              <h2>10. Conclusão e Disposições Finais</h2>
              <p>O Plano de Contratações Anual (PCA) do Ministério Público do Estado do Piauí, consolidado como prática de excelência desde 2021, atinge para o exercício de 2026 um novo patamar de maturidade institucional e robustez administrativa. A principal inovação deste ciclo reside na transição definitiva da governança baseada em ferramentas de visualização estática para um ecossistema tecnológico próprio e dedicado. Este avanço permite o rastreamento integral de cada etapa do planejamento, transformando dados em inteligência estratégica e assegurando uma sincronia sem precedentes entre o planejamento logístico e a execução orçamentária.</p>
              
              <p>O aprimoramento contínuo dos fluxos de trabalho e a interlocução sinérgica entre as unidades técnicas e requisitantes consolidaram o PCA como um instrumento de mitigação de riscos e promoção da integridade nas compras públicas. Para o exercício de 2026, o bom andamento do planejamento é garantido por mecanismos de controle proativos, incluindo travas sistêmicas por setor e o monitoramento rigoroso de limites de empenho, assegurando que cada contratação guarde estrita fidelidade aos parâmetros fiscais aprovados.</p>

              <p>Ressalte-se que o PCA é um instrumento dinâmico e resiliente. Sua natureza flexível permite que a Administração Superior realize ajustes tempestivos, inclusões estratégicas ou remanejamentos de demandas ao longo do ano, sempre pautados pela supremacia do interesse público e pela mutabilidade das necessidades institucionais. Qualquer alteração relevante seguirá os ritos de validação técnica e aprovação pela Procuradoria-Geral de Justiça, mantendo a conformidade com a Lei nº 14.133/2021 e com os objetivos estratégicos do Parquet.</p>

              <p>Por fim, a concretização deste Plano reafirma o compromisso do MPPI com a transparência ativa e a eficiência na alocação dos recursos públicos. Mais do que um repositório de intenções de compra, o PCA-2026 consolida-se como um guia de gestão de alto desempenho, projetando o Ministério Público rumo a um modelo de logística pública moderna, sustentável e plenamente alinhada à excelência na entrega de resultados à sociedade piauiense.</p>

              <p>Sobre as diretrizes finais de execução, destacam-se os seguintes pontos:</p>
              <ol style="padding-left: 20px;">
                <li style="margin-bottom: 4mm;">Os pedidos de contratação não contemplados no Plano de Contratação Anual, previstos no ano de sua elaboração, devem ser enviados à Assessoria de Planejamento e Gestão para comprovação dos recursos orçamentários e após submeter à aprovação da PGJ;</li>
                <li style="margin-bottom: 4mm;">Por fim, considerando tais apontamentos, segue o Plano de Contratações Anual de 2026, com vista à aprovação pelo PGJ-PI em exercício.</li>
              </ol>
            </div>

            <div class="page-break section">
              <h2>11. Aprovação</h2>
              <div style="margin-top: 10mm; padding: 25px; border: 1.5px solid #D9415D; border-radius: 8px; background: #fffafb;">
                <p style="font-size: 14pt; font-weight: 700; color: #D9415D; margin-bottom: 6mm; letter-spacing: 1px;">Aprovação Institucional</p>
                <p style="font-size: 11pt; line-height: 1.7; text-align: justify; font-weight: 500; color: #1f2937;">
                  Considerando a regularidade do processo de planejamento e a observância aos preceitos da Lei nº 14.133/2021, aprovo o Plano de Contratações Anual (PCA) para o exercício de 2026. Determino sua imediata publicação nos veículos oficiais de transparência e a fiel execução por parte das unidades técnicas e requisitantes desta Procuradoria-Geral de Justiça, em estrita conformidade com as diretrizes estabelecidas neste documento e no Ato PGJ nº 1381/2024.
                </p>
                
                <div style="margin-top: 25mm; text-align: center;">
                  <p style="font-size: 10pt; color: #4b5563;">Teresina, datado e assinado eletronicamente.</p>
                  <div style="margin-top: 15mm; border-top: 1px solid #374151; display: inline-block; padding-top: 2mm; min-width: 350px;">
                    <p style="font-weight: 700; margin: 0; font-size: 11pt; color: #111827;">Dra. Cláudia Pessoa Marques da Rocha Seabra</p>
                    <p style="margin: 0; color: #4b5563; font-size: 10pt;">Procuradora-Geral de Justiça</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="page-break section landscape-section">
              <h2>Anexo I: Relação Completa de Demandas</h2>
              <p>A tabela a seguir apresenta a listagem completa de todas as demandas de contratação registradas para o exercício de 2026.</p>
              <table>
                <thead>
                  <tr>
                    <th style="width: 12%;">Cod.PCA</th>
                    <th style="width: 35%;">Descrição</th>
                    <th style="width: 15%;">Setor Demandante</th>
                    <th style="width: 10%;">UO</th>
                    <th style="width: 10%;">Tipo</th>
                    <th style="width: 8%;">Prioridade</th>
                    <th style="width: 10%;">Valor Planejado</th>
                  </tr>
                </thead>
                  <tbody>
                    ${rowsHtml}
                  </tbody>
                </table>
              </div> <!-- End main-content -->
            </td>
          </tr>
        </tbody>
      </table>

          <div class="footer-global" style="display: none;"></div>

            <script>
              window.onload = () => { setTimeout(() => { window.print(); }, 1000); };
            </script>
          </body>
          </html>`;

        if (pdfWindow) {
          const blob = new Blob([html], { type: "text/html;charset=utf-8" });
          const url = URL.createObjectURL(blob);
          pdfWindow.location.href = url;
          setTimeout(() => URL.revokeObjectURL(url), 60000);
        }
      } else {
        const logo = `${location.origin}/logo-mppi.png`;
        const widthClass = (col: string) => {
          if (col === "Cod. PCA") return "col-ID";
          if (col === "Descrição") return "col-Descrição";
          if (col === "Setor") return "col-Setor";
          if (col === "Prioridade") return "col-Prioridade";
          if (col === "Status" || col === "Situação") return "col-Status";
          if (col.includes("Data")) return "col-Data";
          if (col === "SEI") return "col-SEI";
          if (col === "Conformidade") return "col-Status";
          if (col === "Valor Estimado") return "col-Valor-Estimado";
          if (col === "Valor Executado") return "col-Valor-Executado";
          if (["Valor Contratado", "Valor"].includes(col)) return "col-Valor";
          return "";
        };
        const headersHtml = def.columns.map((c) => `<th class="${widthClass(c)}">${c}</th>`).join("");
        const rowsHtml = sourceRows
          .map((r) => {
            const data = def.mapRow(r);
            const formatted = data.map((v, i) => {
              const col = def.columns[i];
              let val: string;
              if (col.toLowerCase().includes("valor")) {
                val = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v) || 0);
              } else if (col.includes("Data")) {
                const dt = String(v || "");
                // Only format if it looks like a date and isn't already formatted (simple check)
                if (dt.includes("-") && dt.length === 10) {
                  const [y, m, d] = dt.split("-").map(Number);
                  val = new Date(y, m - 1, d).toLocaleDateString("pt-BR");
                } else {
                  val = dt;
                }
              } else {
                val = String(v).replace(/</g, "&lt;");
              }
              const align =
                col.toLowerCase().includes("valor")
                  ? "text-right"
                  : col === "Descrição"
                    ? "text-left"
                    : ["Cod. PCA", "Setor", "Prioridade", "Status", "Situação", "Conformidade"].includes(col) || col.includes("Data")
                      ? "text-center"
                      : "text-left";
              return `<td class="${align} ${widthClass(col)}">${val}</td>`;
            });
            return `<tr>${formatted.join("")}</tr>`;
          })
          .join("");
        const today = new Date().toLocaleString('pt-BR');
        const title = REPORT_TYPES[rType].title(sourceRows.length);
        const brand = "MPPI | PCA 2026";
        const primary = "#D9415D";
        const activeFilters = Object.entries(filtros).filter(([_, v]) => v && v !== "__all__");
        const labelMap: Record<string, string> = {
          unidade_orcamentaria: "UO",
          setor_requisitante: "Setor Requisitante",
          tipo_contratacao: "Tipo de Contratação",
          tipo_recurso: "Tipo de Recurso",
          classe: "Classe de Material",
          grau_prioridade: "Grau de Prioridade",
          normativo: "Normativo",
          modalidade: "Modalidade de Contratação",
          etapa_processo: "Status Atual",
          srp: "SRP?",
        };
        const filterHtml =
          activeFilters.length > 0
            ? `<div class="filters">
                <div class="filters-title">Filtros aplicados</div>
                <div class="filters-grid">
                  ${activeFilters
              .map(([key, val]) => {
                const label = labelMap[key] || key;
                const displayVal = key === "setor_requisitante" ? mapSetorName(String(val)) : String(val);
                return `<div class="chip"><span class="k">${label}:</span><span class="v">${displayVal}</span></div>`;
              })
              .join("")}
                </div>
              </div>`
            : "";
        const html = `<!doctype html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>${title}</title>
            <style>
              *{box-sizing:border-box}
              html,body{height:100%}
              body{font-family:system-ui,Segoe UI,Arial;margin:0;color:#111;-webkit-print-color-adjust:exact;print-color-adjust:exact}
              .page{padding:24px}
              .header{position:fixed;top:0;left:0;right:0;background:#fff}
              .header-inner{display:flex;align-items:center;justify-content:space-between;padding:16px 24px}
              .header .divider{height:3px;background:${primary};}
              .brand{display:flex;align-items:center;gap:12px}
              .brand img{height:40px;width:auto;border-radius:4px}
              .brand .title{font-size:16px;font-weight:700}
              .brand .meta{font-size:11px;color:#6b7280}
              .center-title{flex:1;text-align:center;font-size:16px;font-weight:700;color:#111}
              .center-subtitle{flex:1;text-align:center;font-size:12px;color:#374151;margin-top:2px}
              .content{margin-top:40mm;margin-bottom:25mm}
              .content{padding-top:6mm;padding-bottom:6mm}
              table{width:100%;border-collapse:collapse;margin-top:6mm;margin-bottom:6mm}
              table{table-layout:fixed}
              thead{display:table-header-group}
              tfoot{display:table-footer-group}
              th{background:#f9fafb;text-align:center;font-weight:600}
              td,th{border:1px solid #e5e7eb;padding:6px 8px;font-size:12px;word-break:break-word}
              td.text-right{text-align:right}
              td.text-left{text-align:left}
              td.text-center{text-align:center}
              .legend{font-size:11px;color:#6b7280;margin-bottom:8px;text-align:center}
              .filters{padding:4mm 0 2mm 0}
              .filters-title{font-size:12px;font-weight:600;color:#111;margin-bottom:2mm;text-align:left}
              .filters-grid{display:flex;flex-wrap:wrap;gap:6px}
              .chip{display:inline-flex;align-items:center;gap:4px;border:1px solid #e5e7eb;border-radius:6px;padding:4px 8px;font-size:11px;background:#f9fafb}
              .chip .k{color:#6b7280}
              /* Larguras otimizadas por coluna */
              .col-ID{width:12%}
              .col-Descrição{width:38%}
              .col-Setor{width:16%}
              /* Ajuste específico: reduzir setor e ampliar valores */
              .col-Setor{width:14%}
              .col-Valor-Estimado{width:16%}
              .col-Valor-Executado{width:16%}
              .col-Prioridade{width:12%}
              .col-Status{width:12%}
              .col-Data{width:12%}
              .col-SEI{width:20%}
              .col-Valor{width:14%}
              /* Quebra de linha aprimorada para descrição */
              td.col-Descrição{white-space:normal;hyphens:auto;line-height:1.35}
              .footer{position:fixed;bottom:0;left:0;right:0;background:#fff}
              .footer .divider{height:2px;background:${primary};}
              .footer-inner{display:flex;align-items:center;justify-content:space-between;padding:8px 24px;font-size:11px;color:#6b7280}
              .page-num::after{content: counter(page) " de " counter(pages);}
              @page{size:A4;margin:18mm 10mm 10mm 10mm}
              ${rType === "sei" ? `.col-Descrição{width:40%}.col-SEI{width:24%}` : ""}
            </style>
          </head>
          <body>
            <div class="header">
              <div class="header-inner">
                <div class="brand">
                  <img src="${logo}" alt="MPPI" />
                </div>
                <div style="flex:1">
                  <div class="center-title">${def.label}</div>
                  <div class="center-subtitle">Plano de Contratações Anual 2026 - ${title.replace(/Relatório.*?\((.*)\)/, "$1")}</div>
                </div>
              </div>
              <div class="divider"></div>
            </div>
            <div class="page">
              <div class="content">
                ${filterHtml}
                ${rType === "por_status" ? `<div class="legend">A coluna "Data de Referência" exibe: se o status for <strong>concluído</strong>, a data de finalização da licitação; caso contrário, a <strong>data de criação</strong> da contratação.</div>` : ""}
                <table>
                  <thead>
                    <tr>${headersHtml}</tr>
                  </thead>
                  <tbody>${rowsHtml}</tbody>
                  <tfoot><tr><td colspan="${def.columns.length}"></td></tr></tfoot>
                </table>
              </div>
            </div>
            <div class="footer">
              <div class="divider"></div>
              <div class="footer-inner">
                <div>${brand}</div>
                <div>Emitido em ${today}</div>
                <div class="page-num"></div>
              </div>
            </div>
            <script>
              window.onload = () => { setTimeout(() => { try { window.print(); } catch (e) {} }, 500); };
            </script>
          </body>
          </html>`;

        if (pdfWindow) {
          // Usamos Blob URL para evitar problemas de cache e restrições de segurança
          const blob = new Blob([html], { type: "text/html;charset=utf-8" });
          const url = URL.createObjectURL(blob);
          pdfWindow.location.href = url;
          // Revogamos a URL após um tempo seguro para garantir o carregamento
          setTimeout(() => URL.revokeObjectURL(url), 60000);
        }
      }
      toast.success("Relatório pronto", { description: `Exportado ${tipo.toUpperCase()}.` });
    } catch (e: any) {
      if (pdfWindow) {
        // Em caso de erro, escrevemos diretamente na janela
        pdfWindow.document.body.innerHTML = `<div style='padding:20px;color:red;font-family:sans-serif;'><h2>Erro ao gerar relatório</h2><p>${translateError(e.message || String(e))}</p></div>`;
      }
      toast.error("Falha na geração", { description: translateError(e.message || String(e)) });
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
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="flex flex-wrap md:flex-nowrap gap-2 items-center">
              <div className="w-28 shrink-0">
                <div className="text-[10px] font-medium text-muted-foreground px-1">UO:</div>
                <Select value={filtros.unidade_orcamentaria} onValueChange={(v) => setFiltros((f: any) => ({ ...f, unidade_orcamentaria: v }))}>
                  <SelectTrigger className="h-9 w-[110px] truncate px-3 text-sm"><SelectValue placeholder="" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem className="text-xs" value="__all__">Todos</SelectItem>
                    {distinctOptions.unidade_orcamentaria.map((opt) => <SelectItem className="text-xs" key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[130px] shrink-0">
                <div className="text-[10px] font-medium text-muted-foreground px-1">Setor Requisitante:</div>
                <Select value={filtros.setor_requisitante} onValueChange={(v) => setFiltros((f: any) => ({ ...f, setor_requisitante: v }))}>
                  <SelectTrigger className="h-9 w-[120px] truncate px-3 text-sm"><SelectValue placeholder="" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem className="text-xs" value="__all__">Todos</SelectItem>
                    {distinctOptions.setor_requisitante.map((opt) => <SelectItem className="text-xs" key={opt} value={opt}>{mapSetorName(opt)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[160px] shrink-0 -ml-1">
                <div className="text-[10px] font-medium text-muted-foreground px-1">Tipo de Contratação:</div>
                <Select value={filtros.tipo_contratacao} onValueChange={(v) => setFiltros((f: any) => ({ ...f, tipo_contratacao: v }))}>
                  <SelectTrigger className="h-9 w-full truncate px-3 text-sm"><SelectValue placeholder="" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem className="text-xs" value="__all__">Todos</SelectItem>
                    {distinctOptions.tipo_contratacao.map((opt) => <SelectItem className="text-xs" key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[130px] shrink-0">
                <div className="text-[10px] font-medium text-muted-foreground px-1">Tipo de Recurso:</div>
                <Select value={filtros.tipo_recurso} onValueChange={(v) => setFiltros((f: any) => ({ ...f, tipo_recurso: v }))}>
                  <SelectTrigger className="h-9 w-[120px] truncate px-3 text-sm"><SelectValue placeholder="" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem className="text-xs" value="__all__">Todos</SelectItem>
                    {distinctOptions.tipo_recurso.map((opt) => <SelectItem className="text-xs" key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[170px] shrink-0 -ml-1">
                <div className="text-[10px] font-medium text-muted-foreground px-1">Classe de Material:</div>
                <Select value={filtros.classe} onValueChange={(v) => setFiltros((f: any) => ({ ...f, classe: v }))}>
                  <SelectTrigger className="h-9 w-full truncate px-3 text-sm"><SelectValue placeholder="" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem className="text-xs" value="__all__">Todos</SelectItem>
                    {distinctOptions.classe.map((opt) => <SelectItem className="text-xs" key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[130px] shrink-0">
                <div className="text-[10px] font-medium text-muted-foreground px-1">Grau de Prioridade:</div>
                <Select value={filtros.grau_prioridade} onValueChange={(v) => setFiltros((f: any) => ({ ...f, grau_prioridade: v }))}>
                  <SelectTrigger className="h-9 w-[120px] truncate px-3 text-sm"><SelectValue placeholder="" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem className="text-xs" value="__all__">Todos</SelectItem>
                    {distinctOptions.grau_prioridade.map((opt) => <SelectItem className="text-xs" key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[130px] shrink-0 -ml-1">
                <div className="text-[10px] font-medium text-muted-foreground px-1">Normativo:</div>
                <Select value={filtros.normativo} onValueChange={(v) => setFiltros((f: any) => ({ ...f, normativo: v }))}>
                  <SelectTrigger className="h-9 w-[120px] truncate px-3 text-sm"><SelectValue placeholder="" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem className="text-xs" value="__all__">Todos</SelectItem>
                    <SelectItem className="text-xs" value="14.133/2021">14.133/2021</SelectItem>
                    <SelectItem className="text-xs" value="8.666/1993">8.666/1993</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[160px] shrink-0 -ml-1">
                <div className="text-[10px] font-medium text-muted-foreground px-1">Modalidade de Contratação:</div>
                <Select value={filtros.modalidade} onValueChange={(v) => setFiltros((f: any) => ({ ...f, modalidade: v }))}>
                  <SelectTrigger className="h-9 w-full truncate px-3 text-sm"><SelectValue placeholder="" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem className="text-xs" value="__all__">Todos</SelectItem>
                    {distinctOptions.modalidade.map((opt) => <SelectItem className="text-xs" key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[100px] shrink-0 -ml-1">
                <div className="text-[10px] font-medium text-muted-foreground px-1">SRP:</div>
                <Select value={filtros.srp} onValueChange={(v) => setFiltros((f: any) => ({ ...f, srp: v }))}>
                  <SelectTrigger className="h-9 w-full truncate px-3 text-sm"><SelectValue placeholder="" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem className="text-xs" value="__all__">Todos</SelectItem>
                    <SelectItem className="text-xs" value="Sim">Sim</SelectItem>
                    <SelectItem className="text-xs" value="Não">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[130px] shrink-0">
                <div className="text-[10px] font-medium text-muted-foreground px-1">Status Atual:</div>
                <Select value={filtros.etapa_processo} onValueChange={(v) => setFiltros((f: any) => ({ ...f, etapa_processo: v }))}>
                  <SelectTrigger className="h-9 w-[120px] truncate px-3 text-sm"><SelectValue placeholder="" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem className="text-xs" value="__all__">Todos</SelectItem>
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
          <CardHeader>
            <CardTitle>Catálogo de Relatórios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              {Object.entries(REPORT_TYPES).map(([key, def]) => (
                <div 
                  key={key} 
                  className="group relative flex items-center justify-between p-5 rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-xl hover:border-primary/40 hover:bg-accent/5 overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary transform -translate-x-full transition-transform duration-300 group-hover:translate-x-0" />
                  <div className="flex items-center gap-5 transition-transform duration-300 group-hover:translate-x-1">
                    <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white shadow-sm">
                      <def.icon className="h-7 w-7" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                          {def.label}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                        {def.description}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      variant="outline" 
                      className="h-10 px-4 gap-2 border-primary/30 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                      onClick={() => handleGenerate("csv", key)}
                    >
                      <FileSearch className="h-4 w-4" />
                      <span className="font-semibold">Gerar CSV</span>
                    </Button>
                    <Button 
                      className="h-10 px-4 gap-2 bg-primary text-white hover:bg-primary/90 transition-all shadow-md hover:shadow-primary/20"
                      onClick={() => handleGenerate("pdf", key)}
                    >
                      <FileText className="h-4 w-4" />
                      <span className="font-semibold">Gerar PDF</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Relatorios;
