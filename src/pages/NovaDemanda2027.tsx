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
import { CatmatCatserSearch } from "@/components/CatmatCatserSearch";
import type { ItemCatalogo } from "@/hooks/useCatmatCatser";

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
  const [itemCatalogo, setItemCatalogo] = useState<ItemCatalogo | null>(null);

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
  }, []);

  const handleSelectItem = (item: ItemCatalogo) => {
    setItemCatalogo(item);
    toast.success("Item do catálogo selecionado!", {
      description: `${item.tipo} ${item.codigoItem} — ${item.descricaoItem.substring(0, 80)}${item.descricaoItem.length > 80 ? "..." : ""}`,
    });
  };

  const handleClearItem = () => {
    setItemCatalogo(null);
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
          "É necessário selecionar um item do catálogo CATMAT ou CATSER antes de enviar a demanda.",
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
        itemCatalogo.tipo === "CATMAT" ? "Material de Consumo" : "Serviço";

      const unidadeSelecionada = unidades.find(u => u.id === unidadeId);
      const nomeUnidade = unidadeSelecionada?.nome || "";

      const insertData = {
        exercicio: 2027,
        unidade_requisitante_id: unidadeId,
        setor_requisitante: nomeUnidade,
        unidade_demandante: nomeUnidade,
        unidade_orcamentaria: nomeUnidade,
        // Descrição vem exclusivamente do catálogo selecionado
        descricao: itemCatalogo.descricaoItem,
        catmat_catser_tipo: itemCatalogo.tipo,
        catmat_catser_codigo: String(itemCatalogo.codigoItem),
        // Categoria preenchida com o grupo do catálogo
        categoria_material_ou_servico: itemCatalogo.nomeGrupo || itemCatalogo.nomeClasse || "",
        justificativa,
        quantidade,
        quantidade_itens: quantidade,
        unidade_fornecimento: unidadeFornecimento,
        valor_unitario: valorUnitario,
        valor_total: valorTotal,
        valor_estimado: valorTotal,
        prioridade,
        grau_prioridade: prioridade,
        status_planejamento: "Pendente",
        status_aprovacao: "Pendente de análise",
        classe: classeMap,
        tipo_contratacao: "Nova Contratação",
        tipo_recurso: "Custeio",
        modalidade: "Pregão Eletrônico",
        created_by: userData.user.id,
        // Dados adicionais do catálogo para rastreabilidade
        observacoes: [
          `Catálogo: ${itemCatalogo.tipo}`,
          `Código: ${itemCatalogo.codigoItem}`,
          itemCatalogo.nomeGrupo ? `Grupo: ${itemCatalogo.nomeGrupo}` : null,
          itemCatalogo.nomeClasse ? `Classe: ${itemCatalogo.nomeClasse}` : null,
          itemCatalogo.nomePdm ? `PDM: ${itemCatalogo.nomePdm}` : null,
        ]
          .filter(Boolean)
          .join(" | "),
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
          {/* Card 1: Identificação */}
          <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Identificação da Demanda</CardTitle>
              <CardDescription>
                Informe a unidade demandante e a prioridade desta necessidade.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="unidade">Unidade Requisitante *</Label>
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
            </CardContent>
          </Card>

          {/* Card 2: Catálogo CATMAT/CATSER (obrigatório) */}
          <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>
                    Objeto da Contratação — Catálogo Oficial *
                  </CardTitle>
                  <CardDescription className="mt-0.5">
                    Selecione obrigatoriamente um item do catálogo CATMAT (material) ou CATSER
                    (serviço). A descrição do objeto virá exclusivamente da seleção catalogada.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CatmatCatserSearch
                onSelect={handleSelectItem}
                itemSelecionado={itemCatalogo}
                onClear={handleClearItem}
              />

              {/* Aviso de obrigatoriedade quando não há seleção */}
              {!itemCatalogo && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                  <span className="font-bold">⚠</span>
                  A demanda não poderá ser enviada sem a seleção de um item do catálogo.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Card 3: Quantitativos e Valores */}
          <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Quantitativos e Estimativa de Valor</CardTitle>
              <CardDescription>
                Informe a quantidade estimada, a unidade de fornecimento e o valor unitário aproximado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

                <div className="space-y-1.5">
                  <Label>Valor Total Estimado (R$)</Label>
                  <Input
                    readOnly
                    value={valorTotal.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    className="bg-slate-100 dark:bg-slate-800 border font-bold text-primary cursor-not-allowed"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Justificativa */}
          <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Justificativa da Demanda</CardTitle>
              <CardDescription>
                Descreva detalhadamente a necessidade que origina esta demanda de contratação.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="justificativa"
                placeholder="Justifique detalhadamente a necessidade desta contratação, indicando a finalidade, a urgência e o impacto para a unidade..."
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                required
                rows={4}
                className="bg-slate-50/50 border dark:bg-slate-900"
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
