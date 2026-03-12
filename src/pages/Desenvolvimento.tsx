import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Database, 
  Trash2, 
  FileUp, 
  RefreshCw, 
  Eraser, 
  AlertTriangle, 
  Terminal, 
  GitBranch,
  ShieldAlert,
  HardDrive
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { translateError } from "@/lib/utils/error-translations";
import { importContratacoes, removeDuplicates } from "@/utils/importCsv";
import { migrateExistingIds } from "@/utils/migrateCodigos";

export default function Desenvolvimento() {
  const [loading, setLoading] = useState(false);
  const [dbStats, setDbStats] = useState<{ contratacoes: number; historico: number }>({ contratacoes: 0, historico: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { count: countContratacoes } = await supabase
        .from("contratacoes")
        .select("*", { count: 'exact', head: true });
      
      const { count: countHistorico } = await supabase
        .from("contratacoes_historico")
        .select("*", { count: 'exact', head: true });

      setDbStats({
        contratacoes: countContratacoes || 0,
        historico: countHistorico || 0
      });
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
    }
  };

  const handleImport = async () => {
    const confirm = window.confirm("Deseja importar os dados do arquivo demandas2026.csv? Isso pode criar duplicatas se já existirem.");
    if (!confirm) return;
    
    setLoading(true);
    toast.info("Iniciando importação...");
    try {
      const { count, error } = await importContratacoes();
      if (error) throw new Error(error);
      toast.success(`${count} registros importados com sucesso!`);
      fetchStats();
    } catch (error: any) {
      toast.error("Erro na importação", { description: translateError(error.message) });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDuplicates = async () => {
    const confirm = window.confirm("Deseja verificar e remover registros duplicados? Essa ação não pode ser desfeita.");
    if (!confirm) return;

    setLoading(true);
    toast.info("Verificando duplicatas...");
    try {
      const { count, error } = await removeDuplicates();
      if (error) throw new Error(error);
      
      if (count > 0) {
        toast.success(`${count} registros duplicados foram removidos!`);
        fetchStats();
      } else {
        toast.info("Nenhuma duplicata encontrada.");
      }
    } catch (error: any) {
      toast.error("Erro ao remover duplicatas", { description: translateError(error.message) });
    } finally {
      setLoading(false);
    }
  };

  const handleClearSystem = async () => {
    const confirm = window.confirm("ATENÇÃO: Tem certeza que deseja excluir TODAS as contratações do sistema? Essa ação é irreversível.");
    if (!confirm) return;

    const confirm2 = window.confirm("Confirmação final: Deseja realmente prosseguir com a exclusão total?");
    if (!confirm2) return;

    setLoading(true);
    toast.info("Limpando sistema...");
    try {
      const { error } = await supabase.from("contratacoes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (error) throw error;
      
      toast.success("Sistema limpo com sucesso!");
      fetchStats();
    } catch (error: any) {
      toast.error("Erro ao limpar sistema", { description: translateError(error.message) });
    } finally {
      setLoading(false);
    }
  };

  const handleMigrateIds = async () => {
    setLoading(true);
    try {
      await migrateExistingIds();
      toast.success("Migração de IDs concluída.");
      fetchStats();
    } catch (error: any) {
      toast.error("Erro na migração", { description: translateError(error.message) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Terminal className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Desenvolvimento</h1>
            <p className="text-sm text-muted-foreground">Ferramentas de administração e manutenção do sistema</p>
          </div>
        </div>

        {/* Alerta de Página Temporária */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 items-start">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold">PÁGINA RESTRITA - USO EM DESENVOLVIMENTO</p>
            <p>Esta página é temporária e foca na organização dos recursos de desenvolvimento do PCA 2026. 
               As funcionalidades aqui presentes podem realizar alterações massivas no banco de dados e 
               <strong> não devem ser utilizadas por usuários finais ou em ambiente de produção sem supervisão</strong>.</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Card: Gerenciamento de Dados */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Gerenciamento de Dados</CardTitle>
              </div>
              <CardDescription>Operações estruturais no banco de dados de contratações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={handleImport} 
                  disabled={loading} 
                  variant="outline" 
                  className="flex flex-col h-24 gap-2"
                >
                  <FileUp className="h-6 w-6" />
                  <span>Importar CSV</span>
                </Button>
                <Button 
                  onClick={handleRemoveDuplicates} 
                  disabled={loading} 
                  variant="outline" 
                  className="flex flex-col h-24 gap-2"
                >
                  <Trash2 className="h-6 w-6" />
                  <span>Remover Duplicatas</span>
                </Button>
                <Button 
                  onClick={handleMigrateIds} 
                  disabled={loading} 
                  variant="outline" 
                  className="flex flex-col h-24 gap-2"
                >
                  <RefreshCw className="h-6 w-6" />
                  <span>Migrar IDs</span>
                </Button>
                <Button 
                  onClick={handleClearSystem} 
                  disabled={loading} 
                  variant="outline" 
                  className="flex flex-col h-24 gap-2 text-destructive hover:bg-destructive/10"
                >
                  <Eraser className="h-6 w-6" />
                  <span>Limpar Sistema</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Card: Estatísticas e Saúde */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Estado do Sistema</CardTitle>
              </div>
              <CardDescription>Visão atual das tabelas do banco de dados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-2xl font-bold">{dbStats.contratacoes}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Contratações</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-2xl font-bold">{dbStats.historico}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Registros de Histórico</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-amber-500" />
                  Lembrete de Manutenção
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                  <li>Sempre faça backup antes de "Limpar Sistema".</li>
                  <li>A migração de IDs é necessária para registros legados sem código.</li>
                  <li>A importação de CSV utiliza o arquivo local '/demandas2026.csv'.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Card: Infraestrutura Local (Extra) */}
          <Card className="md:col-span-2 border-dashed">
            <CardHeader>
              <div className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Deploy e Ambiente</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 text-success text-xs rounded-full border border-success/20">
                  <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  Banco de Dados Conectado
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary text-xs rounded-full border border-primary/20">
                  <GitBranch className="h-4 w-4" />
                  Branch: Principal (main)
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted text-muted-foreground text-xs rounded-full">
                  Supabase Project: cleristondecastroramos
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
