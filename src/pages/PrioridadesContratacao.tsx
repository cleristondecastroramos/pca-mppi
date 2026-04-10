import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { translateError } from "@/lib/utils/error-translations";
import { Loader2, AlertTriangle, Circle, ArrowDownCircle } from "lucide-react";
import { useAuthSession, useUserRoles, useUserProfile, hasAnyRole } from "@/lib/auth";

type Contratacao = Tables<"contratacoes">;

const PrioridadesContratacao = () => {
  const { data: session } = useAuthSession();
  const uid = session?.user?.id;
  const { data: roles } = useUserRoles(uid);
  const { data: userProfile } = useUserProfile(uid);
  const isSetorRequisitante = hasAnyRole(roles, ["setor_requisitante"]) && !hasAnyRole(roles, ["administrador", "gestor"]);
  const userSetor = userProfile?.setor || null;

  const [rows, setRows] = useState<Contratacao[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");

  useEffect(() => {
    if (roles === undefined || (isSetorRequisitante && !userSetor)) return;
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from("contratacoes")
          .select("id, descricao, setor_requisitante, grau_prioridade, valor_estimado, etapa_processo, sobrestado")
          .order("created_at", { ascending: false });

        if (isSetorRequisitante && userSetor) {
          const allowedSectors = [userSetor, ...(userProfile?.setores_adicionais || [])];
          query = query.in("setor_requisitante", allowedSectors);
        }

        const { data, error } = await query;
        if (error) throw error;
        if (mounted) setRows((data as any) || []);
      } catch (e: any) {
        toast.error("Erro ao carregar prioridades", { description: translateError(e.message || String(e)) });
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
  }, [roles, userSetor]);

  function statusLabel(c: Contratacao) {
    if ((c as any).sobrestado === true) return "sobrestado";
    const etapa = c.etapa_processo?.toLowerCase() || "";
    if (etapa === "iniciado") return "iniciado";
    if (etapa === "retornado para diligência") return "retornado para diligência";
    if (c.etapa_processo === "Concluído") return "concluído";
    if (c.etapa_processo === "Em Licitação" || c.etapa_processo === "Contratado") return "em andamento";
    return "não iniciado";
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      const matches = r.descricao.toLowerCase().includes(q) || (r.setor_requisitante || "").toLowerCase().includes(q);
      if (!matches) return false;
      if (filtroStatus === "todos") return true;
      return statusLabel(r) === filtroStatus;
    });
  }, [rows, search, filtroStatus]);

  const grupos = useMemo(() => {
    const map: Record<string, Contratacao[]> = { Alta: [], Média: [], Baixa: [] };
    filtered.forEach((r) => {
      const p = r.grau_prioridade || "Média";
      (map[p] || (map[p] = [])).push(r);
    });
    return map;
  }, [filtered]);

  const kpis = useMemo(() => {
    const tot = (arr: Contratacao[]) => arr.reduce((s, r) => s + (r.valor_estimado || 0), 0);
    return {
      alta: { qtd: grupos.Alta.length, valor: tot(grupos.Alta) },
      media: { qtd: grupos.Média.length, valor: tot(grupos.Média) },
      baixa: { qtd: grupos.Baixa.length, valor: tot(grupos.Baixa) },
    };
  }, [grupos]);

  const setPrioridade = async (row: Contratacao, value: string) => {
    try {
      const { data: before } = await supabase.from("contratacoes").select("*").eq("id", row.id).single();
      const { error } = await supabase.from("contratacoes").update({ grau_prioridade: value, updated_at: new Date().toISOString() }).eq("id", row.id);
      if (error) throw error;
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        await supabase.from("contratacoes_historico").insert({
          contratacao_id: row.id,
          user_id: userData.user.id,
          acao: "Priorização",
          dados_anteriores: before,
          dados_novos: { ...(before || {}), grau_prioridade: value },
        });
      }
      toast.success("Prioridade atualizada");
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, grau_prioridade: value } : r)));
    } catch (e: any) {
      toast.error("Falha ao atualizar prioridade", { description: translateError(e.message || String(e)) });
    }
  };

  const fmtBRL = (n: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
  const getStatusBadge = (label: string) => {
    const variants: Record<string, { variant: any; className: string }> = {
      "não iniciado": { variant: "secondary", className: "bg-info/10 text-info hover:bg-info/20" },
      "iniciado": { variant: "secondary", className: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20" },
      "retornado para diligência": { variant: "secondary", className: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20" },
      "em andamento": { variant: "secondary", className: "bg-warning/10 text-warning hover:bg-warning/20" },
      "concluído": { variant: "secondary", className: "bg-success/10 text-success hover:bg-success/20" },
      "sobrestado": { variant: "secondary", className: "bg-muted/10 text-muted-foreground hover:bg-muted/20" },
    };
    return variants[label] || variants["não iniciado"];
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Prioridades de Contratação</h1>
            <p className="text-sm text-muted-foreground">Defina e acompanhe prioridades por demanda.</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-3">
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex-1 min-w-[220px]">
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por descrição ou setor" />
              </div>
              <div className="w-[200px]">
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="não iniciado">Não iniciado</SelectItem>
                    <SelectItem value="iniciado">Iniciado</SelectItem>
                    <SelectItem value="retornado para diligência">Retornado para diligência</SelectItem>
                    <SelectItem value="em andamento">Em andamento</SelectItem>
                    <SelectItem value="concluído">Concluído</SelectItem>
                    <SelectItem value="sobrestado">Sobrestado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Alta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs text-muted-foreground">{kpis.alta.qtd} demandas • {fmtBRL(kpis.alta.valor)}</div>
              {loading ? (
                <div className="flex items-center justify-center h-24 text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Carregando...</div>
              ) : grupos.Alta.length === 0 ? (
                <div className="text-sm text-muted-foreground">Sem demandas</div>
              ) : (
                grupos.Alta.map((r) => (
                  <div key={r.id} className="border rounded p-2">
                    <div className="flex items-center gap-2">
                      <div className="truncate" title={r.descricao}>{r.descricao}</div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px] bg-muted/10 text-muted-foreground hover:bg-muted/20">
                        {r.setor_requisitante || "—"}
                      </Badge>
                      {(() => {
                        const s = statusLabel(r);
                        const b = getStatusBadge(s);
                        return <Badge variant={b.variant as any} className={`text-[10px] ${b.className}`}>{s}</Badge>;
                      })()}
                      <Badge variant="destructive" className="text-[10px]">Alta</Badge>
                      <span>{fmtBRL(r.valor_estimado || 0)}</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Circle className="h-4 w-4 text-warning" />
                Média
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs text-muted-foreground">{kpis.media.qtd} demandas • {fmtBRL(kpis.media.valor)}</div>
              {loading ? (
                <div className="flex items-center justify-center h-24 text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Carregando...</div>
              ) : grupos.Média.length === 0 ? (
                <div className="text-sm text-muted-foreground">Sem demandas</div>
              ) : (
                grupos.Média.map((r) => (
                  <div key={r.id} className="border rounded p-2">
                    <div className="flex items-center gap-2">
                      <div className="truncate" title={r.descricao}>{r.descricao}</div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px] bg-muted/10 text-muted-foreground hover:bg-muted/20">
                        {r.setor_requisitante || "—"}
                      </Badge>
                      {(() => {
                        const s = statusLabel(r);
                        const b = getStatusBadge(s);
                        return <Badge variant={b.variant as any} className={`text-[10px] ${b.className}`}>{s}</Badge>;
                      })()}
                      <Badge variant="secondary" className="text-[10px] bg-warning/10 text-warning hover:bg-warning/20">Média</Badge>
                      <span>{fmtBRL(r.valor_estimado || 0)}</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowDownCircle className="h-4 w-4 text-muted-foreground" />
                Baixa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs text-muted-foreground">{kpis.baixa.qtd} demandas • {fmtBRL(kpis.baixa.valor)}</div>
              {loading ? (
                <div className="flex items-center justify-center h-24 text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Carregando...</div>
              ) : grupos.Baixa.length === 0 ? (
                <div className="text-sm text-muted-foreground">Sem demandas</div>
              ) : (
                grupos.Baixa.map((r) => (
                  <div key={r.id} className="border rounded p-2">
                    <div className="flex items-center gap-2">
                      <div className="truncate" title={r.descricao}>{r.descricao}</div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px] bg-muted/10 text-muted-foreground hover:bg-muted/20">
                        {r.setor_requisitante || "—"}
                      </Badge>
                      {(() => {
                        const s = statusLabel(r);
                        const b = getStatusBadge(s);
                        return <Badge variant={b.variant as any} className={`text-[10px] ${b.className}`}>{s}</Badge>;
                      })()}
                      <Badge variant="secondary" className="text-[10px] bg-muted text-muted-foreground">Baixa</Badge>
                      <span>{fmtBRL(r.valor_estimado || 0)}</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default PrioridadesContratacao;
