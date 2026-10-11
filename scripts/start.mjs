import { loadEnvFile } from 'node:process';

try {
  loadEnvFile();
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
process.env.PORT ||= '5173';
process.env.HOST ||= '127.0.0.1';
await import('../dist/server/entry.mjs');
