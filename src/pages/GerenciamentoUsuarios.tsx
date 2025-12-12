import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { PerfilAcesso } from "@/lib/auth";
import { Shield, UserCog, ClipboardList, Eye } from "lucide-react";

async function invokeWithTimeout<T = any>(fn: string, body: any, ms = 12000): Promise<{ data: T | null; error: any }> {
  let timeoutId: any;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("Tempo de resposta excedido")), ms);
  });
  try {
    const res = await Promise.race([
      (supabase as any).functions.invoke(fn, { body }),
      timeout,
    ]) as { data: T | null; error: any };
    clearTimeout(timeoutId);
    return res;
  } catch (e: any) {
    clearTimeout(timeoutId);
    return { data: null, error: e } as any;
  }
}

type Profile = {
  id: string;
  nome_completo: string | null;
  email: string | null;
  setor: string | null;
  cargo: string | null;
};

type UserWithRoles = Profile & { roles: PerfilAcesso[] };

const GerenciamentoUsuarios = () => {
  const [usuarios, setUsuarios] = useState<UserWithRoles[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<PerfilAcesso | "todos">("todos");
  const [editing, setEditing] = useState<UserWithRoles | null>(null);
  const [roleSel, setRoleSel] = useState<PerfilAcesso | undefined>(undefined);
  const [showAdminWarning, setShowAdminWarning] = useState(false);
  const [pendingRole, setPendingRole] = useState<PerfilAcesso | null>(null);
  const [showAdminRemoveWarning, setShowAdminRemoveWarning] = useState(false);
  const [pendingRemoveRole, setPendingRemoveRole] = useState<PerfilAcesso | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  // Cadastro de novo usuário
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newNome, setNewNome] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newSetor, setNewSetor] = useState("");
  const [newCargo, setNewCargo] = useState("");
  const [newRole, setNewRole] = useState<PerfilAcesso | undefined>(undefined);
  const [newProvisionalPassword, setNewProvisionalPassword] = useState("");
  // Exclusão de usuário
  const [deleteTarget, setDeleteTarget] = useState<UserWithRoles | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isAdmin] = useState(false);

  async function loadUsers() {
    try {
      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;
      const { data: profiles, error, count } = (supabase as any)
        .from("profiles")
        .select("id, nome_completo, email, setor, cargo", { count: "exact" })
        .order("nome_completo", { ascending: true })
        .range(start, end);
      if (error) throw error;

      const ids = (profiles || []).map((p: any) => p.id);
      const { data: rolesData } = (supabase as any)
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", ids);
      const rolesMap = new Map<string, PerfilAcesso[]>();
      (rolesData || []).forEach((r: any) => {
        rolesMap.set(r.user_id, [...(rolesMap.get(r.user_id) || []), r.role]);
      });

      const merged: UserWithRoles[] = (profiles || []).map((p: any) => ({
        id: p.id,
        nome_completo: p.nome_completo,
        email: p.email,
        setor: p.setor,
        cargo: p.cargo,
        roles: rolesMap.get(p.id) || [],
      }));
      setUsuarios(merged);
      setTotalUsers(count || merged.length);
    } catch (e: any) {
      console.error(e);
      toast.error("Erro ao carregar usuários", { description: e.message });
    }
  }

  useEffect(() => {
    loadUsers();
    // Captura usuário atual para controles de demissão própria
    supabase.auth.getSession().then(({ data }) => {
      setCurrentUserId(data.session?.user?.id || null);
    });
  }, [page, pageSize]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return usuarios.filter((u) => {
      const textMatch = [u.nome_completo || "", u.email || "", u.setor || "", u.cargo || ""].some((f) =>
        f.toLowerCase().includes(q),
      );
      const roleMatch = roleFilter === "todos" ? true : u.roles.includes(roleFilter as PerfilAcesso);
      return textMatch && roleMatch;
    });
  }, [usuarios, search, roleFilter]);

  async function saveRole() {
    if (!editing || !roleSel) return;

    // Check if assigning admin role
    if (roleSel === "administrador") {
      setPendingRole(roleSel);
      setShowAdminWarning(true);
      return;
    }

    await performRoleSave(roleSel);
  }

  async function performRoleSave(role: PerfilAcesso) {
    if (!editing) return;
    
    try {
      const exists = editing.roles.includes(role);
      if (exists) {
        toast.message("Perfil já atribuído");
        return;
      }

      const { error } = (supabase as any)
        .from("user_roles")
        .insert({ user_id: editing.id, role });
      
      if (error) throw error;

      // Log the role assignment
      await (supabase as any).from("contratacoes_historico").insert({
        user_id: editing.id,
        contratacao_id: editing.id,
        acao: "role_assigned",
        dados_novos: { role, assigned_at: new Date().toISOString() },
      });

      toast.success("Perfil atribuído com sucesso");
      setEditing(null);
      setRoleSel(undefined);
      setShowAdminWarning(false);
      setPendingRole(null);
      loadUsers();
    } catch (e: any) {
      console.error(e);
      toast.error("Falha ao salvar perfil", { description: e.message });
    }
  }

  async function performRoleRemove(role: PerfilAcesso) {
    if (!editing) return;
    try {
      const { error } = (supabase as any)
        .from("user_roles")
        .delete()
        .eq("user_id", editing.id)
        .eq("role", role);
      if (error) throw error;

      // Log de remoção de perfil
      await (supabase as any).from("contratacoes_historico").insert({
        user_id: editing.id,
        contratacao_id: editing.id,
        acao: "role_removed",
        dados_novos: { role, removed_at: new Date().toISOString() },
      });

      toast.success("Perfil removido com sucesso");
      // Atualiza usuário em edição após remoção
      setEditing(null);
      setRoleSel(undefined);
      setShowAdminRemoveWarning(false);
      setPendingRemoveRole(null);
      loadUsers();
    } catch (e: any) {
      console.error(e);
      toast.error("Falha ao remover perfil", { description: e.message });
    }
  }

  function handleRemoveRole(role: PerfilAcesso) {
    if (!editing) return;
    // Proteção extra para remoção de administrador
    if (role === "administrador") {
      setPendingRemoveRole(role);
      setShowAdminRemoveWarning(true);
      return;
    }
    void performRoleRemove(role);
  }

  function handleAdminConfirm() {
    if (pendingRole) {
      performRoleSave(pendingRole);
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Gerenciamento de Usuários</h1>
            <p className="text-sm text-muted-foreground">Listagem, edição e perfis de acesso.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Usuários</CardTitle>
            <div className="flex items-center gap-2">
              <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogTrigger asChild>
                  <Button onClick={() => setShowCreate(true)}>Cadastrar usuário</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Novo usuário</DialogTitle>
                    <DialogDescription>
                      Informe nome, e-mail, setor, cargo e perfil de acesso. Opcionalmente, defina uma senha provisória (mínimo 8 caracteres); o usuário deverá alterá-la no primeiro login.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-muted-foreground">Nome completo</label>
                      <Input value={newNome} onChange={(e) => setNewNome(e.target.value)} placeholder="Ex.: Maria Silva" />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">E-mail</label>
                      <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="usuario@mppi.mp.br" />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Setor</label>
                      <Input value={newSetor} onChange={(e) => setNewSetor(e.target.value)} placeholder="Ex.: TI" />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Cargo</label>
                      <Input value={newCargo} onChange={(e) => setNewCargo(e.target.value)} placeholder="Ex.: Analista" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm text-muted-foreground">Perfil de acesso</label>
                      <Select value={newRole} onValueChange={(v) => setNewRole(v as PerfilAcesso)}>
                        <SelectTrigger className="mt-1 h-9">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="administrador">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-destructive" />
                              Administrador
                            </div>
                          </SelectItem>
                          <SelectItem value="gestor">
                            <div className="flex items-center gap-2">
                              <UserCog className="h-4 w-4 text-warning" />
                              Gestor
                            </div>
                          </SelectItem>
                          <SelectItem value="setor_requisitante">
                            <div className="flex items-center gap-2">
                              <ClipboardList className="h-4 w-4 text-info" />
                              Setor requisitante
                            </div>
                          </SelectItem>
                          <SelectItem value="consulta">
                            <div className="flex items-center gap-2">
                              <Eye className="h-4 w-4 text-muted-foreground" />
                              Consulta
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm text-muted-foreground">Senha provisória (opcional)</label>
                      <Input
                        type="password"
                        value={newProvisionalPassword}
                        onChange={(e) => setNewProvisionalPassword(e.target.value)}
                        placeholder="Mínimo 8 caracteres"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={async () => {
                        if (!newEmail || !newNome || !newRole) {
                          toast.error("Preencha nome, e-mail e perfil de acesso.");
                          return;
                        }
                        setCreating(true);
                        try {
                          if (newProvisionalPassword && newProvisionalPassword.length < 8) {
                            toast.error("A senha provisória deve ter pelo menos 8 caracteres.");
                            setCreating(false);
                            return;
                          }
                          const { data, error } = await invokeWithTimeout("admin-create-user", {
                            email: newEmail,
                            nome_completo: newNome,
                            setor: newSetor,
                            cargo: newCargo,
                            role: newRole,
                            provisional_password: newProvisionalPassword || undefined,
                          }, 15000);
                          if (error) throw error;
                          toast.success("Usuário cadastrado e convidado com sucesso.");
                          setShowCreate(false);
                          setNewEmail("");
                          setNewNome("");
                          setNewSetor("");
                          setNewCargo("");
                          setNewRole(undefined);
                          setNewProvisionalPassword("");
                          loadUsers();
                        } catch (e: any) {
                          console.error(e);
                          const msg = e?.message || String(e);
                          const hint = msg.includes("Tempo de resposta excedido")
                            ? "Verifique se a Function 'admin-create-user' está publicada e acessível."
                            : undefined;
                          toast.error("Falha ao cadastrar usuário", { description: hint ? `${msg} — ${hint}` : msg });
                        } finally {
                          setCreating(false);
                        }
                      }}
                      disabled={creating}
                    >
                      {creating ? "Cadastrando..." : "Cadastrar"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 items-center">
              <Input
                placeholder="Buscar por nome, e-mail, setor"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="min-w-[240px]"
              />
              <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as PerfilAcesso | "todos")}
              >
                <SelectTrigger className="w-[220px] h-9">
                  <SelectValue placeholder="Filtrar por perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os perfis</SelectItem>
                  <SelectItem value="administrador">Administrador</SelectItem>
                  <SelectItem value="gestor">Gestor</SelectItem>
                  <SelectItem value="setor_requisitante">Setor requisitante</SelectItem>
                  <SelectItem value="consulta">Consulta</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="xs" onClick={loadUsers}>Atualizar</Button>
              
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Setor</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Perfis</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.nome_completo || "—"}</TableCell>
                    <TableCell>{u.email || "—"}</TableCell>
                    <TableCell>{u.setor || "—"}</TableCell>
                    <TableCell>{u.cargo || "—"}</TableCell>
                    <TableCell>{u.roles.length ? u.roles.join(", ") : "—"}</TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="xs" variant="outline" onClick={() => { setEditing(u); setRoleSel(undefined); }}>Editar</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar Perfis</DialogTitle>
                            <DialogDescription>
                              Gerencie os perfis de acesso do usuário. Tenha cuidado ao atribuir perfil de administrador.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-3">
                            <div>
                              <div className="text-sm text-muted-foreground">Perfis atuais</div>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {(editing?.roles || []).length === 0 && (
                                  <span className="text-sm">—</span>
                                )}
                                {(editing?.roles || []).map((role) => {
                                  const isSelfAdminRemoval =
                                    role === "administrador" && editing?.id && currentUserId === editing.id;
                                  return (
                                    <div key={role} className="flex items-center gap-2">
                                      <span className="text-sm px-2 py-0.5 rounded bg-muted text-muted-foreground">
                                        {role}
                                      </span>
                                      <Button
                                        size="xs"
                                        variant="outline"
                                        className={role === "administrador" ? "border-destructive text-destructive" : ""}
                                        onClick={() => handleRemoveRole(role)}
                                        disabled={isSelfAdminRemoval}
                                        title={isSelfAdminRemoval ? "Você não pode remover seu próprio perfil de administrador" : "Remover perfil"}
                                      >
                                        Remover
                                      </Button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            <div>
                              <label className="text-sm text-muted-foreground">Adicionar perfil</label>
                              <Select value={roleSel} onValueChange={(v) => setRoleSel(v as PerfilAcesso)}>
                                <SelectTrigger className="mt-1 h-9">
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="administrador">
                                    <div className="flex items-center gap-2">
                                      <Shield className="h-4 w-4 text-destructive" />
                                      Administrador
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="gestor">Gestor</SelectItem>
                                  <SelectItem value="setor_requisitante">Setor requisitante</SelectItem>
                                  <SelectItem value="consulta">Consulta</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button size="xs" onClick={saveRole} disabled={!roleSel}>Salvar</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button
                        size="xs"
                        variant="destructive"
                        className="ml-2"
                        onClick={() => { setDeleteTarget(u); setShowDelete(true); }}
                        disabled={u.id === currentUserId}
                        title={u.id === currentUserId ? "Você não pode excluir seu próprio usuário" : "Excluir usuário"}
                      >
                        Excluir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                {filtered.length} de {totalUsers} usuários
              </div>
              <div className="flex items-center gap-2">
                <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                  <SelectTrigger className="w-[140px] h-9">
                    <SelectValue placeholder="Itens por página" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 por página</SelectItem>
                    <SelectItem value="20">20 por página</SelectItem>
                    <SelectItem value="50">50 por página</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  <div className="text-sm">Página {page}</div>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page * pageSize >= totalUsers}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Confirmação de exclusão de usuário */}
        <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação é permanente e removerá o usuário selecionado, incluindo seus perfis e dados relacionados. Tem certeza que deseja continuar?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={async () => {
                  if (!deleteTarget) return;
                  setDeleting(true);
                  try {
                    const { error } = await supabase.functions.invoke("admin-delete-user", {
                      body: { user_id: deleteTarget.id },
                    });
                    if (error) throw error;
                    toast.success("Usuário excluído com sucesso.");
                    setShowDelete(false);
                    setDeleteTarget(null);
                    loadUsers();
                  } catch (e: any) {
                    console.error(e);
                    toast.error("Falha ao excluir usuário", { description: e.message || e.toString() });
                  } finally {
                    setDeleting(false);
                  }
                }}
                disabled={deleting}
              >
                {deleting ? "Excluindo..." : "Confirmar exclusão"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showAdminWarning} onOpenChange={setShowAdminWarning}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-destructive" />
                Confirmar Atribuição de Administrador
              </AlertDialogTitle>
              <AlertDialogDescription>
                Você está prestes a conceder privilégios de administrador para este usuário. 
                Administradores têm acesso total ao sistema, incluindo gerenciamento de usuários e configurações críticas.
                <br /><br />
                <strong>Tem certeza que deseja continuar?</strong>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleAdminConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showAdminRemoveWarning} onOpenChange={setShowAdminRemoveWarning}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-destructive" />
                Confirmar Remoção de Administrador
              </AlertDialogTitle>
              <AlertDialogDescription>
                Você está prestes a remover privilégios de administrador deste usuário.
                Isso pode restringir acesso a funcionalidades críticas, inclusive o próprio gerenciamento de usuários.
                <br /><br />
                <strong>Tem certeza que deseja continuar?</strong>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (pendingRemoveRole) {
                    void performRoleRemove(pendingRemoveRole);
                  }
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default GerenciamentoUsuarios;
