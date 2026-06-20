const DEFAULT_APP_ORIGIN = "http://localhost:3000";

export function getAppOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return process.env.NEXT_PUBLIC_APP_ORIGIN ?? DEFAULT_APP_ORIGIN;
}

/** URL 입력 prefix 표시용 (예: 211.37.179.144:3000/) */
export function getAppHostPrefix(): string {
  const origin = getAppOrigin();
  return `${origin.replace(/^https?:\/\//, "")}/`;
}

export function getDashboardUrl(companySlug: string): string {
  return `${getAppOrigin()}/${companySlug}/dashboard`;
}
