import { updateSession } from '@/lib/supabase/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import { getUserRoles } from '@/lib/supabase/queries/get-user-roles';

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);

  // Protect the /protected route
  if (request.nextUrl.pathname.startsWith('/protected')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const roles = await getUserRoles();
    if (!roles.includes('admin') && !roles.includes('supervisor')) {
      // Redirect to a "not authorized" page or the home page
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
