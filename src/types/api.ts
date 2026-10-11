import type { paths } from './schema';
export type Book =
  paths['/api/v1/books']['get']['responses'][200]['content']['application/json'][number];
export type Author =
  paths['/api/v1/authors']['get']['responses'][200]['content']['application/json'][number];
export type AuthorCount =
  paths['/api/v1/authors/book-counts']['get']['responses'][200]['content']['application/json'][number];
export type Health =
  paths['/api/v1/health']['get']['responses'][200]['content']['application/json'];
