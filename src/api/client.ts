export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public requestId: string | null,
    public data: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
export function normaliseError(status: number, data: unknown, requestId: string | null): ApiError {
  const fallback: Record<number, string> = {
    400: 'Check the supplied values.',
    404: 'This item no longer exists.',
    409: 'This change conflicts with existing data.',
    422: 'The API could not accept these values.',
    502: 'The backend is unreachable.',
    503: 'The service is temporarily unavailable.',
    504: 'The request timed out. Check the item before retrying a change.',
  };
  const message =
    typeof data === 'object' && data !== null && 'error' in data && typeof data.error === 'string'
      ? data.error
      : fallback[status] || 'Something went wrong. Please try again.';
  return new ApiError(status, message, requestId, data);
}
export type ApiResult<T> = { data: T; status: number; requestId: string | null; latency: number };
export async function apiResponse<T>(
  path: string,
  options: RequestInit = {},
  acceptStatus: number[] = [],
): Promise<ApiResult<T>> {
  const started = performance.now();
  let response: Response;
  try {
    response = await fetch(new URL(`/api/v1${path}`, window.location.origin), {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': crypto.randomUUID(),
        ...options.headers,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw error;
    throw normaliseError(0, null, null);
  }
  const requestId = response.headers.get('x-request-id');
  const text = response.status === 204 ? '' : await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw normaliseError(response.status >= 400 ? response.status : 502, null, requestId);
    }
  }
  if (!response.ok && !acceptStatus.includes(response.status))
    throw normaliseError(response.status, data, requestId);
  return {
    data: data as T,
    status: response.status,
    requestId,
    latency: performance.now() - started,
  };
}
export async function api<T>(path: string, options: RequestInit = {}) {
  return (await apiResponse<T>(path, options)).data;
}
