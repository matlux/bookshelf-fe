import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { expect, it } from 'vitest';
import { server } from '../../../mocks/server';
import StatusIsland from './Status';

it('keeps a 503 dependency response visible and refetches on demand', async () => {
  let checks = 0;
  server.use(
    http.get('*/api/v1/health', ({ request }) => {
      checks++;
      return HttpResponse.json(
        { status: 'degraded', database: false, redis: 'ok' },
        {
          status: 503,
          headers: { 'X-Request-ID': request.headers.get('x-request-id') || 'test' },
        },
      );
    }),
  );
  render(<StatusIsland />);
  expect(await screen.findByText('Degraded', { exact: true })).toBeVisible();
  expect(await screen.findByText('Operational', { exact: true })).toBeVisible();
  expect(screen.getByText('503')).toBeVisible();
  expect(screen.getByText('Unavailable', { exact: true })).toBeVisible();
  await userEvent.setup().click(screen.getByRole('button', { name: 'Check again' }));
  await waitFor(() => expect(checks).toBe(2));
});
it('shows an unreachable proxy error without crashing the island', async () => {
  server.use(
    http.get('*/api/v1/health', () =>
      HttpResponse.json(
        { error: 'Backend unreachable' },
        { status: 502, headers: { 'X-Request-ID': 'outage-check' } },
      ),
    ),
  );
  render(<StatusIsland />);
  expect(await screen.findByText('Unreachable', { exact: true })).toBeVisible();
  expect(screen.getByText('Backend unreachable')).toBeVisible();
  expect(screen.getByText('outage-check')).toBeVisible();
});
