import { LayoutDashboard, FileText, Plus, Settings, LogOut, BarChart3, Users, CheckSquare, ClipboardList, Gauge, BadgeCheck, Clock, TrendingUp, AlertTriangle } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

const menuItems = [
  { title: "Visão Geral", url: "/visao-geral", icon: Gauge },
  { title: "Contratações", url: "/contratacoes", icon: FileText },
  { title: "Setores Demandantes", url: "/setores-demandantes", icon: ClipboardList },
  { title: "Controle de Prazos", url: "/controle-prazos", icon: Clock },
  { title: "Pontos de Atenção", url: "/prioridades-atencao", icon: AlertTriangle },
  { title: "Prioridades de Contratação", url: "/prioridades-contratacao", icon: BadgeCheck },
  { title: "Avaliação e Conformidade", url: "/avaliacao-conformidade", icon: CheckSquare },
  { title: "Resultados Alcançados", url: "/resultados-alcancados", icon: TrendingUp },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
  { title: "Gerenciamento de Usuários", url: "/gerenciamento-usuarios", icon: Users },
  { title: "Minha Conta", url: "/minha-conta", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut({ scope: "local" });
      if (error) {
        console.error("Erro ao fazer logout:", error);
        toast.error(error.message || "Erro ao sair");
      } else {
        toast.success("Logout realizado com sucesso");
      }
    } catch (err: any) {
      console.error("Falha inesperada no logout:", err);
      toast.error("Falha no logout; sessão será encerrada.");
    } finally {
      setIsLoggingOut(false);
      // Garanta retorno à tela de autenticação mesmo se a requisição for abortada
      navigate("/auth");
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="h-16 flex items-center border-b border-border px-4">
        {!collapsed && (
          <div>
            <h2 className="text-lg font-bold text-sidebar-foreground">PCA 2026</h2>
            <p className="text-[10px] font-bold text-sidebar-foreground/60">MINISTÉRIO PÚBLICO DO ESTADO DO PIAUÍ</p>
          </div>
        )}
        {collapsed && (
          <div className="text-center">
            <span className="text-lg font-bold text-sidebar-foreground">P</span>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[0_0_0_1px_hsl(var(--sidebar-border))]"
                          : "hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border px-4 py-2">
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Sair</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
