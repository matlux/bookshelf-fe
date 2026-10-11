import { z } from 'zod';

const name = z
  .string()
  .trim()
  .min(1, 'Please enter a name.')
  .max(300, 'Use 300 characters or fewer.');
export const authorSchema = z.object({ name });
export const bookSchema = z.object({
  title: z.string().trim().min(1, 'Please enter a title.').max(300, 'Use 300 characters or fewer.'),
  'author-id': z.number().int().positive('Choose an author.').max(Number.MAX_SAFE_INTEGER),
  'published-year': z
    .number()
    .int('Enter a whole year.')
    .min(1, 'Year must be between 1 and 9999.')
    .max(9999, 'Year must be between 1 and 9999.'),
});
export type BookInput = z.infer<typeof bookSchema>;
export type AuthorInput = z.infer<typeof authorSchema>;
