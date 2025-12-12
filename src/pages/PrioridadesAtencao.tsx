import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CalendarDays, AlertTriangle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type AttItem = {
  id: string;
  descricao: string;
  setor_requisitante: string | null;
  data_prevista_contratacao: string | null;
  etapa_processo: string | null;
  sobrestado?: boolean | null;
};

function daysUntil(dateStr: string | null) {
  if (!dateStr) return null;
  const today = new Date();
  const target = new Date(dateStr);
  const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

function minusDays(dateStr: string | null, days: number) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

const PrioridadesAtencao = () => {
  const [items, setItems] = useState<AttItem[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("contratacoes")
        .select("id, descricao, setor_requisitante, etapa_processo, sobrestado, data_prevista_contratacao")
        .order("data_prevista_contratacao", { ascending: true });
      setItems((data as any) || []);
    };
    load();
  }, []);

  const acompanhamentoImediato = useMemo(() => {
    const today = new Date();
    const in30Days = new Date();
    in30Days.setDate(today.getDate() + 30);
    return items.filter((i) => {
      const d = i.data_prevista_contratacao ? new Date(i.data_prevista_contratacao) : null;
      const near = d ? d >= today && d <= in30Days : false;
      const sob = i.sobrestado === true;
      const highPending = (i.etapa_processo ?? "") === "Planejamento";
      return sob || near || highPending;
    });
  }, [items]);

  const agendaCLC = useMemo(() => {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return items
      .map((i) => ({ ...i, pgea_data: minusDays(i.data_prevista_contratacao, 120) }))
      .filter((i) => {
        if (!i.pgea_data) return false;
        const d = new Date(i.pgea_data);
        return d >= monthStart && d <= monthEnd;
      });
  }, [items]);

  const calendarioMensal = useMemo(() => {
    const byDay = new Map<string, AttItem[]>();
    agendaCLC.forEach((i) => {
      const day = i.pgea_data as string;
      byDay.set(day, [...(byDay.get(day) || []), i]);
    });
    return Array.from(byDay.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [agendaCLC]);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Pontos de Atenção</h1>
            <p className="text-sm text-muted-foreground">Acompanhamento imediato e agenda da CLC (PGEA).</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Acompanhamento Imediato</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="space-y-3">
              {acompanhamentoImediato.length === 0 ? (
                <div className="p-3 rounded border text-sm text-muted-foreground">Nenhum item crítico no momento.</div>
              ) : (
                acompanhamentoImediato.map((i) => {
                  const dias = daysUntil(i.data_prevista_contratacao);
                  const status = i.sobrestado ? "destructive" : dias !== null && dias <= 7 ? "warning" : "secondary";
                  return (
                    <div key={i.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent/5">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{i.descricao}</p>
                        <p className="text-sm text-muted-foreground">{i.setor_requisitante || "—"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm px-2 py-1 rounded ${status === "destructive" ? "bg-destructive/10 text-destructive" : status === "warning" ? "bg-warning/10 text-warning" : "bg-muted/40 text-muted-foreground"}`}>
                          {i.sobrestado ? "Sobrestado" : dias !== null ? `Prevista em ${dias} dias` : "Sem data"}
                        </span>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2"><CalendarDays className="h-4 w-4" />Agenda CLC (PGEA neste mês)</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            {agendaCLC.length === 0 ? (
              <div className="p-3 rounded border text-sm text-muted-foreground">Nenhum PGEA agendado para este mês.</div>
            ) : (
              <div className="space-y-3">
                {calendarioMensal.map(([dia, itens]) => (
                  <div key={dia} className="border rounded p-3">
                    <div className="text-sm font-medium">{new Date(dia).toLocaleDateString("pt-BR")}</div>
                    <div className="mt-2 space-y-2">
                      {itens.map((i) => (
                        <div key={i.id} className="flex items-center justify-between">
                          <div>
                            <div className="text-sm">{i.descricao}</div>
                            <div className="text-xs text-muted-foreground">{i.setor_requisitante || "—"}</div>
                          </div>
                          <span className="text-xs text-muted-foreground">Prevista: {i.data_prevista_contratacao ? new Date(i.data_prevista_contratacao).toLocaleDateString("pt-BR") : "—"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PrioridadesAtencao;
