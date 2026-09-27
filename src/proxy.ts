import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import { createServerClient } from "@supabase/ssr";
import {
  isSupabaseConfigured,
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
} from "@/lib/supabase/config";
import { DEMO_ROLE_COOKIE, isUserRole } from "@/lib/auth/demo-session";

const PUBLIC_PATHS = ["/auth", "/onboarding"];

function isPublicPath(pathname: string) {
  return (
    PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  );
}

export async function proxy(request: NextRequest) {
  const sessionResponse = await updateSession(request);

  if (!isSupabaseConfigured || isPublicPath(request.nextUrl.pathname)) {
    return sessionResponse;
  }

  const demoRole = request.cookies.get(DEMO_ROLE_COOKIE)?.value;
  if (isUserRole(demoRole)) {
    return sessionResponse;
  }

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll() {
        // Session cookie writes are handled by updateSession above.
      },
    },
  });

  const { data, error } = await supabase.auth.getClaims();
  if (!data?.claims || error) {
    const url = request.nextUrl.clone();
    const authUrl = new URL("/auth", request.url);
    authUrl.searchParams.set("next", `${url.pathname}${url.search}`);
    return NextResponse.redirect(authUrl);
  }

  return sessionResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
