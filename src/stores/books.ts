import { atom } from 'nanostores';
export type BookFilters = {
  limit: number;
  offset: number;
  title: string;
  authorId: string;
  sort: 'id' | 'title' | 'published-year';
  order: 'asc' | 'desc';
};
export const defaultFilters: BookFilters = {
  limit: 20,
  offset: 0,
  title: '',
  authorId: '',
  sort: 'id',
  order: 'asc',
};
export function parseFilters(search: string): BookFilters {
  const p = new URLSearchParams(search);
  const integer = (key: string, fallback: number, min: number, max: number) => {
    const raw = p.get(key);
    const n = raw === null ? NaN : Number(raw);
    return Number.isInteger(n) && n >= min && n <= max ? n : fallback;
  };
  const author = p.get('author-id') || '';
  const sort = p.get('sort');
  return {
    limit: integer('limit', 20, 1, 100),
    offset: integer('offset', 0, 0, 2147483647),
    title: (p.get('title') || '').slice(0, 300),
    authorId: /^[1-9]\d*$/.test(author) && Number.isSafeInteger(Number(author)) ? author : '',
    sort: sort === 'title' || sort === 'published-year' ? sort : 'id',
    order: p.get('order') === 'desc' ? 'desc' : 'asc',
  };
}
export function filterParams(f: BookFilters) {
  const p = new URLSearchParams({
    limit: String(f.limit),
    offset: String(f.offset),
    sort: f.sort,
    order: f.order,
  });
  if (f.title.trim()) p.set('title', f.title.trim());
  if (f.authorId) p.set('author-id', f.authorId);
  return p;
}
export function createBookStore(initial: BookFilters = defaultFilters) {
  return atom<BookFilters>(initial);
}
export function writeFilters(f: BookFilters, mode: 'push' | 'replace' = 'push') {
  const url = new URL(window.location.href);
  url.search = filterParams(f).toString();
  window.history[mode === 'push' ? 'pushState' : 'replaceState']({}, '', url);
}
