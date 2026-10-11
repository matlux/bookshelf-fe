import { expect, it } from 'vitest';
import { defaultFilters } from '../../stores/books';
import { keys } from './books.queries';

it('keys distinguish every server query dimension', () => {
  const base = keys.bookList(defaultFilters);
  for (const patch of [
    { limit: 50 },
    { offset: 20 },
    { title: 'Book' },
    { authorId: '2' },
    { sort: 'title' },
    { order: 'desc' },
  ])
    expect(keys.bookList({ ...defaultFilters, ...patch } as typeof defaultFilters)).not.toEqual(
      base,
    );
  expect(base[0]).toEqual(keys.books[0]);
});
