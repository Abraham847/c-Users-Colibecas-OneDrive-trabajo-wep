import { Domain } from '../models/Domain';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const MAX_DOMAINS = 20;

export class DomainService {
  static async searchDomain(domain: string) {
    const tlds = ['.com', '.net', '.org', '.io', '.dev', '.app', '.ai', '.cloud', '.tech', '.store', '.mx', '.com.mx', '.net.mx', '.org.mx', '.co', '.ar', '.cl', '.pe'];
    const results = [];

    const baseName = domain.replace(/\.[^.]+$/, '').toLowerCase();

    for (const tld of tlds) {
      const fullDomain = `${baseName}${tld}`;
      const existing = await Domain.findOne({ domain: fullDomain });
      results.push({
        domain: fullDomain,
        available: !existing,
        tld,
      });
    }

    return results;
  }

  static async register(userId: string, domain: string, period: number = 1) {
    const existing = await Domain.findOne({ domain: domain.toLowerCase() });
    if (existing) {
      throw new AppError('El dominio ya está registrado', 400, 'DOMAIN_EXISTS');
    }

    const count = await Domain.countDocuments({ userId });
    if (count >= MAX_DOMAINS) {
      throw new AppError(`Has alcanzado el límite de ${MAX_DOMAINS} dominios`, 400, 'DOMAIN_LIMIT');
    }

    const tld = '.' + domain.split('.').pop();

    const domainDoc = await Domain.create({
      userId,
      domain: domain.toLowerCase(),
      tld,
      status: 'active',
      price: 0,
      currency: 'USD',
      registrationDate: new Date(),
      expiryDate: new Date(Date.now() + period * 365 * 24 * 60 * 60 * 1000),
      autoRenew: false,
      nameservers: ['ns1.cloudhost.com', 'ns2.cloudhost.com'],
      privacy: true,
    });

    logger.info(`Domain registered: ${domain} by user ${userId}`);
    return domainDoc;
  }

  static async getDomainsByUser(userId: string) {
    return Domain.find({ userId }).sort({ createdAt: -1 });
  }

  static async getDomainById(userId: string, domainId: string) {
    const domain = await Domain.findOne({ _id: domainId, userId });
    if (!domain) {
      throw new AppError('Dominio no encontrado', 404, 'DOMAIN_NOT_FOUND');
    }
    return domain;
  }

  static async updateNameservers(userId: string, domainId: string, nameservers: string[]) {
    const domain = await Domain.findOneAndUpdate(
      { _id: domainId, userId },
      { nameservers },
      { new: true }
    );
    if (!domain) {
      throw new AppError('Dominio no encontrado', 404, 'DOMAIN_NOT_FOUND');
    }
    return domain;
  }

  static async togglePrivacy(userId: string, domainId: string) {
    const domain = await Domain.findOne({ _id: domainId, userId });
    if (!domain) {
      throw new AppError('Dominio no encontrado', 404, 'DOMAIN_NOT_FOUND');
    }
    domain.privacy = !domain.privacy;
    await domain.save();
    return domain;
  }

  static async toggleAutoRenew(userId: string, domainId: string) {
    const domain = await Domain.findOne({ _id: domainId, userId });
    if (!domain) {
      throw new AppError('Dominio no encontrado', 404, 'DOMAIN_NOT_FOUND');
    }
    domain.autoRenew = !domain.autoRenew;
    await domain.save();
    return domain;
  }

  static async getTlds() {
    return [
      { tld: '.com', description: 'Comercial (global)' },
      { tld: '.net', description: 'Redes (global)' },
      { tld: '.org', description: 'Organizaciones (global)' },
      { tld: '.io', description: 'Tecnología / startups' },
      { tld: '.dev', description: 'Desarrolladores' },
      { tld: '.app', description: 'Aplicaciones' },
      { tld: '.ai', description: 'Inteligencia Artificial' },
      { tld: '.cloud', description: 'Cloud / Nube' },
      { tld: '.tech', description: 'Tecnología' },
      { tld: '.store', description: 'Tiendas online' },
      { tld: '.mx', description: 'México' },
      { tld: '.com.mx', description: 'Comercial México' },
      { tld: '.net.mx', description: 'Redes México' },
      { tld: '.org.mx', description: 'Organizaciones México' },
      { tld: '.co', description: 'Colombia' },
      { tld: '.ar', description: 'Argentina' },
      { tld: '.cl', description: 'Chile' },
      { tld: '.pe', description: 'Perú' },
    ];
  }
}
