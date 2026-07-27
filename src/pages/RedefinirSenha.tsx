import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { translateError } from "@/lib/utils/error-translations";
import { Loader2 } from "lucide-react";

const RedefinirSenha = () => {
  const navigate = useNavigate();
  const [isRecovery, setIsRecovery] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") {
        if (session) setIsRecovery(true);
      }
    });

    const hasHashToken = window.location.hash.includes("access_token") || window.location.hash.includes("type=recovery");
    const hasSearchCode = window.location.search.includes("code=");

    supabase.auth.getSession().then(({ data }) => {
      if (data.session || hasHashToken || hasSearchCode) {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRecovery) {
      toast.error("Link de recuperação inválido ou expirado.");
      return;
    }
    if (password.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      toast.error("As senhas não conferem.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        password,
        data: { must_change_password: false },
      });
      if (error) throw error;

      if (data.user?.id) {
        await supabase
          .from("profiles")
          .update({ must_change_password: false })
          .eq("id", data.user.id);
      }

      toast.success("Senha redefinida com sucesso. Faça login novamente.");
      navigate("/auth", { replace: true });
    } catch (err: any) {
      const errorMessage = translateError(err.message || String(err));
      toast.error("Falha ao redefinir senha", { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-lg shadow-2xl overflow-hidden">
        <CardHeader className="text-center">
          <CardTitle className="text-lg font-bold" style={{ fontFamily: 'QueensidesLight-ZVj3l, sans-serif' }}>
            Redefinir senha
          </CardTitle>
          <CardDescription>
            {isRecovery ? "Defina uma nova senha para sua conta." : "Aguardando validação do link de recuperação..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="grid gap-3">
            <Input
              type="password"
              placeholder="Nova senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Confirmar nova senha"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <Button type="submit" disabled={loading || !isRecovery} size="xs">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Redefinir senha
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate("/auth")} size="xs">
              Voltar ao login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RedefinirSenha;

