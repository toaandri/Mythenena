const CONFIGURED_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const TOKEN_KEY = "mythenena.session-token";

function getBaseUrl(): string {
  if (typeof window === "undefined") return CONFIGURED_BASE_URL;

  try {
    const apiUrl = new URL(CONFIGURED_BASE_URL);
    if (apiUrl.hostname === "localhost" || apiUrl.hostname === "127.0.0.1") {
      apiUrl.hostname = window.location.hostname;
    }
    return apiUrl.origin;
  } catch {
    return CONFIGURED_BASE_URL;
  }
}

export type ApiErrorPayload = { error?: { message?: string }; message?: string };

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

export function getSessionToken(): string | null {
  return typeof window === "undefined" ? null : window.localStorage.getItem(TOKEN_KEY);
}

export function setSessionToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const { auth = true, headers, ...init } = options;
  const token = auth ? getSessionToken() : null;
  const response = await fetch(`${getBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiErrorPayload;
    throw new ApiError(response.status, body.error?.message ?? body.message ?? "Le service est indisponible.");
  }
  return response.json() as Promise<T>;
}

export async function apiUpload<T>(path: string, body: FormData, auth = true): Promise<T> {
  const token = auth ? getSessionToken() : null;
  const response = await fetch(`${getBaseUrl()}${path}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body,
  });

  if (!response.ok) {
    const result = (await response.json().catch(() => ({}))) as ApiErrorPayload;
    throw new ApiError(response.status, result.error?.message ?? result.message ?? "Le service est indisponible.");
  }
  return response.json() as Promise<T>;
}
