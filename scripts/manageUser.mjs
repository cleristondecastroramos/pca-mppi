import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

function usage() {
  console.log('Usage:')
  console.log('  node scripts/manageUser.mjs --check <email>')
  console.log('  node scripts/manageUser.mjs --create-admin <email> <password>')
}

const args = process.argv.slice(2)
if (args.length < 2) {
  usage()
  process.exit(1)
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing env: VITE_SUPABASE_URL/SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY)

async function findUserByEmail(email) {
  const { data, error } = await admin.auth.admin.listUsers({ email })
  if (error) throw error
  const users = data?.users || []
  return users.find((u) => (u.email || '').toLowerCase() === email.toLowerCase()) || null
}

async function ensureAdminRole(userId) {
  const { data: roles, error } = await admin.from('user_roles').select('role').eq('user_id', userId)
  if (error) throw error
  const hasAdmin = (roles || []).some((r) => r.role === 'administrador')
  if (!hasAdmin) {
    const { error: insErr } = await admin.from('user_roles').insert({ user_id: userId, role: 'administrador' })
    if (insErr) throw insErr
  }
}

async function ensureProfile(user, email) {
  const nome = user?.user_metadata?.nome_completo || email
  const payload = { id: user.id, email, nome_completo: nome }
  const { error } = await admin.from('profiles').upsert(payload, { onConflict: 'id' })
  if (error) throw error
}

async function main() {
  const cmd = args[0]
  if (cmd === '--check') {
    const email = args[1]
    const user = await findUserByEmail(email)
    if (user) {
      console.log(JSON.stringify({ exists: true, id: user.id, email: user.email }, null, 2))
    } else {
      console.log(JSON.stringify({ exists: false }, null, 2))
    }
    return
  }
  if (cmd === '--create-admin') {
    const email = args[1]
    const password = args[2]
    if (!email || !password) {
      usage()
      process.exit(1)
    }
    let user = await findUserByEmail(email)
    if (!user) {
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { nome_completo: email },
      })
      if (error) throw error
      user = data.user
    }
    await ensureProfile(user, email)
    await ensureAdminRole(user.id)
    console.log(JSON.stringify({ ok: true, id: user.id, email }, null, 2))
    return
  }
  usage()
  process.exit(1)
}

main().catch((e) => {
  console.error('Error:', e?.message || String(e))
  process.exit(1)
})

