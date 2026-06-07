import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { createServer } from 'http';
import { config } from './config';
import { connectDatabase } from './config/database';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';
import { setupWebSocket } from './websocket';
import { FileService } from './services/FileService';
import deployRoutes, { serveSite } from './services/DeployService';
import { seedPlans, seedAdmin, seedTestUsers } from './seed';
import { logger } from './utils/logger';
import routes from './routes';

const app = express();
const httpServer = createServer(app);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: [config.frontendUrl, 'https://cloudhostprueba.duckdns.org', 'https://abraham847.github.io'], credentials: true }));
app.use(compression());
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
app.use(generalLimiter);

app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

FileService.initialize();

app.get('/', (req, res) => {
  res.json({ name: 'CloudHost API', version: '1.0.0', status: 'running' });
});

app.use('/api', routes);

app.use('/api/deployments', deployRoutes);

app.get('/site/:siteId', serveSite);
app.get('/site/:siteId/*', serveSite);

app.use('/uploads', express.static('uploads'));

app.use(notFoundHandler);
app.use(errorHandler);

const io = setupWebSocket(httpServer);

async function start() {
  try {
    await connectDatabase();

    await seedPlans();
    await seedAdmin();
    await seedTestUsers();

    httpServer.listen(config.port, () => {
      logger.info(`CloudHost API running on port ${config.port}`);
      logger.info(`Environment: ${config.env}`);
      logger.info(`Frontend URL: ${config.frontendUrl}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

export { app, httpServer, io };
