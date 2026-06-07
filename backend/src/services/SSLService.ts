import { Domain } from '../models/Domain';
import { HostingPlan } from '../models/HostingPlan';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class SSLService {
  static async requestSSL(domainId: string, userId: string) {
    const domain = await Domain.findOne({ _id: domainId, userId });
    if (!domain) {
      throw new AppError('Dominio no encontrado', 404, 'DOMAIN_NOT_FOUND');
    }

    domain.ssl.enabled = true;
    domain.ssl.status = 'pending';
    await domain.save();

    this.generateCertificate(domain.domain).then(cert => {
      domain.ssl.status = 'issued';
      domain.ssl.certificate = cert.certificate;
      domain.ssl.issuer = 'CloudHost CA';
      domain.ssl.expiryDate = new Date(Date.now() + 90 * 24 * 3600 * 1000);
      domain.save();
    }).catch(err => {
      domain.ssl.status = 'expired';
      domain.save();
      logger.error(`SSL generation failed for ${domain.domain}:`, err);
    });

    return domain;
  }

  static async renewSSL(domainId: string, userId: string) {
    const domain = await Domain.findOne({ _id: domainId, userId });
    if (!domain) {
      throw new AppError('Dominio no encontrado', 404, 'DOMAIN_NOT_FOUND');
    }

    domain.ssl.status = 'pending';
    await domain.save();
    return domain;
  }

  static async getSSLStatus(domainId: string, userId: string) {
    const domain = await Domain.findOne({ _id: domainId, userId });
    if (!domain) {
      throw new AppError('Dominio no encontrado', 404, 'DOMAIN_NOT_FOUND');
    }
    return domain.ssl;
  }

  private static async generateCertificate(domain: string): Promise<{ certificate: string; privateKey: string }> {
    return {
      certificate: `-----BEGIN CERTIFICATE-----\nMOCK_CERTIFICATE_${domain}\n-----END CERTIFICATE-----`,
      privateKey: `-----BEGIN PRIVATE KEY-----\nMOCK_KEY_${domain}\n-----END PRIVATE KEY-----`,
    };
  }

  static async enableSSL(hostingPlanId: string, userId: string) {
    const plan = await HostingPlan.findOne({ _id: hostingPlanId, userId });
    if (!plan) {
      throw new AppError('Plan de hosting no encontrado', 404, 'HOSTING_NOT_FOUND');
    }

    plan.ssl.enabled = true;
    plan.ssl.status = 'pending';
    await plan.save();
    return plan;
  }

  static async checkExpiringSSL() {
    const thirtyDays = new Date(Date.now() + 30 * 24 * 3600 * 1000);
    const expiringDomains = await Domain.find({
      'ssl.enabled': true,
      'ssl.expiryDate': { $lte: thirtyDays, $gte: new Date() },
    });

    for (const domain of expiringDomains) {
      logger.info(`SSL expiring soon for ${domain.domain}`);
    }

    return expiringDomains;
  }
}
