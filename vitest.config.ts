import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

const root = fileURLToPath(new URL('.', import.meta.url));
export default defineConfig({
  resolve: { alias: { '@': `${root}src` } },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['src/**/*.test.{ts,tsx}'],
          environment: 'jsdom',
          environmentOptions: { jsdom: { url: 'http://localhost:5173' } },
          setupFiles: ['./src/mocks/test-setup.ts'],
        },
      },
      {
        extends: true,
        plugins: [storybookTest({ configDir: `${root}.storybook` })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
