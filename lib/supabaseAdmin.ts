import { createClient } from '@supabase/supabase-js'

function cleanEnv(value?: string){
  return (value || '').trim().replace(/^['\"]|['\"]$/g, '')
}

function cleanSupabaseUrl(value?: string){
  let url = cleanEnv(value)
  // The Supabase URL must be only https://PROJECT.supabase.co
  // Remove common copied paths like /rest/v1 or /auth/v1 if accidentally pasted.
  url = url.replace(/\/(rest|auth|storage)\/v1.*$/i, '')
  return url.replace(/\/+$/, '')
}

export function supabaseAdmin(){
  const url = cleanSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const key = cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY)

  if(!url || !key){
    throw new Error('Missing Supabase env values. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  }

  if(!url.startsWith('https://') || !url.includes('.supabase.co')){
    throw new Error('Invalid NEXT_PUBLIC_SUPABASE_URL. Use only your Project URL like https://xxxxx.supabase.co, not the REST URL.')
  }

  return createClient(url, key, { auth: { persistSession: false } })
}
