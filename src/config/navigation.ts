import { companyPath, parseAppPathname } from "@/lib/companyPaths";

export type NavLeaf = {
  path: string;
  label: string;
  title: string;
  badge?: string;
};

export type NavGroup = {
  key: string;
  label: string;
  children: NavLeaf[];
};

export const navGroups: NavGroup[] = [
  {
    key: "operation",
    label: "운영현황",
    children: [
      { path: "dashboard", label: "대시보드", title: "대시보드" },
      { path: "calendar", label: "캘린더", title: "캘린더" },
      { path: "project", label: "프로젝트", title: "프로젝트" },
      { path: "crew-db", label: "크루 DB", title: "크루 DB" },
    ],
  },
  {
    key: "field",
    label: "현장운영",
    children: [
      { path: "contract", label: "계약", title: "계약" },
      { path: "education", label: "안전교육", title: "안전교육" },
      { path: "chat", label: "채팅", title: "채팅", badge: "n" },
      { path: "safenet", label: "세이프넷", title: "세이프넷" },
      { path: "ptt", label: "하이브리드 PTT", title: "하이브리드 PTT" },
    ],
  },
  {
    key: "report",
    label: "정산/리포트",
    children: [
      { path: "settlement", label: "정산", title: "정산" },
      { path: "statistics", label: "통계/리포트", title: "통계/리포트" },
    ],
  },
  {
    key: "system",
    label: "시스템 구성",
    children: [{ path: "company-settings", label: "기업 설정", title: "기업 설정" }],
  },
];

export const navLeaves = navGroups.flatMap((group) => group.children);

export function buildNavGroups(companySlug: string): NavGroup[] {
  return navGroups.map((group) => ({
    ...group,
    children: group.children.map((child) => ({
      ...child,
      path: companyPath(companySlug, child.path),
    })),
  }));
}

export function getPageTitle(pathname: string): string {
  const { routePath } = parseAppPathname(pathname);
  if (routePath === "/mypage") return "회사 설정";

  const projectDetailMatch = routePath.match(/^\/project\/([^/]+)$/);
  if (projectDetailMatch) {
    return "프로젝트 상세";
  }

  const routeKey = routePath.startsWith("/") ? routePath.slice(1) : routePath;
  return navLeaves.find((item) => item.path === routeKey)?.title ?? "ALLCREW";
}

export function getGroupKeyByPath(pathname: string): string | undefined {
  const { routePath } = parseAppPathname(pathname);
  const routeKey = routePath.startsWith("/") ? routePath.slice(1) : routePath;
  return navGroups.find((group) => group.children.some((child) => child.path === routeKey))?.key;
}

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function getBreadcrumb(pathname: string): BreadcrumbItem[] {
  const { companySlug, routePath } = parseAppPathname(pathname);
  const dashboardHref = companySlug ? companyPath(companySlug, "dashboard") : undefined;

  if (routePath === "/mypage") {
    return [
      { label: "ALLCREW", href: dashboardHref },
      { label: "마이페이지" },
    ];
  }

  const projectDetailMatch = routePath.match(/^\/project\/([^/]+)$/);
  if (projectDetailMatch) {
    const operationGroup = navGroups.find((g) => g.key === "operation");
    return [
      { label: "ALLCREW", href: dashboardHref },
      { label: operationGroup?.label ?? "운영현황" },
      { label: "프로젝트", href: companySlug ? companyPath(companySlug, "project") : undefined },
      { label: projectDetailMatch[1] },
    ];
  }

  const routeKey = routePath.startsWith("/") ? routePath.slice(1) : routePath;
  const group = navGroups.find((g) => g.children.some((child) => child.path === routeKey));
  const leaf = navLeaves.find((item) => item.path === routeKey);

  const items: BreadcrumbItem[] = [{ label: "ALLCREW", href: dashboardHref }];

  if (group) {
    items.push({ label: group.label });
  }

  if (leaf) {
    items.push({ label: leaf.label });
  }

  return items;
}
