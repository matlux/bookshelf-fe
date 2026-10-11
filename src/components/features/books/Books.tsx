import { useStore } from '@nanostores/react';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import {
  ArrowUpDown,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLibraryMutations } from '../../../api/queries/books.mutations';
import { useAuthors, useBooks } from '../../../api/queries/books.queries';
import {
  type BookFilters,
  createBookStore,
  parseFilters,
  writeFilters,
} from '../../../stores/books';
import type { Book } from '../../../types/api';
import { BButton } from '../../bookshelf/BButton';
import { BConfirm } from '../../bookshelf/BConfirm';
import { BDialog } from '../../bookshelf/BDialog';
import { BInput } from '../../bookshelf/BInput';
import { BSelect } from '../../bookshelf/BSelect';
import { BSkeleton } from '../../bookshelf/BSkeleton';
import { BTable } from '../../bookshelf/BTable';
import { Island } from '../Island';
import { EmptyState, ErrorState, PageHeading } from '../shared';
import { BookForm } from './BookForm';
export function Books({ initial }: { initial: BookFilters }) {
  const [store] = useState(() => createBookStore(initial));
  const filters = useStore(store);
  const [search, setSearch] = useState(initial.title);
  const [editing, setEditing] = useState<Book | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Book | null>(null);
  const books = useBooks(filters);
  const authors = useAuthors();
  const mutations = useLibraryMutations();
  function change(patch: Partial<BookFilters>, mode: 'push' | 'replace' = 'push') {
    const next = { ...store.get(), ...patch };
    store.set(next);
    writeFilters(next, mode);
  }
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== store.get().title) {
        const next = { ...store.get(), title: search, offset: 0 };
        store.set(next);
        writeFilters(next, 'replace');
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search, store]);
  useEffect(() => {
    const pop = () => {
      const next = parseFilters(window.location.search);
      store.set(next);
      setSearch(next.title);
    };
    window.addEventListener('popstate', pop);
    return () => window.removeEventListener('popstate', pop);
  }, [store]);
  const edit = useCallback(
    (book: Book | 'new') => {
      mutations.saveBook.reset();
      setEditing(book);
    },
    [mutations.saveBook.reset],
  );
  const columns = useMemo<ColumnDef<Book>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Book title',
        cell: ({ row }) => (
          <div className="book-cell">
            <span className="book-spine" aria-hidden="true">
              {row.original.title.slice(0, 1)}
            </span>
            <div>
              <strong>{row.original.title}</strong>
              <small>BOOK / {String(row.original.id).padStart(3, '0')}</small>
            </div>
          </div>
        ),
      },
      {
        id: 'author',
        header: 'Author',
        cell: ({ row }) =>
          authors.data?.find((a) => a.id === row.original['author-id'])?.name ||
          `Author #${row.original['author-id']}`,
      },
      {
        accessorKey: 'published-year',
        header: 'Published',
        cell: ({ getValue }) => <span className="text-muted-foreground">{getValue<number>()}</span>,
      },
      {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ getValue }) => (
          <span className="text-xs text-muted-foreground">#{getValue<number>()}</span>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <div className="actions">
            <BButton
              variant="ghost"
              size="icon"
              aria-label={`Edit ${row.original.title}`}
              onClick={() => edit(row.original)}
            >
              <Pencil size={15} />
            </BButton>
            <BButton
              variant="ghost"
              size="icon"
              aria-label={`Delete ${row.original.title}`}
              onClick={() => {
                mutations.deleteBook.reset();
                setDeleting(row.original);
              }}
            >
              <Trash2 size={15} />
            </BButton>
          </div>
        ),
      },
    ],
    [authors.data, edit, mutations.deleteBook.reset],
  );
  const table = useReactTable({
    data: books.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    state: { sorting: [{ id: filters.sort, desc: filters.order === 'desc' }] },
    onSortingChange: (updater) => {
      const current: SortingState = [{ id: filters.sort, desc: filters.order === 'desc' }];
      const next = typeof updater === 'function' ? updater(current) : updater;
      change({
        sort: (next[0]?.id || 'id') as BookFilters['sort'],
        order: next[0]?.desc ? 'desc' : 'asc',
        offset: 0,
      });
    },
  });
  return (
    <>
      <PageHeading
        eyebrow="THE COLLECTION"
        title="Your bookshelf"
        description="Good books deserve a place. Keep yours in order."
        action={
          <BButton onClick={() => edit('new')}>
            <Plus size={16} className="mr-2" />
            Add book
          </BButton>
        }
      />
      <div className="collection-note">
        <span className="flex items-center gap-3">
          <BookOpen size={18} />
          <strong>A growing collection, one story at a time.</strong>
        </span>
        <span>Explore · Collect · Revisit</span>
      </div>
      {authors.isError && (
        <div className="mb-4">
          <ErrorState error={authors.error} retry={() => authors.refetch()} />
        </div>
      )}
      <section className="table-panel" aria-label="Book collection">
        <div className="toolbar">
          <BInput
            id="title-search"
            label="FIND A BOOK"
            placeholder="Search by title…"
            type="search"
            maxLength={300}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <BSelect
            id="author-filter"
            label="AUTHOR"
            value={filters.authorId || 'all'}
            onChange={(value) => change({ authorId: value === 'all' ? '' : value, offset: 0 })}
            options={[
              { value: 'all', label: 'All authors' },
              ...(authors.data || []).map((author) => ({
                value: String(author.id),
                label: author.name,
              })),
            ]}
          />
          <BSelect
            id="book-sort"
            label="SORT BY"
            value={`${filters.sort}:${filters.order}`}
            onChange={(value) => {
              const [sort, order] = value.split(':');
              change({
                sort: sort as BookFilters['sort'],
                order: order as BookFilters['order'],
                offset: 0,
              });
            }}
            options={[
              { value: 'id:asc', label: 'ID · ascending' },
              { value: 'id:desc', label: 'ID · descending' },
              { value: 'title:asc', label: 'Title · A to Z' },
              { value: 'title:desc', label: 'Title · Z to A' },
              { value: 'published-year:desc', label: 'Year · newest first' },
              { value: 'published-year:asc', label: 'Year · oldest first' },
            ]}
          />
        </div>
        {books.isPending ? (
          <div className="px-6">
            <BSkeleton />
          </div>
        ) : books.isError ? (
          <div className="p-6">
            <ErrorState error={books.error} retry={() => books.refetch()} />
          </div>
        ) : books.data.length === 0 ? (
          <EmptyState
            title={
              filters.title || filters.authorId
                ? 'No matching books'
                : filters.offset
                  ? 'You’ve reached the last shelf'
                  : 'Your first chapter starts here'
            }
            description={
              filters.title || filters.authorId
                ? 'Try another title or author to find what you’re looking for.'
                : filters.offset
                  ? 'Go back a page to see your collection.'
                  : 'Add a book to begin building your collection.'
            }
            action={
              <BButton
                variant="outline"
                onClick={() => {
                  if (filters.title || filters.authorId) {
                    setSearch('');
                    change({ title: '', authorId: '', offset: 0 });
                  } else if (filters.offset)
                    change({ offset: Math.max(0, filters.offset - filters.limit) });
                  else edit('new');
                }}
              >
                {filters.title || filters.authorId
                  ? 'Clear filters'
                  : filters.offset
                    ? 'Previous page'
                    : 'Add your first book'}
              </BButton>
            }
          />
        ) : (
          <BTable
            caption="Books in your collection"
            headers={table.getHeaderGroups()[0].headers.map((header) => ({
              id: header.id,
              content: ['title', 'published-year', 'id'].includes(header.id) ? (
                <button
                  type="button"
                  className="inline-flex items-center gap-2"
                  onClick={header.column.getToggleSortingHandler()}
                  aria-label={`Sort by ${header.id}`}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  <ArrowUpDown size={12} />
                </button>
              ) : (
                flexRender(header.column.columnDef.header, header.getContext())
              ),
            }))}
            rows={table.getRowModel().rows.map((row) => ({
              id: String(row.original.id),
              cells: row.getVisibleCells().map((cell) => ({
                id: cell.id,
                content: flexRender(cell.column.columnDef.cell, cell.getContext()),
              })),
            }))}
          />
        )}
        <div className="table-footer">
          <span>
            {books.data?.length
              ? `Showing ${filters.offset + 1}–${filters.offset + books.data.length}`
              : 'No books shown'}
            {books.isFetching && !books.isPending ? ' · Updating…' : ''}
          </span>
          <div className="pagination">
            <label className="page-size">
              Per page{' '}
              <select
                aria-label="Books per page"
                value={filters.limit}
                onChange={(e) => change({ limit: Number(e.target.value), offset: 0 })}
              >
                {[...new Set([10, 20, 50, 100, filters.limit])]
                  .sort((a, b) => a - b)
                  .map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
              </select>
            </label>
            <BButton
              variant="outline"
              size="icon"
              aria-label="Previous page"
              disabled={!filters.offset || books.isFetching}
              onClick={() => change({ offset: Math.max(0, filters.offset - filters.limit) })}
            >
              <ChevronLeft size={16} />
            </BButton>
            <span>Page {Math.floor(filters.offset / filters.limit) + 1}</span>
            <BButton
              variant="outline"
              size="icon"
              aria-label="Next page"
              disabled={books.isFetching || books.data?.length !== filters.limit}
              onClick={() => change({ offset: filters.offset + filters.limit })}
            >
              <ChevronRight size={16} />
            </BButton>
          </div>
        </div>
      </section>
      <BDialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open && !mutations.saveBook.isPending) setEditing(null);
        }}
        title={editing === 'new' ? 'Add a book' : 'Edit book'}
        description="A title, its author, and the year the story began."
      >
        {editing !== null && (
          <BookForm
            key={editing === 'new' ? 'new' : editing.id}
            book={editing === 'new' ? undefined : editing}
            authors={authors.data || []}
            pending={mutations.saveBook.isPending}
            error={mutations.saveBook.error}
            onCancel={() => setEditing(null)}
            onSave={(input) =>
              mutations.saveBook.mutate(
                { input, id: editing === 'new' ? undefined : editing?.id },
                {
                  onSuccess: () => {
                    setEditing(null);
                    if (editing === 'new') change({ offset: 0 });
                  },
                },
              )
            }
          />
        )}
      </BDialog>
      <BConfirm
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open && !mutations.deleteBook.isPending) setDeleting(null);
        }}
        title="Remove this book?"
        description={`“${deleting?.title || ''}” will be permanently removed from your library.`}
        pending={mutations.deleteBook.isPending}
        error={mutations.deleteBook.error?.message}
        onConfirm={() => {
          if (deleting)
            mutations.deleteBook.mutate(deleting.id, {
              onSuccess: () => {
                setDeleting(null);
                if (books.data?.length === 1 && filters.offset)
                  change({ offset: Math.max(0, filters.offset - filters.limit) });
              },
            });
        }}
      />
    </>
  );
}
export default function BooksIsland(props: { initial: BookFilters }) {
  return (
    <Island>
      <Books {...props} />
    </Island>
  );
}
