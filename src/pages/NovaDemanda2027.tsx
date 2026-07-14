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
import { Loader2, Plus, ArrowLeft, BookOpen } from "lucide-react";
import { CatalogoInternoSearch, type ItemCatalogoInterno } from "@/components/CatalogoInternoSearch";

export default function NovaDemanda2027() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Campos do formulário
  const [unidadeId, setUnidadeId] = useState("");
  const [unidades, setUnidades] = useState<any[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [isAdminOrGestor, setIsAdminOrGestor] = useState(false);
  const [prioridade, setPrioridade] = useState<"Alta" | "Média" | "Baixa">("Média");
  const [justificativa, setJustificativa] = useState("");
  const [quantidade, setQuantidade] = useState<number>(1);
  const [unidadeFornecimento, setUnidadeFornecimento] = useState("Unidade");
  const [valorUnitario, setValorUnitario] = useState<number>(0);

  // Item do catálogo selecionado (obrigatório)
  const [itemCatalogo, setItemCatalogo] = useState<ItemCatalogoInterno | null>(null);

  const [gruposUnicos, setGruposUnicos] = useState<string[]>([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>("Todas");

  const valorTotal = quantidade * valorUnitario;

  // Pre-seleciona a unidade do usuário logado
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.id) {
        // Verifica permissoes
        supabase.rpc("has_role", { _user_id: data.user.id, _role: "administrador" }).then((res1) => {
          supabase.rpc("has_role", { _user_id: data.user.id, _role: "gestor" }).then((res2) => {
            const admin = !!res1.data;
            const gestor = !!res2.data;
            setIsAdminOrGestor(admin || gestor);
          });
        });

        // Busca profile
        supabase
          .from("profiles")
          .select("unidade_requisitante_id")
          .eq("id", data.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile?.unidade_requisitante_id) {
              setUnidadeId(profile.unidade_requisitante_id);
              setIsLocked(true);
            }
          });
      }
    });

    supabase.from("unidades_requisitantes").select("*").eq("ativo", true).eq("exercicio", 2027).then(({ data }) => {
      if (data) setUnidades(data);
    });

    supabase.from("catalogo_interno").select("grupo").eq("ativo", true).then(({ data }) => {
      if (data) {
        const unique = Array.from(new Set(data.map(d => d.grupo).filter(Boolean))).sort();
        setGruposUnicos(unique as string[]);
      }
    });
  }, []);

  const handleSelectItem = (item: ItemCatalogoInterno) => {
    setItemCatalogo(item);
    if (item.grupo) {
      setCategoriaSelecionada(item.grupo);
    }
    toast.success("Item do catálogo selecionado!", {
      description: `${item.tipo.toUpperCase()} — ${item.nome.substring(0, 80)}${item.nome.length > 80 ? "..." : ""}`,
    });
  };

  const handleClearItem = () => {
    setItemCatalogo(null);
    setCategoriaSelecionada("Todas");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!unidadeId) {
      toast.error("Por favor, selecione a unidade requisitante");
      return;
    }

    // Garante que o item do catálogo foi selecionado
    if (!itemCatalogo) {
      toast.error("Seleção do catálogo obrigatória", {
        description:
          "É necessário selecionar um item do catálogo interno antes de enviar a demanda.",
      });
      return;
    }

    if (!justificativa.trim()) {
      toast.error("Por favor, informe a justificativa da demanda.");
      return;
    }

    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error("Usuário não autenticado");

      // Mapeamento de classe legada baseado no tipo do catálogo
      const classeMap =
        itemCatalogo.tipo === "material" ? "Material de Consumo" : "Serviço";

      const unidadeSelecionada = unidades.find(u => u.id === unidadeId);
      const nomeUnidade = unidadeSelecionada?.nome || "";
      const siglaMatch = nomeUnidade.match(/\(([^)]+)\)/);
      const siglaSetor = siglaMatch ? siglaMatch[1] : nomeUnidade;

      const insertData = {
        exercicio: 2027,
        unidade_requisitante_id: unidadeId,
        setor_requisitante: siglaSetor,
        unidade_demandante: nomeUnidade,
        unidade_orcamentaria: "PGJ",
        // Descrição vem exclusivamente do catálogo selecionado
        descricao: itemCatalogo.descricao || itemCatalogo.nome,
        // Categoria preenchida com o grupo do catálogo ou com o que estiver no dropdown
        categoria_material_ou_servico: itemCatalogo.grupo || (categoriaSelecionada !== "Todas" ? categoriaSelecionada : ""),
        catalogo_interno_id: itemCatalogo.id,
        justificativa: `${justificativa}\n\n[Informações do Catálogo]\n` + [
          `Catálogo Interno: ${itemCatalogo.tipo}`,
          itemCatalogo.codigo ? `Código: ${itemCatalogo.codigo}` : null,
          itemCatalogo.grupo ? `Grupo: ${itemCatalogo.grupo}` : null,
        ]
          .filter(Boolean)
          .join(" | "),
        quantidade_itens: quantidade,
        unidade_fornecimento: unidadeFornecimento,
        valor_unitario: valorUnitario,
        valor_estimado: valorTotal,
        grau_prioridade: prioridade,
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
      <div className="w-full space-y-6 animate-in fade-in duration-500">
        {/* Cabeçalho */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/planejamento-2027")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Apresentar Demanda — PCA 2027
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Coleta e planejamento de contratações para o próximo exercício
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card 1: Identificação (Compacto) */}
          <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="unidade" className="text-slate-500">Unidade Requisitante (Lotação)</Label>
                  <Select value={unidadeId} onValueChange={setUnidadeId} disabled={isLocked && !isAdminOrGestor}>
                    <SelectTrigger id="unidade" className="bg-slate-50/50 border dark:bg-slate-900">
                      <SelectValue placeholder="Selecione a Unidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {unidades.map((u) => (
                        <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="categoria" className="text-slate-500">Categoria / Grupo</Label>
                  <Select value={categoriaSelecionada} onValueChange={(v) => { setCategoriaSelecionada(v); setItemCatalogo(null); }}>
                    <SelectTrigger id="categoria" className="bg-slate-50/50 border dark:bg-slate-900">
                      <SelectValue placeholder="Todos os grupos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Todas">Todos os grupos</SelectItem>
                      {gruposUnicos.map((g) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prioridade" className="text-slate-500">Prioridade da Demanda</Label>
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
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coluna 1: Catálogo */}
            <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">Objeto da Contratação</CardTitle>
                    <CardDescription className="mt-0.5 text-xs">
                      Selecione um item do catálogo.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <CatalogoInternoSearch
                  onSelect={handleSelectItem}
                  itemSelecionado={itemCatalogo}
                  onClear={handleClearItem}
                  filtroGrupo={categoriaSelecionada !== "Todas" ? categoriaSelecionada : undefined}
                />
                {!itemCatalogo && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                    <span className="font-bold">⚠</span>
                    A demanda exige seleção de um item do catálogo.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Coluna 2: Quantitativos e Valores */}
            <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Quantitativos e Estimativa de Valor</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="quantidade">Quantidade Estimada *</Label>
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
                  <Label htmlFor="unidade_forn">Unidade de Fornecimento</Label>
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

                <div className="space-y-1.5 pt-2">
                  <Label>Valor Total Estimado (R$)</Label>
                  <Input
                    readOnly
                    value={valorTotal.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    className="bg-slate-100 dark:bg-slate-800 border font-bold text-primary cursor-not-allowed text-lg h-12"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Card 4: Justificativa */}
          <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Justificativa da Demanda</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                id="justificativa"
                placeholder="Justifique detalhadamente a necessidade desta contratação..."
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                required
                rows={4}
                className="bg-slate-50/50 border dark:bg-slate-900 resize-none"
              />
            </CardContent>
          </Card>

          {/* Ações */}
          <div className="flex justify-end gap-3 pb-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/planejamento-2027")}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !itemCatalogo}
              className="bg-primary text-primary-foreground min-w-[200px]"
              title={!itemCatalogo ? "Selecione um item do catálogo para continuar" : undefined}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              {loading ? "Registrando..." : "Apresentar Demanda"}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
