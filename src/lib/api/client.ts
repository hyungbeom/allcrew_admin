const DEFAULT_API_PORT = "8080";

function isLocalHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function isLocalApiUrl(url: string): boolean {
  return url.includes("localhost") || url.includes("127.0.0.1");
}

/** API 서버 주소 (환경 변수 > 접속 호스트:8080 > localhost:8080) */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;

    // 서버 IP/도메인으로 접속했는데 env가 localhost면 접속 호스트 기준으로 API 호출
    if (!isLocalHost(hostname) && (!fromEnv || isLocalApiUrl(fromEnv))) {
      return `${protocol}//${hostname}:${DEFAULT_API_PORT}`;
    }
  }

  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  return `http://localhost:${DEFAULT_API_PORT}`;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiErrorBody = {
  status?: number;
  message?: string;
};

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("allcrew_access_token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = "요청 처리 중 오류가 발생했습니다.";
    try {
      const body = (await response.json()) as ApiErrorBody;
      if (body.message) message = body.message;
    } catch {
      // ignore parse error
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
