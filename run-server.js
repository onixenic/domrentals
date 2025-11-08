import express from 'express';
import { handler as ssrHandler } from './dist/server/entry.mjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function app() {
  const server = express();
  const base = '/';

  // Serve static client files
  server.use(base, express.static(join(__dirname, 'dist/client')));
  server.use(ssrHandler);

  return server;
}
