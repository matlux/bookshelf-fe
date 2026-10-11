import { Skeleton } from '../ui/skeleton';
export function BSkeleton() {
  return (
    <div role="status" aria-label="Loading" className="space-y-3 py-5">
      <span className="sr-only">Loading…</span>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-4/5" />
    </div>
  );
}
