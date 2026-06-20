import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getDashboardRedirectPath,
  isLegacyAppPath,
  parseAppPathname,
  RESERVED_ROUTE_SEGMENTS,
} from "@/lib/companyPaths";

const PUBLIC_PATHS = ["/login", "/signup"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("allcrew_token")?.value;
  const companySlug = request.cookies.get("allcrew_company_slug")?.value;
  const isPublic = isPublicPath(pathname);

  if (!token && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 토큰만 있고 company_slug가 없으면 구 세션 — 로그인/회원가입 페이지는 허용
  if (token && !companySlug && isPublic) {
    return NextResponse.next();
  }

  if (token && isPublic && companySlug) {
    return NextResponse.redirect(
      new URL(getDashboardRedirectPath(companySlug), request.url),
    );
  }

  if (token && pathname === "/") {
    return NextResponse.redirect(
      new URL(getDashboardRedirectPath(companySlug), request.url),
    );
  }

  if (token && !companySlug && isLegacyAppPath(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token && companySlug && isLegacyAppPath(pathname)) {
    return NextResponse.redirect(
      new URL(getDashboardRedirectPath(companySlug, pathname), request.url),
    );
  }

  if (token && companySlug) {
    const { companySlug: urlSlug } = parseAppPathname(pathname);
    const firstSegment = pathname.split("/").filter(Boolean)[0];

    if (
      firstSegment &&
      !RESERVED_ROUTE_SEGMENTS.has(firstSegment) &&
      urlSlug &&
      urlSlug !== companySlug
    ) {
      const rest = pathname.slice(urlSlug.length + 1) || "/dashboard";
      return NextResponse.redirect(
        new URL(getDashboardRedirectPath(companySlug, rest), request.url),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
