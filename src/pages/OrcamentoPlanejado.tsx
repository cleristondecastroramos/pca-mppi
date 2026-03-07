import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Save } from "lucide-react";

type Orcamento = {
  id: string;
  setor_requisitante: string;
  ano: number;
  valor: number;
  trava_ativa: boolean;
};

const setoresObj = [
  "CAA", "CCF", "CCS", "CEAF", "CLC", "CONINT", "CPPT", "CRH", "CTI", "GAECO", "GSI", "PLANEJAMENTO", "PROCON",
];

const currentYear = new Date().getFullYear();

export default function OrcamentoPlanejado() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orcamentos, setOrcamentos] = useState<Record<string, Orcamento>>({});
  const [editValues, setEditValues] = useState<Record<string, { valor: string; trava_ativa: boolean }>>({});

  useEffect(() => {
    fetchOrcamentos();
  }, []);

  const fetchOrcamentos = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("orcamento_planejado")
        .select("*")
        .eq("ano", currentYear);
        
      if (error) throw error;

      const loadedOrcamentos: Record<string, Orcamento> = {};
      const localEdits: Record<string, { valor: string; trava_ativa: boolean }> = {};

      (data as Orcamento[])?.forEach((item) => {
        loadedOrcamentos[item.setor_requisitante] = item;
        localEdits[item.setor_requisitante] = {
          valor: (item.valor || 0).toString(),
          trava_ativa: item.trava_ativa || false,
        };
      });

      // Populate empty ones
      setoresObj.forEach((setor) => {
        if (!localEdits[setor]) {
          localEdits[setor] = { valor: "0", trava_ativa: false };
        }
      });

      setOrcamentos(loadedOrcamentos);
      setEditValues(localEdits);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar orçamentos.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (setor: string) => {
    setSaving(true);
    try {
      const editData = editValues[setor];
      const parsedValor = parseFloat(editData.valor.replace(/\./g, "").replace(",", ".")) || 0;
      
      const existing = orcamentos[setor];

      if (existing) {
        // Update
        const { error } = await (supabase as any)
          .from("orcamento_planejado")
          .update({ valor: parsedValor, trava_ativa: editData.trava_ativa })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        // Insert
        const { error } = await (supabase as any)
          .from("orcamento_planejado")
          .insert([
            {
              setor_requisitante: setor,
              ano: currentYear,
              valor: parsedValor,
              trava_ativa: editData.trava_ativa,
            },
          ]);

        if (error) throw error;
      }

      toast.success(`Orçamento do setor ${setor} salvo com sucesso!`);
      fetchOrcamentos(); // Re-fetch all to ensure ids and states are updated
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao salvar orçamento: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const parseCurrencyInput = (value: string) => {
    const rawValue = value.replace(/\D/g, "");
    if (!rawValue) return "0,00";
    const numericValue = Number(rawValue) / 100;
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue);
  };

  const handleChangeValor = (setor: string, val: string) => {
    setEditValues((prev) => ({
      ...prev,
      [setor]: {
        ...prev[setor],
        valor: parseCurrencyInput(val),
      },
    }));
  };

  const handleToggleTrava = (setor: string, checked: boolean) => {
    setEditValues((prev) => ({
      ...prev,
      [setor]: {
        ...prev[setor],
        trava_ativa: checked,
      },
    }));
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Orçamento Planejado</h1>
          <p className="text-sm text-muted-foreground">
            Defina o limite de utilização orçamentária e travas sistêmicas por setor para o ano {currentYear}.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Limites por Setor Demandante</CardTitle>
            <CardDescription>
              Ajuste o valor máximo permitido para cada setor. Ao ativar a "Trava", o setor será bloqueado de criar novas demandas que excedam este valor.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Setor</TableHead>
                    <TableHead>Valor Planejado (R$)</TableHead>
                    <TableHead className="text-center">Trava Ativa?</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {setoresObj.map((setor) => {
                    const editData = editValues[setor] || { valor: "0,00", trava_ativa: false };

                    return (
                      <TableRow key={setor}>
                        <TableCell className="font-medium align-middle">{setor}</TableCell>
                        <TableCell className="align-middle w-[250px]">
                          <Input
                            value={editData.valor}
                            onChange={(e) => handleChangeValor(setor, e.target.value)}
                            className="bg-background text-right"
                          />
                        </TableCell>
                        <TableCell className="text-center align-middle">
                          <div className="flex items-center justify-center">
                            <Switch
                              checked={editData.trava_ativa}
                              onCheckedChange={(c) => handleToggleTrava(setor, c)}
                            />
                            <Label className="ml-2 text-xs text-muted-foreground w-12 text-left">
                              {editData.trava_ativa ? "Ativada" : "Inativa"}
                            </Label>
                          </div>
                        </TableCell>
                        <TableCell className="text-right align-middle">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleSave(setor)}
                            disabled={saving}
                          >
                            <Save className="mr-2 h-4 w-4" />
                            Salvar
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
