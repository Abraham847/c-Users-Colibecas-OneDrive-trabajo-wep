import { config } from './config';
import { connectDatabase } from './config/database';
import { Plan } from './models/Plan';
import { User } from './models/User';
import { CodeAuthService } from './services/CodeAuthService';
import { logger } from './utils/logger';

const plansData = [
  {
    name: 'Gratis', type: 'shared', tier: 'free', price: 0, interval: 'monthly',
    features: { 'Almacenamiento SSD': '1 GB', 'Sitios Web': 1, 'Base de Datos': 1, 'SSL Gratis': true, 'CDN': true },
    resources: { cpu: 1, ram: 256, storage: 1073741824, bandwidth: 10737418240, websites: 1, databases: 1, emails: 0, subdomains: 5 },
    position: 1, popular: true, active: true,
  },
];

export async function seedPlans() {
  const count = await Plan.countDocuments();
  if (count > 0) return;
  await Plan.insertMany(plansData);
  logger.info(`Seeded ${plansData.length} plans`);
}

const ADMIN_CODE_ID = 'admin-cloudhost';

export async function seedAdmin() {
  const exists = await User.findOne({ codeId: ADMIN_CODE_ID });
  if (exists) return;
  const user = await User.create({
    email: 'admin@admin.com',
    password: '12345678',
    name: 'Admin CloudHost',
    role: 'superadmin',
    emailVerified: true,
    codeId: ADMIN_CODE_ID,
  });
  const adminCode = await CodeAuthService.createCodeForUser(ADMIN_CODE_ID, 'Admin CloudHost');
  logger.info(`Admin user created. Código de acceso para admin: ${adminCode}`);
}

export async function seedTestUsers() {
}

async function seed() {
  try {
    await connectDatabase();
    await seedPlans();
    await seedAdmin();
    logger.info('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Seed error:', error);
    process.exit(1);
  }
}

const isMainModule = process.argv[1]?.includes('seed');
if (isMainModule) seed();
