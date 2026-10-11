import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.tsx'],
  framework: '@storybook/react-vite',
  addons: ['@storybook/addon-vitest'],
  staticDirs: ['../public'],
  core: { disableTelemetry: true },
  viteFinal: async (config) => ({
    ...config,
    optimizeDeps: {
      ...config.optimizeDeps,
      include: [...(config.optimizeDeps?.include || []), 'msw-storybook-addon/csf3', 'msw/browser'],
    },
    resolve: {
      ...config.resolve,
      alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) },
    },
  }),
};
export default config;
