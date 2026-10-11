import { HttpResponse, http } from 'msw';
import type { Author, Book } from '../types/api';
import { authors, books, rollup } from './fixtures';

const headers = (request: Request) => ({
  'X-Request-ID': request.headers.get('x-request-id') || 'mock-request',
});
export const handlers = [
  http.get('*/api/v1/books', ({ request }) => {
    const p = new URL(request.url).searchParams;
    let rows = books.filter(
      (book) =>
        (!p.get('title') ||
          book.title.toLowerCase().includes((p.get('title') || '').toLowerCase())) &&
        (!p.get('author-id') || String(book['author-id']) === p.get('author-id')),
    );
    const sort = (p.get('sort') || 'id') as 'id' | 'title' | 'published-year';
    rows = [...rows].sort((a, b) => {
      const cmp =
        typeof a[sort] === 'string'
          ? String(a[sort]).localeCompare(String(b[sort]))
          : Number(a[sort]) - Number(b[sort]);
      return (p.get('order') === 'desc' ? -1 : 1) * (cmp || a.id - b.id);
    });
    const offset = Number(p.get('offset') || 0);
    return HttpResponse.json(rows.slice(offset, offset + Number(p.get('limit') || 20)), {
      headers: headers(request),
    });
  }),
  http.get('*/api/v1/authors', ({ request }) =>
    HttpResponse.json(authors, { headers: headers(request) }),
  ),
  http.get('*/api/v1/authors/book-counts', ({ request }) =>
    HttpResponse.json(rollup, { headers: headers(request) }),
  ),
  http.post('*/api/v1/books', async ({ request }) =>
    HttpResponse.json(
      { ...((await request.json()) as Book), id: 99 },
      { status: 201, headers: headers(request) },
    ),
  ),
  http.put('*/api/v1/books/:id', async ({ request, params }) =>
    HttpResponse.json(
      { ...((await request.json()) as Book), id: Number(params.id) },
      { headers: headers(request) },
    ),
  ),
  http.delete('*/api/v1/books/:id', () => new HttpResponse(null, { status: 204 })),
  http.post('*/api/v1/authors', async ({ request }) =>
    HttpResponse.json(
      { ...((await request.json()) as Author), id: 99 },
      { status: 201, headers: headers(request) },
    ),
  ),
  http.put('*/api/v1/authors/:id', async ({ request, params }) =>
    HttpResponse.json(
      { ...((await request.json()) as Author), id: Number(params.id) },
      { headers: headers(request) },
    ),
  ),
  http.delete('*/api/v1/authors/:id', () =>
    HttpResponse.json({ error: 'Resource is still referenced' }, { status: 409 }),
  ),
  http.get('*/api/v1/health/live', ({ request }) =>
    HttpResponse.json({ status: 'ok' }, { headers: headers(request) }),
  ),
  http.get('*/api/v1/health', ({ request }) =>
    HttpResponse.json({ status: 'ok', database: true, redis: 'ok' }, { headers: headers(request) }),
  ),
];
