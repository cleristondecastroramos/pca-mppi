import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

const MinhaConta = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não conferem.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Senha alterada com sucesso.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      console.error(e);
      toast.error("Falha ao alterar senha", { description: e.message || e.toString() });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Minha Conta</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div>
              <h3 className="text-sm font-medium">Trocar senha</h3>
              <div className="grid gap-2 mt-2">
                <Input type="password" placeholder="Nova senha" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                <Input type="password" placeholder="Confirmar nova senha" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                <Button onClick={handleChangePassword} disabled={loading} size="xs">
                  {loading ? "Salvando..." : "Salvar senha"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default MinhaConta;