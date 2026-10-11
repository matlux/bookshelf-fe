import { useQuery } from '@tanstack/react-query';
import type { BookFilters } from '../../stores/books';
import { getAuthors, getBooks, getRollup } from './books.api';
export const keys = {
  books: ['books'] as const,
  bookList: (filters: BookFilters) => ['books', 'list', filters] as const,
  authors: ['authors'] as const,
  rollup: ['rollup'] as const,
};
export const useBooks = (filters: BookFilters) =>
  useQuery({
    queryKey: keys.bookList(filters),
    queryFn: ({ signal }) => getBooks(filters, signal),
  });
export const useAuthors = () =>
  useQuery({ queryKey: keys.authors, queryFn: ({ signal }) => getAuthors(signal) });
export const useRollup = () =>
  useQuery({ queryKey: keys.rollup, queryFn: ({ signal }) => getRollup(signal) });
