import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KPICard } from "@/components/KPICard";
import { ClipboardList, DollarSign } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Row = {
  id: string;
  descricao?: string | null;
  setor_requisitante: string;
  classe: string;
  valor_estimado: number;
  valor_contratado?: number | null;
  saldo_orcamentario?: number | null;
  modalidade: string;
  etapa_processo?: string | null;
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

// Regra de saldo no cliente (fallback):
// - Se cancelada, saldo = 0
// - Caso contrário, saldo = valor_estimado - valor_contratado
const calcSaldo = (r: Row) => {
  const executado = r.valor_contratado || 0;
  if (r.etapa_processo === "Cancelada") return 0;
  return (r.valor_estimado || 0) - executado;
};

const mapSetorName = (setor: string) => {
  if (setor === "PLANEJAMENTO") return "PLAN";
  return setor;
};

const formatId = (id: string) => {
  return `#${id.slice(-8)}`;
};

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

  const filtros = useMemo(() => ({ setor_requisitante: setor, tipo_contratacao: tipoContratacao, etapa_processo: status }), [setor, tipoContratacao, status]);

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
          "descricao",
          "setor_requisitante",
          "classe",
          "valor_estimado",
          "valor_contratado",
          "saldo_orcamentario",
          "modalidade",
          "etapa_processo",
        ].join(","), { count: "exact" });

      if (filtros.setor_requisitante) query = query.eq("setor_requisitante", filtros.setor_requisitante);
      if (filtros.tipo_contratacao) query = query.eq("tipo_contratacao", filtros.tipo_contratacao);
      if (filtros.etapa_processo) {
        const cat = statusCategoryMap[filtros.etapa_processo];
        if (cat) {
          if (cat.sobrestado) {
            query = query.eq("sobrestado", true);
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
      if (!error && data) {
        setRows(data as unknown as Row[]);
        setTotalCount(count || 0);
        
        // Calculate KPI resumo from fetched data (client-side calculation)
        // Fetch all data for KPI calculation (without pagination)
        let kpiQuery = supabase
          .from("contratacoes")
          .select("valor_estimado, valor_contratado, etapa_processo, sobrestado");
        
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
            total_demandas: allData.length,
            valor_estimado: allData.reduce((sum, r) => sum + (r.valor_estimado || 0), 0),
            valor_contratado: allData.reduce((sum, r) => sum + (r.valor_contratado || 0), 0),
            saldo_orcamentario: allData.reduce((sum, r) => sum + ((r.valor_estimado || 0) - (r.valor_contratado || 0)), 0),
            count_planejamento: allData.filter(r => r.etapa_processo === "Planejamento" || !r.etapa_processo).length,
            count_em_andamento: allData.filter(r => ["Em Licitação", "Contratado"].includes(r.etapa_processo || "")).length,
            count_concluidos: allData.filter(r => r.etapa_processo === "Concluído").length,
            count_sobrestados: allData.filter(r => r.sobrestado === true).length,
          };
          setKpiResumo(resumo);
        }
      }

      setLoading(false);
    };
    fetchData();
  }, [page, pageSize, filtros]);

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
            <Button variant="outline" onClick={() => { setSetor(undefined); setTipoContratacao(undefined); setStatus(undefined); setPage(1); }}>Limpar filtros</Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-2">
            <div className="flex items-start gap-2 overflow-x-auto whitespace-nowrap">
              <div className="basis-[37%] min-w-[420px] shrink-0">
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
              <div className="basis-[30%] min-w-[330px] shrink-0">
                <div className="text-[11px] text-muted-foreground px-0.5">Tipo de Contratação:</div>
                <div className="flex flex-nowrap gap-0.5 overflow-x-auto whitespace-nowrap py-0.5">
                  {[ALL, "Nova Contratação", "Renovação", "Aditivo Quantitativo", "Repactuação"].map((t) => (
                    <Button
                      key={t}
                      variant={tipoContratacao === (t === ALL ? undefined : t) ? "default" : "secondary"}
                      size="xs"
                      onClick={() => { setTipoContratacao(t === ALL ? undefined : t); setPage(1); }}
                    >
                      {t === ALL ? "Todos" : t}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="basis-[29%] min-w-[330px] shrink-0">
                <div className="text-[11px] text-muted-foreground px-0.5">Status:</div>
                <div className="flex flex-nowrap gap-0.5 overflow-x-auto whitespace-nowrap py-0.5">
                  {[ALL, "não iniciado", "em andamento", "concluído", "sobrestado"].map((st) => (
                    <Button
                      key={st}
                      variant={status === (st === ALL ? undefined : st) ? "default" : "secondary"}
                      size="xs"
                      onClick={() => { setStatus(st === ALL ? undefined : st); setPage(1); }}
                    >
                      {st === ALL ? "Todos" : st}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <KPICard title="Quantidade de Demandas" value={kpiResumo?.total_demandas || rows.length} icon={ClipboardList} />

          <KPICard title="Valor Estimado" value={formatCurrencyBRL(kpiResumo?.valor_estimado || rows.reduce((s, r) => s + (r.valor_estimado || 0), 0))} icon={DollarSign} />

          <KPICard title="Valor Executado" value={formatCurrencyBRL(kpiResumo?.valor_contratado || rows.reduce((s, r) => s + (r.valor_contratado || 0), 0))} icon={DollarSign} />

          <KPICard
            title="Saldo Orçamentário"
            value={(() => {
              const kpiSaldo = kpiResumo?.saldo_orcamentario;
              const fallbackSaldo = rows.reduce((s, r) => s + calcSaldo(r), 0);
              const displaySaldo = (kpiSaldo !== undefined && kpiSaldo !== null && kpiSaldo !== 0)
                ? kpiSaldo
                : fallbackSaldo;
              return formatCurrencyBRL(displaySaldo);
            })()}
            icon={DollarSign}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Demandas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tipo de Material/Serviço</TableHead>
                    <TableHead>Valor Estimado</TableHead>
                    <TableHead>Valor Executado</TableHead>
                    <TableHead>Saldo Orçamentário</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{formatId(r.id)}</TableCell>
                      <TableCell>{r.descricao}</TableCell>
                      <TableCell>{formatCurrencyBRL(r.valor_estimado)}</TableCell>
                      <TableCell>{formatCurrencyBRL(r.valor_contratado || 0)}</TableCell>
                      <TableCell>{formatCurrencyBRL(calcSaldo(r))}</TableCell>
                      <TableCell>{r.etapa_processo || "-"}</TableCell>
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
      </div>
    </Layout>
  );
};

export default SetoresDemandantes;