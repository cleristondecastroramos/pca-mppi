import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Edit, History, Trash2, FileUp, Eraser, Info, Activity, FileText, Gavel, CalendarCheck, DollarSign, CheckCircle2 } from "lucide-react";
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
import { useEffect, useState, useMemo } from "react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AIWriter } from "@/components/AIWriter";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { translateError } from "@/lib/utils/error-translations";
import { Pencil, Play } from "lucide-react";
import { useAuthSession, useUserRoles, useUserProfile, hasAnyRole } from "@/lib/auth";

type Contratacao = Tables<"contratacoes"> & { codigo?: string | null };
type HistoricoItem = Tables<"contratacoes_historico"> & {
  profiles?: { nome_completo: string | null } | null;
};

export default function LicitacoesSRP() {
  const [contratacoes, setContratacoes] = useState<Contratacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [editingContratacao, setEditingContratacao] = useState<Contratacao | null>(null);
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [showHistorico, setShowHistorico] = useState(false);
  const [selectedContratacaoId, setSelectedContratacaoId] = useState<string | null>(null);
  const [contratacaoToDelete, setContratacaoToDelete] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();

  // Auth: role and profile info
  const { data: session } = useAuthSession();
  const userId = session?.user?.id;
  const { data: roles } = useUserRoles(userId);
  const { data: profile } = useUserProfile(userId);
  const isSetorRequisitante = hasAnyRole(roles, ["setor_requisitante"]) && !hasAnyRole(roles, ["administrador", "gestor"]);
  const isConsulta = hasAnyRole(roles, ["consulta"]) && !hasAnyRole(roles, ["administrador", "gestor", "setor_requisitante"]);
  const userSetor = profile?.setor || null;

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
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Efeito para cálculo automático de status na edição de SRP
  useEffect(() => {
    if (!editingContratacao) return;
    const c = editingContratacao as any;
    
    // Se estiver sobrestado ou retornado para diligência, não altera automaticamente
    if (c.sobrestado || c.etapa_processo === "retornado para diligência") return;

    let newStatus = "Planejada";
    if (c.numero_contrato) newStatus = "Ata Registrada";
    else if (c.data_prevista_contratacao) newStatus = "Licitação Concluída";
    else if (c.numero_sei_licitacao && c.numero_edital) newStatus = "Fase Externa da Licitação";
    else if (c.numero_sei_contratacao) newStatus = "Processo Administrativo Iniciado";

    if (newStatus !== c.etapa_processo) {
      setEditingContratacao({
        ...editingContratacao,
        etapa_processo: newStatus,
      });
    }
  }, [
    (editingContratacao as any)?.numero_sei_contratacao,
    (editingContratacao as any)?.numero_sei_licitacao,
    (editingContratacao as any)?.numero_edital,
    (editingContratacao as any)?.data_prevista_contratacao,
    (editingContratacao as any)?.numero_contrato,
    (editingContratacao as any)?.sobrestado
  ]);

  useEffect(() => {
    // Only fetch once role/profile are resolved
    if (roles === undefined || (isSetorRequisitante && !userSetor)) return;
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
  }, [roles, userSetor]);

  const fetchContratacoes = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("contratacoes")
        .select("id, codigo, descricao, setor_requisitante, unidade_orcamentaria, classe, valor_estimado, valor_contratado, etapa_processo, sobrestado, grau_prioridade, justificativa, data_prevista_contratacao, data_entrada_clc, numero_sei_contratacao, pdm_catser, created_at, quantidade_itens, valor_unitario, unidade_fornecimento, tipo_recurso, tipo_contratacao, modalidade, normativo, srp, numero_sei_licitacao, numero_contrato")
        .eq("srp", true)
        .order("created_at", { ascending: false });

      // Setor requisitante users only see their own setor
      if (isSetorRequisitante && userSetor) {
        query = query.eq("setor_requisitante", userSetor);
      }

      const { data, error } = await query;

      if (error) throw error;
      setContratacoes((data as any) || []);
    } catch (error: any) {
      console.error("Erro ao buscar contratações:", error);
      toast.error("Erro ao carregar contratações", { description: translateError(error?.message || String(error)) });
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

  const handleDelete = async (id: string | null) => {
    if (!id) {
      console.warn("[Exclusão] ID não fornecido.");
      return;
    }
    
    // Criar um ID único para o toast para podermos referenciá-lo com segurança
    const toastId = "delete-contratacao";
    
    try {
      console.log("[Exclusão] Iniciando para ID:", id);
      toast.loading("Excluindo demanda...", { id: toastId });

      // Deletar apenas o registro principal. 
      // O banco de dados está configurado com ON DELETE CASCADE para histórico e conformidade.
      const { error } = await supabase
        .from("contratacoes")
        .delete()
        .eq("id", id);
      
      if (error) {
        console.error("[Exclusão] Erro do Supabase:", error);
        toast.error("Não foi possível excluir", {
          id: toastId,
          description: translateError(error.message || "Erro de permissão ou restrição de integridade.")
        });
        return;
      }

      console.log("[Exclusão] Sucesso.");
      toast.success("Demanda excluída com sucesso", { id: toastId });
      
      setContratacaoToDelete(null);
      // Recarregar a lista
      await fetchContratacoes();
    } catch (err: any) {
      console.error("[Exclusão] Erro inesperado:", err);
      toast.error("Erro inesperado", { 
        id: toastId,
        description: translateError(err.message || "Ocorreu um erro ao processar a exclusão.") 
      });
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

      // Lógica de Status Automático para SRP
      const calculateSrpStatus = (c: any): { etapa: string; sobrestado: boolean } => {
        // Se estiver sobrestado, preserva o status atual mas marca como sobrestado
        if (c.sobrestado === true) {
          return { 
            etapa: c.etapa_processo || "Planejada", 
            sobrestado: true 
          };
        }
        
        // Regras de progressão automática
        if (c.numero_contrato) return { etapa: "Ata Registrada", sobrestado: false };
        if (c.data_prevista_contratacao) return { etapa: "Licitação Concluída", sobrestado: false };
        if (c.numero_sei_licitacao && c.numero_edital) return { etapa: "Fase Externa da Licitação", sobrestado: false };
        if (c.numero_sei_contratacao) return { etapa: "Processo Administrativo Iniciado", sobrestado: false };
        
        return { etapa: "Planejada", sobrestado: false };
      };

      const mapped = calculateSrpStatus(editingContratacao);

      // Atualizar contratação
      let payload: any = {
        descricao: editingContratacao.descricao,
        setor_requisitante: editingContratacao.setor_requisitante,
        unidade_orcamentaria: editingContratacao.unidade_orcamentaria,
        classe: editingContratacao.classe,
        valor_estimado: editingContratacao.valor_estimado,
        valor_contratado: editingContratacao.valor_contratado,
        etapa_processo: mapped.etapa,
        sobrestado: mapped.sobrestado,
        grau_prioridade: editingContratacao.grau_prioridade,
        justificativa: editingContratacao.justificativa,
        numero_contrato: (editingContratacao as any).numero_contrato || null,
        numero_sei_licitacao: (editingContratacao as any).numero_sei_licitacao || null,
        numero_edital: (editingContratacao as any).numero_edital || null,
        quantidade_itens: (editingContratacao as any).quantidade_itens,
        valor_unitario: (editingContratacao as any).valor_unitario,
        unidade_fornecimento: (editingContratacao as any).unidade_fornecimento,
        tipo_recurso: (editingContratacao as any).tipo_recurso,
        tipo_contratacao: (editingContratacao as any).tipo_contratacao,
        modalidade: (editingContratacao as any).modalidade,
        normativo: (editingContratacao as any).normativo,
        pdm_catser: (editingContratacao as any).pdm_catser || null,
        numero_sei_contratacao: (editingContratacao as any).numero_sei_contratacao || null,
        data_prevista_contratacao: (editingContratacao as any).data_prevista_contratacao || null,
        srp: (editingContratacao as any).srp,
        updated_at: new Date().toISOString(),
      };

      let { error: updateError } = await supabase
        .from("contratacoes")
        .update(payload)
        .eq("id", editingContratacao.id);


      if (updateError) {
        const msg = String(updateError.message || updateError);
        if (msg.includes("Saldo orçamentário insuficiente") || msg.includes("saldo orçamentário insuficiente")) {
          toast.error("Saldo orçamentário insuficiente na UO selecionada. Solicite autorização do administrador para excedente.");
        } else {
          // Tenta corrigir erro de colunas que podem não existir no banco
          const potentialMissingColumns = ["numero_sei_licitacao", "numero_edital", "data_prevista_contratacao", "numero_sei_contratacao"];
          let retryNeeded = false;
          for (const col of potentialMissingColumns) {
            if (msg.includes(`column "${col}" does not exist`)) {
              delete payload[col];
              retryNeeded = true;
            }
          }

          if (retryNeeded) {
            const retry = await supabase.from("contratacoes").update(payload).eq("id", editingContratacao.id);
            if (!retry.error) {
              updateError = undefined as any;
            } else {
              updateError = retry.error as any;
            }
          }
          
          if (updateError) {
            toast.error("Erro ao salvar alterações no banco de dados", {
              description: `${updateError.message}${updateError.hint ? ' - ' + updateError.hint : ''} (Código: ${updateError.code})`
            });
          }
        }
        if (updateError) throw updateError;
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
    } catch (error: any) {
      console.error("Erro ao salvar edição:", error);
      toast.error("Erro ao salvar alterações", { description: translateError(error.message || String(error)) });
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
      "Planejada": { variant: "secondary", className: "bg-info/10 text-info hover:bg-info/20" },
      "iniciado": { variant: "secondary", className: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20" },
      "Processo Administrativo Iniciado": { variant: "secondary", className: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20" },
      "retornado para diligência": { variant: "secondary", className: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20" },
      "em andamento": { variant: "secondary", className: "bg-warning/10 text-warning hover:bg-warning/20" },
      "Fase Externa da Licitação": { variant: "secondary", className: "bg-warning/10 text-warning hover:bg-warning/20" },
      "concluído": { variant: "secondary", className: "bg-success/10 text-success hover:bg-success/20" },
      "Licitação Concluída": { variant: "secondary", className: "bg-success/10 text-success hover:bg-success/20" },
      "Ata Registrada": { variant: "secondary", className: "bg-green-600/10 text-green-600 hover:bg-green-600/20 shadow-sm" },
      "sobrestado": { variant: "secondary", className: "bg-muted/10 text-muted-foreground hover:bg-muted/20" },
    };
    const s = status || "Planejada";
    return variants[s] || variants["Planejada"];
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

  const filteredContratacoes = useMemo(() => {
    let result = contratacoes;

    // 1. Filtro Textual
    const term = debouncedSearchTerm.trim().toLowerCase();
    if (term) {
      result = result.filter((item) => {
        // Busca por ID (parcial ou total)
        if (item.codigo?.toLowerCase().includes(term) || item.id.toLowerCase().includes(term)) return true;

        // Busca textual nos campos permitidos
        const searchableText = [
          item.descricao,
          item.setor_requisitante,
          item.classe
        ].filter(Boolean).join(" ").toLowerCase();

        return searchableText.includes(term);
      });
    }

    // 2. Filtros Dropdown
    const applyEq = (field: keyof Filtros, itemField: keyof Contratacao) => {
      const v = filtros[field];
      if (v && v !== ALL_VALUE) {
        result = result.filter((item) => String(item[itemField]) === v);
      }
    };

    applyEq("unidade_orcamentaria", "unidade_orcamentaria");
    applyEq("setor_requisitante", "setor_requisitante");
    applyEq("tipo_contratacao", "tipo_contratacao");
    applyEq("tipo_recurso", "tipo_recurso");
    applyEq("classe", "classe");
    applyEq("grau_prioridade", "grau_prioridade");
    applyEq("normativo", "normativo");
    applyEq("modalidade", "modalidade");

    // 3. Filtro de Status
    const status = filtros.etapa_processo;
    if (status && status !== ALL_VALUE) {
      if (status === "sobrestado") {
        result = result.filter((item) => (item as any).sobrestado === true);
      } else if (status === "retornado para diligência") {
        result = result.filter((item) => item.etapa_processo === "Retornado para Diligência" || item.etapa_processo === "retornado para diligência");
      } else {
        // Para SRP, a etapa_processo agora usa os labels específicos
        result = result.filter((item) => {
          // Lógica de cálculo idêntica à do badge para garantir consistência no filtro
          const getComputedStatus = (c: Contratacao) => {
            if ((c as any).sobrestado === true) return "sobrestado";
            if (c.numero_contrato) return "Ata Registrada";
            if ((c as any).data_prevista_contratacao) return "Licitação Concluída";
            if ((c as any).numero_sei_licitacao && (c as any).numero_edital) return "Fase Externa da Licitação";
            if ((c as any).numero_sei_contratacao) return "Processo Administrativo Iniciado";
            return "Planejada";
          };
          return getComputedStatus(item) === status;
        });
      }
    }

    return result;
  }, [contratacoes, debouncedSearchTerm, filtros]);

  // Atualizar totalCount para paginação
  useEffect(() => {
    setTotalCount(filteredContratacoes.length);
  }, [filteredContratacoes.length]);

  // Resetar página quando filtro muda
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, filtros]);

  const displayedContratacoes = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredContratacoes.slice(start, start + pageSize);
  }, [filteredContratacoes, page, pageSize]);

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
    // Para strings de data pura (AAAA-MM-DD), extraímos partes para evitar deslocamento de fuso horário
    if (dateString.includes("-") && dateString.length === 10) {
      const [year, month, day] = dateString.split("-").map(Number);
      return new Date(year, month - 1, day).toLocaleDateString("pt-BR");
    }
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const formatDateWithTime = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString("pt-BR");
    const formattedTime = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    return `${formattedDate} às ${formattedTime}`;
  };

  const calculateStartDate = (tipo: string | null, modalidade: string | null, dataTermino: string | null) => {
    if (!dataTermino) return null;
    
    let date: Date;
    if (dataTermino.includes("-") && dataTermino.length === 10) {
      const [year, month, day] = dataTermino.split("-").map(Number);
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(dataTermino);
    }

    let days = 120; // Regra 3: Renovação, Aditivo, etc.

    if (tipo === "Nova Contratação") {
      if (modalidade === "Pregão Eletrônico" || modalidade === "Concorrência") {
        days = 150; // Regra 1
      } else if (modalidade === "Dispensa" || modalidade === "Inexigibilidade" || modalidade === "Inexibilidade" || modalidade === "ARP (própria)" || modalidade === "ARP (carona)") {
        days = 90; // Regra 2
      }
    }

    date.setDate(date.getDate() - days);
    
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

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
    srp: "SRP (Registro de Preços)?",
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
    "srp",
  ];

  const formatFieldValue = (key: string, value: any): string => {
    if (value === null || value === undefined || value === "") return "-";
    switch (key) {
      case "valor_estimado":
      case "valor_contratado": {
        const num = typeof value === "number" ? value : parseFloat(String(value));
        return `R$ ${formatCurrencyNumber(isNaN(num) ? 0 : num)}`;
      }
      case "srp": {
        return value === true || value === "true" || value === "Sim" ? "Sim" : "Não";
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

  if (loading && contratacoes.length === 0) {
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
            <h1 className="text-xl font-bold text-foreground">Licitações SRP</h1>
            <p className="text-sm text-muted-foreground">
              Monitore as demandas que são Sistema de Registro de Preços ({totalCount} registros)
            </p>
          </div>
          {!isConsulta && (
            <div className="flex gap-2">
              <Link to="/nova-contratacao">
                <Button size="xs">
                  <Plus className="h-4 w-4 mr-1" />
                  Nova Licitação SRP
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Barra de filtros discretos (copiada da aba Visão Geral) */}
        <Card>
          <CardContent className="p-2">
            <div className="flex flex-wrap md:flex-nowrap gap-2 items-center">
              <div className="w-28 shrink-0">
                <div className="text-[10px] font-medium text-muted-foreground px-1">UO:</div>
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
                <div className="text-[10px] font-medium text-muted-foreground px-1">Setor Requisitante:</div>
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
                <div className="text-[10px] font-medium text-muted-foreground px-1">Tipo de Contratação:</div>
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
                <div className="text-[10px] font-medium text-muted-foreground px-1">Tipo de Recurso:</div>
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
                <div className="text-[10px] font-medium text-muted-foreground px-1">Classe de Material:</div>
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
                <div className="text-[10px] font-medium text-muted-foreground px-1">Grau de Prioridade:</div>
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
                <div className="text-[10px] font-medium text-muted-foreground px-1">Normativo:</div>
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
                <div className="text-[10px] font-medium text-muted-foreground px-1">Modalidade de Contratação:</div>
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
                <div className="text-[10px] font-medium text-muted-foreground px-1">Status Atual:</div>
                <Select onValueChange={(v) => setFiltro("etapa_processo", v)} value={filtros.etapa_processo}>
                  <SelectTrigger className="h-9 w-[120px] truncate px-3 text-sm">
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem className="text-xs" value={ALL_VALUE}>Todos</SelectItem>
                    <SelectItem className="text-xs" value="Planejada">Planejada</SelectItem>
                    <SelectItem className="text-xs" value="Processo Administrativo Iniciado">Processo Administrativo Iniciado</SelectItem>
                    <SelectItem className="text-xs" value="Fase Externa da Licitação">Fase Externa da Licitação</SelectItem>
                    <SelectItem className="text-xs" value="Licitação Concluída">Licitação Concluída</SelectItem>
                    <SelectItem className="text-xs" value="Ata Registrada">Ata Registrada</SelectItem>
                    <SelectItem className="text-xs" value="retornado para diligência">retornado para diligência</SelectItem>
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
              placeholder="Buscar por ID, descrição, setor ou classe..."
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
          <Table containerClassName="max-h-[60vh]">
            <TableHeader className="bg-primary hover:bg-primary">
              <TableRow>
                <TableHead className="text-center w-[80px] text-white font-bold">Cod. PCA</TableHead>
                <TableHead className="text-center min-w-[180px] text-white font-bold">Objeto / Descrição</TableHead>
                <TableHead className="text-center w-[90px] text-white font-bold">Órgão Demandante</TableHead>
                <TableHead className="text-center w-[110px] text-white font-bold">Modalidade</TableHead>
                <TableHead className="text-center w-[110px] text-white font-bold">Número do Processo</TableHead>
                <TableHead className="text-center w-[120px] text-white font-bold">Valor Est. p/ Registro</TableHead>
                <TableHead className="text-center w-[120px] text-white font-bold">Valor Homologado</TableHead>
                <TableHead className="text-center w-[130px] text-white font-bold">Data de Homologação</TableHead>
                <TableHead className="text-center w-[110px] text-white font-bold">Status do Processo</TableHead>
                <TableHead className="text-center w-[90px] text-white font-bold">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedContratacoes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "Nenhuma contratação encontrada com os critérios de busca." : "Nenhuma contratação cadastrada."}
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {displayedContratacoes.map((contratacao) => (
                    <TableRow key={contratacao.id} className="hover:bg-muted/50">
                      <TableCell className="text-center text-sm text-muted-foreground">
                        {contratacao.codigo?.replace(/^PCA-/, "").replace(/-2026$/, "") || contratacao.id.slice(-4)}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={contratacao.descricao}>
                          {contratacao.descricao}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs text-center">{formatSetor(contratacao.setor_requisitante)}</TableCell>
                      <TableCell className="text-sm text-center">{contratacao.modalidade || "-"}</TableCell>
                      <TableCell className="text-sm text-center">{formatNumeroSeiInput((contratacao as any).numero_sei_contratacao || "") || "-"}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(contratacao.valor_estimado)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(contratacao.valor_contratado)}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatDate((contratacao as any).data_prevista_contratacao)}
                      </TableCell>
                      <TableCell className="text-center">
                        {(() => {
                          const getCategory = (c: Contratacao) => {
                            if ((c as any).sobrestado === true) return "sobrestado";
                            // Lógica de Transição Automática para SRP
                            if (c.numero_contrato) return "Ata Registrada";
                            if ((c as any).data_prevista_contratacao) return "Licitação Concluída";
                            if ((c as any).numero_sei_licitacao && (c as any).numero_edital) return "Fase Externa da Licitação";
                            if ((c as any).numero_sei_contratacao) return "Processo Administrativo Iniciado";
                            return "Planejada";
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

                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          {(() => {
                            // Consulta: read-only, no edit/delete
                            // Gestor: can edit and view history, but cannot delete
                            // Unidade Demandante (setor_requisitante): can edit all their own items regardless of stage
                            const canEdit = !isConsulta;
                            const canDelete = hasAnyRole(roles, ["administrador"]);
                            return (
                              <>
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  onClick={() => handleEdit(contratacao)}
                                  title="Editar contratação"
                                  disabled={!canEdit}
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
                                {canDelete && (
                                  <Button
                                    variant="ghost"
                                    size="xs"
                                    onClick={() => setContratacaoToDelete(contratacao.id)}
                                    title="Excluir contratação"
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
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

        {/* Dialog de Edição/Criação */}
        <Dialog open={!!editingContratacao} onOpenChange={() => setEditingContratacao(null)}>
          <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden border-none shadow-2xl">
            <DialogHeader className="bg-gradient-to-r from-[#D9415D] to-[#b9344d] text-white p-5 space-y-1">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
                  <Gavel className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold tracking-tight">Gestão de Licitação SRP</DialogTitle>
                  <DialogDescription className="text-white/80 text-xs font-medium">
                    Acompanhamento do workflow e registro de informações da Ata de Registro de Preços
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {editingContratacao && (
              <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Coluna Esquerda: Workflow e Identificação */}
                  <div className="md:col-span-12 lg:col-span-8 space-y-6">
                    
                    {/* Seção: Descrição do Objeto */}
                    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                      <div className="bg-muted/30 px-4 py-2 border-b border-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="text-xs font-bold uppercase tracking-wider text-foreground">Objeto da Demanda</span>
                        </div>
                        <AIWriter 
                          value={editingContratacao.descricao} 
                          onUpdate={(val) => setEditingContratacao({...editingContratacao, descricao: val})} 
                          fieldName="Descrição" 
                        />
                      </div>
                      <div className="p-4">
                        <Textarea
                          id="edit-descricao"
                          placeholder="Descreva detalhadamente o objeto da contratação..."
                          value={editingContratacao.descricao}
                          onChange={(e) => setEditingContratacao({ ...editingContratacao, descricao: e.target.value })}
                          className="min-h-[80px] text-sm border-none focus-visible:ring-0 p-0 shadow-none resize-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Fase Administrativa */}
                      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="bg-muted/30 px-4 py-2 border-b border-border flex items-center gap-2">
                          <Activity className="h-4 w-4 text-blue-500" />
                          <span className="text-xs font-bold uppercase tracking-wider text-foreground">Fases Administrativas</span>
                        </div>
                        <div className="p-4 space-y-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="edit-sei-adm" className="text-[10px] font-bold text-muted-foreground uppercase">Nº SEI Administrativo</Label>
                            <Input
                              id="edit-sei-adm"
                              placeholder="00.00.0000.0000000/0000-00"
                              value={(editingContratacao as any).numero_sei_contratacao || ""}
                              onChange={(e) => setEditingContratacao({ ...editingContratacao, numero_sei_contratacao: formatNumeroSeiInput(e.target.value) } as any)}
                              className="h-9 text-xs focus-visible:ring-1"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="edit-sei-lic" className="text-[10px] font-bold text-muted-foreground uppercase">Processo SEI Licitação</Label>
                            <Input
                              id="edit-sei-lic"
                              placeholder="00.00.0000.0000000/0000-00"
                              value={(editingContratacao as any).numero_sei_licitacao || ""}
                              onChange={(e) => setEditingContratacao({ ...editingContratacao, numero_sei_licitacao: formatNumeroSeiInput(e.target.value) } as any)}
                              className="h-9 text-xs focus-visible:ring-1"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="edit-edital-num" className="text-[10px] font-bold text-muted-foreground uppercase">Nº do Edital</Label>
                            <Input
                              id="edit-edital-num"
                              placeholder="Ex: 001/2026"
                              value={(editingContratacao as any).numero_edital || ""}
                              onChange={(e) => setEditingContratacao({ ...editingContratacao, numero_edital: e.target.value } as any)}
                              className="h-9 text-xs focus-visible:ring-1"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Configurações do Processo */}
                      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="bg-muted/30 px-4 py-2 border-b border-border flex items-center gap-2">
                          <Info className="h-4 w-4 text-orange-500" />
                          <span className="text-xs font-bold uppercase tracking-wider text-foreground">Configurações e Origem</span>
                        </div>
                        <div className="p-4 space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <Label className="text-[10px] font-bold text-muted-foreground uppercase">Setor</Label>
                              <Select value={editingContratacao.setor_requisitante} onValueChange={(v) => setEditingContratacao({ ...editingContratacao, setor_requisitante: v })}>
                                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {["CAA", "CCF", "CCS", "CLC", "CPPT", "CTI", "CRH", "CEAF", "GAECO", "GSI", "CONINT", "PLANEJAMENTO"].map(s => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-[10px] font-bold text-muted-foreground uppercase">UO</Label>
                              <Select value={editingContratacao.unidade_orcamentaria || ""} onValueChange={(v) => setEditingContratacao({ ...editingContratacao, unidade_orcamentaria: v })}>
                                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {["PGJ", "FMMP", "FEPDC"].map(u => (
                                    <SelectItem key={u} value={u}>{u}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase">Modalidade</Label>
                            <Select value={(editingContratacao as any).modalidade || ""} onValueChange={(v) => setEditingContratacao({ ...editingContratacao, modalidade: v } as any)}>
                              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {["Concorrência", "Pregão Eletrônico", "Dispensa", "Inexigibilidade", "ARP (própria)", "ARP (carona)"].map(m => (
                                  <SelectItem key={m} value={m}>{m}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <Label className="text-[10px] font-bold text-muted-foreground uppercase">Normativo</Label>
                              <Select value={(editingContratacao as any).normativo || ""} onValueChange={(v) => setEditingContratacao({ ...editingContratacao, normativo: v } as any)}>
                                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Lei 14.133/2021">14.133/2021</SelectItem>
                                  <SelectItem value="Lei 8.666/1993">8.666/1993</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-[10px] font-bold text-muted-foreground uppercase">Prioridade</Label>
                              <Select value={editingContratacao.grau_prioridade} onValueChange={(v) => setEditingContratacao({ ...editingContratacao, grau_prioridade: v })}>
                                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {["Alta", "Média", "Baixa"].map(p => (
                                    <SelectItem key={p} value={p}>{p}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Resultados da Licitacao / Registro da Ata */}
                    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                      <div className="bg-muted/30 px-4 py-2 border-b border-border flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground">Finalização (Resultados e Ata)</span>
                      </div>
                      <div className="p-4 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-1.5">
                            <Label htmlFor="edit-data-homolog" className="text-[10px] font-bold text-muted-foreground uppercase">Data de Homologação</Label>
                            <div className="relative">
                              <CalendarCheck className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="edit-data-homolog"
                                type="date"
                                value={(editingContratacao as any).data_prevista_contratacao || ""}
                                onChange={(e) => setEditingContratacao({ ...editingContratacao, data_prevista_contratacao: e.target.value } as any)}
                                className="h-9 pl-9 text-xs focus-visible:ring-1"
                              />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="edit-valor-homolog" className="text-[10px] font-bold text-muted-foreground uppercase">Valor Homologado (R$)</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-green-600" />
                              <Input
                                id="edit-valor-homolog"
                                inputMode="numeric"
                                value={formatCurrencyNumber(editingContratacao.valor_contratado ?? 0)}
                                onChange={(e) => setEditingContratacao({ ...editingContratacao, valor_contratado: parseCurrencyInput(formatCurrencyInput(e.target.value)) })}
                                className="h-9 pl-9 text-xs font-bold focus-visible:ring-1 border-green-100 bg-green-50/20"
                              />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="edit-ata-num" className="text-[10px] font-bold text-primary uppercase">Número da Ata / ARP</Label>
                            <div className="relative">
                              <FileText className="absolute left-2.5 top-2.5 h-4 w-4 text-primary" />
                              <Input
                                id="edit-ata-num"
                                placeholder="Ex: 005/2026"
                                value={(editingContratacao as any).numero_contrato || ""}
                                onChange={(e) => setEditingContratacao({ ...editingContratacao, numero_contrato: e.target.value } as any)}
                                className="h-9 pl-9 text-xs font-bold border-primary/40 bg-primary/5 focus-visible:ring-primary"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Justificativa */}
                    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                      <div className="bg-muted/30 px-4 py-2 border-b border-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Info className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs font-bold uppercase tracking-wider text-foreground">Justificativa da Demanda</span>
                        </div>
                        <AIWriter 
                          value={editingContratacao.justificativa} 
                          onUpdate={(val) => setEditingContratacao({...editingContratacao, justificativa: val})} 
                          fieldName="Justificativa" 
                        />
                      </div>
                      <div className="p-4">
                        <Textarea
                          id="edit-justificativa"
                          placeholder="Justifique a necessidade desta contratação para o MPPI..."
                          value={editingContratacao.justificativa}
                          onChange={(e) => setEditingContratacao({ ...editingContratacao, justificativa: e.target.value })}
                          className="min-h-[60px] text-xs border-none focus-visible:ring-0 p-0 shadow-none resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Coluna Direita: Status e Financeiro */}
                  <div className="md:col-span-12 lg:col-span-4 space-y-6">
                    
                    {/* Card de Status Atual */}
                    <div className="bg-white rounded-xl border border-primary/20 shadow-md overflow-hidden relative">
                      <div className="absolute top-0 right-0 p-2">
                        <div className="px-2 py-0.5 rounded-full bg-primary/10 text-[9px] font-bold text-primary uppercase border border-primary/10">Automático</div>
                      </div>
                      <div className="p-5 flex flex-col items-center text-center space-y-3">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em]">Status Atual do Workflow</div>
                        {(() => {
                          const status = (editingContratacao as any).sobrestado ? "sobrestado" : editingContratacao.etapa_processo;
                          const b = getStatusBadge(status);
                          return (
                            <div className={`px-4 py-2 rounded-lg ${b.className} font-bold text-sm shadow-sm border border-current/10 animate-in fade-in zoom-in duration-300`}>
                              {status || "Planejada"}
                            </div>
                          );
                        })()}
                        <div className="pt-2 w-full">
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase mb-2 block text-left text-center">Intervir manualmente?</Label>
                          <Select 
                            value={(editingContratacao as any).sobrestado ? "sobrestado" : (editingContratacao.etapa_processo || "Planejada")} 
                            onValueChange={(v) => {
                              const next = { ...editingContratacao } as any;
                              if (v === "sobrestado") {
                                next.sobrestado = true;
                              } else {
                                next.sobrestado = false;
                                next.etapa_processo = v;
                              }
                              setEditingContratacao(next);
                            }}
                          >
                            <SelectTrigger className="h-8 text-[10px] font-semibold"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {["Planejada", "Processo Administrativo Iniciado", "Fase Externa da Licitação", "Licitação Concluída", "Ata Registrada", "retornado para diligência", "sobrestado"].map(opt => (
                                <SelectItem key={opt} value={opt} className="text-[10px]">{opt}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Especificações do Item */}
                    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                      <div className="bg-muted/30 px-4 py-2 border-b border-border flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-blue-600" />
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground">Especificação e Valores</span>
                      </div>
                      <div className="p-4 space-y-5">
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase">Classe do Material</Label>
                          <Select value={editingContratacao.classe} onValueChange={(v) => setEditingContratacao({ ...editingContratacao, classe: v })}>
                            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {["Material de Consumo", "Material Permanente", "Serviço", "Serviço de TI", "Serviço de Engenharia", "Serviço de Terceirizado", "Obra", "Software", "Treinamento"].map(c => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase">Quantidade</Label>
                            <Input
                              type="number"
                              min="1"
                              value={(editingContratacao as any).quantidade_itens || 1}
                              onChange={(e) => {
                                const q = parseInt(e.target.value) || 0;
                                const u = (editingContratacao as any).valor_unitario || 0;
                                setEditingContratacao({ ...editingContratacao, quantidade_itens: q, valor_estimado: q * u } as any);
                              }}
                              className="h-9 text-xs focus-visible:ring-1"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase">Unidade</Label>
                            <Input
                              placeholder="Unidade"
                              value={(editingContratacao as any).unidade_fornecimento || ""}
                              onChange={(e) => setEditingContratacao({ ...editingContratacao, unidade_fornecimento: e.target.value } as any)}
                              className="h-9 text-xs focus-visible:ring-1"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase text-blue-600">Valor Unitário Est. (R$)</Label>
                          <Input
                            inputMode="numeric"
                            value={formatCurrencyNumber((editingContratacao as any).valor_unitario || 0)}
                            onChange={(e) => {
                              const val = parseCurrencyInput(formatCurrencyInput(e.target.value));
                              const q = (editingContratacao as any).quantidade_itens || 1;
                              setEditingContratacao({ ...editingContratacao, valor_unitario: val, valor_estimado: q * val } as any);
                            }}
                            className="h-9 text-xs font-semibold focus-visible:ring-1"
                          />
                        </div>

                        <div className="p-3 bg-slate-100 rounded-lg border border-slate-200">
                          <Label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Valor Total Estimado (PCA)</Label>
                          <div className="text-lg font-black text-slate-800 tracking-tight">
                            {formatCurrencyNumber(editingContratacao.valor_estimado)}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase">PDM / CATSER</Label>
                          <Input
                            placeholder="Código PDM ou CATSER"
                            value={(editingContratacao as any).pdm_catser || ""}
                            onChange={(e) => setEditingContratacao({ ...editingContratacao, pdm_catser: e.target.value } as any)}
                            className="h-9 text-xs focus-visible:ring-1"
                          />
                        </div>
                        
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase">Recurso</Label>
                          <Select value={(editingContratacao as any).tipo_recurso || ""} onValueChange={(v) => setEditingContratacao({ ...editingContratacao, tipo_recurso: v } as any)}>
                            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Custeio">Custeio</SelectItem>
                              <SelectItem value="Investimento">Investimento</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Fixo */}
            <div className="bg-white border-t border-border p-4 flex items-center justify-between shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Modo de edição ativo</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditingContratacao(null)} className="h-9 text-xs px-4 border-slate-200 hover:bg-slate-50 transition-colors">
                  Descartar
                </Button>
                <Button size="sm" onClick={handleSaveEdit} className="h-9 text-xs px-8 bg-[#D9415D] hover:bg-[#b9344d] shadow-lg shadow-destructive/20 transition-all font-bold">
                  Salvar Licitação
                </Button>
              </div>
            </div>
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
                            {formatDateWithTime(item.created_at)} por {item.profiles?.nome_completo || "Sistema"}
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-muted/30 text-muted-foreground">{item.id.slice(-6)}</Badge>
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
        {/* Dialog de Confirmação de Exclusão */}
        <AlertDialog open={!!contratacaoToDelete} onOpenChange={() => setContratacaoToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza que deseja excluir esta demanda de contratação?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente a contratação e seu histórico.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleDelete(contratacaoToDelete)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
