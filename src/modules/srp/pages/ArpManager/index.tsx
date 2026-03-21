import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";

import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { 
  Plus, 
  ArrowUpRight, 
  Wallet,
  Building2,
  Users2,
  Lock,
  Unlock,
  AlertTriangle,
  Upload,
  ArrowRight,
  Clock,
  UserPlus,
  Trash2,
  FileCheck,
  Search,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

export default function ArpManager() {
  const [mockItems, setMockItems] = useState([
    { 
      id: 'it1', 
      numero_ata: '015/2024', 
      item: 'Resma de Papel A4', 
      fornecedor: 'PAPELARIA CENTRAL LTDA',
      qtd_original: 5000, 
      consumo_interna: 1200, 
      consumo_carona: 800, 
      reservada_carona: 400,
      valor_unit: 25.50,
      requer_pesquisa: false
    },
    { 
      id: 'it2', 
      numero_ata: '008/2025', 
      item: 'Bateria Automotiva 60Ah', 
      fornecedor: 'AUTO PARTS DISTRIBUIDORA',
      qtd_original: 150, 
      consumo_interna: 45, 
      consumo_carona: 80, 
      reservada_carona: 25,
      valor_unit: 450.00,
      requer_pesquisa: true // TCU Guard
    },
  ]);

  const [activeTab, setActiveTab] = useState<'extrato' | 'adesoes'>('extrato');
  const [isConsumoModalOpen, setIsConsumoModalOpen] = useState(false);

  // Consumo Modal State
  const [consumoCart, setConsumoCart] = useState<any[]>([]);
  const [consumoForm, setConsumoForm] = useState({
      orgao_id: 'MPPI',
      tipo_orgao: 'GERENCIADOR',
      processo_sei: '',
      numero_ne: '',
      data_empenho: new Date().toISOString().split('T')[0],
  });

  const addToCart = (item: any) => {
      if (consumoCart.find(i => i.id === item.id)) return;
      setConsumoCart([...consumoCart, { ...item, quantidade_pedida: 0 }]);
  };

  const removeFromCart = (itemId: string) => {
      setConsumoCart(consumoCart.filter(i => i.id !== itemId));
  };

  const handleQtyChange = (itemId: string, qty: number) => {
      setConsumoCart(consumoCart.map(i => i.id === itemId ? { ...i, quantidade_pedida: qty } : i));
  };

  const cartTotalValue = useMemo(() => {
      return consumoCart.reduce((acc, curr) => acc + (curr.quantidade_pedida * curr.valor_unit), 0);
  }, [consumoCart]);

  const hasTcuGuardInCart = useMemo(() => {
      return consumoCart.some(i => i.requer_pesquisa);
  }, [consumoCart]);

  const canSaveConsumo = useMemo(() => {
      const allQtysPositive = consumoCart.length > 0 && consumoCart.every(i => i.quantidade_pedida > 0);
      const isWithinBalance = consumoCart.every(i => {
          const saldo = i.tipo_orgao === 'CARONA' ? (i.qtd_original * 2 - i.consumo_carona - i.reservada_carona) : (i.qtd_original - i.consumo_interna);
          return i.quantidade_pedida <= saldo;
      });
      return allQtysPositive && isWithinBalance && consumoForm.numero_ne;
  }, [consumoCart, consumoForm]);

  const handleSaveConsumo = () => {
      toast.success("Empenho registrado com sucesso!");
      setIsConsumoModalOpen(false);
      setConsumoCart([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestão de Atas e Saldos (SRP)</h1>
          <p className="text-sm text-muted-foreground">Monitoramento da execução de itens e controle de saldos da Ata.</p>
        </div>
        <div className="flex gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-52 justify-center"
              onClick={() => setActiveTab(activeTab === 'extrato' ? 'adesoes' : 'extrato')}
            >
                {activeTab === 'extrato' ? 'Ver Fila de Adesões' : 'Ver Extrato da Ata'}
            </Button>
            <Button 
              size="sm" 
              className="w-52 justify-center"
              onClick={() => setIsConsumoModalOpen(true)}
            >
                Novo Consumo / Empenho
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         {[
           { label: 'Saldo Unidades Participantes', value: 'R$ 1.250.000,00', icon: Building2, color: 'bg-primary/10 text-primary' },
           { label: 'Adesões de Outros Órgãos', value: 'R$ 845.000,00', icon: Users2, color: 'bg-orange-100 text-orange-600' },
           { label: 'Reservas Pendentes', value: 'R$ 120.000,00', icon: Clock, color: 'bg-blue-100 text-blue-600' },
           { label: 'Itens em Atenção', value: '3', icon: AlertTriangle, color: 'bg-red-100 text-red-600' }
         ].map((stat, idx) => (
           <Card key={idx} className="bg-slate-50 dark:bg-slate-900 border-slate-200">
             <CardContent className="p-4 flex items-center justify-between">
               <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest leading-tight">{stat.label}</p>
                  <div className="text-lg font-bold mt-1">{stat.value}</div>
               </div>
               <div className={`p-2 rounded-full ${stat.color}`}>
                  <stat.icon className="h-4 w-4" />
               </div>
             </CardContent>
           </Card>
         ))}
      </div>

      {activeTab === 'extrato' ? (
        <Card className="shadow-lg border-2 border-slate-100 dark:border-slate-800">
            <CardHeader className="p-4 border-b">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-primary" />
                        Situação Geral: Saldo de Itens por Ata
                    </CardTitle>
                    <Input className="h-8 w-60 text-xs" placeholder="Buscar por Ata ou Item..." />
                </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead className="text-[9px] font-bold uppercase py-2">Item/Ata</TableHead>
                            <TableHead className="text-center text-[9px] font-bold uppercase py-2">Saldo da Unidade</TableHead>
                            <TableHead className="text-center text-[9px] font-bold uppercase py-2">Consumo por Outras Unidades</TableHead>
                            <TableHead className="text-right text-[9px] font-bold uppercase py-2 pr-4"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                    {mockItems.map((item) => {
                        const percInterno = ((item.qtd_original - item.consumo_interna) / item.qtd_original) * 100;
                        const limiteCaronaGlobal = item.qtd_original * 2;
                        const totalCarona = item.consumo_carona + item.reservada_carona;
                        const percCarona = (totalCarona / limiteCaronaGlobal) * 100;
                        const isCritical = percCarona >= 95;

                        return (
                        <TableRow key={item.id} className="hover:bg-slate-50 group transition-all">
                            <TableCell className="py-4">
                                <div className="space-y-1">
                                    <div className="font-bold text-sm text-foreground">{item.item}</div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-[9px] font-bold h-4 bg-white">ATA {item.numero_ata}</Badge>
                                        <span className="text-[9px] text-muted-foreground uppercase">{item.fornecedor}</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="text-center">
                                <div className="flex flex-col items-center gap-1.5 min-w-[150px]">
                                    <div className="flex items-center justify-between w-full text-[10px]">
                                        <span className="font-bold text-primary">{new Intl.NumberFormat('pt-BR').format(item.qtd_original - item.consumo_interna)} disp.</span>
                                        <span className="text-slate-400">Total: {new Intl.NumberFormat('pt-BR').format(item.qtd_original)}</span>
                                    </div>
                                    <Progress value={percInterno} className="h-2 bg-slate-100" />
                                </div>
                            </TableCell>
                            <TableCell className="text-center">
                                <div className="flex flex-col items-center gap-1.5 min-w-[150px]">
                                    <div className="flex items-center justify-between w-full text-[10px]">
                                        <span className={`font-bold ${isCritical ? 'text-red-600 animate-pulse' : 'text-orange-600'}`}>{new Intl.NumberFormat('pt-BR').format(totalCarona)} usado</span>
                                        <span className="text-slate-400">Capacidade: {new Intl.NumberFormat('pt-BR').format(limiteCaronaGlobal)}</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all ${isCritical ? 'bg-red-600' : 'bg-orange-600'}`} 
                                            style={{ width: `${Math.min(percCarona, 100)}%` }} 
                                        />
                                    </div>
                                    {isCritical && <span className="text-[8px] font-bold text-red-600 uppercase">Sugestão: Iniciar nova licitação</span>}
                                </div>
                            </TableCell>
                            <TableCell className="text-right py-4 pr-4">
                                <div className="flex items-center justify-end gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => { addToCart(item); setIsConsumoModalOpen(true); }}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-slate-200" title="Acionar Cadastro de Reserva">
                                        <UserPlus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                        );
                    })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      ) : (
          <div className="text-center p-12 text-slate-400">Fila de adesões em desenvolvimento...</div>
      )}

      {/* Modal: Novo Registro de Consumo/Empenho (Módulo de Execução) */}
      <Dialog open={isConsumoModalOpen} onOpenChange={setIsConsumoModalOpen}>
        <DialogContent className="sm:max-w-[800px] overflow-hidden p-0 max-h-[90vh]">
          <div className="bg-primary p-5 border-b border-primary/20 text-white shadow-md">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-xl font-bold">
                    <FileCheck className="h-6 w-6 text-white/90" />
                    Registrar Consumo / Empenho
                </DialogTitle>
                <DialogDescription className="text-[10px] font-medium text-white/70 uppercase tracking-[0.2em] mt-1">
                    Gestão de Execução SRP • MPPI 2026
                </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-5 space-y-6 overflow-y-auto max-h-[65vh] bg-slate-50/30">
            {/* Bloco A: Dados do Empenho */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b pb-2 mb-1">
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-1 bg-primary rounded-full"></div>
                        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Identificação do Empenho</h3>
                    </div>
                    <div className="text-right">
                        <span className="text-[9px] text-muted-foreground font-bold uppercase">Total Selecionado: </span>
                        <span className="text-sm font-bold text-primary">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartTotalValue)}
                        </span>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-slate-400">Tipo de Órgão</Label>
                        <Select value={consumoForm.tipo_orgao} onValueChange={(val: any) => setConsumoForm(p => ({ ...p, tipo_orgao: val }))}>
                            <SelectTrigger className="h-9 text-xs border-slate-200">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="GERENCIADOR" className="text-xs">MPPI (Gerenciador)</SelectItem>
                                <SelectItem value="PARTICIPANTE" className="text-xs">Outro Participante</SelectItem>
                                <SelectItem value="CARONA" className="text-xs">Carona Autorizado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ne" className="text-[10px] font-bold uppercase text-slate-400">Número da NE (Nota de Empenho)</Label>
                        <Input id="ne" placeholder="Ex: 2026NE00045" className="h-9 text-xs focus:ring-2 focus:ring-primary/20" 
                            value={consumoForm.numero_ne} 
                            onChange={(e) => setConsumoForm(p => ({ ...p, numero_ne: e.target.value }))} 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="date" className="text-[10px] font-bold uppercase text-slate-400">Data do Empenho</Label>
                        <Input id="date" type="date" className="h-9 text-xs border-slate-200" 
                            value={consumoForm.data_empenho} 
                            onChange={(e) => setConsumoForm(p => ({ ...p, data_empenho: e.target.value }))} 
                        />
                    </div>
                </div>
            </div>

            {/* Bloco B: Itens a Consumir */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b pb-2 mb-1">
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-1 bg-primary rounded-full"></div>
                        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Itens e Quantidades</h3>
                    </div>
                </div>
                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-100/50">
                            <TableRow>
                                <TableHead className="text-[9px] font-bold py-2">Item Registrado</TableHead>
                                <TableHead className="text-center text-[9px] font-bold py-2">Saldo Atual</TableHead>
                                <TableHead className="text-center text-[9px] font-bold py-2">Qtd Solicitada</TableHead>
                                <TableHead className="text-right text-[9px] font-bold py-2 pr-4">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {consumoCart.map(item => {
                                const saldoDisponivel = consumoForm.tipo_orgao === 'CARONA' 
                                    ? (item.qtd_original * 2 - item.consumo_carona - item.reservada_carona)
                                    : (item.qtd_original - item.consumo_interna);
                                const isOverbalance = item.quantidade_pedida > saldoDisponivel;

                                return (
                                    <TableRow key={item.id} className="bg-white hover:bg-slate-50 transition-colors">
                                        <TableCell className="py-3">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold leading-tight flex items-center gap-2">
                                                    {item.item}
                                                    {item.requer_pesquisa && <AlertTriangle className="h-3 w-3 text-red-500" />}
                                                </span>
                                                <span className="text-[9px] text-muted-foreground uppercase">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor_unit)} / unit</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex flex-col items-center gap-1 min-w-[100px]">
                                                <span className={`text-[10px] font-bold  ${isOverbalance ? 'text-red-600' : 'text-slate-500'}`}>{new Intl.NumberFormat('pt-BR').format(saldoDisponivel)} disp.</span>
                                                <Progress value={(saldoDisponivel / item.qtd_original) * 100} className={`h-1.5 ${isOverbalance ? 'bg-red-100' : 'bg-slate-100'}`} />
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Input 
                                                type="number" 
                                                className={`h-8 w-24 text-center text-xs mx-auto border-2 ${isOverbalance ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-200'}`} 
                                                value={item.quantidade_pedida}
                                                onChange={(e) => handleQtyChange(item.id, Number(e.target.value))}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right pr-4 font-bold text-xs text-primary">
                                            <div className="flex items-center justify-end gap-3">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.quantidade_pedida * item.valor_unit)}
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-600" onClick={() => removeFromCart(item.id)}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {consumoCart.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-20 text-center text-xs text-slate-400 italic">
                                        Clique no "+" no extrato para adicionar itens ao pedido
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border shadow-sm space-y-3">
                <div className="flex items-center gap-2 mb-1 border-b pb-2">
                    <div className="h-4 w-1 bg-primary rounded-full"></div>
                    <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Observações</h3>
                </div>
                <Textarea 
                    placeholder="Inclua aqui qualquer observação adicional sobre este empenho ou histórico técnico (opcional)" 
                    className="text-xs resize-none h-16"
                    rows={2}
                    id="observacoes"
                />
            </div>
          </div>

          <DialogFooter className="p-6 bg-slate-50 border-t gap-3 sm:gap-0">
             <Button variant="ghost" onClick={() => setIsConsumoModalOpen(false)}>Cancelar</Button>
             <Button className="px-10 shadow-lg shadow-primary/20" disabled={!canSaveConsumo} onClick={handleSaveConsumo}>
                Confirmar Empenho e Debitar Saldo
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
