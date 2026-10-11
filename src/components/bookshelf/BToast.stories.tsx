import type { Meta, StoryObj } from '@storybook/react-vite';
import { BToast } from './BToast';

const meta = { title: 'Bookshelf/Components/BToast', component: BToast, args: {} } satisfies Meta<
  typeof BToast
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
