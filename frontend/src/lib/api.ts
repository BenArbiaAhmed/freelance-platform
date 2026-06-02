import axios, { AxiosError } from "axios";

export const AUTH_STORAGE_KEY = "freelancehub-auth";
export const API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN ?? "http://localhost:3000";

// In-memory token, kept in sync by the auth store. Falls back to the persisted
// store on a fresh page load before the store has had a chance to register it.
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

function readPersistedToken(): string | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw)?.state?.token ?? null;
  } catch {
    return null;
  }
}

export const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
  const token = authToken ?? readPersistedToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Pulls a human-readable message out of a NestJS error response. */
export function apiErrorMessage(
  err: unknown,
  fallback = "Something went wrong",
): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as
      | { message?: string | string[] }
      | undefined;
    const msg = data?.message;
    if (Array.isArray(msg)) return msg[0];
    if (typeof msg === "string") return msg;
    return err.message;
  }
  return fallback;
}

/** Resolves a stored photo path (relative or absolute) to a full URL. */
export function resolvePhotoUrl(url?: string | null): string | null {
  if (!url) return null
  if (url.startsWith('http')) return url
  return `${API_ORIGIN}${url}`
}

/** Minimal GraphQL client that posts to the Nest Apollo endpoint. */
export async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const token = authToken ?? readPersistedToken();
  const { data } = await axios.post(
    "/graphql",
    { query, variables },
    { headers: token ? { Authorization: `Bearer ${token}` } : undefined },
  );
  if (data.errors?.length) {
    throw new Error(data.errors[0].message ?? "GraphQL request failed");
  }
  return data.data as T;
}
