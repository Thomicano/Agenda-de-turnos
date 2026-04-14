import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options })
          },
        },
      }
    )
    
    // 1. Intercambiamos el código por la sesión
    const { data: authData, error: authError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!authError && authData.session) {
      
      // 2. Buscamos el negocio del usuario que acaba de loguearse
      const { data: negocio } = await supabase
        .from('negocios')
        .select('slug')
        .eq('owner_id', authData.session.user.id) // <-- ATENCIÓN: Si tu columna se llama owner_id, cambialo acá
        .limit(1)
        .single()

      // 3. Ruteo inteligente
      if (negocio && negocio.slug) {
        // Ya tiene negocio -> Directo a su panel
        return NextResponse.redirect(`${origin}/admin/${negocio.slug}`)
      } else {
        // Es nuevo -> Lo mandamos a que cree su primer negocio
        return NextResponse.redirect(`${origin}/crear-negocio`) // O la ruta que uses para esto
      }
    }
  }

  // Si algo falla, vuelve al login
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}