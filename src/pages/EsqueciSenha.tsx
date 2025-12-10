import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const EsqueciSenha = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const envRedirect = (import.meta as any).env?.VITE_AUTH_REDIRECT_URL as string | undefined;
      const redirectTo = envRedirect || `${window.location.origin}/redefinir-senha`;
      let { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) {
        // Tenta fallback sem redirectTo (usa SITE_URL do projeto)
        const res = await supabase.auth.resetPasswordForEmail(email);
        error = res.error;
      }
      if (error) throw error;
      toast.success("Se existir uma conta para este e-mail, enviaremos instruções.");
      navigate("/auth");
    } catch (err: any) {
      const msg = (err?.message || String(err)) as string;
      const hint = msg.toLowerCase().includes("redirect")
        ? "Adicione a URL de redirecionamento permitida nas configurações do Supabase Auth."
        : msg.toLowerCase().includes("failed to fetch")
        ? "Verifique conexão e se o domínio atual consta nos Redirect URLs do Supabase."
        : undefined;
      toast.error("Falha ao solicitar recuperação", { description: hint ? `${msg} — ${hint}` : msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-lg shadow-2xl overflow-hidden">
        <CardHeader className="text-center">
          <CardTitle className="text-lg font-bold" style={{ fontFamily: 'QueensidesLight-ZVj3l, sans-serif' }}>
            Recuperar acesso
          </CardTitle>
          <CardDescription>Informe seu e-mail institucional para receber o link de redefinição.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">E-mail</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="seu.email@mppi.mp.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading} size="xs">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar link de redefinição
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={() => navigate("/auth")} size="xs">
              Voltar ao login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EsqueciSenha;

