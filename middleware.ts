import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { getCurrentUserRoles } from '@/lib/supabase/queries/get-user-roles';
import { createServerClient } from '@supabase/ssr';

// Configuration for role-based access control
const protectedRoutes: { [path: string]: string[] } = {
  '/admin': ['admin'],
  '/protected': ['supervisor', 'admin'],
  '/schedule/manage': ['supervisor', 'admin'],
};

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  const pathname = request.nextUrl.pathname;

  // Create a Supabase client to check user authentication
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {
          // This is handled by the updateSession function
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if the requested path is protected
  for (const path in protectedRoutes) {
    if (pathname.startsWith(path)) {
      // If no user is logged in, redirect to the login page
      if (!user) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }

      // If a user is logged in, check their roles
      const userRoles = await getCurrentUserRoles();
      const requiredRoles = protectedRoutes[path];

      const hasRequiredRole = requiredRoles.some((role) =>
        userRoles.includes(role)
      );

      if (!hasRequiredRole) {
        // If user doesn't have the role, redirect to a general "protected" page
        // or an "unauthorized" page. For now, we redirect to the root dashboard.
        console.log(
          `Unauthorized access attempt by user ${user.id} to ${pathname}. Roles: [${userRoles.join(', ')}]`
        );
        return NextResponse.redirect(new URL('/protected', request.url));
      }

      // If the user has the required role, break the loop and proceed
      break;
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth/ (authentication routes)
     * - / (the public home page)
     */
    '/((?!_next/static|_next/image|favicon.ico|auth|login|$).*)',
  ],
};
