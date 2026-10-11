import type { Meta, StoryObj } from '@storybook/react-vite';
import { BButton } from './BButton';

const meta = {
  title: 'Bookshelf/Components/BButton',
  component: BButton,
  args: { children: 'Add book' },
} satisfies Meta<typeof BButton>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
