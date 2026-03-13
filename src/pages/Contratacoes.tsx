import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Edit, History, Trash2, FileUp, Eraser } from "lucide-react";
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

export default function Contratacoes() {
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
    srp?: string;
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
    srp: ALL_VALUE,
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
        .select("id, codigo, descricao, setor_requisitante, unidade_orcamentaria, classe, valor_estimado, valor_contratado, etapa_processo, sobrestado, grau_prioridade, justificativa, data_prevista_contratacao, data_entrada_clc, numero_sei_contratacao, pdm_catser, created_at, quantidade_itens, valor_unitario, unidade_fornecimento, tipo_recurso, tipo_contratacao, modalidade, normativo, srp")
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
          case "iniciado":
            return { etapa: "Iniciado", sobrestado: false };
          case "retornado para diligência":
            return { etapa: "Retornado para Diligência", sobrestado: false };
          case "em andamento":
            return { etapa: currentEtapa === "Contratado" ? "Contratado" : "Em Licitação", sobrestado: false };
          case "concluído":
            return { etapa: "Concluído", sobrestado: false };
          default:
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
        updated_at: new Date().toISOString(),
      };

      // Add missing fields
      if ((editingContratacao as any).quantidade_itens !== undefined) {
        payload.quantidade_itens = (editingContratacao as any).quantidade_itens;
      }
      if ((editingContratacao as any).valor_unitario !== undefined) {
        payload.valor_unitario = (editingContratacao as any).valor_unitario;
      }
      if ((editingContratacao as any).unidade_fornecimento !== undefined) {
        payload.unidade_fornecimento = (editingContratacao as any).unidade_fornecimento;
      }
      if ((editingContratacao as any).tipo_recurso !== undefined) {
        payload.tipo_recurso = (editingContratacao as any).tipo_recurso;
      }
      if ((editingContratacao as any).tipo_contratacao !== undefined) {
        payload.tipo_contratacao = (editingContratacao as any).tipo_contratacao;
      }
      if ((editingContratacao as any).modalidade !== undefined) {
        payload.modalidade = (editingContratacao as any).modalidade;
      }
      if ((editingContratacao as any).normativo !== undefined) {
        payload.normativo = (editingContratacao as any).normativo;
      }

      if ((editingContratacao as any).pdm_catser !== undefined) {
        payload.pdm_catser = (editingContratacao as any).pdm_catser || null;
      }
      if ((editingContratacao as any).numero_sei_contratacao !== undefined) {
        payload.numero_sei_contratacao = (editingContratacao as any).numero_sei_contratacao || null;
      }
      if ((editingContratacao as any).data_prevista_contratacao !== undefined) {
        payload.data_prevista_contratacao = (editingContratacao as any).data_prevista_contratacao || null;
      }
      // data_entrada_clc removed from payload as per requirement (start date is now calculated)
      if ((editingContratacao as any).srp !== undefined) {
        payload.srp = (editingContratacao as any).srp;
      }

      let { error: updateError } = await supabase
        .from("contratacoes")
        .update(payload)
        .eq("id", editingContratacao.id);

      if (updateError) {
        const msg = String(updateError.message || updateError);
        if (msg.includes("column \"data_prevista_contratacao\" does not exist")) {
          delete payload.data_prevista_contratacao;
          ({ error: updateError } = await supabase.from("contratacoes").update(payload).eq("id", editingContratacao.id));
        }
        if (!updateError && msg.includes("column \"numero_sei_contratacao\" does not exist")) {
          delete payload.numero_sei_contratacao;
          ({ error: updateError } = await supabase.from("contratacoes").update(payload).eq("id", editingContratacao.id));
        }
      }

      if (updateError) {
        const msg = String(updateError.message || updateError);
        if (msg.includes("Saldo orçamentário insuficiente") || msg.includes("saldo orçamentário insuficiente")) {
          toast.error("Saldo orçamentário insuficiente na UO selecionada. Solicite autorização do administrador para excedente.");
        } else {
          // Tenta corrigir erro de schema cache/coluna inexistente removendo campos opcionais e reenviando
          const mentionsDataPrevista = msg.includes("data_prevista_contratacao");
          const mentionsNumeroSei = msg.includes("numero_sei_contratacao");
          if (mentionsDataPrevista && payload.data_prevista_contratacao !== undefined) {
            delete payload.data_prevista_contratacao;
            const retry = await supabase.from("contratacoes").update(payload).eq("id", editingContratacao.id);
            if (!retry.error) {
              updateError = undefined as any;
            } else {
              // Ainda erro: mostra descrição detalhada
              toast.error("Erro ao salvar alterações", {
                description: `${retry.error.message}${retry.error.hint ? ' - ' + retry.error.hint : ''} (${retry.error.code})`
              });
            }
          } else if (mentionsNumeroSei && payload.numero_sei_contratacao !== undefined) {
            delete payload.numero_sei_contratacao;
            const retry = await supabase.from("contratacoes").update(payload).eq("id", editingContratacao.id);
            if (!retry.error) {
              updateError = undefined as any;
            } else {
              toast.error("Erro ao salvar alterações", {
                description: `${retry.error.message}${retry.error.hint ? ' - ' + retry.error.hint : ''} (${retry.error.code})`
              });
            }
          } else {
            toast.error("Erro ao salvar alterações no banco de dados", {
              description: `${updateError.message}${updateError.hint ? ' - ' + updateError.hint : ''} (Código: ${updateError.code})`
            });
          }
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
      "iniciado": { variant: "secondary", className: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20" },
      "retornado para diligência": { variant: "secondary", className: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20" },
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

    const srpVal = filtros.srp;
    if (srpVal && srpVal !== ALL_VALUE) {
      result = result.filter((item) => (item.srp === true ? "Sim" : "Não") === srpVal);
    }

    // 3. Filtro de Status
    const status = filtros.etapa_processo;
    if (status && status !== ALL_VALUE) {
      if (status === "sobrestado") {
        result = result.filter((item) => (item as any).sobrestado === true);
      } else if (status === "não iniciado") {
        result = result.filter((item) => !item.etapa_processo || item.etapa_processo === "Planejamento");
      } else if (status === "iniciado") {
        result = result.filter((item) => item.etapa_processo === "Iniciado");
      } else if (status === "retornado para diligência") {
        result = result.filter((item) => item.etapa_processo === "Retornado para Diligência");
      } else if (status === "em andamento") {
        result = result.filter((item) => ["Em Licitação", "Contratado"].includes(item.etapa_processo || ""));
      } else if (status === "concluído") {
        result = result.filter((item) => item.etapa_processo === "Concluído");
      } else {
        result = result.filter((item) => item.etapa_processo === status);
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
      if (modalidade === "Pregão Eletrônico" || modalidade === "Concorrência" || modalidade === "Concurso") {
        days = 150; // Regra 1
      } else if (modalidade === "Dispensa" || modalidade === "Inexigibilidade" || modalidade === "Inexibilidade") {
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
            <h1 className="text-xl font-bold text-foreground">Contratações</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie todas as contratações do PCA 2026 ({totalCount} registros)
            </p>
          </div>
          {!isConsulta && (
            <div className="flex gap-2">
              <Link to="/nova-contratacao">
                <Button size="xs">
                  <Plus className="h-4 w-4 mr-1" />
                  Nova Contratação
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
              <div className="w-[100px] shrink-0 -ml-1">
                <div className="text-[10px] font-medium text-muted-foreground px-1">SRP:</div>
                <Select onValueChange={(v) => setFiltro("srp", v)} value={filtros.srp}>
                  <SelectTrigger className="h-9 w-full truncate px-3 text-sm">
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem className="text-xs" value={ALL_VALUE}>Todos</SelectItem>
                    <SelectItem className="text-xs" value="Sim">Sim</SelectItem>
                    <SelectItem className="text-xs" value="Não">Não</SelectItem>
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
                    <SelectItem className="text-xs" value="não iniciado">não iniciado</SelectItem>
                    <SelectItem className="text-xs" value="iniciado">iniciado</SelectItem>
                    <SelectItem className="text-xs" value="retornado para diligência">retornado para diligência</SelectItem>
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
                <TableHead className="text-center min-w-[180px] text-white font-bold">Descrição</TableHead>
                <TableHead className="text-center w-[90px] text-white font-bold">Setor</TableHead>
                <TableHead className="text-center w-[110px] text-white font-bold">Classe</TableHead>
                <TableHead className="text-center w-[80px] text-white font-bold">Quantidade</TableHead>
                <TableHead className="text-center w-[120px] text-white font-bold">Valor Unitário</TableHead>
                <TableHead className="text-center w-[120px] text-white font-bold">Valor Estimado</TableHead>
                <TableHead className="text-center w-[120px] text-white font-bold">Valor Executado</TableHead>
                <TableHead className="text-center w-[130px] text-white font-bold">Data Prevista de Início</TableHead>
                <TableHead className="text-center w-[130px] text-white font-bold">Data Prevista de Conclusão</TableHead>
                <TableHead className="text-center w-[110px] text-white font-bold">Status</TableHead>
                <TableHead className="text-center w-[90px] text-white font-bold">Prioridade</TableHead>
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
                      <TableCell className="text-sm text-center">{contratacao.classe || "-"}</TableCell>
                      <TableCell className="text-center">{contratacao.quantidade_itens || "-"}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(contratacao.valor_unitario)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(contratacao.valor_estimado)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(contratacao.valor_contratado)}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatDate(calculateStartDate(contratacao.tipo_contratacao, contratacao.modalidade, (contratacao as any).data_prevista_contratacao))}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatDate((contratacao as any).data_prevista_contratacao)}
                      </TableCell>
                      <TableCell className="text-center">
                        {(() => {
                          const getCategory = (c: Contratacao) => {
                            if ((c as any).sobrestado === true) return "sobrestado";
                            const etapa = c.etapa_processo?.toLowerCase() || "";
                            if (etapa === "iniciado") return "iniciado";
                            if (etapa === "retornado para diligência") return "retornado para diligência";
                            if (etapa === "em andamento" || etapa === "em licitação" || etapa === "contratado") return "em andamento";
                            if (etapa === "concluído") return "concluído";
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
              <div className="space-y-4 pt-4">
                {/* Linha 1: Descrição */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="edit-descricao" className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Descrição do Objeto</Label>
                    <AIWriter 
                      value={editingContratacao.descricao} 
                      onUpdate={(val) => setEditingContratacao({...editingContratacao, descricao: val})} 
                      fieldName="Descrição" 
                    />
                  </div>
                  <Textarea
                    id="edit-descricao"
                    value={editingContratacao.descricao}
                    onChange={(e) =>
                      setEditingContratacao({ ...editingContratacao, descricao: e.target.value })
                    }
                    className="min-h-[60px] text-sm resize-none focus-visible:ring-1"
                  />
                </div>

                {/* Bloco 1: Identificação Básica */}
                <div className="grid gap-3 sm:grid-cols-12 bg-muted/30 p-3 rounded-md border border-border/50">
                  <div className="space-y-1.5 sm:col-span-4">
                    <Label htmlFor="edit-sei" className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Número SEI</Label>
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
                      className="h-8 text-xs focus-visible:ring-1"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-4">
                    <Label htmlFor="edit-setor" className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Setor Requisitante</Label>
                    <Select
                      value={editingContratacao.setor_requisitante}
                      onValueChange={(value) =>
                        setEditingContratacao({ ...editingContratacao, setor_requisitante: value })
                      }
                    >
                      <SelectTrigger className="h-8 px-3 text-xs focus:ring-1">
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
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="edit-uo" className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">UO</Label>
                    <Select
                      value={editingContratacao.unidade_orcamentaria || undefined}
                      onValueChange={(value) =>
                        setEditingContratacao({ ...editingContratacao, unidade_orcamentaria: value })
                      }
                    >
                      <SelectTrigger className="h-8 px-3 text-xs focus:ring-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PGJ">PGJ</SelectItem>
                        <SelectItem value="FMMP">FMMP</SelectItem>
                        <SelectItem value="FEPDC">FEPDC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="edit-srp" className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">SRP?</Label>
                    <Select
                      value={(editingContratacao as any).srp ? "Sim" : "Não"}
                      onValueChange={(value) =>
                        setEditingContratacao({ ...editingContratacao, srp: value === "Sim" } as any)
                      }
                    >
                      <SelectTrigger className="h-8 px-3 text-xs focus:ring-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sim">Sim</SelectItem>
                        <SelectItem value="Não">Não</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 sm:col-span-3">
                    <Label htmlFor="edit-data-inicio" className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Prev. Início</Label>
                    <Input
                      id="edit-data-inicio"
                      type="date"
                      value={calculateStartDate((editingContratacao as any).tipo_contratacao, (editingContratacao as any).modalidade, (editingContratacao as any).data_prevista_contratacao) || ""}
                      disabled
                      className="h-8 text-xs focus-visible:ring-1 bg-muted"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-3">
                    <Label htmlFor="edit-data-conclusao" className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Prev. Conclusão</Label>
                    <Input
                      id="edit-data-conclusao"
                      type="date"
                      value={(editingContratacao as any).data_prevista_contratacao || ""}
                      onChange={(e) =>
                        setEditingContratacao({ ...editingContratacao, data_prevista_contratacao: e.target.value } as any)
                      }
                      className="h-8 text-xs focus-visible:ring-1"
                    />
                  </div>
                </div>

                {/* Bloco 2: Classificação */}
                <div className="grid gap-3 sm:grid-cols-12 bg-muted/30 p-3 rounded-md border border-border/50">
                  <div className="space-y-1.5 sm:col-span-3">
                    <Label htmlFor="edit-tipo-contratacao" className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tipo de Contratação</Label>
                    <Select
                      value={(editingContratacao as any).tipo_contratacao || undefined}
                      onValueChange={(value) =>
                        setEditingContratacao({ ...editingContratacao, tipo_contratacao: value } as any)
                      }
                    >
                      <SelectTrigger className="h-8 px-3 text-xs focus:ring-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Nova Contratação">Nova Contratação</SelectItem>
                        <SelectItem value="Renovação">Renovação</SelectItem>
                        <SelectItem value="Aditivo Quantitativo">Aditivo Quantitativo</SelectItem>
                        <SelectItem value="Repactuação">Repactuação</SelectItem>
                        <SelectItem value="Apostilamento">Apostilamento</SelectItem>
                        <SelectItem value="Indeterminado">Indeterminado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 sm:col-span-3">
                    <Label htmlFor="edit-modalidade" className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Modalidade</Label>
                    <Select
                      value={(editingContratacao as any).modalidade || undefined}
                      onValueChange={(value) =>
                        setEditingContratacao({ ...editingContratacao, modalidade: value } as any)
                      }
                    >
                      <SelectTrigger className="h-8 px-3 text-xs focus:ring-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pregão Eletrônico">Pregão Eletrônico</SelectItem>
                        <SelectItem value="Dispensa">Dispensa</SelectItem>
                        <SelectItem value="Inexigibilidade">Inexigibilidade</SelectItem>
                        <SelectItem value="Concorrência">Concorrência</SelectItem>
                        <SelectItem value="Concurso">Concurso</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 sm:col-span-3">
                    <Label htmlFor="edit-classe" className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Classe de Material</Label>
                    <Select
                      value={editingContratacao.classe || undefined}
                      onValueChange={(value) =>
                        setEditingContratacao({ ...editingContratacao, classe: value })
                      }
                    >
                      <SelectTrigger className="h-8 px-3 text-xs focus:ring-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Material de Consumo">Material de Consumo</SelectItem>
                        <SelectItem value="Material Permanente">Material Permanente</SelectItem>
                        <SelectItem value="Serviço">Serviço</SelectItem>
                        <SelectItem value="Serviço de TI">Serviço de TI</SelectItem>
                        <SelectItem value="Serviço de Engenharia">Serviço de Engenharia</SelectItem>
                        <SelectItem value="Serviço de Terceirizado">Serviço de Terceirizado</SelectItem>
                        <SelectItem value="Obra">Obra</SelectItem>
                        <SelectItem value="Software">Software</SelectItem>
                        <SelectItem value="Treinamento">Treinamento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 sm:col-span-3">
                    <Label htmlFor="edit-pdm-catser" className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">PDM/CATSER</Label>
                    <Input
                      id="edit-pdm-catser"
                      type="text"
                      placeholder="Código PDM ou CATSER"
                      value={(editingContratacao as any).pdm_catser || ""}
                      onChange={(e) =>
                        setEditingContratacao({ ...editingContratacao, pdm_catser: e.target.value } as any)
                      }
                      className="h-8 text-xs focus-visible:ring-1"
                    />
                  </div>

                  {/* Linha 2 do Bloco 2 */}
                  <div className="space-y-1.5 sm:col-span-3 pt-1">
                    <Label htmlFor="edit-normativo" className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Normativo</Label>
                    <Select
                      value={(editingContratacao as any).normativo || undefined}
                      onValueChange={(value) =>
                        setEditingContratacao({ ...editingContratacao, normativo: value } as any)
                      }
                    >
                      <SelectTrigger className="h-8 px-3 text-xs focus:ring-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Lei 14.133/2021">14.133/2021</SelectItem>
                        <SelectItem value="Lei 8.666/1993">8.666/1993</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 sm:col-span-3 pt-1">
                    <Label htmlFor="edit-tipo-recurso" className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tipo de Recurso</Label>
                    <Select
                      value={(editingContratacao as any).tipo_recurso || "Custeio"}
                      onValueChange={(value) =>
                        setEditingContratacao({ ...editingContratacao, tipo_recurso: value } as any)
                      }
                    >
                      <SelectTrigger className="h-8 px-3 text-xs focus:ring-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Custeio">Custeio</SelectItem>
                        <SelectItem value="Investimento">Investimento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 sm:col-span-3 pt-1">
                    <Label htmlFor="edit-prioridade" className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Prioridade</Label>
                    <Select
                      value={editingContratacao.grau_prioridade}
                      onValueChange={(value) =>
                        setEditingContratacao({ ...editingContratacao, grau_prioridade: value })
                      }
                    >
                      <SelectTrigger className="h-8 px-3 text-xs focus:ring-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Alta">Alta</SelectItem>
                        <SelectItem value="Média">Média</SelectItem>
                        <SelectItem value="Baixa">Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 sm:col-span-3 pt-1">
                    <Label htmlFor="edit-status" className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Status Atual</Label>
                    <Select
                      value={(editingContratacao as any).sobrestado
                        ? "sobrestado"
                        : ((() => {
                          const etapa = editingContratacao.etapa_processo?.toLowerCase() || "";
                          if (etapa === "concluído") return "concluído";
                          if (etapa === "iniciado") return "iniciado";
                          if (etapa === "retornado para diligência") return "retornado para diligência";
                          if (etapa === "em andamento" || etapa === "em licitação" || etapa === "contratado") return "em andamento";
                          return "não iniciado";
                        })())}
                      onValueChange={(value) => {
                        const next: any = { ...editingContratacao };
                        
                        // Regra: somente usuarios com setor de lotação 'CLC' podem colocar no status 'Retornado para Diligência' e 'Em Andamento'
                        if ((value === "retornado para diligência" || value === "em andamento") && userSetor !== "CLC") {
                          toast.error("Acesso negado", { description: "Somente usuários do setor CLC podem alterar para este status." });
                          return;
                        }

                        if (value === "sobrestado") {
                          next.sobrestado = true;
                        } else {
                          next.sobrestado = false;
                          if (value === "não iniciado") next.etapa_processo = "Planejamento";
                          else if (value === "iniciado") next.etapa_processo = "Iniciado";
                          else if (value === "retornado para diligência") next.etapa_processo = "Retornado para Diligência";
                          else if (value === "em andamento") next.etapa_processo = "Em Licitação";
                          else if (value === "concluído") next.etapa_processo = "Concluído";
                          else next.etapa_processo = value;
                        }
                        setEditingContratacao(next);
                      }}
                    >
                      <SelectTrigger className="h-8 px-3 text-xs font-semibold focus:ring-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="não iniciado">não iniciado</SelectItem>
                        <SelectItem value="iniciado">iniciado</SelectItem>
                        <SelectItem value="retornado para diligência">retornado para diligência</SelectItem>
                        <SelectItem value="em andamento">em andamento</SelectItem>
                        <SelectItem value="concluído">concluído</SelectItem>
                        <SelectItem value="sobrestado">sobrestado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Bloco 3: Dados Financeiros e de Quantidade */}
                <div className="grid gap-3 sm:grid-cols-12 bg-muted/30 p-3 rounded-md border border-border/50">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="edit-quantidade" className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Qtd.</Label>
                    <Input
                      id="edit-quantidade"
                      type="number"
                      min="1"
                      value={(editingContratacao as any).quantidade_itens || 1}
                      onChange={(e) => {
                        const qtd = parseInt(e.target.value) || 0;
                        const unitario = (editingContratacao as any).valor_unitario || 0;
                        setEditingContratacao({
                          ...editingContratacao,
                          quantidade_itens: qtd,
                          valor_estimado: qtd * unitario,
                        } as any);
                      }}
                      className="h-8 text-xs focus-visible:ring-1"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="edit-unidade" className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Unidade</Label>
                    <Input
                      id="edit-unidade"
                      value={(editingContratacao as any).unidade_fornecimento || "Unidade"}
                      onChange={(e) =>
                        setEditingContratacao({ ...editingContratacao, unidade_fornecimento: e.target.value } as any)
                      }
                      className="h-8 text-xs focus-visible:ring-1"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-3">
                    <Label htmlFor="edit-valor-unitario" className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Valor Unitário (R$)</Label>
                    <Input
                      id="edit-valor-unitario"
                      inputMode="numeric"
                      value={formatCurrencyNumber((editingContratacao as any).valor_unitario || 0)}
                      onChange={(e) => {
                        const formatted = formatCurrencyInput(e.target.value);
                        e.currentTarget.value = formatted;
                        const parsed = parseCurrencyInput(formatted);
                        const qtd = (editingContratacao as any).quantidade_itens || 1;
                        setEditingContratacao({
                          ...editingContratacao,
                          valor_unitario: parsed,
                          valor_estimado: qtd * parsed,
                        } as any);
                      }}
                      className="h-8 text-xs focus-visible:ring-1"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-3">
                    <Label htmlFor="edit-valor-estimado" className="text-[10px] font-semibold text-primary uppercase tracking-wider">Valor Estimado (R$)</Label>
                    <Input
                      id="edit-valor-estimado"
                      inputMode="numeric"
                      value={formatCurrencyNumber(editingContratacao.valor_estimado)}
                      readOnly
                      className="h-8 text-xs font-bold bg-primary/5 text-primary focus-visible:ring-1"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="edit-valor-executado" className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">V. Executado (R$)</Label>
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
                      className="h-8 text-xs focus-visible:ring-1"
                    />
                  </div>
                </div>

                {/* Justificativa */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="edit-justificativa" className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Justificativa</Label>
                    <AIWriter 
                      value={editingContratacao.justificativa} 
                      onUpdate={(val) => setEditingContratacao({...editingContratacao, justificativa: val})} 
                      fieldName="Justificativa" 
                    />
                  </div>
                  <Textarea
                    id="edit-justificativa"
                    value={editingContratacao.justificativa}
                    onChange={(e) =>
                      setEditingContratacao({ ...editingContratacao, justificativa: e.target.value })
                    }
                    className="min-h-[50px] text-xs resize-none focus-visible:ring-1"
                  />
                </div>

                {/* Botões de Ação */}
                <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
                  <Button variant="ghost" size="sm" onClick={() => setEditingContratacao(null)} className="h-8 text-xs tracking-wide">
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSaveEdit} className="h-8 text-xs px-6 tracking-wide shadow-sm">
                    Salvar Alterações
                  </Button>
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
