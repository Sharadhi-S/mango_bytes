import { spawn } from 'node:child_process';
import { existsSync, unlinkSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApiServer } from './server.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const dataDir = resolve(root, '.data');
const databasePath = resolve(dataDir, 'shramasetu.sqlite');

// Prototype mode: every fresh `npm run dev` session starts from clean demo data.
// This intentionally resets assignments, accepted tenders, sessions and other temporary state.
if (process.env.PERSIST_DEMO_STATE !== 'true') {
  for (const suffix of ['', '-wal', '-shm']) {
    const file = databasePath + suffix;
    if (existsSync(file)) unlinkSync(file);
  }
}

const server = createApiServer({ databasePath });
const apiPort = Number(process.env.API_PORT || 3001);

server.listen(apiPort, '127.0.0.1', () => {
  console.log(`ShramaSetu API listening on http://localhost:${apiPort}`);
  const vitePath = resolve(root, 'node_modules/vite/bin/vite.js');
  const vite = spawn(process.execPath, [vitePath], { cwd: root, stdio: 'inherit' });

  vite.on('error', (error) => {
    console.error('Could not start Vite:', error);
    process.exitCode = 1;
    server.close();
  });
  vite.on('exit', (code) => {
    process.exitCode = code ?? 0;
    server.close();
  });

  const shutdown = () => {
    vite.kill('SIGTERM');
    server.close();
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
});
