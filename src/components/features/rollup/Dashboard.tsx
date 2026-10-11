import { RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRollup } from '../../../api/queries/books.queries';
import { displayTime, freshness } from '../../../lib/rollup';
import { BBadge } from '../../bookshelf/BBadge';
import { BButton } from '../../bookshelf/BButton';
import { BCard } from '../../bookshelf/BCard';
import { BSkeleton } from '../../bookshelf/BSkeleton';
import { BTable } from '../../bookshelf/BTable';
import { Island } from '../Island';
import { EmptyState, ErrorState, PageHeading } from '../shared';
import { RollupChart } from './RollupChart';
export function Dashboard({ staleSeconds }: { staleSeconds: number }) {
  const rollup = useRollup();
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(timer);
  }, []);
  const rows = rollup.data || [];
  return (
    <>
      <PageHeading
        eyebrow="THE BIGGER PICTURE"
        title="Library overview"
        description="A snapshot of the stories you’ve brought together."
        action={
          <BButton variant="outline" disabled={rollup.isFetching} onClick={() => rollup.refetch()}>
            <RefreshCw size={15} className="mr-2" />
            {rollup.isFetching ? 'Refreshing…' : 'Refresh snapshot'}
          </BButton>
        }
      />
      {rollup.isPending ? (
        <BSkeleton />
      ) : rollup.isError ? (
        <ErrorState error={rollup.error} retry={() => rollup.refetch()} />
      ) : (
        <>
          <div className="stats-grid">
            {[
              {
                label: 'BOOKS IN SNAPSHOT',
                value: rows.reduce((sum, row) => sum + row['book-count'], 0),
                note: 'An eventually consistent count',
              },
              {
                label: 'AUTHORS REPRESENTED',
                value: rows.length,
                note: 'Including authors with no books',
              },
              {
                label: 'FRESH SNAPSHOTS',
                value: rows.filter(
                  (row) => freshness(row['refreshed-at'], now, staleSeconds) === 'fresh',
                ).length,
                note: `Refreshed within ${staleSeconds} seconds`,
              },
            ].map((metric) => (
              <BCard key={metric.label} title={metric.label}>
                <div className="metric-value">{metric.value}</div>
                <p className="metric-note">{metric.note}</p>
              </BCard>
            ))}
          </div>
          <BCard
            title="Books by author"
            description="Every author, and the space their stories occupy."
          >
            {rows.length ? (
              <RollupChart rows={rows} />
            ) : (
              <EmptyState
                title="A picture is taking shape"
                description="Add authors and books to see your collection here."
              />
            )}
          </BCard>
          <div className="table-panel space-section">
            <BTable
              caption="Author counts and refresh timestamps"
              headers={[
                { id: 'author', content: 'Author' },
                { id: 'count', content: 'Books' },
                { id: 'time', content: 'Last refresh' },
                { id: 'state', content: 'Snapshot' },
              ]}
              rows={rows.map((row) => {
                const state = freshness(row['refreshed-at'], now, staleSeconds);
                return {
                  id: String(row['author-id']),
                  cells: [
                    { id: 'author', content: row.name },
                    { id: 'count', content: row['book-count'] },
                    {
                      id: 'time',
                      content: (
                        <span className="text-xs text-muted-foreground">
                          {displayTime(row['refreshed-at'])}
                        </span>
                      ),
                    },
                    {
                      id: 'state',
                      content: (
                        <BBadge tone={state === 'fresh' ? 'good' : 'warning'}>
                          {state === 'never'
                            ? 'Not refreshed'
                            : state === 'fresh'
                              ? 'Fresh'
                              : 'Stale'}
                        </BBadge>
                      ),
                    },
                  ],
                };
              })}
            />
          </div>
          <p className="refresh-note">
            Counts are updated by the background worker. Refresh reads its latest snapshot; it does
            not force a recount. Older snapshots are marked stale after {staleSeconds} seconds.
          </p>
        </>
      )}
    </>
  );
}
export default function DashboardIsland(props: { staleSeconds: number }) {
  return (
    <Island>
      <Dashboard {...props} />
    </Island>
  );
}
