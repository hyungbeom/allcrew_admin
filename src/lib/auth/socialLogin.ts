import { getAppOrigin } from "@/lib/appOrigin";

export type SocialProvider = "kakao" | "google" | "apple";

const PROVIDER_LABEL: Record<SocialProvider, string> = {
  kakao: "카카오",
  google: "Google",
  apple: "Apple",
};

export function getSocialCallbackPath(provider: SocialProvider) {
  return `/login/oauth/${provider}`;
}

export function getSocialRedirectUri(provider: SocialProvider) {
  return `${getAppOrigin()}${getSocialCallbackPath(provider)}`;
}

function getKakaoAuthorizeUrl(redirectUri: string) {
  const clientId = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY?.trim();
  if (!clientId) return null;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
  });

  return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
}

function getGoogleAuthorizeUrl(redirectUri: string) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
  if (!clientId) return null;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

function getAppleAuthorizeUrl(redirectUri: string) {
  const clientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID?.trim();
  if (!clientId) return null;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    response_mode: "query",
    scope: "name email",
  });

  return `https://appleid.apple.com/auth/authorize?${params.toString()}`;
}

export function getSocialAuthorizeUrl(provider: SocialProvider) {
  const redirectUri = getSocialRedirectUri(provider);

  switch (provider) {
    case "kakao":
      return getKakaoAuthorizeUrl(redirectUri);
    case "google":
      return getGoogleAuthorizeUrl(redirectUri);
    case "apple":
      return getAppleAuthorizeUrl(redirectUri);
    default:
      return null;
  }
}

export function startSocialLogin(provider: SocialProvider) {
  const authorizeUrl = getSocialAuthorizeUrl(provider);
  if (!authorizeUrl) {
    throw new Error(`${PROVIDER_LABEL[provider]} 로그인 연동 설정이 필요합니다.`);
  }

  window.location.assign(authorizeUrl);
}
