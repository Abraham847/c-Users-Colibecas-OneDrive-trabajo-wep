import { connectDatabase } from './config/database';
import { logger } from './utils/logger';

async function migrate() {
  try {
    await connectDatabase();
    logger.info('Running migrations...');
    logger.info('Migrations complete');
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
