import http from 'http';
import { createApp } from './app.js';
import { env } from './lib/config/env.js';
import { db } from './lib/knex/knex.js';
import { logger } from './lib/logger/logger.js';

const app = createApp();
const server = http.createServer(app);

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
