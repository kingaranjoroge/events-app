import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const { data: { user }, } = await supabase.auth.getUser()

  // Handle auth callback for password reset
  if (request.nextUrl.pathname.startsWith('/auth/callback')) {
    const code = request.nextUrl.searchParams.get('code')
    if (code) {
      await supabase.auth.exchangeCodeForSession(code)
    }
    return NextResponse.redirect(new URL('/reset-password', request.url))
  }

  // Handle reset password with error parameters
  if (request.nextUrl.pathname === '/reset-password') {
    const error = request.nextUrl.searchParams.get('error')
    const errorCode = request.nextUrl.searchParams.get('error_code')
    
    if (error === 'access_denied' && errorCode === 'otp_expired') {
      return NextResponse.redirect(new URL('/forgot-password?error=expired', request.url))
    }
  }

  return supabaseResponse
}
