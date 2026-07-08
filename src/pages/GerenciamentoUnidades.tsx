import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Building2, ShieldAlert } from "lucide-react";
import { useAuthSession } from "@/lib/auth";

type UnidadeRequisitante = {
  id: string;
  nome: string;
  tipo: string;
  exercicio: number;
  ativo: boolean;
};

export default function GerenciamentoUnidades() {
  const { data: session } = useAuthSession();
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [unidades, setUnidades] = useState<UnidadeRequisitante[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("");
  const [exercicio, setExercicio] = useState("2027");
  const [ativo, setAtivo] = useState(true);

  useEffect(() => {
    if (session?.user) {
      checkAdminStatus();
    }
  }, [session]);

  const checkAdminStatus = async () => {
    try {
      const { data } = await supabase.rpc("has_role", {
        _user_id: session!.user.id,
        _role: "administrador",
      });
      setIsAdmin(!!data);
      if (data) {
        fetchUnidades();
      } else {
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const fetchUnidades = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("unidades_requisitantes")
        .select("*")
        .order("nome", { ascending: true });
        
      if (error) throw error;
      setUnidades(data as UnidadeRequisitante[]);
    } catch (error: any) {
      console.error(error);
      toast.error("Erro ao carregar unidades: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNome("");
    setTipo("");
    setExercicio("2027");
    setAtivo(true);
    setEditingId(null);
  };

  const handleEdit = (unidade: UnidadeRequisitante) => {
    setNome(unidade.nome);
    setTipo(unidade.tipo);
    setExercicio(String(unidade.exercicio));
    setAtivo(unidade.ativo);
    setEditingId(unidade.id);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !tipo.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        nome: nome.trim(),
        tipo: tipo.trim(),
        exercicio: parseInt(exercicio, 10),
        ativo,
      };

      if (editingId) {
        const { error } = await supabase
          .from("unidades_requisitantes")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
        toast.success("Unidade atualizada com sucesso!");
      } else {
        const { error } = await supabase
          .from("unidades_requisitantes")
          .insert([payload]);
        if (error) throw error;
        toast.success("Unidade cadastrada com sucesso!");
      }

      setIsDialogOpen(false);
      fetchUnidades();
    } catch (error: any) {
      console.error(error);
      toast.error("Erro ao salvar unidade: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <ShieldAlert className="h-16 w-16 text-destructive opacity-80" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Acesso Negado</h2>
          <p className="text-slate-500">
            Você não tem permissão de administrador para acessar o gerenciamento de unidades.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              Unidades Requisitantes (PCA 2027)
            </h1>
            <p className="text-sm text-slate-500">
              Gerencie as unidades responsáveis por demandar contratações no planejamento.
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Unidade
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden [&>button]:text-white">
              <DialogHeader className="bg-sidebar p-6">
                <DialogTitle className="text-white">{editingId ? "Editar Unidade" : "Nova Unidade Requisitante"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 p-6 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome da Unidade *</Label>
                  <Input 
                    id="nome" 
                    placeholder="Ex: Promotoria de Justiça de Parnaíba" 
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo / Categoria *</Label>
                  <Select value={tipo} onValueChange={setTipo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Promotoria">Promotoria</SelectItem>
                      <SelectItem value="Procuradoria">Procuradoria</SelectItem>
                      <SelectItem value="Centro de Apoio">Centro de Apoio</SelectItem>
                      <SelectItem value="Grupo Especial">Grupo Especial</SelectItem>
                      <SelectItem value="Núcleo de Promotorias">Núcleo de Promotorias</SelectItem>
                      <SelectItem value="Sede">Sede</SelectItem>
                      <SelectItem value="Unidade Administrativa">Unidade Administrativa</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exercicio">Exercício de Planejamento</Label>
                  <Select value={exercicio} onValueChange={setExercicio}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2027">2027</SelectItem>
                      <SelectItem value="2028">2028</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Switch 
                    id="ativo" 
                    checked={ativo}
                    onCheckedChange={setAtivo}
                  />
                  <Label htmlFor="ativo">Unidade Ativa no Sistema</Label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-md border bg-white dark:bg-slate-900 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
              <TableRow>
                <TableHead>Unidade</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Exercício</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unidades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                    Nenhuma unidade cadastrada.
                  </TableCell>
                </TableRow>
              ) : (
                unidades.map((unidade) => (
                  <TableRow key={unidade.id}>
                    <TableCell className="font-medium">{unidade.nome}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal text-xs">
                        {unidade.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell>{unidade.exercicio}</TableCell>
                    <TableCell>
                      {unidade.ativo ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400">
                          Ativa
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-slate-500">
                          Inativa
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(unidade)}
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}
