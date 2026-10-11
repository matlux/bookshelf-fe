import type { Meta, StoryObj } from '@storybook/react-vite';
import { BTable } from './BTable';

const meta = {
  title: 'Bookshelf/Components/BTable',
  component: BTable,
  args: {
    caption: 'Books',
    headers: [
      { id: 'title', content: 'Title' },
      { id: 'author', content: 'Author' },
    ],
    rows: [
      {
        id: '1',
        cells: [
          { id: 'title', content: 'Kindred' },
          { id: 'author', content: 'Octavia E. Butler' },
        ],
      },
    ],
  },
} satisfies Meta<typeof BTable>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
