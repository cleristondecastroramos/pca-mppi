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
import { Calendar as CalendarIcon, FileText, BarChart3, ClipboardList, BadgeCheck, DollarSign, FileSearch, CalendarDays, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

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
  });

  const formatId = (id: any, codigo?: any) => codigo ? codigo : `${String(id).slice(-8)}`;
  const getErrorMessage = (e: any) => {
    try {
      if (typeof e === "string") return e;
      const m = e?.message || e?.error?.message;
      if (m) return m;
      return JSON.stringify(e);
    } catch {
      return String(e);
    }
  };
  const selectBase =
    "id, codigo, descricao, unidade_orcamentaria, setor_requisitante, tipo_contratacao, tipo_recurso, classe, grau_prioridade, normativo, modalidade, numero_sei_contratacao, etapa_processo, sobrestado, created_at, data_finalizacao_licitacao, valor_estimado, valor_contratado, data_prevista_contratacao";
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
    } catch (e) {
      toast.error("Falha ao normalizar normativo", { description: getErrorMessage(e) });
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
    detalhado: {
      label: "Contratações — Detalhado",
      description: "Listagem completa com ID, descrição, setor, prioridade e valores (estimado e executado).",
      icon: FileText,
      columns: ["ID", "Descrição", "Setor", "Prioridade", "Valor Estimado", "Valor Executado"],
      csvColumns: ["ID", "Descrição", "Setor", "Prioridade", "Valor Estimado", "Valor Executado"],
      mapRow: (r) => [
        formatId(r.id, r.codigo),
        String(r.descricao || ""),
        r.setor_requisitante || "",
        r.grau_prioridade || "",
        r.valor_estimado || 0,
        (r as any).valor_executado ?? r.valor_contratado ?? 0,
      ],
      title: (n) => `Relatório Detalhado de Contratações (${n} registros)`,
    },
    por_status: {
      label: "Contratações — Por Status",
      description: "Listagem focada no status e andamento das contratações.",
      icon: BarChart3,
      columns: ["ID", "Descrição", "Status", "Data de Referência", "Valor Executado"],
      csvColumns: ["ID", "Descrição", "Status", "Data de Referência", "Valor Executado"],
      mapRow: (r) => [
        formatId(r.id, r.codigo),
        String(r.descricao || ""),
        r.sobrestado === true
          ? "sobrestado"
          : r.etapa_processo === "Concluído"
          ? "concluído"
          : r.etapa_processo === "Em Licitação" || r.etapa_processo === "Contratado"
          ? "em andamento"
          : "não iniciado",
        r.data_finalizacao_licitacao || r.created_at || "",
        (r as any).valor_executado ?? r.valor_contratado ?? 0,
      ],
      title: (n) => `Relatório por Status (${n} registros)`,
    },
    por_setor: {
      label: "Contratações — Por Setor",
      description: "Listagem agrupável por setor requisitante.",
      icon: ClipboardList,
      columns: ["ID", "Descrição", "Setor", "Status", "Valor Estimado", "Valor Executado"],
      csvColumns: ["ID", "Descrição", "Setor", "Status", "Valor Estimado", "Valor Executado"],
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
      columns: ["ID", "Descrição", "Prioridade", "Setor", "Status", "Valor Estimado"],
      csvColumns: ["ID", "Descrição", "Prioridade", "Setor", "Status", "Valor Estimado"],
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
      columns: ["ID", "Descrição", "Valor Estimado", "Valor Contratado", "Valor Executado"],
      csvColumns: ["ID", "Descrição", "Valor Estimado", "Valor Contratado", "Valor Executado"],
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
      columns: ["ID", "Descrição", "SEI", "Status"],
      csvColumns: ["ID", "Descrição", "SEI", "Status"],
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
      columns: ["ID", "Descrição", "Setor", "Conformidade", "Status"],
      csvColumns: ["ID", "Descrição", "Setor", "Conformidade", "Status"],
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
      columns: ["ID", "Descrição", "Setor", "Data Prevista", "Situação"],
      csvColumns: ["ID", "Descrição", "Setor", "Data Prevista", "Situação"],
      mapRow: (r) => {
         const status = getPrazoStatus(r);
         return [
            formatId(r.id, r.codigo),
            String(r.descricao || ""),
            r.setor_requisitante || "",
            r.data_prevista_contratacao ? new Date(r.data_prevista_contratacao).toLocaleDateString("pt-BR") : "—",
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
      } catch (e) {
        toast.error("Erro ao carregar dados", { description: getErrorMessage(e) });
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
      console.log("Gerando relatório tipo:", rType); // Debug
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
        a.download = "relatorio.csv";
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const logo = `${location.origin}/logo-mppi.png`;
        const widthClass = (col: string) => {
          if (col === "ID") return "col-ID";
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
                    val = new Date(dt).toLocaleDateString("pt-BR");
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
                  : ["ID", "Setor", "Prioridade", "Status", "Situação", "Conformidade"].includes(col) || col.includes("Data")
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
    } catch (e) {
      if (pdfWindow) {
        // Em caso de erro, escrevemos diretamente na janela
        pdfWindow.document.body.innerHTML = `<div style='padding:20px;color:red;font-family:sans-serif;'><h2>Erro ao gerar relatório</h2><p>${getErrorMessage(e)}</p></div>`;
      }
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
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="flex flex-wrap md:flex-nowrap gap-2 items-center">
              <div className="w-28 shrink-0">
                <div className="text-[10px] text-black px-1">UO:</div>
                <Select value={filtros.unidade_orcamentaria} onValueChange={(v) => setFiltros((f: any) => ({ ...f, unidade_orcamentaria: v }))}>
                  <SelectTrigger className="h-9 w-[110px] truncate px-3 text-sm"><SelectValue placeholder="" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem className="text-xs" value="__all__">Todos</SelectItem>
                    {distinctOptions.unidade_orcamentaria.map((opt) => <SelectItem className="text-xs" key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[130px] shrink-0">
                <div className="text-[10px] text-black px-1">Setor Requisitante:</div>
                <Select value={filtros.setor_requisitante} onValueChange={(v) => setFiltros((f: any) => ({ ...f, setor_requisitante: v }))}>
                  <SelectTrigger className="h-9 w-[120px] truncate px-3 text-sm"><SelectValue placeholder="" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem className="text-xs" value="__all__">Todos</SelectItem>
                    {distinctOptions.setor_requisitante.map((opt) => <SelectItem className="text-xs" key={opt} value={opt}>{mapSetorName(opt)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[160px] shrink-0 -ml-1">
                <div className="text-[10px] text-black px-1">Tipo de Contratação:</div>
                <Select value={filtros.tipo_contratacao} onValueChange={(v) => setFiltros((f: any) => ({ ...f, tipo_contratacao: v }))}>
                  <SelectTrigger className="h-9 w-full truncate px-3 text-sm"><SelectValue placeholder="" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem className="text-xs" value="__all__">Todos</SelectItem>
                    {distinctOptions.tipo_contratacao.map((opt) => <SelectItem className="text-xs" key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[130px] shrink-0">
                <div className="text-[10px] text-black px-1">Tipo de Recurso:</div>
                <Select value={filtros.tipo_recurso} onValueChange={(v) => setFiltros((f: any) => ({ ...f, tipo_recurso: v }))}>
                  <SelectTrigger className="h-9 w-[120px] truncate px-3 text-sm"><SelectValue placeholder="" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem className="text-xs" value="__all__">Todos</SelectItem>
                    {distinctOptions.tipo_recurso.map((opt) => <SelectItem className="text-xs" key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[170px] shrink-0 -ml-1">
                <div className="text-[10px] text-black px-1">Classe de Material:</div>
                <Select value={filtros.classe} onValueChange={(v) => setFiltros((f: any) => ({ ...f, classe: v }))}>
                  <SelectTrigger className="h-9 w-full truncate px-3 text-sm"><SelectValue placeholder="" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem className="text-xs" value="__all__">Todos</SelectItem>
                    {distinctOptions.classe.map((opt) => <SelectItem className="text-xs" key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[130px] shrink-0">
                <div className="text-[10px] text-black px-1">Grau de Prioridade:</div>
                <Select value={filtros.grau_prioridade} onValueChange={(v) => setFiltros((f: any) => ({ ...f, grau_prioridade: v }))}>
                  <SelectTrigger className="h-9 w-[120px] truncate px-3 text-sm"><SelectValue placeholder="" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem className="text-xs" value="__all__">Todos</SelectItem>
                    {distinctOptions.grau_prioridade.map((opt) => <SelectItem className="text-xs" key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[130px] shrink-0 -ml-1">
                <div className="text-[10px] text-black px-1">Normativo:</div>
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
                <div className="text-[10px] text-black px-1">Modalidade de Contratação:</div>
                <Select value={filtros.modalidade} onValueChange={(v) => setFiltros((f: any) => ({ ...f, modalidade: v }))}>
                  <SelectTrigger className="h-9 w-full truncate px-3 text-sm"><SelectValue placeholder="" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem className="text-xs" value="__all__">Todos</SelectItem>
                    {distinctOptions.modalidade.map((opt) => <SelectItem className="text-xs" key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[130px] shrink-0">
                <div className="text-[10px] text-black px-1">Status Atual:</div>
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
            <div className="space-y-3">
              {Object.entries(REPORT_TYPES).map(([key, def]) => (
                <div key={key} className="border rounded p-3 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 font-medium">
                      <def.icon className="h-4 w-4 text-muted-foreground" />
                      {def.label}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{def.description}</div>
                  </div>
                  <div className="mt-1">
                    <Button size="xs" className="gap-1 bg-primary text-white hover:bg-primary/90" onClick={() => handleGenerate("pdf", key)}>
                      <FileText className="h-3 w-3" />
                      Gerar PDF
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
