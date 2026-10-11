import type { Meta, StoryObj } from '@storybook/react-vite';
import { delay, HttpResponse, http } from 'msw';
import { expect } from 'storybook/test';
import { handlers } from '../../../mocks/handlers';
import { defaultFilters } from '../../../stores/books';
import BooksIsland from './Books';

const meta = {
  title: 'Bookshelf/Features/Books',
  component: BooksIsland,
  args: { initial: defaultFilters },
} satisfies Meta<typeof BooksIsland>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Collection: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.findByText('A Wizard of Earthsea')).resolves.toBeVisible();
  },
};
export const Empty: Story = {
  args: { initial: { ...defaultFilters, title: 'unmatched' } },
  play: async ({ canvas }) => {
    await expect(canvas.findByText('No matching books')).resolves.toBeVisible();
  },
};
export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/v1/books', async () => {
          await delay('infinite');
          return HttpResponse.json([]);
        }),
        ...handlers,
      ],
    },
  },
};
export const Unavailable: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.findByText('The library is temporarily unavailable.', {}, { timeout: 4000 }),
    ).resolves.toBeVisible();
  },
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/v1/books', () =>
          HttpResponse.json({ error: 'The library is temporarily unavailable.' }, { status: 503 }),
        ),
        ...handlers,
      ],
    },
  },
};
