import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { type BookInput, bookSchema } from '../../../lib/forms';
import type { Author, Book } from '../../../types/api';
import { BButton } from '../../bookshelf/BButton';
import { BInput } from '../../bookshelf/BInput';
import { ErrorState } from '../shared';
export function BookForm({
  book,
  authors,
  onSave,
  onCancel,
  pending,
  error,
}: {
  book?: Book;
  authors: Author[];
  onSave: (input: BookInput) => void;
  onCancel: () => void;
  pending: boolean;
  error: Error | null;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookInput>({
    resolver: zodResolver(bookSchema),
    defaultValues: book
      ? {
          title: book.title,
          'author-id': book['author-id'],
          'published-year': book['published-year'],
        }
      : { title: '', 'author-id': 0, 'published-year': new Date().getFullYear() },
  });
  return (
    <form className="form-stack" onSubmit={handleSubmit(onSave)}>
      <BInput
        id="book-title"
        label="Book title"
        autoFocus
        maxLength={300}
        placeholder="e.g. A Wizard of Earthsea"
        error={errors.title?.message}
        {...register('title')}
      />
      <div className="form-columns">
        <div className="field">
          <label htmlFor="book-author">Author</label>
          <select
            id="book-author"
            aria-invalid={!!errors['author-id']}
            aria-describedby={errors['author-id'] ? 'book-author-error' : undefined}
            {...register('author-id', { valueAsNumber: true })}
          >
            <option value="0">Choose an author</option>
            {authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))}
          </select>
          {errors['author-id'] && (
            <p id="book-author-error" className="field-error">
              {errors['author-id'].message}
            </p>
          )}
        </div>
        <BInput
          id="book-year"
          label="Publication year"
          type="number"
          min={1}
          max={9999}
          error={errors['published-year']?.message}
          {...register('published-year', { valueAsNumber: true })}
        />
      </div>
      {!authors.length && (
        <p className="text-sm text-muted-foreground">
          Create an author on the{' '}
          <a href="/authors" className="text-link">
            Authors page
          </a>{' '}
          first.
        </p>
      )}
      {error && <ErrorState error={error} />}
      <div className="form-footer">
        <BButton type="button" variant="outline" disabled={pending} onClick={onCancel}>
          Cancel
        </BButton>
        <BButton type="submit" disabled={pending || !authors.length}>
          {pending ? 'Saving…' : book ? 'Save changes' : 'Add book'}
        </BButton>
      </div>
    </form>
  );
}
