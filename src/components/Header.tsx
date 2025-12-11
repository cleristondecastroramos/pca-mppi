import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export function Header() {
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [initials, setInitials] = useState<string>("?");

  useEffect(() => {
    let mounted = true;
    const local = typeof window !== "undefined" ? localStorage.getItem("app_avatar_url") : null;
    if (local) setAvatarUrl(local);
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!mounted || !user) return;
      const meta = user.user_metadata || {};
      const nome: string | undefined = (meta.nome_completo as string) || user.email || "";
      const init = nome
        .split(/[\s@._-]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase())
        .join("") || "?";
      setInitials(init);
      const { data: profile } = await supabase
        .from("profiles")
        .select("avatar_url, nome_completo, email")
        .eq("id", user.id)
        .maybeSingle();
      const url = (profile?.avatar_url as string) || (meta.avatar_url as string) || null;
      setAvatarUrl(url);
      if (url) localStorage.setItem("app_avatar_url", url);
    };
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    let channel: ReturnType<typeof supabase.channel> | null = null;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) return;
      channel = supabase
        .channel("profile-avatar")
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
          (payload: any) => {
            if (!mounted) return;
            const newRow = payload?.new as { avatar_url?: string; nome_completo?: string } | undefined;
            const url = (newRow?.avatar_url as string) || null;
            if (url !== null) setAvatarUrl(url);
            if (url) localStorage.setItem("app_avatar_url", url);
            const nome = newRow?.nome_completo || user.email || "";
            const init = nome
              .split(/[\s@._-]+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((s) => s[0]?.toUpperCase())
              .join("") || "?";
            setInitials(init);
          },
        )
        .subscribe();
    })();
    const onStorage = (e: StorageEvent) => {
      if (!mounted) return;
      if (e.key === "app_avatar_url") setAvatarUrl(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    const onAvatarUpdate = (e: CustomEvent) => {
      if (!mounted) return;
      const url = (e as any).detail as string | null;
      setAvatarUrl(url);
      if (url) try { localStorage.setItem("app_avatar_url", url); } catch {}
    };
    window.addEventListener("app-avatar-update" as any, onAvatarUpdate as any);
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
      if (channel) channel.unsubscribe();
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("app-avatar-update" as any, onAvatarUpdate as any);
    };
  }, []);

  return (
    <header className="h-16 border-b border-border bg-card flex items-center px-6 justify-between">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold text-foreground">
          Sistema de Gerenciamento PCA MPPI 2026
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full p-0 h-10 w-10">
              <Avatar className="h-8 w-8">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt="Foto de perfil" onError={() => setAvatarUrl(null)} />
                ) : (
                  <AvatarFallback className="text-xs">
                    {initials || <User className="h-4 w-4" />}
                  </AvatarFallback>
                )}
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/minha-conta")}>Configurações</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
