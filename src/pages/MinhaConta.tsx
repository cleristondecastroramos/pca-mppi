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
  const [ramal, setRamal] = useState("");
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
          .select("id, nome_completo, email, setor, cargo, ramal, avatar_url")
          .eq("id", user.id)
          .maybeSingle();
        if (!error && profile) {
          setNomeCompleto(profile.nome_completo || "");
          setEmail(profile.email || user.email || "");
          setSetor(profile.setor || "");
          setCargo(profile.cargo || "");
          setRamal(profile.ramal || "");
          const metaUrl = (user.user_metadata as any)?.avatar_url as string | undefined;
          const localUrl = typeof window !== "undefined" ? localStorage.getItem("app_avatar_url") : null;
          setAvatarUrl(profile.avatar_url || metaUrl || localUrl || null);
        } else {
          setEmail(user.email || "");
        }
      }
    };
    load();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "app_avatar_url") setAvatarUrl(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    const onAvatarUpdate = (e: Event) => {
      const url = (e as CustomEvent).detail as string | null;
      setAvatarUrl(url);
    };
    window.addEventListener("app-avatar-update" as any, onAvatarUpdate as any);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("app-avatar-update" as any, onAvatarUpdate as any);
    };
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

  

  const formatRamal = (v: string) => {
    return v.replace(/\D/g, "").slice(0, 4);
  };

  const handleRamalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRamal(formatRamal(e.target.value));
  };

  const handleSaveProfile = async () => {
    if (!userId) return;
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ nome_completo: nomeCompleto, setor, cargo, ramal, email })
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
          <CardContent className="grid gap-6 md:grid-cols-2 items-stretch">
            <div className="md:col-span-2 flex items-center justify-center">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt="Minha foto" onError={() => setAvatarUrl(null)} />
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
            <Card className="h-full">
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-sm">Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-1 grid gap-2">
                <div className="grid gap-2">
                  <label className="text-sm">Nome completo</label>
                  <Input value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} placeholder="Seu nome" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm">E-mail</label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu.email@mppi.mp.br" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-2">
                    <label className="text-sm">Setor</label>
                    <Input value={setor} onChange={(e) => setSetor(e.target.value)} placeholder="Setor de lotação" />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm">Ramal</label>
                    <Input value={ramal} onChange={handleRamalChange} inputMode="numeric" placeholder="XXXX" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm">Cargo/Função</label>
                  <Input value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder="Cargo/Função" />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={savingProfile} size="xs">
                    {savingProfile ? "Salvando..." : "Salvar dados"}
                  </Button>
                </div>
              </CardContent>
            </Card>
            <div className="grid gap-2">
              <Card className="border border-border">
                <CardHeader className="p-3 pb-1">
                  <CardTitle className="text-sm">Segurança</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-1 grid gap-2">
                  <p className="text-xs text-muted-foreground">Sua senha deve ter no mínimo 8 caracteres.</p>
                  <div className="grid gap-2">
                    <Input type="password" placeholder="Nova senha" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="h-8 text-sm" />
                    <Input type="password" placeholder="Confirmar nova senha" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleChangePassword} disabled={loading} size="xs">
                      {loading ? "Salvando..." : "Salvar senha"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default MinhaConta;
