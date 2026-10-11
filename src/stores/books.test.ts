import { describe, expect, it } from 'vitest';
import { createBookStore, defaultFilters, filterParams, parseFilters, writeFilters } from './books';

describe('URL state', () => {
  it('uses defaults and bounds malformed values', () => {
    expect(parseFilters('?limit=999&offset=-2&sort=sql&order=no&author-id=oops')).toEqual(
      defaultFilters,
    );
  });
  it('round trips all supported values', () => {
    const filters = {
      limit: 50,
      offset: 100,
      title: 'Earth & sea',
      authorId: '2',
      sort: 'title' as const,
      order: 'desc' as const,
    };
    expect(parseFilters(filterParams(filters).toString())).toEqual(filters);
  });
  it('omits empty search values', () => {
    expect(filterParams(defaultFilters).has('title')).toBe(false);
    expect(filterParams(defaultFilters).has('author-id')).toBe(false);
  });
  it('keeps stores independent for server rendering', () => {
    const a = createBookStore();
    const b = createBookStore();
    a.set({ ...a.get(), title: 'one' });
    expect(b.get().title).toBe('');
  });
  it('preserves path and writes navigable query state', () => {
    writeFilters({ ...defaultFilters, title: 'Kindred', offset: 20 });
    expect(window.location.pathname).toBe('/books');
    expect(parseFilters(window.location.search).title).toBe('Kindred');
  });
  it('rejects unsafe author IDs and fractional offsets', () => {
    expect(parseFilters('?author-id=9223372036854775807&offset=1.5').authorId).toBe('');
    expect(parseFilters('?offset=1.5').offset).toBe(0);
  });
});
