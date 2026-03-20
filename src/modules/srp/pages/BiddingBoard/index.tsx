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
    AlertCircle
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
    { title: "Planejamento", count: 4, items: [
      { id: '1', numero: '015/2026', sei: '19.20.0000.00123/2025-99', objeto: 'Aquisição de Notebooks', status: 'ETP em Elaboração', priority: 'high' },
      { id: '2', numero: '016/2026', sei: '19.20.0000.00124/2025-01', objeto: 'Serviço de Nuvem', status: 'Termo de Referência', priority: 'medium' },
    ]},
    { title: "Publicado", count: 2, items: [] },
    { title: "Disputa", count: 1, items: [] },
  ];

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Mesa de Operações (Kanban)</h1>
        <Button size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Licitação
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 flex-1">
        {columns.map((column, idx) => (
          <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2 flex flex-col space-y-3 min-w-[250px] border-2 border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between px-2 py-1">
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
                 <div className="h-2 w-2 rounded-full bg-primary/40"></div>
                 {column.title}
              </h3>
              <Badge variant="secondary" className="text-[10px] h-4">{column.count}</Badge>
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
          <div className="bg-primary/5 dark:bg-primary/10 p-6 border-b border-primary/20">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-xl font-bold text-primary">
                    <Gavel className="h-6 w-6" />
                    Iniciar Novo Processo SRP
                </DialogTitle>
                <DialogDescription className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-1">
                    Fase de Planejamento Automático (Lei 14.133/21)
                </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-8 max-h-[80vh] overflow-y-auto">
            {/* Bloco A: Identificação & Vínculo PCA */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-1 px-2 rounded bg-primary/10 text-primary text-[10px] font-bold">BLOCO A</div>
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Identificação e Planejamento</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="sei" className="text-xs font-bold uppercase tracking-tight flex items-center gap-2">
                            <FileText className="h-3 w-3" /> Processo SEI / e-Docs
                        </Label>
                        <Input 
                            id="sei" 
                            placeholder="Ex: 19.20.0000.00123/2025-99" 
                            className="bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary/20"
                            value={formData.numero_processo_sei}
                            onChange={(e) => setFormData(prev => ({ ...prev, numero_processo_sei: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="pca" className="text-xs font-bold uppercase tracking-tight flex items-center gap-2">
                            <Briefcase className="h-3 w-3" /> Vínculo com o PCA (Anual)
                        </Label>
                        <Select onValueChange={handlePcaSelect}>
                            <SelectTrigger id="pca" className="bg-slate-50 dark:bg-slate-900 border-none shadow-sm h-10">
                                <SelectValue placeholder="Pesquisar item no PCA..." />
                            </SelectTrigger>
                            <SelectContent>
                                {pcaItems.map(item => (
                                    <SelectItem key={item.id} value={item.id}>
                                        <div className="flex flex-col text-left">
                                            <span className="font-bold text-[11px]">{item.descricao}</span>
                                            <span className="text-[9px] text-muted-foreground opacity-70">Estimado: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor_estimado)}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-[10px] text-muted-foreground italic flex items-center gap-1 mt-1">
                            <Link2 className="h-2 w-2" /> Isto conecta o contrato ao planejamento estratégico do MPPI.
                        </p>
                    </div>
                </div>
            </div>

            {/* Bloco B: Enquadramento Legal */}
            <div className="space-y-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-1 px-2 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 text-[10px] font-bold">BLOCO B</div>
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Enquadramento Legal (Lei 14.133/202)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-slate-400">Modalidade</Label>
                        <Select value={formData.modalidade} onValueChange={(val: any) => setFormData(prev => ({ ...prev, modalidade: val }))}>
                            <SelectTrigger className="border-none shadow-none h-8 font-bold text-xs bg-transparent p-0">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PREGAO">Pregão Eletrônico (Regra Geral)</SelectItem>
                                <SelectItem value="CONCORRENCIA">Concorrência Eletrônica</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-slate-400">Critério de Julgamento</Label>
                        <Select value={formData.criterio_julgamento} onValueChange={(val: any) => setFormData(prev => ({ ...prev, criterio_julgamento: val }))}>
                            <SelectTrigger className="border-none shadow-none h-8 font-bold text-xs bg-transparent p-0">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="MENOR_PRECO">Menor Preço</SelectItem>
                                <SelectItem value="MAIOR_DESCONTO">Maior Desconto</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="col-span-2 flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-full">
                                <ShieldCheck className="h-4 w-4 text-primary" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-xs font-bold">Permite Adesão (Carona)?</p>
                                <p className="text-[10px] text-muted-foreground">Art. 86 da Lei 14.133/21</p>
                            </div>
                        </div>
                        <Switch 
                            checked={formData.permite_adesao} 
                            onCheckedChange={(val) => setFormData(prev => ({ ...prev, permite_adesao: val }))}
                        />
                    </div>
                    {formData.permite_adesao && (
                        <div className="col-span-2 space-y-2 animate-in slide-in-from-top-2 duration-300">
                             <Label htmlFor="justificativa" className="text-[10px] font-bold uppercase text-slate-400">Justificativa para Aceite de Caronas (Exigência TCU)</Label>
                             <Textarea 
                                id="justificativa" 
                                placeholder="Justifique por que este registro poderá ser utilizado por outros órgãos..." 
                                className="h-16 text-xs bg-transparent"
                                value={formData.justificativa_adesao}
                                onChange={(e) => setFormData(prev => ({ ...prev, justificativa_adesao: e.target.value }))}
                             />
                        </div>
                    )}
                </div>
            </div>

            {/* Bloco C: O Objeto */}
            <div className="space-y-3">
                <Label htmlFor="objeto" className="text-xs font-bold uppercase tracking-tight">Descrição Detalhada do Objeto</Label>
                <Textarea 
                    id="objeto" 
                    placeholder="Ex: Registro de preços para eventual aquisição de equipamentos de TI..." 
                    className="h-24 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20"
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
