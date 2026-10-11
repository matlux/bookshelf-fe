import type { Meta, StoryObj } from '@storybook/react-vite';
import { BConfirm } from './BConfirm';

const meta = {
  title: 'Bookshelf/Components/BConfirm',
  component: BConfirm,
  args: {
    open: true,
    onOpenChange: () => {},
    title: 'Delete this book?',
    description: 'This action cannot be undone.',
    onConfirm: () => {},
  },
} satisfies Meta<typeof BConfirm>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
