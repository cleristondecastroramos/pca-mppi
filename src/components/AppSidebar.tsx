import { LayoutDashboard, FileText, Plus, Settings, LogOut, BarChart3, Users, CheckSquare, ClipboardList, Gauge, BadgeCheck, Clock, TrendingUp, AlertTriangle, HelpCircle, Terminal, BellRing, BookOpen, Gavel, Calculator, ListTodo } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useUserRoles, useAuthSession, type PerfilAcesso } from "@/lib/auth";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { prefetchPage } from "@/lib/prefetch";
import { useQueryClient } from "@tanstack/react-query";

type MenuItem = {
  title: string;
  url: string;
  icon: any;
  allowedRoles: PerfilAcesso[];
};

const menuItems: MenuItem[] = [
  { title: "Visão Geral", url: "/visao-geral", icon: Gauge, allowedRoles: ["administrador", "gestor", "setor_requisitante", "consulta"] },
  { title: "Contratações", url: "/contratacoes", icon: ListTodo, allowedRoles: ["administrador", "gestor", "setor_requisitante", "consulta"] },
  { title: "Licitações SRP", url: "/licitacoes-srp", icon: Gavel, allowedRoles: ["administrador", "gestor", "setor_requisitante", "consulta"] },
  { title: "Setores Demandantes", url: "/setores-demandantes", icon: ClipboardList, allowedRoles: ["administrador", "gestor"] },
  { title: "Controle de Prazos", url: "/controle-prazos", icon: Clock, allowedRoles: ["administrador", "gestor", "setor_requisitante"] },
  { title: "Pontos de Atenção", url: "/pontos-atencao", icon: AlertTriangle, allowedRoles: ["administrador", "gestor", "setor_requisitante"] },
  { title: "Prioridades de Contratação", url: "/prioridades-contratacao", icon: BadgeCheck, allowedRoles: ["administrador", "gestor", "setor_requisitante"] },
  { title: "Avaliação e Conformidade", url: "/avaliacao-conformidade", icon: CheckSquare, allowedRoles: ["administrador", "gestor"] },
  { title: "Resultados Alcançados", url: "/resultados-alcancados", icon: TrendingUp, allowedRoles: ["administrador", "gestor"] },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3, allowedRoles: ["administrador", "gestor"] },
  { title: "Orçamento Planejado", url: "/orcamento-planejado", icon: Calculator, allowedRoles: ["administrador"] },
  { title: "Gerenciamento de Usuários", url: "/gerenciamento-usuarios", icon: Users, allowedRoles: ["administrador"] },
  { title: "Notificações", url: "/notificacoes", icon: BellRing, allowedRoles: ["administrador"] },

  { title: "Tutorial", url: "/tutorial", icon: BookOpen, allowedRoles: ["administrador", "gestor", "setor_requisitante", "consulta"] },
  { title: "FAQ / Dúvidas", url: "/faq", icon: HelpCircle, allowedRoles: ["administrador", "gestor", "setor_requisitante", "consulta"] },
  { title: "Minha Conta", url: "/minha-conta", icon: Settings, allowedRoles: ["administrador", "gestor", "setor_requisitante", "consulta"] },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { data: session } = useAuthSession();
  const { data: roles } = useUserRoles(session?.user?.id);

  const visibleItems = menuItems.filter((item) => {
    if (!roles || roles.length === 0) return false;
    return item.allowedRoles.some((r) => roles.includes(r));
  });

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    const forceRedirect = () => {
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace("/auth");
    };

    try {
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 2000));

      await Promise.race([signOutPromise, timeoutPromise]);

      queryClient.clear();
      toast.success("Logout realizado com sucesso");
    } catch (err: any) {
      console.error("Erro no logout:", err);
    } finally {
      forceRedirect();
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
            <span className="text-lg font-bold text-sidebar-foreground">PCA</span>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink
                        to={item.url}
                        className={({ isActive }) =>
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[0_0_0_1px_hsl(var(--sidebar-border))]"
                            : "hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                        }
                        onMouseEnter={() => prefetchPage(item.url)}
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

      {!collapsed && (
        <div className="flex flex-col px-4 pb-1 transition-opacity">
          <span className="text-[11px] font-mono text-sidebar-foreground/80">
            v2.3.0
          </span>
        </div>
      )}
      <SidebarFooter className="border-t border-sidebar-border px-4 py-2">
        <Tooltip>
          <TooltipTrigger asChild>
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
          </TooltipTrigger>
          <TooltipContent side="right" hidden={!collapsed}>
            Sair
          </TooltipContent>
        </Tooltip>
      </SidebarFooter>
    </Sidebar>
  );
}
