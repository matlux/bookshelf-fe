import type { Meta, StoryObj } from '@storybook/react-vite';
import { BDialog } from './BDialog';

const meta = {
  title: 'Bookshelf/Components/BDialog',
  component: BDialog,
  args: {
    open: true,
    onOpenChange: () => {},
    title: 'Add a book',
    description: 'Give a new story a home.',
    children: 'Book form content',
  },
} satisfies Meta<typeof BDialog>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
