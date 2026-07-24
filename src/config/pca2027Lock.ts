// -----------------------------------------------------------------------------
// TRAVA PROVISÓRIA — Acesso ao módulo PCA 2027
// -----------------------------------------------------------------------------
// Enquanto o prazo oficial para apresentação de demandas não iniciar, o módulo
// PCA 2027 fica indisponível para usuários requisitantes / consulta.
// Administradores e gestores continuam com acesso normal.
//
// COMO REVERTER A TRAVA (após 27/07/2026, ou a qualquer momento):
//   • Basta alterar PCA_2027_LOCK_ENABLED para `false` OU
//   • Ajustar PCA_2027_UNLOCK_AT para uma data já passada.
// Nenhuma outra alteração é necessária em outro ponto do sistema.
// -----------------------------------------------------------------------------

import type { PerfilAcesso } from "@/lib/auth";

/** Liga/desliga a trava manualmente. Definir como `false` libera o acesso. */
export const PCA_2027_LOCK_ENABLED = true;

/** Data/hora (horário local) em que o módulo passa a ficar disponível. */
export const PCA_2027_UNLOCK_AT = new Date("2026-07-27T00:00:00");

/** Formato amigável exibido nas mensagens ao usuário. */
export const PCA_2027_UNLOCK_LABEL = "27 de julho de 2026";

/**
 * Retorna `true` quando o usuário deve ser bloqueado do módulo PCA 2027.
 * Administradores e gestores nunca são bloqueados (para permitir configuração
 * e testes antes da liberação oficial).
 */
export function isPca2027LockedForRoles(roles: PerfilAcesso[] | undefined): boolean {
  if (!PCA_2027_LOCK_ENABLED) return false;
  if (Date.now() >= PCA_2027_UNLOCK_AT.getTime()) return false;
  const bypass = roles?.some((r) => r === "administrador" || r === "gestor");
  return !bypass;
}
