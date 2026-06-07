import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import jwt from 'jsonwebtoken';
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
app.use(cors({
  origin: [config.frontendUrl, 'http://localhost:5173', 'https://cloudhostprueba.duckdns.org'],
  credentials: true,
}));
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

app.use('/uploads', authenticateUploads, express.static('uploads'));

function authenticateUploads(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.query.token as string || req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No autorizado' });
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as jwt.JwtPayload;
    const userPath = req.path.startsWith('/users/');
    if (userPath) {
      const userIdFromPath = req.path.split('/')[2];
      if (decoded.id !== userIdFromPath) return res.status(403).json({ error: 'Acceso denegado' });
    }
    next();
  } catch { res.status(401).json({ error: 'Token inválido' }); }
}

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
