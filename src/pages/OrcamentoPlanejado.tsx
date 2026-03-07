import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Save, History } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

type Orcamento = {
  id: string;
  setor_requisitante: string;
  ano: number;
  valor_pgj: number;
  valor_fmmp: number;
  valor_fepdc: number;
  trava_ativa: boolean;
};

const setoresObj = [
  "CAA", "CCF", "CCS", "CEAF", "CLC", "CONINT", "CPPT", "CRH", "CTI", "GAECO", "GSI", "PLANEJAMENTO", "PROCON",
];

const currentYear = new Date().getFullYear();

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
};

export default function OrcamentoPlanejado() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orcamentos, setOrcamentos] = useState<Record<string, Orcamento>>({});
  const [editValues, setEditValues] = useState<Record<string, { valor_pgj: string; valor_fmmp: string; valor_fepdc: string; trava_ativa: boolean }>>({});
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditOpen, setAuditOpen] = useState(false);

  useEffect(() => {
    fetchOrcamentos();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      let result = await (supabase as any)
        .from("orcamento_planejado_auditoria")
        .select("*")
        .order("data_alteracao", { ascending: false })
        .limit(100);

      if (result.error) throw result.error;

      // Busca os nomes dos usuários cruzando as tabelas permanentemente em vez de usar foreign key join ("fallback")
      if (result.data && result.data.length > 0) {
        const userIds = [...new Set(result.data.map((log: any) => log.usuario_id).filter(Boolean))] as string[];
        if (userIds.length > 0) {
      const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, nome_completo")
            .in("id", userIds);
          
          if (profilesData) {
            const profilesMap = profilesData.reduce((acc: any, p: any) => {
              acc[p.id] = p.full_name;
              return acc;
            }, {});
            
            result.data = result.data.map((log: any) => ({
              ...log,
              profiles: { full_name: profilesMap[log.usuario_id] }
            }));
          }
        }
      }

      setAuditLogs(result.data || []);
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao carregar auditoria: " + (err.message || "Tente atualizar a página."));
    }
  };

  const fetchOrcamentos = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("orcamento_planejado")
        .select("*")
        .eq("ano", currentYear);
        
      if (error) throw error;

      const loadedOrcamentos: Record<string, Orcamento> = {};
      const localEdits: Record<string, { valor_pgj: string; valor_fmmp: string; valor_fepdc: string; trava_ativa: boolean }> = {};

      (data as Orcamento[])?.forEach((item) => {
        loadedOrcamentos[item.setor_requisitante] = item;
        localEdits[item.setor_requisitante] = {
          valor_pgj: (item.valor_pgj || 0).toString(),
          valor_fmmp: (item.valor_fmmp || 0).toString(),
          valor_fepdc: (item.valor_fepdc || 0).toString(),
          trava_ativa: item.trava_ativa || false,
        };
      });

      // Populate empty ones
      setoresObj.forEach((setor) => {
        if (!localEdits[setor]) {
          localEdits[setor] = { valor_pgj: "0,00", valor_fmmp: "0,00", valor_fepdc: "0,00", trava_ativa: false };
        } else {
          localEdits[setor].valor_pgj = parseValToCurrencyDisplay(localEdits[setor].valor_pgj);
          localEdits[setor].valor_fmmp = parseValToCurrencyDisplay(localEdits[setor].valor_fmmp);
          localEdits[setor].valor_fepdc = parseValToCurrencyDisplay(localEdits[setor].valor_fepdc);
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

  const parseValToCurrencyDisplay = (val: string) => {
    const raw = parseFloat(val) || 0;
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(raw);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const updates = [];
      const inserts = [];

      for (const setor of setoresObj) {
        const editData = editValues[setor];
        const vPgj = parseFloat(editData.valor_pgj.replace(/\./g, "").replace(",", ".")) || 0;
        const vFmmp = parseFloat(editData.valor_fmmp.replace(/\./g, "").replace(",", ".")) || 0;
        const vFepdc = parseFloat(editData.valor_fepdc.replace(/\./g, "").replace(",", ".")) || 0;
        
        const existing = orcamentos[setor];

        if (existing?.id) {
          updates.push({
            id: existing.id,
            setor_requisitante: setor,
            ano: currentYear,
            valor_pgj: vPgj,
            valor_fmmp: vFmmp,
            valor_fepdc: vFepdc,
            trava_ativa: editData.trava_ativa,
          });
        } else {
          inserts.push({
            setor_requisitante: setor,
            ano: currentYear,
            valor_pgj: vPgj,
            valor_fmmp: vFmmp,
            valor_fepdc: vFepdc,
            trava_ativa: editData.trava_ativa,
          });
        }
      }

      if (inserts.length > 0) {
        const { error: errorInserts } = await (supabase as any)
          .from("orcamento_planejado")
          .insert(inserts);

        if (errorInserts) throw errorInserts;
      }

      if (updates.length > 0) {
        const { error: errorUpdates } = await (supabase as any)
          .from("orcamento_planejado")
          .upsert(updates, { onConflict: 'id' });

        if (errorUpdates) throw errorUpdates;
      }

      toast.success(`Todos os orçamentos foram salvos com sucesso!`);
      fetchOrcamentos();
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao salvar orçamentos: " + err.message);
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

  const parseToNumber = (valString: string) => {
    return parseFloat(valString.replace(/\./g, "").replace(",", ".")) || 0;
  };

  const handleChangeValor = (setor: string, field: "valor_pgj" | "valor_fmmp" | "valor_fepdc", val: string) => {
    setEditValues((prev) => ({
      ...prev,
      [setor]: {
        ...prev[setor],
        [field]: parseCurrencyInput(val),
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

  // Calcula totais
  let totalGeralPgj = 0;
  let totalGeralFmmp = 0;
  let totalGeralFepdc = 0;

  setoresObj.forEach((s) => {
    const data = editValues[s];
    if (data) {
      totalGeralPgj += parseToNumber(data.valor_pgj);
      totalGeralFmmp += parseToNumber(data.valor_fmmp);
      totalGeralFepdc += parseToNumber(data.valor_fepdc);
    }
  });

  const totalGeralAll = totalGeralPgj + totalGeralFmmp + totalGeralFepdc;

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Orçamento Planejado</h1>
            <p className="text-sm text-muted-foreground">
              Defina o limite de utilização orçamentária e travas sistêmicas por setor para o ano {currentYear}.
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={auditOpen} onOpenChange={(open) => {
              setAuditOpen(open);
              if (open) fetchAuditLogs();
            }}>
              <DialogTrigger asChild>
                <Button variant="outline" className="whitespace-nowrap">
                  <History className="mr-2 h-4 w-4" />
                  Auditoria
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle>Auditoria de Configurações</DialogTitle>
                  <DialogDescription>
                    Histórico de alterações nos limites orçamentários
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[60vh] mt-4 rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Setor</TableHead>
                        <TableHead>Alterações (PGJ / FMMP / FEPDC / Trava)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-xs align-top whitespace-nowrap">
                            {new Date(log.data_alteracao).toLocaleString("pt-BR")}
                          </TableCell>
                          <TableCell className="font-medium text-xs align-top">
                            {log.profiles?.full_name || log.usuario_id || "Desconhecido"}
                          </TableCell>
                          <TableCell className="font-medium text-xs align-top">
                            {log.setor_requisitante}
                          </TableCell>
                          <TableCell className="text-xs space-y-1 align-top">
                            <div><strong>PGJ:</strong> {formatCurrency(Number(log.valor_pgj_anterior) || 0)} → {formatCurrency(Number(log.valor_pgj_novo) || 0)}</div>
                            <div><strong>FMMP:</strong> {formatCurrency(Number(log.valor_fmmp_anterior) || 0)} → {formatCurrency(Number(log.valor_fmmp_novo) || 0)}</div>
                            <div><strong>FEPDC:</strong> {formatCurrency(Number(log.valor_fepdc_anterior) || 0)} → {formatCurrency(Number(log.valor_fepdc_novo) || 0)}</div>
                            <div><strong>Trava:</strong> {log.trava_ativa_anterior ? "Ativada" : "Inativa"} → {log.trava_ativa_novo ? "Ativada" : "Inativa"}</div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </DialogContent>
            </Dialog>
            <Button onClick={handleSaveAll} disabled={saving} className="whitespace-nowrap">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Salvar
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Limites por Setor Demandante</CardTitle>
            <CardDescription>
              Ajuste o valor máximo permitido para cada setor em cada Unidade Orçamentária. Ao ativar a "Trava", o setor será bloqueado de criar novas demandas que excedam a soma configurada.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Setor</TableHead>
                    <TableHead className="text-center">PGJ (R$)</TableHead>
                    <TableHead className="text-center">FMMP (R$)</TableHead>
                    <TableHead className="text-center">FEPDC (R$)</TableHead>
                    <TableHead className="text-right">Total Setor (R$)</TableHead>
                    <TableHead className="text-center">Trava Ativa?</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {setoresObj.map((setor) => {
                    const editData = editValues[setor] || { valor_pgj: "0,00", valor_fmmp: "0,00", valor_fepdc: "0,00", trava_ativa: false };

                    const numPgj = parseToNumber(editData.valor_pgj);
                    const numFmmp = parseToNumber(editData.valor_fmmp);
                    const numFepdc = parseToNumber(editData.valor_fepdc);
                    const totalSetor = numPgj + numFmmp + numFepdc;

                    return (
                      <TableRow key={setor}>
                        <TableCell className="font-medium align-middle py-1 px-2">{setor}</TableCell>
                        <TableCell className="align-middle w-[150px] py-1 px-2">
                          <Input
                            value={editData.valor_pgj}
                            onChange={(e) => handleChangeValor(setor, "valor_pgj", e.target.value)}
                            className="bg-background text-right h-8 text-sm"
                          />
                        </TableCell>
                        <TableCell className="align-middle w-[150px] py-1 px-2">
                          <Input
                            value={editData.valor_fmmp}
                            onChange={(e) => handleChangeValor(setor, "valor_fmmp", e.target.value)}
                            className="bg-background text-right h-8 text-sm"
                          />
                        </TableCell>
                        <TableCell className="align-middle w-[150px] py-1 px-2">
                          <Input
                            value={editData.valor_fepdc}
                            onChange={(e) => handleChangeValor(setor, "valor_fepdc", e.target.value)}
                            className="bg-background text-right h-8 text-sm"
                          />
                        </TableCell>
                        <TableCell className="align-middle text-right font-medium py-1 px-2">
                          {formatCurrency(totalSetor)}
                        </TableCell>
                        <TableCell className="text-center align-middle py-1 px-2">
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
                      </TableRow>
                    );
                  })}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="font-bold">Total Geral</TableCell>
                    <TableCell className="text-right font-bold pr-5">{formatCurrency(totalGeralPgj)}</TableCell>
                    <TableCell className="text-right font-bold pr-5">{formatCurrency(totalGeralFmmp)}</TableCell>
                    <TableCell className="text-right font-bold pr-5">{formatCurrency(totalGeralFepdc)}</TableCell>
                    <TableCell className="text-right font-bold text-primary">{formatCurrency(totalGeralAll)}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
