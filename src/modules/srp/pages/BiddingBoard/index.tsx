import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Switch } from "@/components/ui/switch";
import { 
    Gavel, 
    Plus, 
    Calendar, 
    Clock, 
    ChevronRight, 
    Building2, 
    FileText, 
    Link2,
    ShieldCheck,
    Briefcase,
    AlertCircle,
    Megaphone,
    CheckCircle2,
    LayoutList
} from "lucide-react";
import { BiddingService } from "../../services/BiddingService";
import { SrpPcaItem } from "../../types";
import { toast } from "sonner"; // Assuming sonner as a toast system

export default function BiddingBoard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pcaItems, setPcaItems] = useState<SrpPcaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
      numero_processo_sei: "",
      pca_item_id: "",
      unidade_demandante_id: "DTI", // Pre-filled default
      modalidade: "PREGAO",
      criterio_julgamento: "MENOR_PRECO",
      permite_adesao: true,
      justificativa_adesao: "",
      objeto: ""
  });

  useEffect(() => {
    async function fetchPca() {
        try {
            const items = await BiddingService.listPcaItems();
            setPcaItems(items);
        } catch (e) { console.error(e); }
    }
    fetchPca();
  }, []);

  const handlePcaSelect = (pcaId: string) => {
      const item = pcaItems.find(i => i.id === pcaId);
      if (item) {
          setFormData(prev => ({ 
              ...prev, 
              pca_item_id: pcaId,
              objeto: `Registro de preços para eventual aquisição de ${item.descricao} para o MPPI.`
          }));
      }
  };

  const handleCreate = async () => {
      if (!formData.numero_processo_sei || !formData.objeto) {
          toast.error("Preencha os campos obrigatórios.");
          return;
      }
      setIsLoading(true);
      try {
          const resp = await BiddingService.createBidding(formData as any);
          toast.success("Licitação iniciada com sucesso!");
          setIsModalOpen(false);
          // Redirecionamento simulado
          console.log("Redirecionando paraWorkspace:", resp.id);
      } catch (e: any) {
          toast.error(e.message || "Erro ao criar licitação.");
      } finally {
          setIsLoading(false);
      }
  };

  const columns = [
    { title: "Planejamento", icon: LayoutList, color: "bg-blue-500", textColor: "text-blue-600", count: 4, items: [
      { id: '1', numero: '015/2026', sei: '19.20.0000.00123/2025-99', objeto: 'Aquisição de Notebooks', status: 'ETP em Elaboração', priority: 'high' },
      { id: '2', numero: '016/2026', sei: '19.20.0000.00124/2025-01', objeto: 'Serviço de Nuvem', status: 'Termo de Referência', priority: 'medium' },
    ]},
    { title: "Publicado", icon: Megaphone, color: "bg-orange-500", textColor: "text-orange-600", count: 2, items: [] },
    { title: "Disputa", icon: Gavel, color: "bg-red-500", textColor: "text-red-600", count: 1, items: [] },
    { title: "Homologado", icon: CheckCircle2, color: "bg-green-500", textColor: "text-green-600", count: 0, items: [] },
  ];

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Mesa de Operações</h1>
        <Button size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Licitação
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 flex-1">
        {columns.map((column, idx) => (
          <div key={idx} className="bg-slate-50/50 dark:bg-slate-900/40 rounded-xl p-3 flex flex-col space-y-4 min-w-[250px] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                 <div className={`p-1.5 rounded-lg ${column.color} bg-opacity-10 ${column.textColor}`}>
                    <column.icon className="h-4 w-4" />
                 </div>
                 <h3 className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400 tracking-wider">
                    {column.title}
                 </h3>
              </div>
              <Badge variant="secondary" className="text-[10px] h-5 px-1.5 rounded-full bg-white dark:bg-slate-800 border">{column.count}</Badge>
            </div>
            
            <div className="flex-1 space-y-3">
              {column.items.map((item) => (
                <Card key={item.id} className="group hover:ring-2 hover:ring-primary/20 border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer transition-all">
                  <CardContent className="p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-primary font-mono">{item.numero}</span>
                      <div className={`h-1 w-8 rounded-full ${item.priority === 'high' ? 'bg-red-500' : 'bg-primary/30'}`}></div>
                    </div>
                    <p className="text-xs font-semibold leading-tight line-clamp-2">{item.objeto}</p>
                    <div className="space-y-1">
                        <div className="text-[9px] text-muted-foreground flex items-center gap-1">
                            <FileText className="h-3 w-3" /> SEI: {item.sei}
                        </div>
                        <div className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded w-fit capitalize">{item.status}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {column.items.length === 0 && (
                <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg opacity-30 text-[10px] italic">Sem processos nesta fase</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Genesis Modal: Nova Licitação SRP (Fricção Mínima) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[700px] overflow-hidden p-0 dark:border-slate-800">
          <div className="bg-primary p-5 border-b border-primary/20 text-white shadow-md">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-xl font-bold">
                    <Gavel className="h-6 w-6 text-white/90" />
                    Iniciar Novo Processo SRP
                </DialogTitle>
                <DialogDescription className="text-[10px] font-medium text-white/70 uppercase tracking-[0.2em] mt-1">
                    Fase Inicial de Planejamento • MPPI 2026
                </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-5 space-y-6 max-h-[75vh] overflow-y-auto bg-slate-50/30">
            {/* Bloco A: Identificação & Vínculo PCA */}
            <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-xl border shadow-sm">
                <div className="flex items-center gap-2 mb-1 border-b pb-2">
                    <div className="h-4 w-1 bg-primary rounded-full"></div>
                    <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Identificação do Processo</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="sei" className="text-[10px] font-bold uppercase text-slate-400">Processo SEI / e-Docs</Label>
                        <Input 
                            id="sei" 
                            placeholder="Ex: 19.20.0000.00123/2025-99" 
                            className="h-9 text-xs focus:ring-2 focus:ring-primary/20"
                            value={formData.numero_processo_sei}
                            onChange={(e) => setFormData(prev => ({ ...prev, numero_processo_sei: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="pca" className="text-[10px] font-bold uppercase text-slate-400">Vínculo com o PCA Anual</Label>
                        <Select onValueChange={handlePcaSelect}>
                            <SelectTrigger id="pca" className="bg-slate-50/50 h-9 text-xs border-slate-200">
                                <SelectValue placeholder="Pesquisar item no PCA..." />
                            </SelectTrigger>
                            <SelectContent>
                                {pcaItems.map(item => (
                                    <SelectItem key={item.id} value={item.id} className="text-xs">
                                        <div className="flex flex-col text-left">
                                            <span className="font-bold text-[11px]">{item.descricao}</span>
                                            <span className="text-[9px] text-muted-foreground opacity-70">Estimado: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor_estimado)}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Bloco B: Configuração da Licitação */}
            <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-xl border shadow-sm">
                <div className="flex items-center gap-2 mb-1 border-b pb-2">
                    <div className="h-4 w-1 bg-primary rounded-full"></div>
                    <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Configuração da Licitação</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-slate-400">Modalidade</Label>
                        <Select value={formData.modalidade} onValueChange={(val: any) => setFormData(prev => ({ ...prev, modalidade: val }))}>
                            <SelectTrigger className="h-9 text-xs border-slate-200">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PREGAO">Pregão Eletrônico</SelectItem>
                                <SelectItem value="CONCORRENCIA">Concorrência Eletrônica</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-slate-400">Critério de Julgamento</Label>
                        <Select value={formData.criterio_julgamento} onValueChange={(val: any) => setFormData(prev => ({ ...prev, criterio_julgamento: val }))}>
                            <SelectTrigger className="h-9 text-xs border-slate-200">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="MENOR_PRECO">Menor Preço</SelectItem>
                                <SelectItem value="MAIOR_DESCONTO">Maior Desconto</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="col-span-2 flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="h-4 w-4 text-primary" />
                            <div className="space-y-0.5">
                                <p className="text-xs font-bold uppercase text-slate-600">Permitir Adesão de Outros Órgãos?</p>
                                <p className="text-[9px] text-muted-foreground italic">Autoriza pedidos de consumo de órgãos externos (Caronas)</p>
                            </div>
                        </div>
                        <Switch 
                            checked={formData.permite_adesao} 
                            onCheckedChange={(val) => setFormData(prev => ({ ...prev, permite_adesao: val }))}
                        />
                    </div>
                    {formData.permite_adesao && (
                        <div className="col-span-2 space-y-2 animate-in slide-in-from-top-1">
                             <Label htmlFor="justificativa" className="text-[10px] font-bold uppercase text-slate-400">Motivação para Adesão</Label>
                             <Textarea 
                                id="justificativa" 
                                placeholder="Descreva brevemente por que autorizar o consumo externo..." 
                                className="h-14 text-xs resize-none"
                                value={formData.justificativa_adesao}
                                onChange={(e) => setFormData(prev => ({ ...prev, justificativa_adesao: e.target.value }))}
                             />
                        </div>
                    )}
                </div>
            </div>

            {/* Bloco C: Objeto */}
            <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-xl border shadow-sm">
                <div className="flex items-center gap-2 mb-1 border-b pb-2">
                    <div className="h-4 w-1 bg-primary rounded-full"></div>
                    <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Objeto da Licitação</h3>
                </div>
                <Textarea 
                    id="objeto" 
                    placeholder="Descrição detalhada do objeto de acordo com o Termo de Referência..." 
                    className="h-20 text-xs focus:ring-2 focus:ring-primary/20 resize-none"
                    value={formData.objeto}
                    onChange={(e) => setFormData(prev => ({ ...prev, objeto: e.target.value }))}
                />
            </div>
          </div>

          <DialogFooter className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 gap-3 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={isLoading} className="px-8 shadow-lg shadow-primary/20">
                {isLoading ? "Criando Processo..." : "Salvar e Continuar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
