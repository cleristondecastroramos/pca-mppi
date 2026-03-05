import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Clock, Calendar, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type AttItem = {
  id: string;
  descricao: string;
  setor_requisitante: string | null;
  data_prevista_contratacao: string | null;
  etapa_processo: string | null;
  sobrestado?: boolean | null;
};

const parseDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('pt-BR');
};

const getDaysDiff = (targetDate: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const PrioridadesAtencao = () => {
  const [items, setItems] = useState<AttItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("contratacoes")
          .select("id, descricao, setor_requisitante, etapa_processo, sobrestado, data_prevista_contratacao")
          .order("data_prevista_contratacao", { ascending: true });
        
        if (error) throw error;
        setItems((data as any) || []);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const { atrasados, atencao120 } = useMemo(() => {
    const atrasadosList: AttItem[] = [];
    const atencaoList: AttItem[] = [];

    items.forEach(item => {
      if (!item.data_prevista_contratacao) return;

      const dataPrevista = parseDate(item.data_prevista_contratacao);
      const daysDiff = getDaysDiff(dataPrevista);
      
      const isConcluido = item.etapa_processo === "Concluído" || item.etapa_processo === "Contratado";
      const isEmLicitacao = item.etapa_processo === "Em Licitação"; // Talvez considerar em andamento

      // Se já foi concluído, ignorar para alertas de atraso/atenção
      if (isConcluido) return;

      // Lógica para Atrasados
      if (daysDiff < 0) {
        atrasadosList.push(item);
      } 
      // Lógica para Atenção (0 a 120 dias)
      else if (daysDiff >= 0 && daysDiff <= 120) {
        atencaoList.push(item);
      }
    });

    return { atrasados: atrasadosList, atencao120: atencaoList };
  }, [items]);

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Pontos de Atenção</h1>
          <p className="text-muted-foreground text-lg">
            Monitoramento estratégico de prazos e processos críticos da CLC.
          </p>
        </div>

        {/* KPIs Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-l-4 border-l-destructive shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-destructive">
                Processos em Atraso
              </CardTitle>
              <AlertCircle className="h-5 w-5 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">{atrasados.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Data prevista já expirada
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-600">
                Atenção (Próximos 120 dias)
              </CardTitle>
              <Clock className="h-5 w-5 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">{atencao120.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Prazo crítico se aproximando
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">
                Total Monitorado
              </CardTitle>
              <Calendar className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{atrasados.length + atencao120.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Processos requerendo ação
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="atrasados" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-[600px]">
            <TabsTrigger value="atrasados" className="data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground">
              Em Atraso ({atrasados.length})
            </TabsTrigger>
            <TabsTrigger value="atencao" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              Atenção / Próximos 120 dias ({atencao120.length})
            </TabsTrigger>
          </TabsList>

          {/* Tab: Atrasados */}
          <TabsContent value="atrasados" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Processos com Prazo Expirado
                </CardTitle>
                <CardDescription>
                  Estes processos ultrapassaram a data prevista de contratação e requerem intervenção imediata.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {atrasados.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                    <p className="text-lg font-medium">Nenhum processo em atraso!</p>
                    <p>Todas as contratações estão dentro do prazo.</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead className="w-[100px]">ID</TableHead>
                          <TableHead>Objeto / Descrição</TableHead>
                          <TableHead>Setor</TableHead>
                          <TableHead>Etapa Atual</TableHead>
                          <TableHead className="text-center">Data Prevista</TableHead>
                          <TableHead className="text-right">Atraso</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {atrasados.map((item) => {
                          const date = parseDate(item.data_prevista_contratacao!);
                          const days = Math.abs(getDaysDiff(date));
                          return (
                            <TableRow key={item.id} className="hover:bg-destructive/5">
                              <TableCell className="font-mono text-xs text-muted-foreground">
                                {item.id.slice(-8)}
                              </TableCell>
                              <TableCell className="font-medium max-w-[400px]">
                                <div className="truncate" title={item.descricao}>
                                  {item.descricao}
                                </div>
                              </TableCell>
                              <TableCell>{item.setor_requisitante || "-"}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-background">
                                  {item.etapa_processo || "Não iniciado"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center font-medium text-destructive">
                                {formatDate(date)}
                              </TableCell>
                              <TableCell className="text-right font-bold text-destructive">
                                {days} dias
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Atenção */}
          <TabsContent value="atencao" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-600">
                  <Clock className="h-5 w-5" />
                  Agenda de Atenção (Próximos 120 dias)
                </CardTitle>
                <CardDescription>
                  Processos que devem ser iniciados ou monitorados para evitar atrasos futuros.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {atencao120.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                    <p className="text-lg font-medium">Agenda tranquila!</p>
                    <p>Nenhum processo crítico previsto para os próximos 120 dias.</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead className="w-[100px]">ID</TableHead>
                          <TableHead>Objeto / Descrição</TableHead>
                          <TableHead>Setor</TableHead>
                          <TableHead>Etapa Atual</TableHead>
                          <TableHead className="text-center">Data Prevista</TableHead>
                          <TableHead className="text-right">Prazo Restante</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {atencao120.map((item) => {
                          const date = parseDate(item.data_prevista_contratacao!);
                          const days = getDaysDiff(date);
                          let urgencyColor = "text-green-600";
                          if (days < 30) urgencyColor = "text-red-500 font-bold";
                          else if (days < 60) urgencyColor = "text-amber-500 font-bold";
                          else if (days < 90) urgencyColor = "text-amber-600";

                          return (
                            <TableRow key={item.id} className="hover:bg-muted/30">
                              <TableCell className="font-mono text-xs text-muted-foreground">
                                {item.id.slice(-8)}
                              </TableCell>
                              <TableCell className="font-medium max-w-[400px]">
                                <div className="truncate" title={item.descricao}>
                                  {item.descricao}
                                </div>
                              </TableCell>
                              <TableCell>{item.setor_requisitante || "-"}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-background">
                                  {item.etapa_processo || "Não iniciado"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                {formatDate(date)}
                              </TableCell>
                              <TableCell className={`text-right ${urgencyColor}`}>
                                {days} dias
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default PrioridadesAtencao;
