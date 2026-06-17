import 'reflect-metadata';
import http from 'http';
import { createApp } from './app.js';
import { env } from './lib/config/env.js';
import { db } from './lib/knex/knex.js';
import { TOKENS } from './lib/di/tokens.js';
import { container } from '../src/lib/di/container.js';
import { attachWsServer } from './lib/webSocket/ws-server.js';
import { logger } from './lib/logger/logger.js';

const app = createApp();
const server = http.createServer(app);

const io = attachWsServer(server);
container.registerInstance(TOKENS.WsServer, io);

server.listen(env.port, () => {
  logger.info(`Server listening on ${env.port}`);
});

async function shutdown() {
  server.close(async () => {
    console.log('application shutdown');
    await db.destroy();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
