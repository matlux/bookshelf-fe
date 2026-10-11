import type { AuthorInput, BookInput } from '../../lib/forms';
import { type BookFilters, filterParams } from '../../stores/books';
import type { Author, AuthorCount, Book } from '../../types/api';
import { api } from '../client';
export const getBooks = (filters: BookFilters, signal?: AbortSignal) =>
  api<Book[]>(`/books?${filterParams(filters)}`, { signal });
export const getAuthors = (signal?: AbortSignal) => api<Author[]>('/authors', { signal });
export const getRollup = (signal?: AbortSignal) =>
  api<AuthorCount[]>('/authors/book-counts', { signal });
export const saveBook = (input: BookInput, id?: number) =>
  api<Book>(id ? `/books/${id}` : '/books', {
    method: id ? 'PUT' : 'POST',
    body: JSON.stringify(input),
  });
export const deleteBook = (id: number) => api<void>(`/books/${id}`, { method: 'DELETE' });
export const saveAuthor = (input: AuthorInput, id?: number) =>
  api<Author>(id ? `/authors/${id}` : '/authors', {
    method: id ? 'PUT' : 'POST',
    body: JSON.stringify(input),
  });
export const deleteAuthor = (id: number) => api<void>(`/authors/${id}`, { method: 'DELETE' });
