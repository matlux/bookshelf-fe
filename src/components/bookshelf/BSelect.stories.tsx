import type { Meta, StoryObj } from '@storybook/react-vite';
import { BSelect } from './BSelect';

const meta = {
  title: 'Bookshelf/Components/BSelect',
  component: BSelect,
  args: {
    id: 'authors',
    label: 'Author',
    value: 'all',
    onChange: () => {},
    options: [
      { value: 'all', label: 'All authors' },
      { value: '1', label: 'Ursula K. Le Guin' },
    ],
  },
} satisfies Meta<typeof BSelect>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
