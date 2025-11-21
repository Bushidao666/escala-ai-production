import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { updateSession } from '@/shared/infra/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabase, response } = await updateSession(request)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Se o usuário não estiver logado e tentar acessar uma rota protegida, redirecione para o login
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    request.nextUrl.pathname !== '/'
  ) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Se o usuário não estiver logado e tentar acessar a página inicial, redirecione para o login
  if (!user && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 