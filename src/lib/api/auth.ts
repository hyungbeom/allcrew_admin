import { apiFetch } from "./client";

export type AuthMember = {
  id: number;
  name: string;
  email: string;
  phone: string;
  memberRole: string;
  signupType: string;
  agencyId: number | null;
  companyName: string | null;
  companySlug: string | null;
};

export type AuthResponse = {
  accessToken: string;
  member: AuthMember;
};

export type SignupRepresentativePayload = {
  name: string;
  phone: string;
  email: string;
  password: string;
  agreeTerms: boolean;
  agreePrivacy: boolean;
  agreeLocation: boolean;
  agreeMarketing: boolean;
  companyName: string;
  companySlug: string;
  businessNumber: string;
  address?: string;
  addressDetail?: string;
};

export type SignupEmployeePayload = {
  name: string;
  phone: string;
  email: string;
  password: string;
  agreeTerms: boolean;
  agreePrivacy: boolean;
  agreeLocation: boolean;
  agreeMarketing: boolean;
  inviteCode: string;
};

const TOKEN_KEY = "allcrew_access_token";
const MEMBER_KEY = "allcrew_member";
const COMPANY_SLUG_COOKIE = "allcrew_company_slug";

export function saveAuthSession(auth: AuthResponse) {
  localStorage.setItem(TOKEN_KEY, auth.accessToken);
  localStorage.setItem(MEMBER_KEY, JSON.stringify(auth.member));

  document.cookie = `allcrew_token=${auth.accessToken}; path=/; max-age=86400; SameSite=Lax`;

  if (auth.member.companySlug) {
    document.cookie = `${COMPANY_SLUG_COOKIE}=${auth.member.companySlug}; path=/; max-age=86400; SameSite=Lax`;
  }
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(MEMBER_KEY);
  document.cookie = "allcrew_token=; path=/; max-age=0; SameSite=Lax";
  document.cookie = `${COMPANY_SLUG_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export function getStoredMember(): AuthMember | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(MEMBER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthMember;
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export async function login(email: string, password: string) {
  const response = await apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  saveAuthSession(response);
  return response;
}

export async function socialLogin(provider: "kakao" | "google" | "apple", code: string, redirectUri: string) {
  const response = await apiFetch<AuthResponse>(`/api/auth/oauth/${provider}`, {
    method: "POST",
    body: JSON.stringify({ code, redirectUri }),
  });
  saveAuthSession(response);
  return response;
}

export async function checkEmailAvailable(email: string) {
  const params = new URLSearchParams({ email });
  return apiFetch<{ available: boolean }>(`/api/auth/check-email?${params.toString()}`);
}

export async function checkBusinessNumberAvailable(businessNumber: string) {
  const params = new URLSearchParams({ businessNumber });
  return apiFetch<{ available: boolean }>(`/api/auth/check-business-number?${params.toString()}`);
}

export async function checkCompanySlugAvailable(companySlug: string) {
  const params = new URLSearchParams({ companySlug });
  return apiFetch<{ available: boolean }>(`/api/auth/check-company-slug?${params.toString()}`);
}

export async function signupRepresentative(payload: SignupRepresentativePayload) {
  return apiFetch<{ message: string; memberId: number }>("/api/auth/signup/representative", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function signupEmployee(payload: SignupEmployeePayload) {
  return apiFetch<{ message: string; memberId: number }>("/api/auth/signup/employee", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function logout() {
  clearAuthSession();
}
