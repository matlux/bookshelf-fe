import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLibraryMutations } from '../../../api/queries/books.mutations';
import { useAuthors } from '../../../api/queries/books.queries';
import { type AuthorInput, authorSchema } from '../../../lib/forms';
import type { Author } from '../../../types/api';
import { BButton } from '../../bookshelf/BButton';
import { BConfirm } from '../../bookshelf/BConfirm';
import { BDialog } from '../../bookshelf/BDialog';
import { BInput } from '../../bookshelf/BInput';
import { BSkeleton } from '../../bookshelf/BSkeleton';
import { BTable } from '../../bookshelf/BTable';
import { Island } from '../Island';
import { EmptyState, ErrorState, PageHeading } from '../shared';

function AuthorForm({
  author,
  pending,
  error,
  onSave,
  onCancel,
}: {
  author?: Author;
  pending: boolean;
  error: Error | null;
  onSave: (input: AuthorInput) => void;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthorInput>({
    resolver: zodResolver(authorSchema),
    defaultValues: { name: author?.name || '' },
  });
  return (
    <form className="form-stack" onSubmit={handleSubmit(onSave)}>
      <BInput
        id="author-name"
        label="Author name"
        maxLength={300}
        autoFocus
        placeholder="e.g. Ursula K. Le Guin"
        error={errors.name?.message}
        {...register('name')}
      />
      {error && <ErrorState error={error} />}
      <div className="form-footer">
        <BButton type="button" variant="outline" disabled={pending} onClick={onCancel}>
          Cancel
        </BButton>
        <BButton type="submit" disabled={pending}>
          {pending ? 'Saving…' : author ? 'Save changes' : 'Add author'}
        </BButton>
      </div>
    </form>
  );
}
export function Authors() {
  const authors = useAuthors();
  const mutations = useLibraryMutations();
  const [editing, setEditing] = useState<Author | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Author | null>(null);
  const edit = (author: Author | 'new') => {
    mutations.saveAuthor.reset();
    setEditing(author);
  };
  return (
    <>
      <PageHeading
        eyebrow="BEHIND THE STORIES"
        title="The authors"
        description="The minds behind the books on your shelf."
        action={
          <BButton onClick={() => edit('new')}>
            <Plus size={16} className="mr-2" />
            Add author
          </BButton>
        }
      />
      <div className="collection-note">
        <span className="flex items-center gap-3">
          <Users size={18} />
          <strong>
            {authors.data
              ? `${authors.data.length} voices in your collection`
              : 'Every story starts with a voice.'}
          </strong>
        </span>
        <span>A name worth remembering</span>
      </div>
      <section className="table-panel">
        {authors.isPending ? (
          <div className="p-6">
            <BSkeleton />
          </div>
        ) : authors.isError ? (
          <div className="p-6">
            <ErrorState error={authors.error} retry={() => authors.refetch()} />
          </div>
        ) : !authors.data.length ? (
          <EmptyState
            title="Meet your first author"
            description="Add an author, then give their books a home here."
            action={<BButton onClick={() => edit('new')}>Add author</BButton>}
          />
        ) : (
          <BTable
            caption="Authors in your library"
            headers={[
              { id: 'name', content: 'Author' },
              { id: 'id', content: 'Library ID' },
              { id: 'actions', content: <span className="sr-only">Actions</span> },
            ]}
            rows={authors.data.map((author) => ({
              id: String(author.id),
              cells: [
                {
                  id: 'name',
                  content: (
                    <div className="book-cell">
                      <span className="empty-icon !m-0 !p-3 text-xs">
                        {author.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </span>
                      <strong>{author.name}</strong>
                    </div>
                  ),
                },
                { id: 'id', content: <span className="text-muted-foreground">#{author.id}</span> },
                {
                  id: 'actions',
                  content: (
                    <div className="actions">
                      <BButton
                        size="icon"
                        variant="ghost"
                        aria-label={`Rename ${author.name}`}
                        onClick={() => edit(author)}
                      >
                        <Pencil size={15} />
                      </BButton>
                      <BButton
                        size="icon"
                        variant="ghost"
                        aria-label={`Delete ${author.name}`}
                        onClick={() => {
                          mutations.deleteAuthor.reset();
                          setDeleting(author);
                        }}
                      >
                        <Trash2 size={15} />
                      </BButton>
                    </div>
                  ),
                },
              ],
            }))}
          />
        )}
      </section>
      <p className="refresh-note">
        Authors with books can’t be deleted. Remove or reassign their books first.
      </p>
      <BDialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open && !mutations.saveAuthor.isPending) setEditing(null);
        }}
        title={editing === 'new' ? 'Add an author' : 'Rename author'}
        description="Use the name you’d like to see across your collection."
      >
        {editing !== null && (
          <AuthorForm
            key={editing === 'new' ? 'new' : editing.id}
            author={editing === 'new' ? undefined : editing}
            pending={mutations.saveAuthor.isPending}
            error={mutations.saveAuthor.error}
            onCancel={() => setEditing(null)}
            onSave={(input) =>
              mutations.saveAuthor.mutate(
                { input, id: editing === 'new' ? undefined : editing?.id },
                { onSuccess: () => setEditing(null) },
              )
            }
          />
        )}
      </BDialog>
      <BConfirm
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open && !mutations.deleteAuthor.isPending) setDeleting(null);
        }}
        title="Delete this author?"
        description={`${deleting?.name || 'This author'} will be removed. Authors who still have books cannot be deleted.`}
        pending={mutations.deleteAuthor.isPending}
        error={mutations.deleteAuthor.error?.message}
        onConfirm={() => {
          if (deleting)
            mutations.deleteAuthor.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
        }}
      />
    </>
  );
}
export default function AuthorsIsland() {
  return (
    <Island>
      <Authors />
    </Island>
  );
}
