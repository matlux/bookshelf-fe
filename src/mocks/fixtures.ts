import type { Author, AuthorCount, Book } from '../types/api';
export const authors: Author[] = [
  { id: 1, name: 'Ursula K. Le Guin' },
  { id: 2, name: 'Octavia E. Butler' },
  { id: 3, name: 'Jorge Luis Borges' },
];
export const books: Book[] = [
  { id: 1, title: 'A Wizard of Earthsea', 'author-id': 1, 'published-year': 1968 },
  { id: 2, title: 'The Dispossessed', 'author-id': 1, 'published-year': 1974 },
  { id: 3, title: 'Kindred', 'author-id': 2, 'published-year': 1979 },
  { id: 4, title: 'Ficciones', 'author-id': 3, 'published-year': 1944 },
];
export const rollup: AuthorCount[] = authors.map((author) => ({
  'author-id': author.id,
  name: author.name,
  'book-count': books.filter((book) => book['author-id'] === author.id).length,
  'refreshed-at': new Date().toISOString(),
}));
