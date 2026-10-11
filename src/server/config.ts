export function serverConfig() {
  const origin = process.env.BOOKSHELF_API_URL || 'http://127.0.0.1:3000';
  const url = new URL(origin);
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  )
    throw new Error('BOOKSHELF_API_URL must be an HTTP(S) origin without credentials or path');
  const staleSeconds = Number(process.env.ROLLUP_STALE_SECONDS || 60);
  if (!Number.isFinite(staleSeconds) || staleSeconds < 1)
    throw new Error('ROLLUP_STALE_SECONDS must be positive');
  return { origin: url.origin, staleSeconds };
}
