import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { expect } from 'storybook/test';
import { getRollup } from '../../../api/queries/books.api';
import { RollupChart } from './RollupChart';

function MockChart() {
  const query = useQuery({ queryKey: ['story-rollup'], queryFn: () => getRollup() });
  return query.data ? <RollupChart rows={query.data} /> : <p>Loading snapshot…</p>;
}
const meta = {
  title: 'Bookshelf/Components/RollupChart',
  component: RollupChart,
  args: { rows: [] },
  render: () => (
    <QueryClientProvider client={new QueryClient()}>
      <MockChart />
    </QueryClientProvider>
  ),
} satisfies Meta<typeof RollupChart>;
export default meta;
export const Snapshot: StoryObj<typeof meta> = {
  play: async ({ canvas }) => {
    await expect(canvas.findByRole('img', { name: /Books per author/ })).resolves.toBeVisible();
    await expect(canvas.findByText('Ursula K. Le Guin')).resolves.toBeVisible();
  },
};
