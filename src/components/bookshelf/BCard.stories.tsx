import type { Meta, StoryObj } from '@storybook/react-vite';
import { BCard } from './BCard';

const meta = {
  title: 'Bookshelf/Components/BCard',
  component: BCard,
  args: {
    title: 'Your collection',
    description: 'A place for every story.',
    children: 'Four books, three authors.',
  },
} satisfies Meta<typeof BCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
