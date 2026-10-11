import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { expect, it } from 'vitest';
import { server } from '../../../mocks/server';
import { defaultFilters } from '../../../stores/books';
import BooksIsland from './Books';

it('renders real query results then debounces a URL-backed title filter', async () => {
  const user = userEvent.setup();
  render(<BooksIsland initial={defaultFilters} />);
  expect(await screen.findByText('A Wizard of Earthsea')).toBeVisible();
  await user.type(screen.getByLabelText('FIND A BOOK'), 'Kindred');
  await waitFor(() => expect(screen.queryByText('A Wizard of Earthsea')).not.toBeInTheDocument());
  expect(await screen.findByText('Kindred')).toBeVisible();
  expect(new URLSearchParams(window.location.search).get('title')).toBe('Kindred');
});
it('shows an empty state for unmatched titles', async () => {
  render(<BooksIsland initial={{ ...defaultFilters, title: 'missing' }} />);
  expect(await screen.findByText('No matching books')).toBeVisible();
});
it('restores query state on browser history navigation', async () => {
  render(<BooksIsland initial={defaultFilters} />);
  await screen.findByText('Kindred');
  window.history.pushState({}, '', '/books?title=Ficciones&limit=20');
  window.dispatchEvent(new PopStateEvent('popstate'));
  await waitFor(() => expect(screen.queryByText('Kindred')).not.toBeInTheDocument());
  expect(await screen.findByText('Ficciones')).toBeVisible();
  expect(screen.getByLabelText('FIND A BOOK')).toHaveValue('Ficciones');
});
it('shows an actionable server error', async () => {
  server.use(
    http.get('*/api/v1/books', () =>
      HttpResponse.json({ error: 'Temporarily unavailable' }, { status: 503 }),
    ),
  );
  render(<BooksIsland initial={defaultFilters} />);
  expect(await screen.findByText('Temporarily unavailable', {}, { timeout: 4000 })).toBeVisible();
});
