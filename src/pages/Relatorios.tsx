import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { toast } from "sonner";
import { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon } from "lucide-react";

const Relatorios = () => {
  const [status, setStatus] = useState<string>("todos");
  const [setor, setSetor] = useState<string>("todos");
  const [range, setRange] = useState<DateRange | undefined>({ from: undefined, to: undefined });
  const [loading, setLoading] = useState(false);

  async function handleGenerate(tipo: "pdf" | "csv") {
    setLoading(true);
    toast.message("Gerando relatório...", { description: "Processo assíncrono iniciado." });
    try {
      // Simular chamada assíncrona do backend
      await new Promise((res) => setTimeout(res, 1500));
      toast.success("Relatório pronto", {
        description: `Formato ${tipo.toUpperCase()} gerado com filtros aplicados.`,
      });
    } catch (e) {
      toast.error("Falha na geração", { description: "Tente novamente mais tarde." });
    } finally {
      setLoading(false);
    }
  }
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Relatórios</h1>
            <p className="text-sm text-muted-foreground">Geração e exportação de relatórios.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtros e Período</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-4">
              <div>
                <label className="text-sm text-muted-foreground">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="mt-1 h-9">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="não iniciado">não iniciado</SelectItem>
                    <SelectItem value="em andamento">em andamento</SelectItem>
                    <SelectItem value="concluído">concluído</SelectItem>
                    <SelectItem value="sobrestado">sobrestado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Setor</label>
                <Input className="mt-1" placeholder="Ex.: TI, Engenharia" value={setor} onChange={(e) => setSetor(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-muted-foreground">Período</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button size="xs" variant="outline" className="mt-1 w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {range?.from && range?.to
                        ? `${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`
                        : "Selecione intervalo"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={range}
                      onSelect={setRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="xs" onClick={() => handleGenerate("pdf")} disabled={loading} className="bg-primary hover:bg-primary-dark">
                Exportar PDF
              </Button>
              <Button size="xs" onClick={() => handleGenerate("csv")} disabled={loading} variant="outline">
                Exportar CSV
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">A geração é assíncrona e mostra feedback com toasts.</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Relatorios;