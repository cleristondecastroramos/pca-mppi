import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Package, 
  Trash2, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign,
  Briefcase,
  Plus,
  ShieldCheck,
  FileText
} from "lucide-react";
import { SrpItem, SrpTipoCota, SrpEstrategiaAdjudicacao, SrpTipoLote } from "../../types";

const ME_EPP_LIMIT = 80000;

export default function LotBuilder() {
  const [unallocatedItems, setUnallocatedItems] = useState<SrpItem[]>([
    { id: '1', lote_id: '', numero_item: 1, codigo_catalogo: '1234', descricao_detalhada: 'Notebook Core i7 16GB RAM', unidade_medida: 'UN', quantidade_estimada: 10, valor_unitario_estimado: 4500, menor_lance_valido_certame: false },
    { id: '2', lote_id: '', numero_item: 2, codigo_catalogo: '1235', descricao_detalhada: 'Monitor 27" 4K', unidade_medida: 'UN', quantidade_estimada: 5, valor_unitario_estimado: 2200, menor_lance_valido_certame: false },
    { id: '3', lote_id: '', numero_item: 3, codigo_catalogo: '1236', descricao_detalhada: 'Switch Gerenciável 24 Portas', unidade_medida: 'UN', quantidade_estimada: 2, valor_unitario_estimado: 3500, menor_lance_valido_certame: false },
    { id: '4', lote_id: '', numero_item: 4, codigo_catalogo: '1237', descricao_detalhada: 'Cabo de Rede Cat6 305m', unidade_medida: 'CX', quantidade_estimada: 20, valor_unitario_estimado: 450, menor_lance_valido_certame: false },
  ]);

  const [lots, setLots] = useState<any[]>([
    { 
      id: 'l1', 
      numero_lote: 1, 
      descricao: 'Lote 01 - Equipamentos de T.I.', 
      items: [], 
      tipo_cota: 'AMPLA_CONCORRENCIA', 
      estrategia_adjudicacao: 'POR_ITEM',
      tipo_lote: 'GRUPO_ITENS_AFINS',
      justificativa_agrupamento: ''
    },
  ]);

  const [isJustifyModalOpen, setIsJustifyModalOpen] = useState(false);
  const [activeLotId, setActiveLotId] = useState<string | null>(null);

  const allocateToLot = (itemId: string, lotId: string) => {
    const item = unallocatedItems.find(i => i.id === itemId);
    if (!item) return;

    setUnallocatedItems(prev => prev.filter(i => i.id !== itemId));
    setLots(prev => prev.map(lot => 
      lot.id === lotId ? { ...lot, items: [...lot.items, item] } : lot
    ));
  };

  const getLotTotal = (items: any[]) => items.reduce((acc, curr) => acc + (curr.quantidade_estimada * curr.valor_unitario_estimado), 0);

  const handleStrategyChange = (lotId: string, strategy: SrpEstrategiaAdjudicacao) => {
    if (strategy === 'POR_GRUPO_GLOBAL') {
      setActiveLotId(lotId);
      setIsJustifyModalOpen(true);
    }
    setLots(prev => prev.map(l => l.id === lotId ? { ...l, estrategia_adjudicacao: strategy } : l));
  };

  const saveJustification = (justification: string) => {
    setLots(prev => prev.map(l => l.id === activeLotId ? { ...l, justificativa_agrupamento: justification } : l));
    setIsJustifyModalOpen(false);
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Construtor de Lotes</h1>
          <p className="text-sm text-muted-foreground">Arraste os itens para agrupar em lotes e definir cotas.</p>
        </div>
        <Button size="sm">Salvar Estrutura</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-[600px]">
        {/* List of Unallocated Items */}
        <Card className="flex flex-col border-dashed border-2 bg-slate-50/50 dark:bg-slate-900/10 h-fit max-h-[700px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              Itens Pendentes
              <Badge variant="secondary" className="rounded-full">{unallocatedItems.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 flex-1 overflow-y-auto pt-0">
            {unallocatedItems.map(item => (
              <div key={item.id} className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm group hover:ring-2 hover:ring-primary/20 cursor-move transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-slate-400">ITEM {item.numero_item}</span>
                      <Badge variant="outline" className="text-[9px] h-4 py-0 px-1">{item.unidade_medida}</Badge>
                    </div>
                    <p className="text-xs font-semibold leading-relaxed">{item.descricao_detalhada}</p>
                    <div className="mt-2 text-[10px] text-muted-foreground flex items-center gap-3">
                       <span className="flex items-center"><Package className="h-3 w-3 mr-1" /> Qtd: {item.quantidade_estimada}</span>
                       <span className="flex items-center font-bold text-primary"><DollarSign className="h-3 w-3 mr-0.5" /> Unit: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor_unitario_estimado)}</span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => allocateToLot(item.id, lots[0].id)}
                    className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {unallocatedItems.length === 0 && (
                <div className="h-40 flex flex-col items-center justify-center text-muted-foreground opacity-50">
                    <CheckCircle2 className="h-8 w-8 mb-2" />
                    <p className="text-sm">Todos os itens foram alocados</p>
                </div>
            )}
          </CardContent>
        </Card>

        {/* List of Lots */}
        <div className="space-y-4 overflow-y-auto pr-2 h-fit max-h-[700px]">
          {lots.map(lot => {
            const total = getLotTotal(lot.items);
            const isMeEppExclusive = total <= ME_EPP_LIMIT;
            const strategyGlobal = lot.estrategia_adjudicacao === 'POR_GRUPO_GLOBAL';

            return (
              <Card key={lot.id} className={`border-2 transition-all ${isMeEppExclusive && lot.items.length > 0 ? 'border-green-500/50 bg-green-50/5 dark:bg-green-950/5' : 'border-slate-200 dark:border-slate-800'}`}>
                <CardHeader className="pb-3 border-b bg-slate-50/50 dark:bg-slate-900/50 rounded-t-lg">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                           <Briefcase className="h-4 w-4 text-primary" />
                           {lot.descricao}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {isMeEppExclusive && lot.items.length > 0 && (
                                <Badge variant="success" className="text-[10px] flex items-center gap-1 animate-pulse">
                                    <ShieldCheck className="h-3 w-3" /> Cota Exclusiva ME/EPP
                                </Badge>
                          )}
                          <span className={`${total > ME_EPP_LIMIT ? 'text-primary' : 'text-green-600'} font-bold text-sm`}>
                             {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                         <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground uppercase">Adjudicação</Label>
                            <Select 
                                value={lot.estrategia_adjudicacao} 
                                onValueChange={(val: any) => handleStrategyChange(lot.id, val)}
                            >
                                <SelectTrigger className="h-7 text-[11px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="POR_ITEM">Por Item</SelectItem>
                                    <SelectItem value="POR_GRUPO_GLOBAL">Grupo Global</SelectItem>
                                </SelectContent>
                            </Select>
                         </div>
                         <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground uppercase">Justificativa</Label>
                            {strategyGlobal ? (
                                <Button 
                                    variant="outline" 
                                    size="xs" 
                                    className={`w-full h-7 text-[10px] ${!lot.justificativa_agrupamento ? 'border-red-500 text-red-500' : 'text-green-600'}`}
                                    onClick={() => { setActiveLotId(lot.id); setIsJustifyModalOpen(true); }}
                                >
                                   <FileText className="h-3 w-3 mr-1" />
                                   {lot.justificativa_agrupamento ? 'Vinculado ao ETP' : 'REQUER JUSTIFICATIVA'}
                                </Button>
                            ) : (
                                <div className="text-[10px] text-slate-400 italic flex items-center h-7 px-2 border rounded bg-slate-50 opacity-50">Não se aplica</div>
                            )}
                         </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-2 min-h-[80px]">
                  {lot.items.map((item: any) => (
                    <div key={item.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded border border-transparent hover:border-slate-300 transition-colors flex items-center justify-between text-xs">
                      <span className="font-semibold line-clamp-1 flex-1 pr-4">{item.descricao_detalhada}</span>
                      <div className="flex items-center gap-4 shrink-0">
                         <span className="text-muted-foreground">{item.quantidade_estimada} {item.unidade_medida}</span>
                         <span className="font-medium text-primary">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.quantidade_estimada * item.valor_unitario_estimado)}</span>
                         <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500/50 hover:text-red-500 transition-colors"><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </div>
                  ))}
                  {lot.items.length === 0 && (
                      <div className="h-20 flex flex-col items-center justify-center text-xs text-muted-foreground italic border-2 border-dashed rounded-lg bg-slate-50/50 opacity-50">
                          <Plus className="h-4 w-4 mb-1 opacity-20" />
                          Arraste itens para este lote
                      </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
          <Button variant="outline" className="w-full border-dashed border-2 py-8 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Novo Lote
          </Button>
        </div>
      </div>

      {/* Logic Modal for Global Justification */}
      <Dialog open={isJustifyModalOpen} onOpenChange={setIsJustifyModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Justificativa de Agrupamento Global
            </DialogTitle>
            <DialogDescription>
                Determine a vantagem econômica ou técnica para a adjudicação global conforme exigido pelo TCU (Lei 14.133/2021).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
                <Label className="text-sm font-semibold">Este agrupamento está vinculado ao ETP?</Label>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg text-xs text-blue-800 dark:text-blue-400 flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5" />
                    O agrupamento deve comprovar economia de escala, integração de sistemas ou padronização de equipamentos.
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="justificativa">Informe a justificativa técnica/econômica:</Label>
                <Textarea 
                    id="justificativa" 
                    placeholder="Ex: A adjudicação global justifica-se pela necessidade de padronização tecnológica e compatibilidade sistêmica entre os componentes..."
                    className="h-32"
                    defaultValue={lots.find(l => l.id === activeLotId)?.justificativa_agrupamento}
                    onBlur={(e) => {
                        const val = e.target.value;
                        if (val.length < 10) return;
                        setLots(prev => prev.map(l => l.id === activeLotId ? { ...l, justificativa_agrupamento: val } : l));
                    }}
                />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsJustifyModalOpen(false)}>Confirmar Agrupamento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
