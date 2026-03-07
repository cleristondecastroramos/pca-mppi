import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send, Trash2, BellRing } from "lucide-react";
import { useAuthSession } from "@/lib/auth";

type Notificacao = {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: string;
  data_criacao: string;
  ativa: boolean;
};

export default function Notificacoes() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const { data: session } = useAuthSession();

  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    fetchNotificacoes();
  }, []);

  const fetchNotificacoes = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("notificacoes")
        .select("*")
        .eq("ativa", true)
        .order("data_criacao", { ascending: false });

      if (error) throw error;
      setNotificacoes(data || []);
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao carregar notificações.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !mensagem.trim()) {
      toast.warning("Preencha o título e a mensagem.");
      return;
    }

    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from("notificacoes")
        .insert([
          {
            titulo: titulo.trim(),
            mensagem: mensagem.trim(),
            autor_id: session?.user?.id,
            tipo: "info",
          },
        ]);

      if (error) throw error;

      toast.success("Notificação enviada a todos os usuários com sucesso!");
      setTitulo("");
      setMensagem("");
      fetchNotificacoes();
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao criar notificação: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Deseja realmente excluir (inativar) esta notificação? Ela sumirá do painel de todos os usuários.")) return;
    
    try {
      const { error } = await (supabase as any)
        .from("notificacoes")
        .update({ ativa: false })
        .eq("id", id);

      if (error) throw error;

      toast.success("Notificação removida.");
      setNotificacoes((prev) => prev.filter((n) => n.id !== id));
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao excluir notificação.");
    }
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
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <BellRing className="h-6 w-6 text-primary" />
            Central de Notificações
          </h1>
          <p className="text-sm text-muted-foreground">
            Crie, envie e gerencie alertas ou mensagens de comunicação rápida para todos os usuários do sistema.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 h-fit">
            <CardHeader>
              <CardTitle>Nova Notificação</CardTitle>
              <CardDescription>
                O texto será exibido instantaneamente no sino superior direito (máximo 150 caracteres).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Título Curto (Máx: 50)</label>
                  <Input 
                    placeholder="Ex: Prazo de encerramento prorrogado" 
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    maxLength={50}
                  />
                  <div className="text-xs text-right text-muted-foreground">{titulo.length}/50</div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Mensagem Direta (Máx: 150)</label>
                  <Textarea 
                    placeholder="Descreva a notificação ou alerta em poucas palavras..." 
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    maxLength={150}
                    className="resize-none h-24"
                  />
                  <div className="text-xs text-right text-muted-foreground">{mensagem.length}/150</div>
                </div>

                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  Disparar para Usuários
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Histórico de Notificações Ativas</CardTitle>
              <CardDescription>
                Notificações atuais sendo exibidas aos usuários na plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {notificacoes.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm border border-dashed rounded-lg">
                  Nenhuma notificação ativa no momento.
                </div>
              ) : (
                <div className="rounded-lg border bg-card">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">Data e Hora</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Mensagem</TableHead>
                        <TableHead className="w-[70px] text-center">Excluir</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {notificacoes.map((notif) => (
                        <TableRow key={notif.id}>
                          <TableCell className="text-xs text-muted-foreground align-top whitespace-nowrap">
                            {new Date(notif.data_criacao).toLocaleString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </TableCell>
                          <TableCell className="font-semibold text-sm align-top">
                            {notif.titulo}
                          </TableCell>
                          <TableCell className="text-xs align-top">
                            {notif.mensagem}
                          </TableCell>
                          <TableCell className="text-center align-middle">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => handleDelete(notif.id)}
                              title="Remover Notificação"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
