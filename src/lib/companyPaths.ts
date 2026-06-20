export const RESERVED_ROUTE_SEGMENTS = new Set(["login", "signup"]);

export const LEGACY_APP_PATHS = [
  "/dashboard",
  "/calendar",
  "/project",
  "/crew-db",
  "/contract",
  "/education",
  "/chat",
  "/safenet",
  "/ptt",
  "/settlement",
  "/statistics",
  "/company-settings",
  "/mypage",
];

export function normalizeCompanySlug(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

export function companyPath(companySlug: string, route = "dashboard"): string {
  const normalizedRoute = route.startsWith("/") ? route.slice(1) : route;
  return `/${companySlug}/${normalizedRoute}`;
}

export function parseAppPathname(pathname: string): {
  companySlug: string | null;
  routePath: string;
} {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return { companySlug: null, routePath: "/dashboard" };
  }

  const firstSegment = segments[0];
  if (RESERVED_ROUTE_SEGMENTS.has(firstSegment)) {
    return { companySlug: null, routePath: pathname };
  }

  const routePath =
    segments.length > 1 ? `/${segments.slice(1).join("/")}` : "/dashboard";

  return { companySlug: firstSegment, routePath };
}

export function isLegacyAppPath(pathname: string): boolean {
  return LEGACY_APP_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function getDashboardRedirectPath(
  companySlug: string | null | undefined,
  pathname = "/dashboard",
): string {
  if (!companySlug) {
    return "/login";
  }

  if (pathname === "/") {
    return companyPath(companySlug, "dashboard");
  }

  if (isLegacyAppPath(pathname)) {
    return `/${companySlug}${pathname}`;
  }

  return companyPath(companySlug, "dashboard");
}
