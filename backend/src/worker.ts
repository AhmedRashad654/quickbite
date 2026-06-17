import 'reflect-metadata';
import http from 'http';
import { attachWsServer } from './lib/webSocket/ws-server.js';
import { container } from './lib/di/container.js';
import { TOKENS } from './lib/di/tokens.js';
import { Logger } from './lib/logger/logger.js';
import { startAll, stopAll } from './lib/jobs/scheduler.js';
import { registerAssignmentJobs } from './app/assignment/jobs.js';

const noopServer = http.createServer();
const io = attachWsServer(noopServer);
container.registerInstance(TOKENS.WsServer, io);
const logger = container.resolve<Logger>(TOKENS.Logger);

registerAssignmentJobs();

async function main() {
  noopServer.listen(0, () => {
    logger.info('Worker background HTTP server running');
  });
  logger.info('Starting Assignment Background Workers...');
  startAll();
}

async function shutdown() {
  logger.info('Worker shutdown requested, cleaning up...');
  await stopAll();
  try {
    await io.close();
  } catch (err) {
    logger.error('Error closing Socket.io', { err });
  }
  noopServer.close(() => {
    logger.info('Worker process exited cleanly.');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 5_000).unref();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

main().catch((err) => {
  logger.error('Worker boot failed', { error: (err as Error).message });
  process.exit(1);
});
