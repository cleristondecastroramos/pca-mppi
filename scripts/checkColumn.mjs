import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL)
console.log('SERVICE_KEY present:', !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY))

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing env: VITE_SUPABASE_URL and key (SERVICE_ROLE or ANON)')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

async function checkColumn() {
  console.log('Checking for data_prevista_contratacao column in contratacoes table...')
  
  // Try to select the specific column from one record
  const { data, error } = await supabase
    .from('contratacoes')
    .select('data_prevista_contratacao')
    .limit(1)

  if (error) {
    console.error('Error selecting column:', error.message)
    if (error.message.includes('does not exist') || error.code === 'PGRST204') { // PGRST204 is column not found in PostgREST usually, or similar
       console.log('Column likely does not exist.')
    }
  } else {
    console.log('Column exists! Data sample:', data)
  }
}

checkColumn().catch(console.error)
