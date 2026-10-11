import node from '@astrojs/node';
import react from '@astrojs/react';
import { defineConfig } from 'astro/config';
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [react()],
  server: { host: '127.0.0.1', port: Number(process.env.PORT || 5173) },
  vite: { define: { 'process.env.STORYBOOK_DISABLE_TELEMETRY': 'true' } },
});
