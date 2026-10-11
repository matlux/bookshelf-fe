export function freshness(
  timestamp: string | null,
  now: number,
  staleSeconds: number,
): 'fresh' | 'stale' | 'never' {
  if (!timestamp || !Number.isFinite(Date.parse(timestamp))) return 'never';
  return now - Date.parse(timestamp) > staleSeconds * 1000 ? 'stale' : 'fresh';
}
export function displayTime(timestamp: string | null) {
  if (!timestamp) return 'Not yet refreshed';
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? 'Unknown refresh time' : date.toLocaleString();
}
