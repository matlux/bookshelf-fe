import type { Meta, StoryObj } from '@storybook/react-vite';
import { BBadge } from './BBadge';

const meta = {
  title: 'Bookshelf/Components/BBadge',
  component: BBadge,
  args: { children: 'Fresh', tone: 'good' },
} satisfies Meta<typeof BBadge>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
