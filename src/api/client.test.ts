import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '../mocks/server';
import { api, apiResponse, normaliseError } from './client';

describe('API client', () => {
  it.each([400, 404, 409, 422, 502, 503, 504])(
    'normalises status %s and keeps diagnostics',
    (status) => {
      const error = normaliseError(status, { error: 'Clear explanation' }, 'trace');
      expect(error.message).toBe('Clear explanation');
      expect(error.status).toBe(status);
      expect(error.requestId).toBe('trace');
    },
  );
  it('provides safe fallbacks for unexpected bodies', () =>
    expect(normaliseError(504, '<html>internal details</html>', null).message).toContain(
      'timed out',
    ));
  it('sends and receives a request ID', async () => {
    const response = await apiResponse('/health/live');
    expect(response.status).toBe(200);
    expect(response.requestId).toMatch(/^[0-9a-f-]{36}$/);
  });
  it('supports empty delete responses', async () =>
    expect(await api('/books/1', { method: 'DELETE' })).toBeNull());
  it('preserves readiness details on 503', async () => {
    server.use(
      http.get('*/api/v1/health', () =>
        HttpResponse.json({ status: 'unavailable', database: false, redis: 'ok' }, { status: 503 }),
      ),
    );
    const result = await apiResponse('/health', {}, [503]);
    expect(result.data).toMatchObject({ database: false });
    expect(result.status).toBe(503);
  });
  it('rejects malformed successful JSON', async () => {
    server.use(http.get('*/api/v1/health', () => new HttpResponse('<html>bad upstream</html>')));
    await expect(api('/health')).rejects.toMatchObject({ status: 502 });
  });
});
