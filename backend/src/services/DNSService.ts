import { DNSSetting } from '../models/DNSSetting';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class DNSService {
  static async getRecords(domain: string) {
    const dns = await DNSSetting.findOne({ domain: domain.toLowerCase() });
    if (!dns) {
      return this.createDefaultRecords(domain);
    }
    return dns;
  }

  static async createDefaultRecords(domain: string) {
    const records = [
      { type: 'A' as const, name: '@', value: '127.0.0.1', ttl: 3600, status: 'active' as const },
      { type: 'A' as const, name: 'www', value: '127.0.0.1', ttl: 3600, status: 'active' as const },
      { type: 'CNAME' as const, name: 'mail', value: 'mail.cloudhost.com', ttl: 3600, status: 'active' as const },
      { type: 'MX' as const, name: '@', value: 'mail.cloudhost.com', ttl: 3600, priority: 10, status: 'active' as const },
      { type: 'TXT' as const, name: '@', value: 'v=spf1 include:_spf.cloudhost.com ~all', ttl: 3600, status: 'active' as const },
    ];

    const dns = await DNSSetting.create({ domain, records });
    return dns;
  }

  static async addRecord(userId: string, domain: string, record: {
    type: string;
    name: string;
    value: string;
    ttl?: number;
    priority?: number;
  }) {
    const dns = await DNSSetting.findOne({ domain: domain.toLowerCase() });
    if (!dns) {
      throw new AppError('Registro DNS no encontrado', 404, 'DNS_NOT_FOUND');
    }

    dns.records.push({
      type: record.type as any,
      name: record.name,
      value: record.value,
      ttl: record.ttl || 3600,
      priority: record.priority,
      status: 'active',
    });

    await dns.save();
    return dns;
  }

  static async updateRecord(userId: string, domain: string, recordId: string, data: Partial<{
    type: string; name: string; value: string; ttl: number; priority: number;
  }>) {
    const dns = await DNSSetting.findOne({ domain: domain.toLowerCase() });
    if (!dns) {
      throw new AppError('Registro DNS no encontrado', 404, 'DNS_NOT_FOUND');
    }

    const record = dns.records.id(recordId);
    if (!record) {
      throw new AppError('Registro no encontrado', 404, 'RECORD_NOT_FOUND');
    }

    Object.assign(record, data);
    await dns.save();
    return dns;
  }

  static async deleteRecord(userId: string, domain: string, recordId: string) {
    const dns = await DNSSetting.findOne({ domain: domain.toLowerCase() });
    if (!dns) {
      throw new AppError('Registro DNS no encontrado', 404, 'DNS_NOT_FOUND');
    }

    dns.records = dns.records.filter(r => r._id?.toString() !== recordId);
    await dns.save();
    return dns;
  }

  static async validateDNS(domain: string, type: string, value: string) {
    const dns = await DNSSetting.findOne({ domain: domain.toLowerCase() });
    if (!dns) return false;
    return dns.records.some(r => r.type === type && r.value === value);
  }
}
