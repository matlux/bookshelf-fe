import { expect, it } from 'vitest';
import { authorSchema, bookSchema } from './forms';
import { freshness } from './rollup';

it('matches API validation boundaries', () => {
  const good = { title: 'Book', 'author-id': 1, 'published-year': 1 };
  expect(bookSchema.safeParse(good).success).toBe(true);
  for (const patch of [
    { title: ' ' },
    { title: 'x'.repeat(301) },
    { 'author-id': 0 },
    { 'published-year': 10000 },
    { 'published-year': 2.5 },
  ])
    expect(bookSchema.safeParse({ ...good, ...patch }).success).toBe(false);
  expect(authorSchema.safeParse({ name: ' ' }).success).toBe(false);
  expect(authorSchema.safeParse({ name: 'x'.repeat(300) }).success).toBe(true);
});
it('distinguishes absent, stale and fresh rollups', () => {
  expect(freshness(null, 100000, 60)).toBe('never');
  expect(freshness(new Date(0).toISOString(), 100000, 60)).toBe('stale');
  expect(freshness(new Date(90000).toISOString(), 100000, 60)).toBe('fresh');
});
