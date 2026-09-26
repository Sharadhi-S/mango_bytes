import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApiServer } from './server.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const server = createApiServer();
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
