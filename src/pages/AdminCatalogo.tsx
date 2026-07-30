import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Search, Edit2, Package, Wrench, Loader2 } from "lucide-react";
import { useAuthSession, useUserProfile } from "@/lib/auth";

export default function AdminCatalogo() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTipo, setFilterTipo] = useState<"todos" | "material" | "servico">("todos");
  const [filterGrupo, setFilterGrupo] = useState<string>("todos");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  
  const { data: session } = useAuthSession();
  const { data: profile } = useUserProfile(session?.user?.id);

  // Form states
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState<"material" | "servico">("material");
  const [codigo, setCodigo] = useState("");
  const [grupo, setGrupo] = useState("");
  const [isCustomGrupo, setIsCustomGrupo] = useState(false);
  const [ativo, setAtivo] = useState(true);
  const [valorEstimado, setValorEstimado] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("catalogo_interno")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Erro ao carregar catálogo: " + error.message);
      } else {
        setItems(data || []);
      }
    } catch (err: any) {
      toast.error("Erro ao carregar catálogo: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setNome(item.nome || "");
      setDescricao(item.descricao || "");
      setTipo(item.tipo || "material");
      setCodigo(item.codigo || "");
      setGrupo(item.grupo || "");
      setIsCustomGrupo(false);
      setAtivo(item.ativo ?? true);
      setValorEstimado(item.valor_estimado ? item.valor_estimado.toString() : "");
    } else {
      setEditingItem(null);
      setNome("");
      setDescricao("");
      setTipo("material");
      setCodigo("");
      setGrupo("");
      setIsCustomGrupo(false);
      setAtivo(true);
      setValorEstimado("");
    }
    setIsDialogOpen(true);
  };

  const parseValor = (val: string): number => {
    if (!val) return 0;
    let cleaned = val.trim();
    if (cleaned.includes(",") && cleaned.includes(".")) {
      cleaned = cleaned.replace(/\./g, "").replace(",", ".");
    } else if (cleaned.includes(",")) {
      cleaned = cleaned.replace(",", ".");
    }
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      toast.error("O nome é obrigatório.");
      return;
    }
    if (!descricao.trim()) {
      toast.error("A descrição é obrigatória.");
      return;
    }
    if (!grupo.trim()) {
      toast.error("O grupo / categoria é obrigatório.");
      return;
    }

    setSaving(true);
    const currentUserId = session?.user?.id || profile?.id || null;

    const payload: any = {
      nome: nome.trim(),
      descricao: descricao.trim(),
      tipo,
      codigo: codigo.trim() || null,
      grupo: grupo.trim(),
      ativo,
      exercicio: editingItem?.exercicio || 2027,
      valor_estimado: parseValor(valorEstimado),
    };

    try {
      if (editingItem) {
        const updateData: any = { ...payload };
        if (currentUserId) updateData.updated_by = currentUserId;

        const { error } = await supabase
          .from("catalogo_interno")
          .update(updateData)
          .eq("id", editingItem.id);
        
        if (error) throw error;
        toast.success("Item atualizado com sucesso!");
      } else {
        const insertData: any = { ...payload };
        if (currentUserId) insertData.created_by = currentUserId;

        const { error } = await supabase
          .from("catalogo_interno")
          .insert([insertData]);
        
        if (error) throw error;
        toast.success("Item cadastrado com sucesso!");
      }
      setIsDialogOpen(false);
      await fetchItems();
    } catch (error: any) {
      console.error("Erro ao salvar item no catálogo:", error);
      toast.error("Erro ao salvar item: " + (error.message || "Tente novamente."));
    } finally {
      setSaving(false);
    }
  };

  const toggleAtivo = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("catalogo_interno")
        .update({ ativo: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      setItems(items.map((item) => (item.id === id ? { ...item, ativo: !currentStatus } : item)));
      toast.success(`Item ${!currentStatus ? 'ativado' : 'inativado'} com sucesso.`);
    } catch (error: any) {
      toast.error("Erro ao alterar status: " + error.message);
    }
  };

  // Extrair grupos únicos para o dropdown
  const grupos = Array.from(new Set(items.map(i => i.grupo).filter(Boolean))).sort();

  const removeAccents = (str: string) => {
    return str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";
  };

  const filteredItems = items.filter((item) => {
    const normalizedQuery = removeAccents(searchQuery.toLowerCase());
    const matchesSearch = removeAccents(item.nome?.toLowerCase() || "").includes(normalizedQuery) || 
                          (item.codigo && removeAccents(item.codigo.toLowerCase()).includes(normalizedQuery));
    const matchesTipo = filterTipo === "todos" || item.tipo === filterTipo;
    const matchesGrupo = filterGrupo === "todos" || item.grupo === filterGrupo;
    return matchesSearch && matchesTipo && matchesGrupo;
  });

  return (
    <Layout>
      <div className="space-y-6 w-full animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gerenciar Catálogo Interno</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Cadastre e gerencie materiais e serviços que serão disponibilizados no PCA 2027.
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="bg-primary text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Novo Item
          </Button>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por nome ou código..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterTipo} onValueChange={(v: any) => setFilterTipo(v)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                <SelectItem value="material">Material</SelectItem>
                <SelectItem value="servico">Serviço</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterGrupo} onValueChange={setFilterGrupo}>
              <SelectTrigger className="w-full md:w-[250px]">
                <SelectValue placeholder="Filtrar por grupo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os grupos</SelectItem>
                {grupos.map(g => (
                  <SelectItem key={g as string} value={g as string}>{g as string}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-primary">
                <TableRow className="hover:bg-primary">
                  <TableHead className="text-white text-center w-[120px]">Tipo</TableHead>
                  <TableHead className="text-white text-center w-[100px]">Código</TableHead>
                  <TableHead className="text-white text-center w-full">Nome</TableHead>
                  <TableHead className="text-white text-center w-[150px]">Grupo</TableHead>
                  <TableHead className="text-white text-center w-[150px]">Valor estimado</TableHead>
                  <TableHead className="text-white text-center w-[100px]">Status</TableHead>
                  <TableHead className="text-white text-center w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                    </TableCell>
                  </TableRow>
                ) : filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                      Nenhum item encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full w-max ${
                          item.tipo === 'material' 
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}>
                          {item.tipo === 'material' ? <Package className="h-3 w-3" /> : <Wrench className="h-3 w-3" />}
                          {item.tipo?.toUpperCase()}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{item.codigo || "-"}</TableCell>
                      <TableCell className="font-medium max-w-[600px] truncate" title={item.nome}>
                        {item.nome}
                        {item.descricao && <p className="text-xs text-slate-500 truncate mt-0.5">{item.descricao}</p>}
                      </TableCell>
                      <TableCell className="text-sm">{item.grupo || "-"}</TableCell>
                      <TableCell className="text-right text-sm font-medium text-slate-700 dark:text-slate-300">
                        {Number(item.valor_estimado || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          item.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {item.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)} title="Editar">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Switch 
                            checked={item.ativo}
                            onCheckedChange={() => toggleAtivo(item.id, item.ativo)}
                            title={item.ativo ? "Inativar" : "Ativar"}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden [&>button]:text-white [&>button]:hover:text-white/80">
          <DialogHeader className="bg-primary p-6 pb-4">
            <DialogTitle className="text-white">{editingItem ? 'Editar Item do Catálogo' : 'Novo Item do Catálogo'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 px-6 pb-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select value={tipo} onValueChange={(v: any) => setTipo(v)}>
                  <SelectTrigger id="tipo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="material">Material</SelectItem>
                    <SelectItem value="servico">Serviço</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="codigo">Código (Opcional)</Label>
                <Input id="codigo" value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Ex: MAT-001" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Item *</Label>
              <Input id="nome" required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Papel A4" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição *</Label>
              <Input id="descricao" required value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Detalhes adicionais..." />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="grupo">Grupo / Categoria *</Label>
                <Button 
                  type="button" 
                  variant="link" 
                  className="h-auto p-0 text-xs text-primary"
                  onClick={() => {
                    setIsCustomGrupo(!isCustomGrupo);
                    if (!isCustomGrupo) setGrupo("");
                  }}
                >
                  {isCustomGrupo ? "Selecionar grupo existente" : "+ Digitar novo grupo"}
                </Button>
              </div>

              {isCustomGrupo ? (
                <Input
                  id="grupo"
                  required
                  value={grupo}
                  onChange={(e) => setGrupo(e.target.value)}
                  placeholder="Digite a nova categoria..."
                />
              ) : (
                <Select required value={grupo} onValueChange={setGrupo}>
                  <SelectTrigger id="grupo">
                    <SelectValue placeholder="Selecione um grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    {grupos.length > 0 ? (
                      grupos.map((g) => (
                        <SelectItem key={g as string} value={g as string}>
                          {g as string}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="Material Diverso">Material Diverso</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="valorEstimado">Valor Estimado (R$)</Label>
              <Input 
                id="valorEstimado" 
                type="text" 
                value={valorEstimado} 
                onChange={(e) => setValorEstimado(e.target.value)} 
                placeholder="Ex: 150,00 ou 150.00" 
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch id="ativo" checked={ativo} onCheckedChange={setAtivo} />
              <Label htmlFor="ativo">Item Ativo</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Salvar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

