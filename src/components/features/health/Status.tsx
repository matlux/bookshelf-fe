import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { ApiError, apiResponse } from '../../../api/client';
import type { Health } from '../../../types/api';
import { BBadge } from '../../bookshelf/BBadge';
import { BButton } from '../../bookshelf/BButton';
import { BCard } from '../../bookshelf/BCard';
import { BSkeleton } from '../../bookshelf/BSkeleton';
import { Island } from '../Island';
import { PageHeading } from '../shared';

function Probe({ kind }: { kind: 'live' | 'ready' }) {
  const query = useQuery({
    queryKey: ['health', kind],
    queryFn: ({ signal }) =>
      apiResponse<Health | { status: 'ok' } | { error: string }>(
        kind === 'live' ? '/health/live' : '/health',
        { signal },
        [503],
      ),
    retry: false,
    refetchInterval: 15_000,
  });
  const result = query.data;
  const health = result?.data;
  const degraded = result?.status === 503;
  return (
    <BCard
      title={kind === 'live' ? 'Process liveness' : 'Dependency readiness'}
      description={kind === 'live' ? 'Can the API respond?' : 'Can the API reach its dependencies?'}
      action={
        <BBadge tone={query.isError ? 'bad' : degraded ? 'warning' : result ? 'good' : 'neutral'}>
          {query.isError
            ? 'Unreachable'
            : degraded
              ? 'Degraded'
              : result
                ? 'Operational'
                : 'Checking'}
        </BBadge>
      }
    >
      {query.isPending ? (
        <BSkeleton />
      ) : (
        <>
          <div className="status-details">
            <div>
              <span>HTTP response</span>
              <strong>
                {result?.status ||
                  (query.error instanceof ApiError ? query.error.status : 'Unavailable')}
              </strong>
            </div>
            <div>
              <span>Round-trip latency</span>
              <strong>{result ? `${Math.round(result.latency)} ms` : '—'}</strong>
            </div>
            {kind === 'ready' && health && 'database' in health && (
              <>
                <div>
                  <span>PostgreSQL</span>
                  <BBadge tone={health.database ? 'good' : 'bad'}>
                    {health.database ? 'Connected' : 'Unavailable'}
                  </BBadge>
                </div>
                <div>
                  <span>Redis</span>
                  <BBadge
                    tone={
                      health.redis === 'ok'
                        ? 'good'
                        : health.redis === 'disabled'
                          ? 'neutral'
                          : 'bad'
                    }
                  >
                    {health.redis === 'ok'
                      ? 'Connected'
                      : health.redis === 'disabled'
                        ? 'Disabled'
                        : 'Unavailable'}
                  </BBadge>
                </div>
              </>
            )}
          </div>
          {query.error && (
            <p className="field-error" role="alert">
              {query.error.message}
            </p>
          )}
          {health && 'error' in health && (
            <p role="status" className="text-sm text-muted-foreground">
              {health.error}
            </p>
          )}
          <p className="metric-label">LAST REQUEST ID</p>
          <p className="request-id">
            {result?.requestId ||
              (query.error instanceof ApiError ? query.error.requestId : null) ||
              'Not available'}
          </p>
        </>
      )}
    </BCard>
  );
}
export function Status() {
  const client = useQueryClient();
  return (
    <>
      <PageHeading
        eyebrow="UNDER THE HOOD"
        title="Service status"
        description="A clear view of the systems behind your bookshelf."
        action={
          <BButton
            variant="outline"
            onClick={() => client.invalidateQueries({ queryKey: ['health'] })}
          >
            <RefreshCw size={15} className="mr-2" />
            Check again
          </BButton>
        }
      />
      <div className="status-grid">
        <Probe kind="live" />
        <Probe kind="ready" />
      </div>
      <div className="collection-note mt-6">
        <span>Checked automatically every 15 seconds.</span>
        <span>Local services · No external monitoring</span>
      </div>
      <p className="refresh-note">
        A degraded readiness check means a dependency is unavailable or the request executor is
        busy. Liveness can remain healthy while readiness is degraded.
      </p>
    </>
  );
}
export default function StatusIsland() {
  return (
    <Island>
      <Status />
    </Island>
  );
}
