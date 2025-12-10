import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera } from "lucide-react";

const MinhaConta = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [setor, setSetor] = useState("");
  const [cargo, setCargo] = useState("");
  const [telefone, setTelefone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      setUserId(user?.id || null);
      if (user?.id) {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("id, nome_completo, email, setor, cargo, telefone, avatar_url")
          .eq("id", user.id)
          .maybeSingle();
        if (!error && profile) {
          setNomeCompleto(profile.nome_completo || "");
          setEmail(profile.email || user.email || "");
          setSetor(profile.setor || "");
          setCargo(profile.cargo || "");
          setTelefone(profile.telefone || "");
          setAvatarUrl(profile.avatar_url || null);
        } else {
          setEmail(user.email || "");
        }
      }
    };
    load();
  }, []);

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

  const handleUploadAvatar = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast.error("Selecione uma imagem.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Arquivo inválido. Envie uma imagem.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 2MB.");
      return;
    }
    setUploading(true);
    try {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) throw new Error("Sessão inválida");

      const ext = file.name.split(".").pop() || "jpg";
      const path = `users/${user.id}/avatar.${ext}`;

      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, {
        upsert: true,
        contentType: file.type,
      });
      if (upErr) throw upErr;

      const { data: pubData } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = pubData.publicUrl;

      await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
      const { error: profErr } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);
      if (profErr) throw profErr;

      setAvatarUrl(publicUrl);
      try { localStorage.setItem("app_avatar_url", publicUrl); } catch {}
      try { window.dispatchEvent(new CustomEvent("app-avatar-update", { detail: publicUrl })); } catch {}
      toast.success("Foto atualizada.");
    } catch (e: any) {
      toast.error("Falha ao enviar imagem", { description: e.message || String(e) });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const triggerSelectFile = () => {
    fileRef.current?.click();
  };

  

  const formatPhone = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 11);
    const a = d.slice(0, 2);
    const b = d.slice(2, 7);
    const c = d.slice(7, 11);
    let out = "";
    if (a) out = `(${a})`;
    if (b) out += ` ${b}`;
    if (c) out += `-${c}`;
    return out;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelefone(formatPhone(e.target.value));
  };

  const handleSaveProfile = async () => {
    if (!userId) return;
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ nome_completo: nomeCompleto, setor, cargo, telefone, email })
        .eq("id", userId);
      if (error) throw error;
      toast.success("Dados atualizados.");
      await supabase.auth.updateUser({ data: { nome_completo: nomeCompleto } });
    } catch (e: any) {
      toast.error("Falha ao salvar dados", { description: e.message || String(e) });
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Minha Conta</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2 flex items-center justify-center">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt="Minha foto" />
                  ) : (
                    <AvatarFallback>EU</AvatarFallback>
                  )}
                </Avatar>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUploadAvatar} />
                <button type="button" onClick={triggerSelectFile} className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-card border border-border shadow flex items-center justify-center text-muted-foreground hover:text-foreground">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="grid gap-3">
              <div className="grid gap-2">
                <label className="text-sm">Nome completo</label>
                <Input value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} placeholder="Seu nome" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm">E-mail</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu.email@mppi.mp.br" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm">Setor</label>
                <Input value={setor} onChange={(e) => setSetor(e.target.value)} placeholder="Setor de lotação" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm">Cargo</label>
                <Input value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder="Cargo" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm">Telefone</label>
                <Input value={telefone} onChange={handlePhoneChange} inputMode="numeric" placeholder="(XX) XXXXX-XXXX" />
              </div>
              <div>
                <Button onClick={handleSaveProfile} disabled={savingProfile} size="xs">
                  {savingProfile ? "Salvando..." : "Salvar dados"}
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <h3 className="text-sm font-medium">Segurança</h3>
              <div className="grid gap-2">
                <Input type="password" placeholder="Nova senha" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                <Input type="password" placeholder="Confirmar nova senha" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
              <div>
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
