export type ApiError = {
  code: string;
  message: string;
  fields?: Record<string, string>;
};

export type ApiResult<Data> =
  | { ok: true; data: Data }
  | { ok: false; error: ApiError };

const networkError: ApiError = {
  code: "NETWORK",
  message: "Could not reach the server, try again",
};

export async function apiRequest<Data = unknown>(
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body?: unknown,
): Promise<ApiResult<Data>> {
  try {
    const response = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const payload = response.status === 204 ? null : await response.json();

    if (!response.ok) {
      return { ok: false, error: payload?.error ?? networkError };
    }
    return { ok: true, data: payload as Data };
  } catch {
    return { ok: false, error: networkError };
  }
}

export function safeNextPath(next: string | undefined | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}
