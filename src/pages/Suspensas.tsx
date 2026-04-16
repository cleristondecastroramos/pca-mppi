import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PauseCircle, DollarSign, Database, PlayCircle, Search } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const formatCurrencyBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

const formatId = (id: string, codigo?: string | null) => {
  if (!codigo) return id.slice(-4).toUpperCase();
  return codigo.toUpperCase().replace(/^PCA-/, "").replace(/-2026$/, "");
};

const ALL_VALUE = "__all__";

type Filtros = {
  unidade_orcamentaria: string;
  setor_requisitante: string;
  tipo_contratacao: string;
  tipo_recurso: string;
  classe: string;
  grau_prioridade: string;
  normativo: string;
  modalidade: string;
};

const FILTROS_INICIAIS: Filtros = {
  unidade_orcamentaria: ALL_VALUE,
  setor_requisitante: ALL_VALUE,
  tipo_contratacao: ALL_VALUE,
  tipo_recurso: ALL_VALUE,
  classe: ALL_VALUE,
  grau_prioridade: ALL_VALUE,
  normativo: ALL_VALUE,
  modalidade: ALL_VALUE,
};

const Suspensas = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_INICIAIS);
  const [searchTerm, setSearchTerm] = useState("");
  const [demandaToReactivate, setDemandaToReactivate] = useState<any | null>(null);
  const [isReactivating, setIsReactivating] = useState(false);

  const setFiltro = (key: keyof Filtros, value: string) =>
    setFiltros((prev) => ({ ...prev, [key]: value }));

  const clearFiltros = () => {
    setFiltros(FILTROS_INICIAIS);
    setSearchTerm("");
  };

  const fetchSuspensas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contratacoes')
      .select('*, parent_id, parent:parent_id(codigo)')
      .eq('sobrestado', true)
      .order('parent_id')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Erro ao carregar demandas suspensas.");
      console.error(error);
    } else {
      setRows(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSuspensas();
  }, []);

  // Opções distintas para os selects (derivadas dos dados carregados)
  const distinctOptions = useMemo(() => {
    const build = (key: string) => {
      const s = new Set<string>();
      rows.forEach((r) => {
        const v = r[key] as string | null;
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
    return {
      unidade_orcamentaria: orderedUO,
      setor_requisitante: build("setor_requisitante"),
      tipo_contratacao: build("tipo_contratacao"),
      tipo_recurso: build("tipo_recurso"),
      classe: build("classe"),
      grau_prioridade: build("grau_prioridade"),
      normativo: build("normativo"),
      modalidade: build("modalidade"),
    };
  }, [rows]);

  const filteredRows = useMemo(() => {
    let result = rows;

    // Busca textual
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      result = result.filter((r) => {
        if (r.codigo?.toLowerCase().includes(term) || r.id.toLowerCase().includes(term)) return true;
        return [r.descricao, r.setor_requisitante, r.classe]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term);
      });
    }

    // Filtros dropdown
    const applyEq = (filtroKey: keyof Filtros, rowKey: string) => {
      const v = filtros[filtroKey];
      if (v && v !== ALL_VALUE) {
        result = result.filter((r) => String(r[rowKey]) === v);
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

    return result;
  }, [rows, filtros, searchTerm]);

  const totalRetido = filteredRows.reduce((acc, r) => acc + (r.valor_estimado || 0), 0);
  const totalItens = filteredRows.length;
  const filhasCount = filteredRows.filter(r => r.parent_id !== null).length;

  const handleReativar = (row: any) => {
    setDemandaToReactivate(row);
  };

  const handleConfirmReativar = async () => {
    if (!demandaToReactivate) return;
    setIsReactivating(true);

    try {
      const { error } = await supabase.rpc('reativar_suspensao', { p_id: demandaToReactivate.id });
      if (error) throw error;

      toast.success("Demanda reativada com sucesso!");
      setDemandaToReactivate(null);
      fetchSuspensas();
    } catch (error: any) {
      toast.error("Erro ao reativar: " + error.message);
      console.error(error);
    } finally {
      setIsReactivating(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Demandas Suspensas</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Visualize, analise e reative processos e demandas atualmente sobrestadas ou estacionadas.
            </p>
          </div>
        </div>

        {/* KPIs Isolados */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-orange-900">Valor Retido (Estimado)</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700">{formatCurrencyBRL(totalRetido)}</div>
              <p className="text-xs text-orange-600/80 mt-1">Montante estacionário não computado no fluxo orçamentário ativo.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Volume de Demandas</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalItens}</div>
              <p className="text-xs text-muted-foreground mt-1">Processos listados com a flag de suspensão total.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ocorrências Parciais (Filhas)</CardTitle>
              <PauseCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{filhasCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Derivadas de sobrestamentos parciais.</p>
            </CardContent>
          </Card>
        </div>

        {/* Barra de filtros */}
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
                      <SelectItem className="text-xs" key={opt} value={opt}>{opt}</SelectItem>
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
              <div className="ml-auto shrink-0">
                <Button size="xs" variant="outline" onClick={clearFiltros} className="h-9">Limpar filtros</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Busca textual */}
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
        </div>

        {/* Tabela de Dados */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Tabela Hierárquica de Suspensas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="w-[120px] font-semibold text-center">Cod. PCA</TableHead>
                    <TableHead className="font-semibold max-w-[300px]">Descrição Resumida</TableHead>
                    <TableHead className="w-[100px] font-semibold text-center">Unid.</TableHead>
                    <TableHead className="w-[140px] font-semibold text-right">Valor Retido</TableHead>
                    <TableHead className="w-[160px] font-semibold text-center">Hierarquia da Origem</TableHead>
                    <TableHead className="w-[140px] font-semibold text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">Carregando dados...</TableCell>
                    </TableRow>
                  ) : filteredRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <PauseCircle className="h-8 w-8 text-slate-300" />
                          <span>Nenhuma demanda suspensa encontrada.</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRows.map((r) => {
                      const isFilha = !!r.parent_id;
                      return (
                        <TableRow key={r.id} className={`${isFilha ? 'bg-orange-50/10' : ''}`}>
                          <TableCell className="text-sm font-medium text-center">
                            {isFilha && <span className="inline-block w-4 text-orange-400 font-bold opacity-50 mr-1">↳</span>}
                            {formatId(r.id, r.codigo)}
                          </TableCell>
                          <TableCell className="max-w-[300px] truncate" title={r.descricao || ""}>
                            {r.descricao || <span className="italic text-muted-foreground">S/ DESCRIÇÃO</span>}
                          </TableCell>
                          <TableCell className="text-center text-xs text-muted-foreground">
                            {r.unidade_orcamentaria || "-"}
                          </TableCell>
                          <TableCell className="text-right font-medium text-orange-600">
                            {formatCurrencyBRL(r.valor_estimado)}
                          </TableCell>
                          <TableCell className="text-center">
                            {isFilha ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-[10px] font-semibold bg-slate-100 border text-slate-700 px-2 py-1 rounded cursor-pointer hover:bg-slate-200">
                                    Origem: {r.parent?.codigo ? formatId(r.parent_id, r.parent.codigo) : r.parent_id.slice(-4).toUpperCase()}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  Vinculado à demanda base devido a sobrestamento parcial.
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <span className="text-[10px] bg-slate-50 text-muted-foreground italic px-2 py-1 rounded-sm border-dashed border">
                                Suspensão Total
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="xs"
                              className="h-7 text-xs flex items-center gap-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={() => handleReativar(r)}
                            >
                              <PlayCircle className="h-3 w-3" /> Reativar
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Reativação */}
      <Dialog open={!!demandaToReactivate} onOpenChange={(open) => !open && setDemandaToReactivate(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader className="bg-primary px-6 py-4 -mx-6 -mt-6 rounded-t-lg mb-2">
            <DialogTitle className="text-primary-foreground">Reativar Demanda</DialogTitle>
            <DialogDescription className="text-primary-foreground/90">
              Confirme os detalhes da operação de reativação abaixo.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {demandaToReactivate && (
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-md text-sm border">
                  <p><strong>Código PCA:</strong> {formatId(demandaToReactivate.id, demandaToReactivate.codigo)}</p>
                  <p className="line-clamp-3 break-words whitespace-normal mt-1">
                    <strong>Descrição:</strong> {demandaToReactivate.descricao || "S/ DESCRIÇÃO"}
                  </p>
                </div>

                {demandaToReactivate.parent_id ? (
                  <div className="bg-orange-50 border border-orange-200 text-orange-900 p-4 rounded-md text-sm">
                    <p className="font-semibold mb-2 flex items-center gap-1.5"><PlayCircle className="w-4 h-4"/> Fusão Reversa (Suspensão Parcial)</p>
                    <p className="opacity-90">Esta demanda separada (filha) será excluída e seus quantitativos retornarão integralmente para a Demanda Origem.</p>
                    <div className="mt-3 p-2 bg-orange-100/50 rounded-sm text-xs font-medium space-y-1">
                      <p>➤ <strong>Pai / Origem:</strong> {demandaToReactivate.parent?.codigo ? formatId(demandaToReactivate.parent_id, demandaToReactivate.parent.codigo) : formatId(demandaToReactivate.parent_id)}</p>
                      <p>➤ <strong>Valor da Fusão:</strong> {formatCurrencyBRL(demandaToReactivate.valor_estimado)}</p>
                      <p>➤ <strong>Itens Transferidos:</strong> {demandaToReactivate.quantidade_itens} unidades</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 text-blue-900 p-4 rounded-md text-sm">
                    <p className="font-semibold mb-2 flex items-center gap-1.5"><PlayCircle className="w-4 h-4"/> Voltar ao Fluxo (Suspensão Total)</p>
                    <p className="opacity-90">A tag de <strong>sobrestamento</strong> será removida da demanda e ela voltará para a contabilidade orçamentária.</p>
                    <div className="mt-3 p-2 bg-blue-100/50 rounded-sm text-xs font-medium space-y-1">
                      <p>➤ <strong>Retorna à Etapa:</strong> Planejamento</p>
                      <p>➤ <strong>Valor reativado:</strong> {formatCurrencyBRL(demandaToReactivate.valor_estimado)}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDemandaToReactivate(null)} disabled={isReactivating}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmReativar} disabled={isReactivating} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isReactivating ? "Processando..." : "Confirmar Reativação"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Suspensas;
