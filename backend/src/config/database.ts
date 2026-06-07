import fs from 'fs';
import mongoose from 'mongoose';
import Datastore from 'nedb-promises';
import path from 'path';
import { config } from './index';
import { logger } from '../utils/logger';

let usingMemoryServer = false;

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

export const db = {
  emails: Datastore.create({ filename: path.join(DATA_DIR, 'emails.db'), autoload: true }),
  dnsSettings: Datastore.create({ filename: path.join(DATA_DIR, 'dnsSettings.db'), autoload: true }),
  deployments: Datastore.create({ filename: path.join(DATA_DIR, 'deployments.db'), autoload: true }),
  supportTickets: Datastore.create({ filename: path.join(DATA_DIR, 'supportTickets.db'), autoload: true }),
  websites: Datastore.create({ filename: path.join(DATA_DIR, 'websites.db'), autoload: true }),
};

export function isUsingMemoryServer() {
  return usingMemoryServer;
}

export async function connectDatabase(): Promise<void> {
  const useMemory = !config.mongodb.uri || config.mongodb.uri === 'mongodb://localhost:27017/cloudhost';

  if (useMemory) {
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create({ instance: { dbName: 'cloudhost' } });
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      usingMemoryServer = true;
      logger.info(`MongoDB Memory Server started`);
      return;
    } catch (err: any) {
      logger.warn(`MongoDB Memory Server failed: ${err.message}. Trying external MongoDB...`);
    }
  }

  try {
    await mongoose.connect(config.mongodb.uri);
    logger.info('MongoDB connected successfully');
    mongoose.connection.on('error', (err) => logger.error('MongoDB connection error:', err));
    mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}
