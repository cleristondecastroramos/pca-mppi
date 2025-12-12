import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Edit, History, Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import type { Tables } from "@/integrations/supabase/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

type Contratacao = Tables<"contratacoes">;
type HistoricoItem = Tables<"contratacoes_historico"> & {
  profiles?: { nome_completo: string | null } | null;
};

export default function Contratacoes() {
  const [contratacoes, setContratacoes] = useState<Contratacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingContratacao, setEditingContratacao] = useState<Contratacao | null>(null);
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [showHistorico, setShowHistorico] = useState(false);
  const [selectedContratacaoId, setSelectedContratacaoId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();

  // Filtros iguais à aba Visão Geral
  const ALL_VALUE = "__all__";
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
  const setFiltro = (key: keyof Filtros, value: string) => setFiltros((prev) => ({ ...prev, [key]: value }));
  const clearFiltros = () => setFiltros(defaultFiltros);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      await fetchContratacoes();
    };
    run();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      if (mounted) fetchContratacoes();
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [page, pageSize, searchTerm, filtros]);

  const fetchContratacoes = async () => {
    setLoading(true);
    try {
      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;
      let query = supabase
        .from("contratacoes")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(start, end);

      const term = searchTerm.trim();
      if (term) {
        const like = `%${term}%`;
        query = query.or(
          `descricao.ilike.${like},setor_requisitante.ilike.${like},classe.ilike.${like}`
        );
      }

      const applyEq = (field: keyof Filtros, column: string) => {
        const v = filtros[field];
        if (v && v !== ALL_VALUE) query = query.eq(column, v);
      };
      applyEq("unidade_orcamentaria", "unidade_orcamentaria");
      applyEq("setor_requisitante", "setor_requisitante");
      applyEq("tipo_contratacao", "tipo_contratacao");
      applyEq("tipo_recurso", "tipo_recurso");
      applyEq("classe", "classe");
      applyEq("grau_prioridade", "grau_prioridade");
      applyEq("normativo", "normativo");
      applyEq("modalidade", "modalidade");

      const status = filtros.etapa_processo;
      if (status && status !== ALL_VALUE) {
        if (status === "sobrestado") {
          query = query.eq("sobrestado", true as any);
        } else if (status === "não iniciado") {
          query = query.is("etapa_processo", null).or("etapa_processo.eq.Planejamento");
        } else if (status === "em andamento") {
          query = query.in("etapa_processo", ["Em Licitação", "Contratado"]);
        } else if (status === "concluído") {
          query = query.eq("etapa_processo", "Concluído");
        } else {
          query = query.eq("etapa_processo", status);
        }
      }

      const { data, error, count } = await query as any;
      if (error) throw error;
      setContratacoes(data || []);
      setTotalCount(count || 0);
    } catch (error: any) {
      console.error("Erro ao buscar contratações:", error);
      toast.error("Erro ao carregar contratações", { description: error?.message || String(error) });
    } finally {
      setLoading(false);
    }
  };

  const fetchHistorico = async (contratacaoId: string) => {
    try {
      // Buscar histórico
      const { data: historicoData, error: historicoError } = await supabase
        .from("contratacoes_historico")
        .select("*")
        .eq("contratacao_id", contratacaoId)
        .order("created_at", { ascending: false });

      if (historicoError) throw historicoError;

      // Buscar dados dos usuários para cada entrada do histórico
      const historicoComUsuarios = await Promise.all(
        (historicoData || []).map(async (item) => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("nome_completo")
            .eq("id", item.user_id)
            .single();

          return {
            ...item,
            profiles: profileData,
          };
        })
      );

      setHistorico(historicoComUsuarios);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      toast.error("Erro ao carregar histórico");
    }
  };

  const handleEdit = async (contratacao: Contratacao) => {
    setEditingContratacao({ ...contratacao });
  };

  const handleSaveEdit = async () => {
    if (!editingContratacao) return;

    try {
      // Buscar dados anteriores para o histórico
      const { data: dadosAnteriores } = await supabase
        .from("contratacoes")
        .select("*")
        .eq("id", editingContratacao.id)
        .single();

      // Mapear seleção de status para persistência em etapa_processo e sobrestado
      const mapStatusToPersistence = (
        selected: string | null,
        currentEtapa: string | null
      ): { etapa: string | null; sobrestado: boolean } => {
        if (!selected) return { etapa: currentEtapa, sobrestado: false };
        switch (selected) {
          case "sobrestado":
            return { etapa: currentEtapa || "Planejamento", sobrestado: true };
          case "não iniciado":
            return { etapa: "Planejamento", sobrestado: false };
          case "em andamento":
            return { etapa: currentEtapa === "Contratado" ? "Contratado" : "Em Licitação", sobrestado: false };
          case "concluído":
            return { etapa: "Concluído", sobrestado: false };
          default:
            // Etapas específicas (não utilizadas quando apenas categorias)
            return { etapa: selected, sobrestado: false };
        }
      };

      // Se o usuário marcou "Sobrestado" no estado local, prioriza persistência desse flag
      const isSobrestadoLocal = (editingContratacao as any)?.sobrestado === true;
      const mapped = isSobrestadoLocal
        ? {
            etapa: editingContratacao.etapa_processo || dadosAnteriores?.etapa_processo || "Planejamento",
            sobrestado: true,
          }
        : mapStatusToPersistence(
            editingContratacao.etapa_processo || null,
            dadosAnteriores?.etapa_processo || null
          );

      // Atualizar contratação
      const { error: updateError } = await supabase
        .from("contratacoes")
        .update({
          descricao: editingContratacao.descricao,
          setor_requisitante: editingContratacao.setor_requisitante,
          unidade_orcamentaria: editingContratacao.unidade_orcamentaria,
          classe: editingContratacao.classe,
          valor_estimado: editingContratacao.valor_estimado,
          valor_contratado: editingContratacao.valor_contratado,
          numero_sei_contratacao: (editingContratacao as any).numero_sei_contratacao || null,
          etapa_processo: mapped.etapa,
          sobrestado: mapped.sobrestado,
          grau_prioridade: editingContratacao.grau_prioridade,
          justificativa: editingContratacao.justificativa,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingContratacao.id);

      if (updateError) {
        const msg = String(updateError.message || updateError);
        if (msg.includes("Saldo orçamentário insuficiente") || msg.includes("saldo orçamentário insuficiente")) {
          toast.error("Saldo orçamentário insuficiente na UO selecionada. Solicite autorização do administrador para excedente.");
        } else {
          toast.error("Erro ao salvar alterações");
        }
        throw updateError;
      }

      // Registrar no histórico
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        await supabase.from("contratacoes_historico").insert({
          contratacao_id: editingContratacao.id,
          user_id: userData.user.id,
          acao: "Edição",
          dados_anteriores: dadosAnteriores,
          dados_novos: editingContratacao,
        });
      }

      toast.success("Contratação atualizada com sucesso");
      setEditingContratacao(null);
      fetchContratacoes();
    } catch (error) {
      console.error("Erro ao salvar edição:", error);
      toast.error("Erro ao salvar alterações");
    }
  };

  const handleShowHistorico = (contratacaoId: string) => {
    setSelectedContratacaoId(contratacaoId);
    setShowHistorico(true);
    fetchHistorico(contratacaoId);
  };

  const getStatusBadge = (status: string | null) => {
    const variants: Record<string, { variant: any; className: string }> = {
      "não iniciado": { variant: "secondary", className: "bg-info/10 text-info hover:bg-info/20" },
      "em andamento": { variant: "secondary", className: "bg-warning/10 text-warning hover:bg-warning/20" },
      "concluído": { variant: "secondary", className: "bg-success/10 text-success hover:bg-success/20" },
      "sobrestado": { variant: "secondary", className: "bg-muted/10 text-muted-foreground hover:bg-muted/20" },
    };
    return variants[status || "não iniciado"] || variants["não iniciado"];
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const variants: Record<string, { variant: any; className: string }> = {
      "Alta": { variant: "destructive", className: "" },
      "Média": { variant: "secondary", className: "bg-warning/10 text-warning hover:bg-warning/20" },
      "Baixa": { variant: "secondary", className: "bg-muted text-muted-foreground" },
    };
    return variants[prioridade] || variants["Média"];
  };

  // Opções distintas para os seletores (copiando a lógica da Visão Geral)
  const distinctOptions = (() => {
    const build = (key: keyof Contratacao) => {
      const s = new Set<string>();
      contratacoes.forEach((r) => {
        const v = r[key] as unknown as string | null;
        if (v && String(v).trim() !== "") s.add(String(v));
      });
      return Array.from(s).sort((a, b) => a.localeCompare(b, "pt-BR"));
    };
    const PRIORITY_UO = ["PGJ", "FMMP", "FEPDC"];
    const rawUO = build("unidade_orcamentaria" as any);
    const orderedUO = [
      ...PRIORITY_UO.filter((x) => rawUO.includes(x)),
      ...rawUO.filter((x) => !PRIORITY_UO.includes(x)).sort((a, b) => a.localeCompare(b, "pt-BR")),
    ];
    const PRIORITY_PRIORIDADE = ["Alta", "Média", "Baixa"];
    const rawPrioridade = build("grau_prioridade" as any);
    const orderedPrioridade = [
      ...PRIORITY_PRIORIDADE.filter((x) => rawPrioridade.includes(x)),
      ...rawPrioridade
        .filter((x) => !PRIORITY_PRIORIDADE.includes(x))
        .sort((a, b) => a.localeCompare(b, "pt-BR")),
    ];
    return {
      unidade_orcamentaria: orderedUO,
      setor_requisitante: build("setor_requisitante" as any),
      tipo_contratacao: build("tipo_contratacao" as any),
      tipo_recurso: build("tipo_recurso" as any),
      classe: build("classe" as any),
      grau_prioridade: orderedPrioridade,
      normativo: build("normativo" as any),
      modalidade: build("modalidade" as any),
      etapa_processo: build("etapa_processo" as any),
    };
  })();

  const displayedContratacoes = contratacoes;

  const [scrollTop, setScrollTop] = useState(0);
  const rowHeight = 44;
  const visibleCount = 20;
  const buffer = 10;
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - buffer);
  const endIndex = Math.min(displayedContratacoes.length, startIndex + visibleCount + buffer * 2);
  const topPad = startIndex * rowHeight;
  const bottomPad = (displayedContratacoes.length - endIndex) * rowHeight;

  const formatCurrency = (value: number | null) => {
    if (!value) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Helpers para campos monetários com separador de milhar e duas casas decimais
  const formatCurrencyInput = (value: string) => {
    const digits = value.replace(/[^0-9]/g, "");
    const num = Number(digits) / 100;
    return num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Formata um número já existente (vindo do banco) sem aplicar divisão por 100
  const formatCurrencyNumber = (value: number | null | undefined) => {
    const num = typeof value === "number" && !isNaN(value) ? value : 0;
    return num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const parseCurrencyInput = (value: string) => {
    const normalized = value.replace(/\./g, "").replace(/,/g, ".");
    const num = parseFloat(normalized);
    return isNaN(num) ? 0 : num;
  };

  // Máscara para Número SEI: XX.XX.XXXX.XXXXXXX/XXXX-XX
  const formatNumeroSeiInput = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 21);
    const lens = [2, 2, 4, 7, 4, 2];
    const seps = [".", ".", ".", "/", "-"];
    let out = "";
    let idx = 0;
    for (let i = 0; i < lens.length; i++) {
      const l = lens[i];
      const seg = digits.slice(idx, idx + l);
      if (!seg) break;
      out += seg;
      idx += seg.length;
      if (seg.length === l && i < seps.length && digits.length > idx) out += seps[i];
    }
    return out;
  };

  const formatSetor = (setor: string | null) => {
    if (!setor) return "-";
    if (setor === "PLANEJAMENTO") return "PLAN";
    return setor;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  // Labels amigáveis para campos exibidos no histórico
  const HISTORICO_LABELS: Record<string, string> = {
    descricao: "Descrição",
    setor_requisitante: "Setor Requisitante",
    unidade_orcamentaria: "UO",
    classe: "Classe de Material",
    tipo_contratacao: "Tipo de Contratação",
    tipo_recurso: "Tipo de Recurso",
    modalidade: "Modalidade",
    normativo: "Normativo",
    grau_prioridade: "Prioridade",
    etapa_processo: "Status Atual",
    numero_sei_contratacao: "Número SEI",
    valor_estimado: "Valor Estimado (R$)",
    valor_contratado: "Valor Executado (R$)",
    justificativa: "Justificativa",
  };

  const HISTORICO_CAMPOS: string[] = [
    "descricao",
    "setor_requisitante",
    "unidade_orcamentaria",
    "classe",
    "tipo_contratacao",
    "tipo_recurso",
    "modalidade",
    "normativo",
    "grau_prioridade",
    "etapa_processo",
    "numero_sei_contratacao",
    "valor_estimado",
    "valor_contratado",
    "justificativa",
  ];

  const formatFieldValue = (key: string, value: any): string => {
    if (value === null || value === undefined || value === "") return "-";
    switch (key) {
      case "valor_estimado":
      case "valor_contratado": {
        const num = typeof value === "number" ? value : parseFloat(String(value));
        return `R$ ${formatCurrencyNumber(isNaN(num) ? 0 : num)}`;
      }
      case "setor_requisitante":
        return formatSetor(String(value));
      case "numero_sei_contratacao":
        return formatNumeroSeiInput(String(value));
      case "created_at":
      case "updated_at":
        return formatDate(String(value));
      default:
        return String(value);
    }
  };

  const buildChangesList = (prev: any, next: any) => {
    const keys = HISTORICO_CAMPOS.filter(
      (k) => (prev && k in prev) || (next && k in next)
    );
    const changes = keys
      .map((key) => {
        const oldVal = prev ? prev[key] : undefined;
        const newVal = next ? next[key] : undefined;
        const changed = JSON.stringify(oldVal) !== JSON.stringify(newVal);
        if (!changed) return null;
        return {
          key,
          label: HISTORICO_LABELS[key] || key,
          old: formatFieldValue(key, oldVal),
          new: formatFieldValue(key, newVal),
        };
      })
      .filter(Boolean) as { key: string; label: string; old: string; new: string }[];
    return changes;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Carregando contratações...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Contratações</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie todas as contratações do PCA 2026 ({totalCount} registros)
            </p>
          </div>
          <Link to="/nova-contratacao">
            <Button size="xs">
              <Plus className="h-4 w-4 mr-1" />
              Nova Contratação
            </Button>
          </Link>
        </div>

        {/* Barra de filtros discretos (copiada da aba Visão Geral) */}
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
                      <SelectItem className="text-xs" key={opt} value={opt}>{formatSetor(opt)}</SelectItem>
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

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por descrição, setor, classe..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="xs">
            <Filter className="h-4 w-4 mr-1" />
            Filtros
          </Button>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <Table containerClassName="max-h-[60vh]" onContainerScroll={(e) => setScrollTop((e.target as HTMLDivElement).scrollTop)}>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center w-[90px]">ID</TableHead>
                <TableHead className="text-center w-[280px]">Descrição</TableHead>
                <TableHead className="text-center w-[120px]">Setor</TableHead>
                <TableHead className="text-center w-[140px]">Classe</TableHead>
                <TableHead className="text-center w-[140px]">Valor Estimado</TableHead>
                <TableHead className="text-center w-[140px]">Valor Executado</TableHead>
                <TableHead className="text-center w-[130px]">Status</TableHead>
                <TableHead className="text-center w-[120px]">Prioridade</TableHead>
                <TableHead className="text-center w-[120px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedContratacoes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "Nenhuma contratação encontrada com os critérios de busca." : "Nenhuma contratação cadastrada."}
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  <TableRow className="border-0" style={{ height: topPad }} />
                  {displayedContratacoes.slice(startIndex, endIndex).map((contratacao) => (
                  <TableRow key={contratacao.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      #{contratacao.id.slice(-8)}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={contratacao.descricao}>
                        {contratacao.descricao}
                      </div>
                    </TableCell>
                    <TableCell>{formatSetor(contratacao.setor_requisitante)}</TableCell>
                    <TableCell>{contratacao.classe || "-"}</TableCell>
                    <TableCell className="text-right w-[140px]">
                      {formatCurrency(contratacao.valor_estimado)}
                    </TableCell>
                    <TableCell className="text-right w-[140px]">
                      {formatCurrency(contratacao.valor_contratado)}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const getCategory = (c: Contratacao) => {
                          if ((c as any).sobrestado === true) return "sobrestado";
                          if (c.etapa_processo === "Em Licitação" || c.etapa_processo === "Contratado") return "em andamento";
                          if (c.etapa_processo === "Concluído") return "concluído";
                          return "não iniciado";
                        };
                        const label = getCategory(contratacao);
                        const badge = getStatusBadge(label);
                        return (
                          <Badge
                            variant={badge.variant}
                            className={badge.className}
                          >
                            {label}
                          </Badge>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getPrioridadeBadge(contratacao.grau_prioridade).variant}
                        className={getPrioridadeBadge(contratacao.grau_prioridade).className}
                      >
                        {contratacao.grau_prioridade}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleEdit(contratacao)}
                          title="Editar contratação"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleShowHistorico(contratacao.id)}
                          title="Ver histórico"
                        >
                          <History className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          title="Ver detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  ))}
                  <TableRow className="border-0" style={{ height: bottomPad }} />
                </>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">Página {page} • {displayedContratacoes.length} de {totalCount} registros</div>
          <div className="flex items-center gap-2">
            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Itens por página" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 por página</SelectItem>
                <SelectItem value="20">20 por página</SelectItem>
                <SelectItem value="50">50 por página</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="xs" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Anterior</Button>
              <div className="text-sm">{page}</div>
              <Button variant="outline" size="xs" onClick={() => setPage((p) => p + 1)} disabled={page * pageSize >= totalCount}>Próxima</Button>
            </div>
          </div>
        </div>

        {/* Dialog de Edição */}
        <Dialog open={!!editingContratacao} onOpenChange={() => setEditingContratacao(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader className="bg-[#D9415D] text-destructive-foreground -mx-6 -mt-6 px-6 py-4 rounded-t-md">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded bg-[#D9415D]/20 flex items-center justify-center text-destructive-foreground">
                  <Pencil className="h-4 w-4" />
                </div>
                <DialogTitle className="text-lg">Editar Contratação</DialogTitle>
              </div>
              <DialogDescription className="text-xs text-destructive-foreground/80">
                Faça as alterações necessárias na contratação. Todas as mudanças serão registradas no histórico.
              </DialogDescription>
            </DialogHeader>
            {editingContratacao && (
              <div className="space-y-6 pt-3">
                {/* Linha 1: Descrição ocupa a linha inteira */}
                <div className="space-y-2">
                  <Label htmlFor="edit-descricao" className="text-[12px] text-muted-foreground">Descrição:</Label>
                  <Textarea
                    id="edit-descricao"
                    value={editingContratacao.descricao}
                    onChange={(e) =>
                      setEditingContratacao({ ...editingContratacao, descricao: e.target.value })
                    }
                    className="min-h-[90px]"
                  />
                </div>

                {/* Linha 2: Número SEI + Setor Requisitante + Unidade Orçamentária + Classe */}
                <div className="grid gap-4 sm:grid-cols-6">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="edit-sei" className="text-[12px] text-muted-foreground">Número SEI:</Label>
                    <Input
                      id="edit-sei"
                      type="text"
                      inputMode="numeric"
                      placeholder="__.__.____._______/____-__"
                      maxLength={26}
                      value={(editingContratacao as any).numero_sei_contratacao || ""}
                      onChange={(e) => {
                        const formatted = formatNumeroSeiInput(e.target.value);
                        e.currentTarget.value = formatted;
                        setEditingContratacao({
                          ...editingContratacao,
                          numero_sei_contratacao: formatted || null,
                        } as any);
                      }}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-1">
                    <Label htmlFor="edit-setor" className="text-[12px] text-muted-foreground">Setor Requisitante:</Label>
                    <Select
                      value={editingContratacao.setor_requisitante}
                      onValueChange={(value) =>
                        setEditingContratacao({ ...editingContratacao, setor_requisitante: value })
                      }
                    >
                      <SelectTrigger className="h-9 px-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CAA">CAA</SelectItem>
                        <SelectItem value="CCF">CCF</SelectItem>
                        <SelectItem value="CCS">CCS</SelectItem>
                        <SelectItem value="CLC">CLC</SelectItem>
                        <SelectItem value="CPPT">CPPT</SelectItem>
                        <SelectItem value="CTI">CTI</SelectItem>
                        <SelectItem value="CRH">CRH</SelectItem>
                        <SelectItem value="CEAF">CEAF</SelectItem>
                        <SelectItem value="GAECO">GAECO</SelectItem>
                        <SelectItem value="GSI">GSI</SelectItem>
                        <SelectItem value="CONINT">CONINT</SelectItem>
                        <SelectItem value="PLANEJAMENTO">PLANEJAMENTO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-1">
                    <Label htmlFor="edit-uo" className="text-[12px] text-muted-foreground">UO:</Label>
                    <Select
                      value={editingContratacao.unidade_orcamentaria || undefined}
                      onValueChange={(value) =>
                        setEditingContratacao({ ...editingContratacao, unidade_orcamentaria: value })
                      }
                    >
                      <SelectTrigger className="h-9 px-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PGJ">PGJ</SelectItem>
                        <SelectItem value="FMMP">FMMP</SelectItem>
                        <SelectItem value="FEPDC">FEPDC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="edit-classe" className="text-[12px] text-muted-foreground">Classe de Material:</Label>
                    <Select
                      value={editingContratacao.classe || undefined}
                      onValueChange={(value) =>
                        setEditingContratacao({ ...editingContratacao, classe: value })
                      }
                    >
                      <SelectTrigger className="h-9 px-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Todos">Todos</SelectItem>
                        <SelectItem value="Material de Consumo">Material de Consumo</SelectItem>
                        <SelectItem value="Material Permanente">Material Permanente</SelectItem>
                        <SelectItem value="Obra">Obra</SelectItem>
                        <SelectItem value="Serviço">Serviço</SelectItem>
                        <SelectItem value="Serviço de TI">Serviço de TI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Linha 3: Valores, Prioridade e Status juntos */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-valor" className="text-[12px] text-muted-foreground">Valor Estimado (R$):</Label>
                    <Input
                      id="edit-valor"
                      inputMode="numeric"
                      value={formatCurrencyNumber(editingContratacao.valor_estimado)}
                      onChange={(e) => {
                        const formatted = formatCurrencyInput(e.target.value);
                        e.currentTarget.value = formatted;
                        const parsed = parseCurrencyInput(formatted);
                        setEditingContratacao({
                          ...editingContratacao,
                          valor_estimado: parsed,
                        });
                      }}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-valor-executado" className="text-[12px] text-muted-foreground">Valor Executado (R$):</Label>
                    <Input
                      id="edit-valor-executado"
                      inputMode="numeric"
                      value={formatCurrencyNumber(editingContratacao.valor_contratado ?? 0)}
                      onChange={(e) => {
                        const formatted = formatCurrencyInput(e.target.value);
                        e.currentTarget.value = formatted;
                        const parsed = parseCurrencyInput(formatted);
                        setEditingContratacao({
                          ...editingContratacao,
                          valor_contratado: parsed,
                        });
                      }}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-prioridade" className="text-[12px] text-muted-foreground">Prioridade:</Label>
                    <Select
                      value={editingContratacao.grau_prioridade}
                      onValueChange={(value) =>
                        setEditingContratacao({ ...editingContratacao, grau_prioridade: value })
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Alta">Alta</SelectItem>
                        <SelectItem value="Média">Média</SelectItem>
                        <SelectItem value="Baixa">Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-status" className="text-[12px] text-muted-foreground">Status:</Label>
                    <Select
                      value={(editingContratacao as any).sobrestado
                        ? "sobrestado"
                        : ((() => {
                            const etapa = editingContratacao.etapa_processo;
                            if (etapa === "Concluído") return "concluído";
                            if (etapa === "Em Licitação" || etapa === "Contratado") return "em andamento";
                            return "não iniciado";
                          })())}
                      onValueChange={(value) => {
                        const next: any = { ...editingContratacao };
                        if (value === "sobrestado") {
                          next.sobrestado = true;
                          // mantém etapa atual
                        } else {
                          next.sobrestado = false;
                          next.etapa_processo = value;
                        }
                        setEditingContratacao(next);
                      }}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="não iniciado">não iniciado</SelectItem>
                        <SelectItem value="em andamento">em andamento</SelectItem>
                        <SelectItem value="concluído">concluído</SelectItem>
                        <SelectItem value="sobrestado">sobrestado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Linha 4: Justificativa ocupa a linha inteira */}
                <div className="space-y-2">
                  <Label htmlFor="edit-justificativa" className="text-[12px] text-muted-foreground">Justificativa:</Label>
                  <Textarea
                    id="edit-justificativa"
                    value={editingContratacao.justificativa}
                    onChange={(e) =>
                      setEditingContratacao({ ...editingContratacao, justificativa: e.target.value })
                    }
                    className="min-h-[80px]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setEditingContratacao(null)}>
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSaveEdit}>Salvar Alterações</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog de Histórico */}
        <Dialog open={showHistorico} onOpenChange={setShowHistorico}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader className="bg-[#D9415D] text-destructive-foreground -mx-6 -mt-6 px-6 py-4 rounded-t-md">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded bg-[#D9415D]/20 flex items-center justify-center text-destructive-foreground">
                  <History className="h-4 w-4" />
                </div>
                <DialogTitle className="text-lg">Histórico de Alterações</DialogTitle>
              </div>
              <DialogDescription className="text-xs text-destructive-foreground/80">
                Registro de mudanças com comparação campo a campo.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-3">
              {historico.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma alteração registrada para esta contratação.
                </p>
              ) : (
                historico.map((item) => {
                  const changes = buildChangesList(item.dados_anteriores, item.dados_novos);
                  return (
                    <div key={item.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{item.acao}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(item.created_at)} por {item.profiles?.nome_completo || "Sistema"}
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-muted/30 text-muted-foreground">#{item.id.slice(-6)}</Badge>
                      </div>
                      {changes.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-xs font-medium">Alterações:</p>
                          <div className="space-y-1">
                            {changes.map((c) => (
                              <div key={c.key} className="grid grid-cols-12 gap-2 text-sm">
                                <div className="col-span-3 text-[12px] text-muted-foreground">{c.label}</div>
                                <div className="col-span-4 text-muted-foreground line-through">{c.old}</div>
                                <div className="col-span-1 text-center">→</div>
                                <div className="col-span-4 font-medium">{c.new}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">Sem alterações de dados nesta ação.</p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
