import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Loader2, Package, Wrench, X } from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

export interface ItemCatalogoInterno {
  id: string;
  nome: string;
  descricao: string | null;
  tipo: string;
  codigo: string | null;
  grupo: string | null;
}

interface CatalogoInternoSearchProps {
  onSelect: (item: ItemCatalogoInterno) => void;
  itemSelecionado: ItemCatalogoInterno | null;
  onClear: () => void;
  filtroGrupo?: string;
  headerElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export function CatalogoInternoSearch({ onSelect, itemSelecionado, onClear, filtroGrupo, headerElement, rightElement }: CatalogoInternoSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState<ItemCatalogoInterno[]>([]);
  const [loading, setLoading] = useState(false);

  // Se tivermos poucos itens (ex: < 1000), podemos carregar todos no início para uma busca rápida no frontend,
  // mas como boa prática, vamos fazer busca no banco. Para o catálogo interno, vamos carregar tudo e filtrar no frontend 
  // se for pequeno, ou fazer debounce. Vamos fazer busca simples inicial.
  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(true);
      let query = supabase
        .from("catalogo_interno")
        .select("*")
        .eq("ativo", true)
        .order("nome", { ascending: true })
        .limit(50);
      
      if (filtroGrupo) {
        query = query.eq("grupo", filtroGrupo);
      }
      
      const { data, error } = await query;
      
      if (!error && data) {
        setItems(data);
      }
      setLoading(false);
    };
    fetchInitial();
  }, [filtroGrupo]);

  const handleSearch = async (term: string) => {
    setLoading(true);
    let query = supabase
      .from("catalogo_interno")
      .select("*")
      .eq("ativo", true)
      .order("nome", { ascending: true })
      .limit(50);

    if (filtroGrupo) {
      query = query.eq("grupo", filtroGrupo);
    }

    if (term.trim()) {
      query = query.or(`nome.ilike.%${term}%,codigo.ilike.%${term}%`);
    }

    const { data, error } = await query;

    if (error) {
      toast.error("Erro ao buscar no catálogo: " + error.message);
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchTerm);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm, filtroGrupo]);

  if (itemSelecionado) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 relative">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 text-primary p-2 rounded-lg mt-1">
            {itemSelecionado.tipo === 'material' ? <Package className="h-5 w-5" /> : <Wrench className="h-5 w-5" />}
          </div>
          <div className="flex-1 pr-8">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                {itemSelecionado.tipo === 'servico' ? 'SERVIÇO' : 'MATERIAL'}
              </span>
              {itemSelecionado.codigo && (
                <span className="text-xs font-mono text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">
                  CÓDIGO: {itemSelecionado.codigo}
                </span>
              )}
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white mt-1 text-lg leading-tight">
              {itemSelecionado.nome}
            </h4>
            {itemSelecionado.descricao && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {itemSelecionado.descricao}
              </p>
            )}
            {itemSelecionado.grupo && (
              <p className="text-xs text-slate-500 mt-2 font-medium">
                Grupo/Categoria: {itemSelecionado.grupo}
              </p>
            )}
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClear}
          className="absolute top-2 right-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 relative group flex flex-col h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {headerElement && (
          <div className="flex-shrink-0">
            {headerElement}
          </div>
        )}
        <div className="flex flex-col md:flex-row items-center gap-4 flex-1 justify-end">
          <div className="relative flex items-center transition-all duration-300 ring-1 ring-slate-200 dark:ring-slate-800 rounded-lg focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 overflow-hidden bg-white dark:bg-slate-900 shadow-sm w-full max-w-2xl">
            <Search className="absolute left-3 h-5 w-5 text-slate-400" />
            <Input 
              placeholder="Digite o nome ou código para buscar..." 
              className="pl-10 border-0 focus-visible:ring-0 shadow-none h-10 bg-transparent text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {loading && <Loader2 className="absolute right-3 h-5 w-5 animate-spin text-slate-400" />}
          </div>
          {rightElement && (
            <div className="flex-shrink-0">
              {rightElement}
            </div>
          )}
        </div>
      </div>

      <Card className="flex-1 border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm rounded-none">
        <ScrollArea className="h-[500px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full py-8 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p>Buscando no catálogo...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-8 text-slate-500">
              <Search className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-lg font-medium text-slate-900 dark:text-slate-300">Nenhum item encontrado</p>
              <p className="text-sm">Tente usar outros termos para a busca.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-[#D9415D] sticky top-0 z-10 shadow-sm hover:bg-[#D9415D]">
                <TableRow className="hover:bg-[#D9415D]">
                  <TableHead className="w-[100px] text-white font-bold">Tipo</TableHead>
                  <TableHead className="w-[120px] text-white font-bold">Código</TableHead>
                  <TableHead className="text-white font-bold">Objeto</TableHead>
                  <TableHead className="w-[150px] text-white font-bold">Grupo</TableHead>
                  <TableHead className="w-[80px] text-right text-white font-bold">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow 
                    key={item.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer group transition-colors"
                    onClick={() => onSelect(item)}
                  >
                    <TableCell>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        item.tipo === 'material' 
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {item.tipo === 'servico' ? 'SERVIÇO' : 'MATERIAL'}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 font-mono">
                      {item.codigo || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                        {item.nome}
                      </div>
                      {item.descricao && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1" title={item.descricao}>
                          {item.descricao}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 truncate max-w-[150px]" title={item.grupo || ''}>
                      {item.grupo || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" className="h-7 text-xs border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                        Selecionar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ScrollArea>
      </Card>
    </div>
  );
}
