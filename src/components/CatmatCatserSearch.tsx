import { useEffect } from "react";
import { useCatmatCatser, type ItemCatalogo, type TipoCatalogo } from "@/hooks/useCatmatCatser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  RefreshCw,
  Search,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  Package,
  Wrench,
  Loader2,
  Info,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// ─── Props ────────────────────────────────────────────────────────────────────

interface CatmatCatserSearchProps {
  /** Chamado quando o usuário seleciona um item do catálogo */
  onSelect: (item: ItemCatalogo) => void;
  /** Item atualmente selecionado (para exibir o badge de seleção) */
  itemSelecionado?: ItemCatalogo | null;
  /** Permite limpar a seleção atual */
  onClear?: () => void;
}

// ─── Utilitários visuais ──────────────────────────────────────────────────────

function BadgeTipo({ tipo }: { tipo: TipoCatalogo }) {
  if (tipo === "CATMAT") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
        <Package className="h-3 w-3" /> CATMAT
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-700">
      <Wrench className="h-3 w-3" /> CATSER
    </span>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function CatmatCatserSearch({
  onSelect,
  itemSelecionado,
  onClear,
}: CatmatCatserSearchProps) {
  const {
    tipo,
    grupos,
    grupoSelecionado,
    itensFiltrados,
    textoBusca,
    paginaAtual,
    totalPaginas,
    totalRegistros,
    loadingGrupos,
    loadingItens,
    erroGrupos,
    erroItens,
    setTipo,
    setGrupoSelecionado,
    setBusca,
    irParaPagina,
    carregarGrupos,
    retryGrupos,
    retryItens,
  } = useCatmatCatser();

  // Carrega os grupos CATMAT ao montar
  useEffect(() => {
    carregarGrupos("CATMAT");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Renderização do item selecionado ────────────────────────────────────────
  if (itemSelecionado) {
    return (
      <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-900/20 p-4 space-y-2 animate-in fade-in duration-300">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">
                Item do Catálogo Selecionado
              </p>
              <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5 leading-tight">
                {itemSelecionado.descricaoItem}
              </p>
            </div>
          </div>
          {onClear && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-400 hover:text-red-500 flex-shrink-0"
              onClick={onClear}
              title="Remover seleção e buscar novamente"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2 pl-7">
          <BadgeTipo tipo={itemSelecionado.tipo} />
          <Badge variant="outline" className="text-[10px] font-mono">
            Cód. {itemSelecionado.codigoItem}
          </Badge>
          {itemSelecionado.nomeGrupo && (
            <Badge variant="secondary" className="text-[10px]">
              {itemSelecionado.nomeGrupo}
            </Badge>
          )}
          {itemSelecionado.nomeClasse && (
            <Badge variant="secondary" className="text-[10px]">
              {itemSelecionado.nomeClasse}
            </Badge>
          )}
          {itemSelecionado.nomePdm && (
            <Badge variant="outline" className="text-[10px]">
              PDM: {itemSelecionado.nomePdm}
            </Badge>
          )}
        </div>
      </div>
    );
  }

  // ── Interface de busca ──────────────────────────────────────────────────────
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">

      {/* Cabeçalho com abas CATMAT / CATSER */}
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        {(["CATMAT", "CATSER"] as TipoCatalogo[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTipo(t)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
              tipo === t
                ? "bg-primary text-primary-foreground"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            {t === "CATMAT" ? (
              <Package className="h-4 w-4" />
            ) : (
              <Wrench className="h-4 w-4" />
            )}
            {t === "CATMAT" ? "Material (CATMAT)" : "Serviço (CATSER)"}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-3">
        {/* Linha 1: Seleção de grupo */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            1. Selecione o Grupo do Catálogo
          </label>

          {erroGrupos ? (
            <div className="flex items-center gap-2 p-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-sm text-red-700 dark:text-red-300">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1">{erroGrupos}</span>
              <Button variant="ghost" size="sm" onClick={retryGrupos} className="h-7 px-2 text-red-600">
                <RefreshCw className="h-3.5 w-3.5 mr-1" /> Tentar novamente
              </Button>
            </div>
          ) : (
            <Select
              value={grupoSelecionado ? String(grupoSelecionado.codigoGrupo) : ""}
              onValueChange={(v) => {
                const g = grupos.find((g) => String(g.codigoGrupo) === v);
                setGrupoSelecionado(g ?? null);
              }}
              disabled={loadingGrupos}
            >
              <SelectTrigger className="bg-slate-50/50 dark:bg-slate-800/50 border">
                {loadingGrupos ? (
                  <span className="flex items-center gap-2 text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin" /> Carregando grupos...
                  </span>
                ) : (
                  <SelectValue placeholder="Selecione um grupo para pesquisar..." />
                )}
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {grupos.map((g) => (
                  <SelectItem key={g.codigoGrupo} value={String(g.codigoGrupo)}>
                    <span className="text-xs text-muted-foreground mr-2 font-mono">
                      {String(g.codigoGrupo).padStart(3, "0")}
                    </span>
                    {g.nomeGrupo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Linha 2: Filtro de texto (aparece após seleção de grupo) */}
        {grupoSelecionado && (
          <div className="space-y-1 animate-in fade-in duration-200">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              2. Filtre por Descrição ou Código
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="catmat-busca-texto"
                placeholder="Ex: papel, caneta, impressora..."
                value={textoBusca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9 bg-slate-50/50 dark:bg-slate-800/50"
                disabled={loadingItens}
              />
              {textoBusca && (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setBusca("")}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Estado de carregamento de itens */}
        {loadingItens && (
          <div className="flex items-center justify-center gap-2 py-8 text-slate-500 dark:text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm">Consultando catálogo oficial do governo...</span>
          </div>
        )}

        {/* Erro ao carregar itens */}
        {erroItens && !loadingItens && (
          <div className="flex items-center gap-2 p-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-sm text-red-700 dark:text-red-300">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1">{erroItens}</span>
            <Button variant="ghost" size="sm" onClick={retryItens} className="h-7 px-2 text-red-600">
              <RefreshCw className="h-3.5 w-3.5 mr-1" /> Tentar novamente
            </Button>
          </div>
        )}

        {/* Tabela de itens */}
        {!loadingItens && !erroItens && grupoSelecionado && itensFiltrados.length > 0 && (
          <div className="space-y-2 animate-in fade-in duration-200">
            {/* Cabeçalho informativo */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Info className="h-3.5 w-3.5" />
                {textoBusca
                  ? `${itensFiltrados.length} itens filtrados`
                  : `${itensFiltrados.length} de ${totalRegistros.toLocaleString("pt-BR")} itens do grupo`}
              </p>
              <BadgeTipo tipo={tipo} />
            </div>

            <ScrollArea className="h-72 rounded-lg border border-slate-200 dark:border-slate-700">
              <Table>
                <TableHeader className="sticky top-0 bg-slate-50 dark:bg-slate-800 z-10">
                  <TableRow>
                    <TableHead className="text-xs w-24">Código</TableHead>
                    <TableHead className="text-xs">Descrição Padronizada</TableHead>
                    <TableHead className="text-xs w-36 hidden md:table-cell">Classe / PDM</TableHead>
                    <TableHead className="text-xs w-24 text-center">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itensFiltrados.map((item) => (
                    <TableRow
                      key={item.codigoItem}
                      className="hover:bg-primary/5 cursor-pointer"
                      onClick={() => onSelect(item)}
                    >
                      <TableCell className="font-mono text-xs font-semibold text-primary">
                        {item.codigoItem}
                      </TableCell>
                      <TableCell className="text-xs leading-snug">
                        {item.descricaoItem}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="space-y-0.5">
                          {item.nomeClasse && (
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              {item.nomeClasse}
                            </p>
                          )}
                          {item.nomePdm && (
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">
                              {item.nomePdm}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          type="button"
                          size="xs"
                          variant="outline"
                          className="h-7 text-[11px] border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect(item);
                          }}
                        >
                          Selecionar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>

            {/* Paginação */}
            {totalPaginas > 1 && !textoBusca && (
              <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-slate-400">
                  Página {paginaAtual} de {totalPaginas}
                </p>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => irParaPagina(paginaAtual - 1)}
                    disabled={paginaAtual <= 1 || loadingItens}
                    className="h-7 px-2"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => irParaPagina(paginaAtual + 1)}
                    disabled={paginaAtual >= totalPaginas || loadingItens}
                    className="h-7 px-2"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Estado vazio (grupo selecionado mas sem itens filtrados) */}
        {!loadingItens && !erroItens && grupoSelecionado && itensFiltrados.length === 0 && (
          <div className="text-center py-8 text-slate-400 dark:text-slate-500 space-y-1">
            <Search className="h-8 w-8 mx-auto opacity-40" />
            <p className="text-sm">
              {textoBusca
                ? `Nenhum item encontrado para "${textoBusca}" neste grupo.`
                : "Nenhum item disponível neste grupo."}
            </p>
            {textoBusca && (
              <Button
                type="button"
                variant="link"
                size="sm"
                className="text-xs"
                onClick={() => setBusca("")}
              >
                Limpar filtro
              </Button>
            )}
          </div>
        )}

        {/* Estado inicial (nenhum grupo selecionado ainda) */}
        {!grupoSelecionado && !loadingGrupos && !erroGrupos && (
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 px-1 py-2">
            <Info className="h-4 w-4 flex-shrink-0" />
            <span>
              Selecione um grupo acima para listar os itens disponíveis no catálogo
              oficial {tipo}.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
