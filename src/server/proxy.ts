import { serverConfig } from './config';
export async function proxy(request: Request): Promise<Response> {
  const input = new URL(request.url);
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
  if (!/^\/api\/v1(?:\/|$)/.test(input.pathname))
    return Response.json(
      { error: 'API route not found' },
      { status: 404, headers: { 'X-Request-ID': requestId } },
    );
  const target = new URL(serverConfig().origin);
  target.pathname = input.pathname;
  target.search = input.search;
  const headers = new Headers({ 'X-Request-ID': requestId, Accept: 'application/json' });
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);
  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer(),
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(125_000)]),
      redirect: 'manual',
    });
    const outgoing = new Headers({
      'Cache-Control': 'no-store',
      'X-Request-ID': upstream.headers.get('x-request-id') || requestId,
    });
    for (const name of ['content-type', 'location', 'allow']) {
      const value = upstream.headers.get(name);
      if (value) outgoing.set(name, value);
    }
    return new Response(upstream.body, { status: upstream.status, headers: outgoing });
  } catch {
    return Response.json(
      { error: 'The bookshelf API is unreachable. Check that the backend is running.' },
      { status: 502, headers: { 'X-Request-ID': requestId, 'Cache-Control': 'no-store' } },
    );
  }
}
