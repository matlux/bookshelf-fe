import type { Meta, StoryObj } from '@storybook/react-vite';
import { BSkeleton } from './BSkeleton';

const meta = {
  title: 'Bookshelf/Components/BSkeleton',
  component: BSkeleton,
  args: {},
} satisfies Meta<typeof BSkeleton>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
