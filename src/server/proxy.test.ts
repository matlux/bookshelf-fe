import { afterEach, expect, it, vi } from 'vitest';
import { proxy } from './proxy';

afterEach(() => vi.unstubAllGlobals());
it('forwards method, query, body and request ID, preserving response status', async () => {
  const upstream = vi.fn().mockResolvedValue(
    new Response(JSON.stringify({ error: 'Conflict' }), {
      status: 409,
      headers: { 'X-Request-ID': 'upstream-id', 'Content-Type': 'application/json' },
    }),
  );
  vi.stubGlobal('fetch', upstream);
  const response = await proxy(
    new Request('http://localhost:5173/api/v1/books?limit=20', {
      method: 'POST',
      body: '{}',
      headers: { 'X-Request-ID': 'client-id', 'Content-Type': 'application/json' },
    }),
  );
  expect(response.status).toBe(409);
  expect(response.headers.get('x-request-id')).toBe('upstream-id');
  expect(String(upstream.mock.calls[0][0])).toBe('http://127.0.0.1:3000/api/v1/books?limit=20');
  expect(upstream.mock.calls[0][1].headers.get('x-request-id')).toBe('client-id');
});
it('returns JSON 502 with a request ID when the backend is down', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('private network detail')));
  const response = await proxy(new Request('http://localhost:5173/api/v1/health'));
  expect(response.status).toBe(502);
  expect(response.headers.get('x-request-id')).toBeTruthy();
  expect(JSON.stringify(await response.json())).not.toContain('private network detail');
});
it('rejects paths outside the API prefix', async () => {
  const fetch = vi.fn();
  vi.stubGlobal('fetch', fetch);
  expect((await proxy(new Request('http://localhost:5173/api/other'))).status).toBe(404);
  expect(fetch).not.toHaveBeenCalled();
});
