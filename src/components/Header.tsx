import React, { memo, useEffect, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, User, Sun, Moon, LogOut } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "@/components/theme-provider";

function HeaderBase() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [initials, setInitials] = useState<string>("?");
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [roleDisplayName, setRoleDisplayName] = useState<string | null>(null);
  const [hasUnread, setHasUnread] = useState(false);
  const [notificacoes, setNotificacoes] = useState<any[]>([]);
  const [lidasIds, setLidasIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let mounted = true;
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
      // Prefer profiles.avatar_url when available
      const { data: profile } = await (supabase as any)
        .from("profiles")
        .select("avatar_url, nome_completo, email")
        .eq("id", user.id)
        .single();
      const url = (profile?.avatar_url as string) || (meta.avatar_url as string) || null;
      setAvatarUrl(url);
      setUserName(profile?.nome_completo || meta.nome_completo || user.email);
      setUserEmail(profile?.email || user.email);

      // Fetch user roles
      const { data: roleData } = await (supabase as any)
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      
      if (roleData && roleData.length > 0) {
        const roles = roleData.map((r: any) => r.role);
        const roleNames: Record<string, string> = {
          'administrador': 'Administrador',
          'gestor': 'Gestor',
          'setor_requisitante': 'Unidade Demandante',
          'consulta': 'Perfil de Consulta'
        };
        const displayName = roles.map((r: string) => roleNames[r] || r).join(", ");
        setRoleDisplayName(displayName);
      }

      // Fetch Notifications System
      const { data: notifs } = await (supabase as any)
        .from("notificacoes")
        .select("*")
        .eq("ativa", true)
        .order("data_criacao", { ascending: false })
        .limit(10);

      if (notifs) {
        setNotificacoes(notifs);

        const { data: lidas } = await (supabase as any)
          .from("notificacoes_lidas")
          .select("notificacao_id")
          .eq("usuario_id", user.id);

        const readSet = new Set<string>((lidas || []).map((l: any) => l.notificacao_id));
        setLidasIds(readSet);

        const anyUnread = notifs.some((n: any) => !readSet.has(n.id));
        setHasUnread(anyUnread);
      }
    };
    load();

    const onAvatarUpdate = (e: Event) => {
      const url = (e as CustomEvent).detail as string | null;
      setAvatarUrl(url);
    };
    window.addEventListener("app-avatar-update" as any, onAvatarUpdate as any);

    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
      window.removeEventListener("app-avatar-update" as any, onAvatarUpdate as any);
    };
  }, []);

  const handleMarcarLidas = async () => {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    if (!user) return;

    const unreadIds = notificacoes.filter(n => !lidasIds.has(n.id)).map(n => n.id);
    if (unreadIds.length === 0) return;

    try {
      const inserts = unreadIds.map(id => ({ notificacao_id: id, usuario_id: user.id }));
      await (supabase as any).from("notificacoes_lidas").insert(inserts);

      const newReadSet = new Set(lidasIds);
      unreadIds.forEach(id => newReadSet.add(id));
      setLidasIds(newReadSet);
      setHasUnread(false);
    } catch (e) {
      console.error("Erro ao registrar notificações lidas:", e);
    }
  };

  const handleLogout = async () => {
    console.log("[Header] Solicitando logout...");
    
    const forceRedirect = () => {
      localStorage.clear();
      sessionStorage.clear();
      // Usar href para forçar recarregamento completo da aplicação
      window.location.href = "/auth";
    };

    try {
      // Timeout de 1s para o signOut para evitar que o sistema trave caso o Supabase demore a responder
      await Promise.race([
        supabase.auth.signOut(),
        new Promise(resolve => setTimeout(resolve, 1000))
      ]);
    } catch (e) {
      console.error("Erro no signOut:", e);
    } finally {
      forceRedirect();
    }
  };

  return (
    <header className="h-16 border-b border-border bg-card flex items-center px-6 justify-between">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold text-foreground">
          Sistema de Gerenciamento PCA MPPI 2026
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5 border rounded-full p-0.5 bg-muted/30 mr-1">
          <Button
            variant="ghost"
            size="icon"
            className={`h-7 w-7 rounded-full ${theme !== "dark" ? "bg-background shadow-sm text-foreground" : "hover:bg-transparent text-muted-foreground"}`}
            onClick={() => setTheme("light")}
            title="Tema Claro"
          >
            <Sun className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-7 w-7 rounded-full ${theme === "dark" ? "bg-background shadow-sm text-foreground" : "hover:bg-transparent text-muted-foreground"}`}
            onClick={() => setTheme("dark")}
            title="Tema Escuro"
          >
            <Moon className="h-3.5 w-3.5" />
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {hasUnread && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 max-h-[85vh] overflow-y-auto">
            <DropdownMenuLabel>Notificações</DropdownMenuLabel>

            {notificacoes.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                Nenhuma notificação no momento.
              </div>
            ) : (
              notificacoes.map((notif: any) => {
                const isUnread = !lidasIds.has(notif.id);
                const dt = new Date(notif.data_criacao).toLocaleString("pt-BR", {
                  day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit"
                });

                return (
                  <React.Fragment key={notif.id}>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-default focus:bg-transparent">
                      <div className="flex w-full justify-between items-start gap-2">
                        <span className={`font-semibold text-sm ${isUnread ? "text-foreground" : "text-muted-foreground"}`}>
                          {notif.titulo}
                        </span>
                        {isUnread && <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5"></span>}
                      </div>
                      <span className={`text-xs ${isUnread ? "text-muted-foreground" : "text-muted-foreground/60"}`}>
                        {notif.mensagem}
                      </span>
                      <span className="text-[10px] text-muted-foreground mt-1">{dt}</span>
                    </DropdownMenuItem>
                  </React.Fragment>
                );
              })
            )}

            {hasUnread && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="w-full justify-center text-xs font-medium cursor-pointer text-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    handleMarcarLidas();
                  }}
                >
                  Marcar todas como lidas
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full p-0 h-10 w-10">
              <Avatar className="h-8 w-8">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt="Foto de perfil" />
                ) : (
                  <AvatarFallback className="text-xs">
                    {initials || <User className="h-4 w-4" />}
                  </AvatarFallback>
                )}
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-0">
            <div className="flex flex-col p-3">
              <span className="text-sm font-semibold truncate leading-none">{userName}</span>
              <span className="text-xs text-muted-foreground truncate mt-1">{userEmail}</span>
              {roleDisplayName && (
                <span className="text-[10px] uppercase tracking-wider font-bold text-primary mt-1.5">
                  {roleDisplayName}
                </span>
              )}
            </div>
            <DropdownMenuSeparator className="m-0" />
            <div className="grid grid-cols-2 p-1 gap-1">
              <DropdownMenuItem 
                onClick={() => navigate("/minha-conta")} 
                className="cursor-pointer flex items-center justify-center gap-1.5 py-2 text-xs font-medium border"
              >
                <User className="h-3.5 w-3.5 text-primary" />
                Minha Conta
              </DropdownMenuItem>
              <DropdownMenuItem 
                onSelect={handleLogout} 
                className="cursor-pointer flex items-center justify-center gap-1.5 py-2 text-xs font-medium border text-destructive focus:text-destructive focus:bg-destructive/5"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sair
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export const Header = memo(HeaderBase);
