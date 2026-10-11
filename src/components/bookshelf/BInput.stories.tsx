import type { Meta, StoryObj } from '@storybook/react-vite';
import { BInput } from './BInput';

const meta = {
  title: 'Bookshelf/Components/BInput',
  component: BInput,
  args: { id: 'title', label: 'Book title', placeholder: 'A Wizard of Earthsea' },
} satisfies Meta<typeof BInput>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
