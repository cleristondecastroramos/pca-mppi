import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { PerfilAcesso } from "@/lib/auth";

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
  const [editing, setEditing] = useState<UserWithRoles | null>(null);
  const [roleSel, setRoleSel] = useState<PerfilAcesso | undefined>(undefined);

  async function loadUsers() {
    try {
      const { data: profiles, error } = (supabase as any)
        .from("profiles")
        .select("id, nome_completo, email, setor, cargo")
        .order("nome_completo", { ascending: true });
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
    } catch (e: any) {
      console.error(e);
      toast.error("Erro ao carregar usuários", { description: e.message });
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return usuarios.filter((u) =>
      [u.nome_completo || "", u.email || "", u.setor || "", u.cargo || ""].some((f) => f.toLowerCase().includes(q)),
    );
  }, [usuarios, search]);

  async function saveRole() {
    if (!editing || !roleSel) return;
    try {
      const exists = editing.roles.includes(roleSel);
      if (exists) {
        toast.message("Perfil já atribuído");
        return;
      }
      const { error } = (supabase as any)
        .from("user_roles")
        .insert({ user_id: editing.id, role: roleSel });
      if (error) throw error;
      toast.success("Perfil atribuído");
      setEditing(null);
      setRoleSel(undefined);
      loadUsers();
    } catch (e: any) {
      console.error(e);
      toast.error("Falha ao salvar perfil", { description: e.message });
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Gerenciamento de Usuários</h1>
        <p className="text-muted-foreground">Listagem, edição e perfis de acesso.</p>

        <Card>
          <CardHeader>
            <CardTitle>Usuários</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input placeholder="Buscar por nome, e-mail, setor" value={search} onChange={(e) => setSearch(e.target.value)} />
              <Button variant="outline" onClick={loadUsers}>Atualizar</Button>
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
                          <Button size="sm" variant="outline" onClick={() => { setEditing(u); setRoleSel(undefined); }}>Editar</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar Perfis</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-3">
                            <div>
                              <div className="text-sm text-muted-foreground">Perfis atuais</div>
                              <div className="text-sm">{editing?.roles.join(", ") || "—"}</div>
                            </div>
                            <div>
                              <label className="text-sm text-muted-foreground">Adicionar perfil</label>
                              <Select value={roleSel} onValueChange={(v) => setRoleSel(v as PerfilAcesso)}>
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="administrador">Administrador</SelectItem>
                                  <SelectItem value="gestor">Gestor</SelectItem>
                                  <SelectItem value="setor_requisitante">Setor requisitante</SelectItem>
                                  <SelectItem value="consulta">Consulta</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={saveRole} disabled={!roleSel}>Salvar</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default GerenciamentoUsuarios;