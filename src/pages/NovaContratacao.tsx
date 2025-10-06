import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const contratacaoSchema = z.object({
  descricao: z.string().min(10, "Descrição deve ter no mínimo 10 caracteres").max(500, "Descrição muito longa"),
  justificativa: z.string().min(20, "Justificativa deve ter no mínimo 20 caracteres").max(1000, "Justificativa muito longa"),
  classe: z.string().min(1, "Classe é obrigatória"),
  setor_requisitante: z.string().min(1, "Setor requisitante é obrigatório"),
  tipo_contratacao: z.string().min(1, "Tipo de contratação é obrigatório"),
  modalidade: z.string().min(1, "Modalidade é obrigatória"),
  unidade_orcamentaria: z.string().min(1, "Unidade orçamentária é obrigatória"),
  tipo_recurso: z.string().min(1, "Tipo de recurso é obrigatório"),
  grau_prioridade: z.string().min(1, "Grau de prioridade é obrigatório"),
  valor_estimado: z.number().positive("Valor estimado deve ser maior que zero"),
});

export default function NovaContratacao() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    
    const formData = new FormData(e.currentTarget);
    const data = {
      descricao: formData.get("descricao") as string,
      justificativa: formData.get("justificativa") as string,
      classe: formData.get("classe") as string,
      setor_requisitante: formData.get("setor_requisitante") as string,
      tipo_contratacao: formData.get("tipo_contratacao") as string,
      modalidade: formData.get("modalidade") as string,
      unidade_orcamentaria: formData.get("unidade_orcamentaria") as string,
      tipo_recurso: formData.get("tipo_recurso") as string,
      grau_prioridade: formData.get("grau_prioridade") as string,
      valor_estimado: parseFloat(formData.get("valor_estimado") as string),
    };

    try {
      // Validate input
      contratacaoSchema.parse(data);

      // Submit to backend
      const { error } = await supabase.from("contratacoes").insert([data]);
      
      if (error) throw error;

      toast.success("Contratação cadastrada com sucesso!");
      navigate("/contratacoes");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0] as string] = issue.message;
          }
        });
        setErrors(fieldErrors);
        toast.error("Verifique os campos do formulário");
      } else {
        toast.error("Erro ao cadastrar contratação");
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link to="/contratacoes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">Nova Contratação</h1>
            <p className="text-sm text-muted-foreground">Cadastre uma nova contratação no PCA 2026</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>Dados principais da contratação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição do Objeto *</Label>
                  <Input name="descricao" id="descricao" placeholder="Ex: Aquisição de Computadores" required />
                  {errors.descricao && <p className="text-sm text-destructive">{errors.descricao}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pdm">PDM/CATSER</Label>
                  <Input name="pdm_catser" id="pdm" placeholder="Código do catálogo" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="classe">Classe *</Label>
                  <Select name="classe" required>
                    <SelectTrigger id="classe" className="h-9">
                      <SelectValue placeholder="Selecione a classe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Material de Consumo">Material de Consumo</SelectItem>
                      <SelectItem value="Material Permanente">Material Permanente</SelectItem>
                      <SelectItem value="Serviço">Serviço</SelectItem>
                      <SelectItem value="Serviço de TI">Serviço de TI</SelectItem>
                      <SelectItem value="Engenharia">Engenharia</SelectItem>
                      <SelectItem value="Obra">Obra</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.classe && <p className="text-sm text-destructive">{errors.classe}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="setor">Setor Requisitante *</Label>
                  <Select name="setor_requisitante" required>
                    <SelectTrigger id="setor" className="h-9">
                      <SelectValue placeholder="Selecione o setor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CAA">CAA</SelectItem>
                      <SelectItem value="CCF">CCF</SelectItem>
                      <SelectItem value="CCS">CCS</SelectItem>
                      <SelectItem value="CLC">CLC</SelectItem>
                      <SelectItem value="CPPT">CPPT</SelectItem>
                      <SelectItem value="CTI">CTI</SelectItem>
                      <SelectItem value="CRH">CRH</SelectItem>
                      <SelectItem value="CEAF">CEAF</SelectItem>
                      <SelectItem value="GAECO">GAECO</SelectItem>
                      <SelectItem value="GSI">GSI</SelectItem>
                      <SelectItem value="CONINT">CONINT</SelectItem>
                      <SelectItem value="PLANEJAMENTO">PLAN</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.setor_requisitante && <p className="text-sm text-destructive">{errors.setor_requisitante}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo-contratacao">Tipo de Contratação *</Label>
                  <Select name="tipo_contratacao" required>
                    <SelectTrigger id="tipo-contratacao" className="h-9">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nova Contratação">Nova Contratação</SelectItem>
                      <SelectItem value="Renovação">Renovação</SelectItem>
                      <SelectItem value="Aditivo Quantitativo">Aditivo Quantitativo</SelectItem>
                      <SelectItem value="Repactuação">Repactuação</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.tipo_contratacao && <p className="text-sm text-destructive">{errors.tipo_contratacao}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modalidade">Modalidade *</Label>
                  <Select name="modalidade" required>
                    <SelectTrigger id="modalidade" className="h-9">
                      <SelectValue placeholder="Selecione a modalidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pregão Eletrônico">Pregão Eletrônico</SelectItem>
                      <SelectItem value="Dispensa">Dispensa</SelectItem>
                      <SelectItem value="Inexigibilidade">Inexigibilidade</SelectItem>
                      <SelectItem value="Concorrência">Concorrência</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.modalidade && <p className="text-sm text-destructive">{errors.modalidade}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prioridade">Grau de Prioridade *</Label>
                  <Select name="grau_prioridade" required>
                    <SelectTrigger id="prioridade" className="h-9">
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Alta">Alta</SelectItem>
                      <SelectItem value="Média">Média</SelectItem>
                      <SelectItem value="Baixa">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.grau_prioridade && <p className="text-sm text-destructive">{errors.grau_prioridade}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unidade-orcamentaria">Unidade Orçamentária *</Label>
                  <Select name="unidade_orcamentaria" required>
                    <SelectTrigger id="unidade-orcamentaria" className="h-9">
                      <SelectValue placeholder="Selecione a unidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PGJ">PGJ</SelectItem>
                      <SelectItem value="FMMP">FMMP</SelectItem>
                      <SelectItem value="FEPDC">FEPDC</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.unidade_orcamentaria && <p className="text-sm text-destructive">{errors.unidade_orcamentaria}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="justificativa">Justificativa *</Label>
                <Textarea
                  name="justificativa"
                  id="justificativa"
                  placeholder="Descreva a justificativa para esta contratação"
                  rows={4}
                  required
                />
                {errors.justificativa && <p className="text-sm text-destructive">{errors.justificativa}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Valores e Quantidades</CardTitle>
              <CardDescription>Informações orçamentárias</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="quantidade">Quantidade de Itens</Label>
                  <Input name="quantidade_itens" id="quantidade" type="number" placeholder="0" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor-unitario">Valor Unitário (R$)</Label>
                  <Input name="valor_unitario" id="valor-unitario" type="number" step="0.01" placeholder="0,00" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor-estimado">Valor Estimado Total (R$) *</Label>
                  <Input
                    name="valor_estimado"
                    id="valor-estimado"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    required
                  />
                  {errors.valor_estimado && <p className="text-sm text-destructive">{errors.valor_estimado}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unidade-fornecimento">Unidade de Fornecimento</Label>
                  <Input name="unidade_fornecimento" id="unidade-fornecimento" placeholder="Ex: UN, KG, M²" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo-recurso">Tipo de Recurso *</Label>
                  <Select name="tipo_recurso" required>
                    <SelectTrigger id="tipo-recurso" className="h-9">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Custeio">Custeio</SelectItem>
                      <SelectItem value="Investimento">Investimento</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.tipo_recurso && <p className="text-sm text-destructive">{errors.tipo_recurso}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Link to="/contratacoes">
              <Button type="button" variant="outline" size="xs">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={loading} size="xs">
              {loading ? "Salvando..." : "Salvar Contratação"}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
