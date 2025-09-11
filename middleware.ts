import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Se não tem token e não é a página de login, redirecionar
    if (!token && pathname !== '/login') {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Se tem token e está tentando acessar login, redirecionar para dashboard
    if (token && pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Verificar permissões por tipo de usuário (futuras rotas admin)
    if (token) {
      const userType = token.userType

      // Rotas de administrador (quando implementadas)
      if (pathname.startsWith('/admin')) {
        if (userType !== 'ADMIN') {
          return NextResponse.redirect(new URL('/dashboard', req.url))
        }
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Sempre retornar true para deixar o middleware acima gerenciar
        return true
      }
    }
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ]
}