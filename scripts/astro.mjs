import { spawn } from 'node:child_process';
import { loadEnvFile } from 'node:process';

try {
  loadEnvFile();
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const child = spawn(
  process.execPath,
  [
    'node_modules/astro/bin/astro.mjs',
    process.argv[2] || 'dev',
    '--host',
    '127.0.0.1',
    '--port',
    process.env.PORT || '5173',
  ],
  { stdio: 'inherit', env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' } },
);
child.on('exit', (code) => process.exit(code ?? 1));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
