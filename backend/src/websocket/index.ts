import { Server as HTTPServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { logger } from '../utils/logger';
import { AIService } from '../ai/AIService';

export function setupWebSocket(httpServer: HTTPServer) {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: config.frontendUrl,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) {
      return next(new Error('Autenticación requerida'));
    }
    try {
      const decoded = jwt.verify(token as string, config.jwt.secret) as any;
      (socket as any).user = decoded;
      next();
    } catch {
      next(new Error('Token inválido'));
    }
  });

  io.on('connection', (socket) => {
    const user = (socket as any).user;
    logger.info(`WebSocket connected: ${user.email}`);

    socket.join(`user:${user.id}`);

    socket.on('join:hosting', (planId: string) => {
      socket.join(`hosting:${planId}`);
    });

    socket.on('leave:hosting', (planId: string) => {
      socket.leave(`hosting:${planId}`);
    });

    socket.on('join:deployment', (deploymentId: string) => {
      socket.join(`deployment:${deploymentId}`);
    });

    socket.on('server:metrics', (data: { hostingId: string; cpu: number; ram: number; storage: number }) => {
      io.to(`hosting:${data.hostingId}`).emit('metrics:update', data);
    });

    socket.on('deployment:log', (data: { deploymentId: string; log: string }) => {
      io.to(`deployment:${data.deploymentId}`).emit('deployment:log', data.log);
    });

    socket.on('terminal:input', (data: { command: string; sessionId: string }) => {
      io.to(`terminal:${data.sessionId}`).emit('terminal:output', {
        output: `$ ${data.command}\nComando ejecutado en servidor remoto.\n`,
        sessionId: data.sessionId,
      });
    });

    socket.on('ai:chat', async (data: { message: string; context?: any[] }) => {
      try {
        const response = await AIService.chatWithAI(data.message, data.context);
        socket.emit('ai:response', response);
      } catch (error) {
        socket.emit('ai:error', { message: 'Error al procesar mensaje' });
      }
    });

    socket.on('disconnect', () => {
      logger.info(`WebSocket disconnected: ${user.email}`);
    });
  });

  return io;
}
