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
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function NovaContratacao() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Contratação cadastrada com sucesso!");
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/contratacoes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Nova Contratação</h1>
            <p className="text-muted-foreground">Cadastre uma nova contratação no PCA 2026</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>Dados principais da contratação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição do Objeto *</Label>
                  <Input id="descricao" placeholder="Ex: Aquisição de Computadores" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pdm">PDM/CATSER</Label>
                  <Input id="pdm" placeholder="Código do catálogo" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="classe">Classe *</Label>
                  <Select required>
                    <SelectTrigger id="classe">
                      <SelectValue placeholder="Selecione a classe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="material-consumo">Material de Consumo</SelectItem>
                      <SelectItem value="material-permanente">Material Permanente</SelectItem>
                      <SelectItem value="servico">Serviço</SelectItem>
                      <SelectItem value="servico-ti">Serviço de TI</SelectItem>
                      <SelectItem value="engenharia">Engenharia</SelectItem>
                      <SelectItem value="obra">Obra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="setor">Setor Requisitante *</Label>
                  <Select required>
                    <SelectTrigger id="setor">
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
                      <SelectItem value="PLANEJAMENTO">PLANEJAMENTO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo-contratacao">Tipo de Contratação *</Label>
                  <Select required>
                    <SelectTrigger id="tipo-contratacao">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nova">Nova Contratação</SelectItem>
                      <SelectItem value="renovacao">Renovação</SelectItem>
                      <SelectItem value="aditivo">Aditivo Quantitativo</SelectItem>
                      <SelectItem value="repactuacao">Repactuação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modalidade">Modalidade *</Label>
                  <Select required>
                    <SelectTrigger id="modalidade">
                      <SelectValue placeholder="Selecione a modalidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pregao">Pregão Eletrônico</SelectItem>
                      <SelectItem value="dispensa">Dispensa</SelectItem>
                      <SelectItem value="inexigibilidade">Inexigibilidade</SelectItem>
                      <SelectItem value="concorrencia">Concorrência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prioridade">Grau de Prioridade *</Label>
                  <Select required>
                    <SelectTrigger id="prioridade">
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="baixa">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unidade-orcamentaria">Unidade Orçamentária *</Label>
                  <Select required>
                    <SelectTrigger id="unidade-orcamentaria">
                      <SelectValue placeholder="Selecione a unidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PGJ">PGJ</SelectItem>
                      <SelectItem value="FMMP">FMMP</SelectItem>
                      <SelectItem value="FEPDC">FEPDC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="justificativa">Justificativa *</Label>
                <Textarea
                  id="justificativa"
                  placeholder="Descreva a justificativa para esta contratação"
                  rows={4}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Valores e Quantidades</CardTitle>
              <CardDescription>Informações orçamentárias</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="quantidade">Quantidade de Itens</Label>
                  <Input id="quantidade" type="number" placeholder="0" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor-unitario">Valor Unitário (R$)</Label>
                  <Input id="valor-unitario" type="number" step="0.01" placeholder="0,00" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor-estimado">Valor Estimado Total (R$) *</Label>
                  <Input
                    id="valor-estimado"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unidade-fornecimento">Unidade de Fornecimento</Label>
                  <Input id="unidade-fornecimento" placeholder="Ex: UN, KG, M²" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo-recurso">Tipo de Recurso *</Label>
                  <Select required>
                    <SelectTrigger id="tipo-recurso">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custeio">Custeio</SelectItem>
                      <SelectItem value="investimento">Investimento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link to="/contratacoes">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Salvar Contratação
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
