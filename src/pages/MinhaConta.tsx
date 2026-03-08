import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const avatarOptions = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Matthew&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aidan&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Adrian&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Brian&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Caleb&clothing=blazerAndShirt&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Christian&clothing=blazerAndSweater&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=David&clothing=collarAndSweater&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Dylan&clothing=blazerAndShirt&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Ethan&clothing=blazerAndSweater&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Gabriel&clothing=blazerAndShirt&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Henry&clothing=blazerAndSweater&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Isaac&clothing=collarAndSweater&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Julian&clothing=blazerAndShirt&backgroundColor=e2e8f0",

  "https://api.dicebear.com/7.x/avataaars/svg?seed=Leo&clothing=blazerAndShirt&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Arthur&clothing=blazerAndShirt&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Oscar&clothing=blazerAndSweater&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Benjamin&clothing=blazerAndSweater&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Dustin&clothing=collarAndSweater&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=George&clothing=blazerAndShirt&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper&clothing=blazerAndSweater&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Luis&clothing=collarAndSweater&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus&clothing=blazerAndShirt&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Simon&clothing=blazerAndSweater&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Victor&clothing=collarAndSweater&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=William&clothing=blazerAndShirt&backgroundColor=e2e8f0",

  "https://api.dicebear.com/7.x/avataaars/svg?seed=Frank&clothing=blazerAndSweater&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Charles&clothing=collarAndSweater&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas&clothing=blazerAndShirt&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Daniel&clothing=blazerAndShirt&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas&clothing=blazerAndSweater&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Edward&clothing=blazerAndSweater&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Martin&clothing=collarAndSweater&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Mason&clothing=blazerAndShirt&backgroundColor=e2e8f0",
];

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
  const [openAvatarDialog, setOpenAvatarDialog] = useState(false);
  const [updatingAvatar, setUpdatingAvatar] = useState(false);

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
      try { localStorage.setItem("app_avatar_url", publicUrl); } catch { }
      try { window.dispatchEvent(new CustomEvent("app-avatar-update", { detail: publicUrl })); } catch { }
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

  const handleSelectPredefinedAvatar = async (url: string) => {
    try {
      setUpdatingAvatar(true);

      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        toast.error("Usuário não identificado ou sessão expirada.");
        return;
      }

      const { error: authErr } = await supabase.auth.updateUser({ data: { avatar_url: url } });
      if (authErr) throw authErr;

      const { error: profErr } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
      if (profErr) throw profErr;

      setAvatarUrl(url);
      try { localStorage.setItem("app_avatar_url", url); } catch { }
      try { window.dispatchEvent(new CustomEvent("app-avatar-update", { detail: url })); } catch { }

      setOpenAvatarDialog(false);
      setTimeout(() => {
        toast.success("Avatar selecionado com sucesso!");
      }, 300);

    } catch (e: any) {
      console.error(e);
      toast.error("Falha ao atualizar o avatar", { description: e.message || "Tente enviar sua foto manualmente." });
    } finally {
      setUpdatingAvatar(false);
    }
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
            <div className="md:col-span-2 flex flex-col items-center justify-center gap-4">
              <div className="relative group">
                <Avatar className="h-24 w-24">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt="Minha foto" onError={() => setAvatarUrl(null)} />
                  ) : (
                    <AvatarFallback>EU</AvatarFallback>
                  )}
                </Avatar>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUploadAvatar} />
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-sm bg-card border-border text-muted-foreground hover:text-foreground"
                  onClick={() => setOpenAvatarDialog(true)}
                  title="Alterar Avatar"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>

              <Dialog open={openAvatarDialog} onOpenChange={setOpenAvatarDialog}>
                <DialogContent className="sm:max-w-[480px]">
                  <DialogHeader>
                    <DialogTitle>Mudar Foto de Perfil</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-6 gap-3 py-4 place-items-center">
                    {avatarOptions.map((url, idx) => (
                      <button
                        type="button"
                        key={idx}
                        disabled={updatingAvatar}
                        className={`cursor-pointer rounded-full p-1 transition-all ${updatingAvatar ? 'opacity-50 pointer-events-none' : 'hover:ring-2 hover:ring-ring hover:ring-offset-2 hover:ring-offset-background'}`}
                        onClick={() => handleSelectPredefinedAvatar(url)}
                      >
                        <div className="h-12 w-12 rounded-full overflow-hidden bg-muted">
                          <img src={url} alt={`Avatar ${idx}`} className="h-full w-full object-contain" />
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-border">
                    <p className="text-xs font-medium text-center text-muted-foreground">Ou envie a sua própria foto</p>
                    <Button
                      variant="outline"
                      className="w-full text-xs h-9"
                      onClick={() => {
                        setOpenAvatarDialog(false);
                        triggerSelectFile();
                      }}
                    >
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Fazer Upload
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
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
