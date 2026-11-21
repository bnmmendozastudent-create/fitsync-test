import 'server-only'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { publicAppOrigin } from '../../../shared/deployment.mjs'

export async function authClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  const jar = await cookies()
  return createServerClient(url, key, {
    cookieOptions: { path: '/', sameSite: 'lax', secure: process.env.NODE_ENV === 'production' },
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (values) => {
        try { values.forEach(({ name, value, options }) => jar.set(name, value, options)) }
        catch { /* Server Components are read-only; Proxy refreshes their cookies. */ }
      },
    },
  })
}

export function appOrigin() {
  const url = new URL(publicAppOrigin())
  if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') throw new Error('HTTPS is required')
  return url.origin
}
