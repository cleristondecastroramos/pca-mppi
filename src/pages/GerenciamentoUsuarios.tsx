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
import { Shield, UserCog, ClipboardList, Eye, Info, Pencil, Trash2 } from "lucide-react";

const ROLE_DEFINITIONS = {
  administrador: {
    label: "Administrador",
    description: "Acesso total ao sistema e gestão de usuários.",
    tasks: [
      "Gerenciamento completo de usuários e perfis",
      "Configurações globais do sistema",
      "Aprovação final de planejamentos",
      "Visualização e edição de todas as contratações",
      "Exclusão de registros"
    ],
    icon: Shield,
    color: "text-destructive",
  },
  gestor: {
    label: "Gestor",
    description: "Gestão e consolidação das contratações.",
    tasks: [
      "Visualização de todas as contratações de todos os setores",
      "Edição técnica de contratações",
      "Geração de relatórios gerenciais e dashboards",
      "Validação de demandas dos setores requisitantes"
    ],
    icon: UserCog,
    color: "text-amber-600",
  },
  setor_requisitante: {
    label: "Setor Requisitante",
    description: "Cadastro e acompanhamento de demandas próprias.",
    tasks: [
      "Cadastro de novas contratações (PCA)",
      "Edição de contratações em rascunho do próprio setor",
      "Visualização apenas das demandas do seu setor"
    ],
    icon: ClipboardList,
    color: "text-blue-600",
  },
  consulta: {
    label: "Consulta",
    description: "Acesso somente leitura para transparência.",
    tasks: [
      "Visualização de dados públicos do PCA",
      "Consulta de relatórios básicos",
      "Sem permissão de alteração ou exclusão"
    ],
    icon: Eye,
    color: "text-muted-foreground",
  }
} as const;

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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);

  // Create user
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newNome, setNewNome] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newSetor, setNewSetor] = useState("");
  const [newCargo, setNewCargo] = useState("");
  const [newRole, setNewRole] = useState<PerfilAcesso | undefined>(undefined);
  const [newProvisionalPassword, setNewProvisionalPassword] = useState("");

  // Edit user
  const [editTarget, setEditTarget] = useState<UserWithRoles | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editNome, setEditNome] = useState("");
  const [editSetor, setEditSetor] = useState("");
  const [editCargo, setEditCargo] = useState("");
  const [editRole, setEditRole] = useState<PerfilAcesso | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  // Delete user
  const [deleteTarget, setDeleteTarget] = useState<UserWithRoles | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function loadUsers() {
    try {
      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;
      const { data: profiles, error, count } = await supabase
        .from("profiles")
        .select("id, nome_completo, email, setor, cargo", { count: "exact" })
        .order("nome_completo", { ascending: true })
        .range(start, end);
      if (error) throw error;

      const ids = (profiles || []).map((p) => p.id);
      if (ids.length === 0) {
        setUsuarios([]);
        setTotalUsers(0);
        return;
      }
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", ids);
      const rolesMap = new Map<string, PerfilAcesso[]>();
      (rolesData || []).forEach((r) => {
        rolesMap.set(r.user_id, [...(rolesMap.get(r.user_id) || []), r.role]);
      });

      const merged: UserWithRoles[] = (profiles || []).map((p) => ({
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

  function openEdit(u: UserWithRoles) {
    setEditTarget(u);
    setEditNome(u.nome_completo || "");
    setEditSetor(u.setor || "");
    setEditCargo(u.cargo || "");
    setEditRole(u.roles[0] || undefined);
    setShowEdit(true);
  }

  async function handleEditSave() {
    if (!editTarget) return;
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-update-user", {
        body: {
          user_id: editTarget.id,
          nome_completo: editNome,
          setor: editSetor,
          cargo: editCargo,
          role: editRole,
        },
      });
      if (error) throw error;
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed?.error) throw new Error(parsed.error);
      toast.success("Usuário atualizado com sucesso.");
      setShowEdit(false);
      setEditTarget(null);
      loadUsers();
    } catch (e: any) {
      console.error(e);
      toast.error("Falha ao atualizar usuário", { description: e.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleCreate() {
    if (!newEmail || !newNome || !newRole) {
      toast.error("Preencha nome, e-mail e perfil de acesso.");
      return;
    }
    if (newProvisionalPassword && newProvisionalPassword.length < 8) {
      toast.error("A senha provisória deve ter pelo menos 8 caracteres.");
      return;
    }
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-create-user", {
        body: {
          email: newEmail,
          nome_completo: newNome,
          setor: newSetor,
          cargo: newCargo,
          role: newRole,
          provisional_password: newProvisionalPassword || undefined,
        },
      });
      if (error) throw error;
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed?.error) throw new Error(parsed.error);
      toast.success("Usuário cadastrado com sucesso.");
      setShowCreate(false);
      setNewEmail(""); setNewNome(""); setNewSetor(""); setNewCargo("");
      setNewRole(undefined); setNewProvisionalPassword("");
      loadUsers();
    } catch (e: any) {
      console.error(e);
      toast.error("Falha ao cadastrar usuário", { description: e.message });
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-delete-user", {
        body: { user_id: deleteTarget.id },
      });
      if (error) throw error;
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed?.error) throw new Error(parsed.error);
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
  }

  const roleLabel = (r: PerfilAcesso) => ROLE_DEFINITIONS[r]?.label || r;

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
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Info className="h-4 w-4" />
                    Política de Acessos
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl p-0 overflow-hidden [&>button]:text-white">
                  <DialogHeader className="bg-sidebar p-6">
                    <DialogTitle className="text-white">Política de Acessos e Atribuições</DialogTitle>
                    <DialogDescription className="text-white/80">
                      Entenda as responsabilidades e permissões de cada perfil no sistema.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 p-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[180px]">Perfil</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Principais Atribuições</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(Object.entries(ROLE_DEFINITIONS) as [keyof typeof ROLE_DEFINITIONS, typeof ROLE_DEFINITIONS[keyof typeof ROLE_DEFINITIONS]][]).map(([key, def]) => (
                          <TableRow key={key}>
                            <TableCell className="font-medium align-top">
                              <div className="flex items-center gap-2">
                                <def.icon className={`h-4 w-4 ${def.color}`} />
                                {def.label}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground align-top">{def.description}</TableCell>
                            <TableCell className="align-top">
                              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                {def.tasks.map((task, i) => (
                                  <li key={i}>{task}</li>
                                ))}
                              </ul>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </DialogContent>
              </Dialog>

              <Button onClick={() => setShowCreate(true)}>Cadastrar usuário</Button>
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
              <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as PerfilAcesso | "todos")}>
                <SelectTrigger className="w-[220px] h-9">
                  <SelectValue placeholder="Filtrar por perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os perfis</SelectItem>
                  {(Object.entries(ROLE_DEFINITIONS) as [keyof typeof ROLE_DEFINITIONS, typeof ROLE_DEFINITIONS[keyof typeof ROLE_DEFINITIONS]][]).map(([key, def]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <def.icon className={`h-4 w-4 ${def.color}`} />
                        {def.label}
                      </div>
                    </SelectItem>
                  ))}
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
                  <TableHead>Perfil</TableHead>
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
                    <TableCell>{u.roles.length ? u.roles.map(roleLabel).join(", ") : "—"}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button size="xs" variant="outline" onClick={() => openEdit(u)} title="Editar usuário">
                        <Pencil className="h-3.5 w-3.5 mr-1" /> Editar
                      </Button>
                      <Button
                        size="xs"
                        variant="destructive"
                        onClick={() => { setDeleteTarget(u); setShowDelete(true); }}
                        disabled={u.id === currentUserId}
                        title={u.id === currentUserId ? "Você não pode excluir seu próprio usuário" : "Excluir usuário"}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Excluir
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
                  <Button variant="outline" size="xs" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                    Anterior
                  </Button>
                  <div className="text-sm">Página {page}</div>
                  <Button variant="outline" size="xs" onClick={() => setPage((p) => p + 1)} disabled={page * pageSize >= totalUsers}>
                    Próxima
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create User Dialog */}
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent className="p-0 overflow-hidden [&>button]:text-white">
            <DialogHeader className="bg-sidebar p-6">
              <DialogTitle className="text-white">Novo usuário</DialogTitle>
              <DialogDescription className="text-white/80">
                Informe nome, e-mail, setor, cargo e perfil de acesso.
              </DialogDescription>
            </DialogHeader>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="text-sm text-muted-foreground">Nome completo</label>
                  <Input value={newNome} onChange={(e) => setNewNome(e.target.value)} placeholder="Ex.: Maria Silva" />
                </div>
                <div className="md:col-span-2">
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
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione um perfil" /></SelectTrigger>
                    <SelectContent>
                      {(Object.entries(ROLE_DEFINITIONS) as [keyof typeof ROLE_DEFINITIONS, typeof ROLE_DEFINITIONS[keyof typeof ROLE_DEFINITIONS]][]).map(([key, def]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2"><def.icon className={`h-4 w-4 ${def.color}`} />{def.label}</div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-muted-foreground">Senha provisória (opcional, mín. 8 caracteres)</label>
                  <Input type="password" value={newProvisionalPassword} onChange={(e) => setNewProvisionalPassword(e.target.value)} placeholder="Mínimo 8 caracteres" />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button onClick={handleCreate} disabled={creating}>{creating ? "Cadastrando..." : "Cadastrar"}</Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={showEdit} onOpenChange={setShowEdit}>
          <DialogContent className="p-0 overflow-hidden [&>button]:text-white">
            <DialogHeader className="bg-sidebar p-6">
              <DialogTitle className="text-white">Editar usuário</DialogTitle>
              <DialogDescription className="text-white/80">
                {editTarget?.email || ""}
              </DialogDescription>
            </DialogHeader>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="text-sm text-muted-foreground">Nome completo</label>
                  <Input value={editNome} onChange={(e) => setEditNome(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Setor</label>
                  <Input value={editSetor} onChange={(e) => setEditSetor(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Cargo</label>
                  <Input value={editCargo} onChange={(e) => setEditCargo(e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-muted-foreground">Perfil de acesso</label>
                  <Select value={editRole} onValueChange={(v) => setEditRole(v as PerfilAcesso)}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione um perfil" /></SelectTrigger>
                    <SelectContent>
                      {(Object.entries(ROLE_DEFINITIONS) as [keyof typeof ROLE_DEFINITIONS, typeof ROLE_DEFINITIONS[keyof typeof ROLE_DEFINITIONS]][]).map(([key, def]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2"><def.icon className={`h-4 w-4 ${def.color}`} />{def.label}</div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setShowEdit(false)}>Cancelar</Button>
                <Button onClick={handleEditSave} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete User Dialog */}
        <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação é permanente e removerá <strong>{deleteTarget?.nome_completo || deleteTarget?.email}</strong>, incluindo seus perfis e dados relacionados. Tem certeza?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Excluindo..." : "Confirmar exclusão"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default GerenciamentoUsuarios;
