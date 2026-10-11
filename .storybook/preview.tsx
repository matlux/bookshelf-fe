import type { Preview } from '@storybook/react-vite';
import { mswLoader } from 'msw-storybook-addon/csf3';
import { handlers } from '../src/mocks/handlers';
import '../src/styles/global.css';

const preview: Preview = {
  loaders: [mswLoader()],
  parameters: {
    layout: 'padded',
    msw: { handlers },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 1100, margin: '20px auto' }}>
        <Story />
      </div>
    ),
  ],
};
export default preview;
