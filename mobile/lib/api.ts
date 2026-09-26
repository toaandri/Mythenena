import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const localhostFallback = 'http://localhost:4000';

const resolveBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  const preferred = envUrl && envUrl.length > 0 ? envUrl.replace(/\/$/, '') : localhostFallback;

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') {
      return localhostFallback;
    }
  }

  try {
    const parsed = new URL(preferred);
    return parsed.origin;
  } catch {
    return localhostFallback;
  }
};

export const BASE_URL = resolveBaseUrl();
const TOKEN_KEY = 'mythenena.session-token';

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

export async function getSessionToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setSessionToken(token: string | null): Promise<void> {
  try {
    if (token) {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } else {
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // ignore
  }
}

const fetchWithLocalFallback = async (path: string, init: RequestInit): Promise<Response> => {
  const candidateUrls = [BASE_URL, localhostFallback];
  const uniqueUrls = [...new Set(candidateUrls)];

  let lastError: unknown;
  for (const baseUrl of uniqueUrls) {
    try {
      return await fetch(`${baseUrl}${path}`, init);
    } catch (error) {
      lastError = error;
      if (baseUrl === localhostFallback) {
        throw error;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Service indisponible.');
};

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const { auth = true, headers, ...init } = options;
  const token = auth ? await getSessionToken() : null;

  const response = await fetchWithLocalFallback(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers as Record<string, string> | undefined),
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { error?: { message?: string }; message?: string };
    throw new ApiError(
      response.status,
      body.error?.message ?? body.message ?? 'Service indisponible.'
    );
  }
  return response.json() as Promise<T>;
}

export async function apiUpload<T>(
  path: string,
  body: FormData,
  options: { auth?: boolean } = {}
): Promise<T> {
  const token = options.auth === false ? null : await getSessionToken();
  const response = await fetchWithLocalFallback(path, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body,
  });

  if (!response.ok) {
    const result = await response.json().catch(() => ({})) as { error?: { message?: string }; message?: string };
    throw new ApiError(
      response.status,
      result.error?.message ?? result.message ?? 'Service indisponible.'
    );
  }
  return response.json() as Promise<T>;
}
