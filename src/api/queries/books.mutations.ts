import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { AuthorInput, BookInput } from '../../lib/forms';
import { deleteAuthor, deleteBook, saveAuthor, saveBook } from './books.api';
import { keys } from './books.queries';
export function useLibraryMutations() {
  const client = useQueryClient();
  const refresh = async () => {
    await Promise.all(
      [keys.books, keys.authors, keys.rollup].map((queryKey) =>
        client.invalidateQueries({ queryKey }),
      ),
    );
  };
  const success = (message: string) => async () => {
    toast.success(message);
    await refresh();
  };
  return {
    saveBook: useMutation({
      mutationFn: ({ input, id }: { input: BookInput; id?: number }) => saveBook(input, id),
      onSuccess: success('Book saved'),
    }),
    deleteBook: useMutation({ mutationFn: deleteBook, onSuccess: success('Book deleted') }),
    saveAuthor: useMutation({
      mutationFn: ({ input, id }: { input: AuthorInput; id?: number }) => saveAuthor(input, id),
      onSuccess: success('Author saved'),
    }),
    deleteAuthor: useMutation({ mutationFn: deleteAuthor, onSuccess: success('Author deleted') }),
  };
}
