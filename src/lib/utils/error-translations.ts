export const translateError = (message: string): string => {
  if (!message) return "Erro desconhecido";

  const translations: Record<string, string> = {
    "Invalid login credentials": "Credenciais de login inválidas",
    "Email not confirmed": "E-mail não confirmado",
    "User already registered": "Usuário já cadastrado",
    "New password should be different from the old password": "A nova senha deve ser diferente da senha atual.",
    "Password should be at least 6 characters": "A senha deve ter pelo menos 6 caracteres",
    "Identity is already linked": "Esta conta já está vinculada",
    "User not found": "Usuário não encontrado",
    "Signup is disabled": "O cadastro de usuários está desativado",
    "Invalid email": "E-mail inválido",
    "Rate limit exceeded": "Limite de tentativas excedido. Tente novamente mais tarde.",
    "Database error": "Erro de banco de dados",
    "permission denied": "Acesso negado",
    "row level security policy": "Violação de política de segurança (RLS)",
    "Failed to fetch": "Falha na conexão com o servidor",
    "Auth session missing!": "Sessão de autenticação ausente!",
    "JWT expired": "Sessão expirada. Por favor, faça login novamente.",
    "invalid claim": "Reivindicação inválida na sessão",
    "Request failed with status code 403": "Acesso negado (403)",
    "Request failed with status code 401": "Não autorizado (401)",
    "duplicate key value violates unique constraint": "Já existe um registro com estes dados",
    "violates foreign key constraint": "Este registro não pode ser removido pois está sendo usado em outro lugar",
    "Saldo orçamentário insuficiente": "Saldo orçamentário insuficiente na UO selecionada",
  };

  // Match partial messages too
  for (const [key, value] of Object.entries(translations)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  return message;
};
