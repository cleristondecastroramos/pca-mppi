import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, ArrowLeft } from "lucide-react";
import { SETORES_REQUISITANTES } from "@/lib/auth";

export default function NovaDemanda2027() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Form fields
  const [unidadeDemandante, setUnidadeDemandante] = useState("");
  const [descricao, setDescricao] = useState("");
  const [catmatCatserTipo, setCatmatCatserTipo] = useState<"CATMAT" | "CATSER">("CATMAT");
  const [catmatCatserCodigo, setCatmatCatserCodigo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [justificativa, setJustificativa] = useState("");
  const [quantidade, setQuantidade] = useState<number>(1);
  const [unidadeFornecimento, setUnidadeFornecimento] = useState("Unidade");
  const [valorUnitario, setValorUnitario] = useState<number>(0);
  const [prioridade, setPrioridade] = useState<"Alta" | "Média" | "Baixa">("Média");

  const valorTotal = quantidade * valorUnitario;

  // Set default demandante if user has one
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.id) {
        supabase.from("profiles")
          .select("setor")
          .eq("id", data.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile?.setor && SETORES_REQUISITANTES.includes(profile.setor as any)) {
              setUnidadeDemandante(profile.setor);
            }
          });
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unidadeDemandante) {
      toast.error("Por favor, selecione a unidade demandante");
      return;
    }

    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error("Usuário não autenticado");

      // Auto map type of object to legacy class
      const classeMap = catmatCatserTipo === "CATMAT" ? "Material de Consumo" : "Serviço";

      const insertData = {
        exercicio: 2027,
        unidade_demandante: unidadeDemandante,
        setor_requisitante: unidadeDemandante, // align with legacy field for security RLS
        descricao,
        catmat_catser_tipo: catmatCatserTipo,
        catmat_catser_codigo: catmatCatserCodigo,
        categoria_material_ou_servico: categoria,
        justificativa,
        quantidade,
        quantidade_itens: quantidade,
        unidade_fornecimento: unidadeFornecimento,
        valor_unitario: valorUnitario,
        valor_total: valorTotal,
        valor_estimado: valorTotal, // align with legacy field
        prioridade,
        grau_prioridade: prioridade, // align with legacy field
        status_planejamento: "Pendente",
        status_aprovacao: "Pendente de análise",
        classe: classeMap,
        tipo_contratacao: "Nova Contratação",
        tipo_recurso: "Custeio",
        modalidade: "Pregão Eletrônico",
        created_by: userData.user.id,
      };

      const { error } = await supabase.from("contratacoes").insert([insertData]);
      if (error) throw error;

      toast.success("Demanda registrada com sucesso no planejamento 2027!");
      navigate("/planejamento-2027");
    } catch (error: any) {
      console.error(error);
      toast.error("Erro ao registrar demanda: " + (error.message || error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/planejamento-2027")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Apresentar Demanda — PCA 2027</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Coleta e planejamento de contratações para o próximo exercício</p>
          </div>
        </div>

        <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
          <CardHeader>
            <CardTitle>Formulário de Demanda</CardTitle>
            <CardDescription>Insira todos os atributos essenciais para registrar sua necessidade de contratação ou aquisição.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="unidade">Unidade Demandante</Label>
                  <Select value={unidadeDemandante} onValueChange={setUnidadeDemandante}>
                    <SelectTrigger id="unidade" className="bg-slate-50/50 border dark:bg-slate-900">
                      <SelectValue placeholder="Selecione a Unidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {SETORES_REQUISITANTES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prioridade">Prioridade da Demanda</Label>
                  <Select value={prioridade} onValueChange={(v: any) => setPrioridade(v)}>
                    <SelectTrigger id="prioridade" className="bg-slate-50/50 border dark:bg-slate-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Alta">Alta</SelectItem>
                      <SelectItem value="Média">Média</SelectItem>
                      <SelectItem value="Baixa">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="descricao">Descrição Detalhada do Objeto</Label>
                <Textarea 
                  id="descricao"
                  placeholder="Descreva claramente o material ou serviço a ser contratado..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  required
                  rows={3}
                  className="bg-slate-50/50 border dark:bg-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="natureza">Natureza do Catálogo</Label>
                  <Select value={catmatCatserTipo} onValueChange={(v: any) => setCatmatCatserTipo(v)}>
                    <SelectTrigger id="natureza" className="bg-slate-50/50 border dark:bg-slate-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CATMAT">CATMAT (Material)</SelectItem>
                      <SelectItem value="CATSER">CATSER (Serviço)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="codigo_catalogo">Código CATMAT / CATSER</Label>
                  <Input 
                    id="codigo_catalogo"
                    placeholder="Ex: 456782"
                    value={catmatCatserCodigo}
                    onChange={(e) => setCatmatCatserCodigo(e.target.value)}
                    required
                    className="bg-slate-50/50 border dark:bg-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="categoria">Categoria / Classificação</Label>
                  <Input 
                    id="categoria"
                    placeholder="Ex: Material de Escritório / TI"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="bg-slate-50/50 border dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="quantidade">Quantidade Estimada</Label>
                  <Input 
                    id="quantidade"
                    type="number"
                    min={1}
                    value={quantidade}
                    onChange={(e) => setQuantidade(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    required
                    className="bg-slate-50/50 border dark:bg-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="unidade_forn">Unidade Fornecimento</Label>
                  <Input 
                    id="unidade_forn"
                    placeholder="Ex: Unidade, Caixa, Resma"
                    value={unidadeFornecimento}
                    onChange={(e) => setUnidadeFornecimento(e.target.value)}
                    required
                    className="bg-slate-50/50 border dark:bg-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="valor_unit">Valor Unitário Estimado (R$)</Label>
                  <Input 
                    id="valor_unit"
                    type="number"
                    step="0.01"
                    min="0"
                    value={valorUnitario}
                    onChange={(e) => setValorUnitario(Math.max(0, parseFloat(e.target.value) || 0))}
                    required
                    className="bg-slate-50/50 border dark:bg-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Valor Total Estimado (R$)</Label>
                  <Input 
                    readOnly
                    value={valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    className="bg-slate-100 dark:bg-slate-800 border font-bold text-primary cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="justificativa">Justificativa da Demanda</Label>
                <Textarea 
                  id="justificativa"
                  placeholder="Justifique detalhadamente a necessidade desta contratação..."
                  value={justificativa}
                  onChange={(e) => setJustificativa(e.target.value)}
                  required
                  rows={3}
                  className="bg-slate-50/50 border dark:bg-slate-900"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => navigate("/planejamento-2027")}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  Apresentar Demanda
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
