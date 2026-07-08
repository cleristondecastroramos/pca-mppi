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
}

export function CatalogoInternoSearch({ onSelect, itemSelecionado, onClear }: CatalogoInternoSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState<ItemCatalogoInterno[]>([]);
  const [loading, setLoading] = useState(false);

  // Se tivermos poucos itens (ex: < 1000), podemos carregar todos no início para uma busca rápida no frontend,
  // mas como boa prática, vamos fazer busca no banco. Para o catálogo interno, vamos carregar tudo e filtrar no frontend 
  // se for pequeno, ou fazer debounce. Vamos fazer busca simples inicial.
  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("catalogo_interno")
        .select("*")
        .eq("ativo", true)
        .order("nome", { ascending: true })
        .limit(50);
      
      if (!error && data) {
        setItems(data);
      }
      setLoading(false);
    };
    fetchInitial();
  }, []);

  const handleSearch = async (term: string) => {
    setLoading(true);
    let query = supabase
      .from("catalogo_interno")
      .select("*")
      .eq("ativo", true)
      .order("nome", { ascending: true })
      .limit(50);

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
  }, [searchTerm]);

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
    <div className="space-y-3 relative group">
      <div className="relative flex items-center transition-all duration-300 ring-1 ring-slate-200 dark:ring-slate-800 rounded-lg focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
        <Search className="absolute left-3 h-5 w-5 text-slate-400" />
        <Input 
          placeholder="Digite o nome ou código para buscar no catálogo..." 
          className="pl-10 border-0 focus-visible:ring-0 shadow-none h-12 bg-transparent text-base"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {loading && <Loader2 className="absolute right-3 h-5 w-5 animate-spin text-slate-400" />}
      </div>

      <Card className="border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm rounded-xl">
        <ScrollArea className="h-[300px]">
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
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900/80 transition-colors cursor-pointer group"
                  onClick={() => onSelect(item)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          item.tipo === 'material' 
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}>
                          {item.tipo === 'servico' ? 'SERVIÇO' : 'MATERIAL'}
                        </span>
                        {item.codigo && (
                          <span className="text-xs text-slate-400 font-mono">Cód: {item.codigo}</span>
                        )}
                        {item.grupo && (
                          <span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full truncate max-w-[200px]">
                            {item.grupo}
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                        {item.nome}
                      </h4>
                      {item.descricao && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {item.descricao}
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                      Selecionar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  );
}
