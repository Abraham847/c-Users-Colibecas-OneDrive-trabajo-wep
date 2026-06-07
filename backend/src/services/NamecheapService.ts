import axios from 'axios';
import { logger } from '../utils/logger';

// ============================================
// NAMECHEAP API - Registro de dominios real
// Docs: https://www.namecheap.com/support/api/methods/
// ============================================

const NAMECHEAP_API = 'https://api.namecheap.com/xml.response';

function getConfig() {
  return {
    apiUser: process.env.NAMECHEAP_API_USER || '',
    apiKey: process.env.NAMECHEAP_API_KEY || '',
    clientIp: process.env.NAMECHEAP_CLIENT_IP || '127.0.0.1',
    sandbox: process.env.NAMECHEAP_SANDBOX === 'true',
  };
}

async function namecheapRequest(command: string, params: Record<string, string> = {}) {
  const config = getConfig();
  const url = new URL(NAMECHEAP_API);
  url.searchParams.set('ApiUser', config.apiUser);
  url.searchParams.set('ApiKey', config.apiKey);
  url.searchParams.set('UserName', config.apiUser);
  url.searchParams.set('ClientIp', config.clientIp);
  url.searchParams.set('Command', command);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  try {
    const response = await axios.get(url.toString(), { timeout: 30000 });
    return response.data;
  } catch (error: any) {
    logger.error(`Namecheap API error (${command}):`, error.message);
    throw new Error(`Namecheap API error: ${error.message}`);
  }
}

// Verificar disponibilidad de dominio
export async function checkDomainAvailability(domain: string): Promise<{
  domain: string;
  available: boolean;
  price: number;
  registrar: string;
}> {
  const sld = domain.split('.')[0];
  const tld = domain.split('.').slice(1).join('.');
  const price = getDomainPrice(tld);

  try {
    const result = await namecheapRequest('namecheap.domains.check', {
      DomainList: domain,
    });
    const available = result.includes('IsAvailable="true"') || result.includes('true');
    return { domain, available, price, registrar: 'namecheap' };
  } catch {
    return { domain, available: true, price, registrar: 'namecheap' };
  }
}

// Registrar dominio
export async function registerDomain(params: {
  domain: string;
  years: number;
  nameservers: string[];
  registrant: { name: string; email: string; address: string; city: string; country: string; postalCode: string; phone: string };
}): Promise<{
  orderId: number;
  domain: string;
  status: string;
  expiryDate: string;
}> {
  const sld = params.domain.split('.')[0];
  const tld = params.domain.split('.').slice(1).join('.');

  try {
    const result = await namecheapRequest('namecheap.domains.create', {
      DomainName: params.domain,
      Years: params.years.toString(),
      Nameservers: params.nameservers.join(','),
      RegistrantFirstName: params.registrant.name.split(' ')[0] || params.registrant.name,
      RegistrantLastName: params.registrant.name.split(' ').slice(1).join(' ') || '.',
      RegistrantEmailAddress: params.registrant.email,
      RegistrantAddress1: params.registrant.address,
      RegistrantCity: params.registrant.city,
      RegistrantCountry: params.registrant.country,
      RegistrantPostalCode: params.registrant.postalCode,
      RegistrantPhone: params.registrant.phone,
      TechFirstName: params.registrant.name.split(' ')[0] || params.registrant.name,
      TechLastName: params.registrant.name.split(' ').slice(1).join(' ') || '.',
      TechEmailAddress: params.registrant.email,
      AdminFirstName: params.registrant.name.split(' ')[0] || params.registrant.name,
      AdminLastName: params.registrant.name.split(' ').slice(1).join(' ') || '.',
      AdminEmailAddress: params.registrant.email,
      AuxBillingFirstName: params.registrant.name.split(' ')[0] || params.registrant.name,
      AuxBillingLastName: params.registrant.name.split(' ').slice(1).join(' ') || '.',
      AuxBillingEmailAddress: params.registrant.email,
    });

    logger.info(`Domain registered: ${params.domain}`);
    return {
      orderId: Date.now(),
      domain: params.domain,
      status: 'registered',
      expiryDate: new Date(Date.now() + params.years * 365 * 24 * 60 * 60 * 1000).toISOString(),
    };
  } catch (error: any) {
    throw new Error(`Domain registration failed: ${error.message}`);
  }
}

// Obtener registros DNS
export async function getDNSRecords(domain: string) {
  const sld = domain.split('.')[0];
  const tld = domain.split('.').slice(1).join('.');

  try {
    const result = await namecheapRequest('namecheap.domains.dns.getHosts', {
      SLD: sld,
      TLD: tld,
    });
    return result;
  } catch {
    return [];
  }
}

// Actualizar registros DNS
export async function updateDNSRecords(domain: string, records: Array<{
  type: string;
  hostname: string;
  address: string;
  ttl: number;
  mxPref?: string;
}>) {
  const sld = domain.split('.')[0];
  const tld = domain.split('.').slice(1).join('.');

  const hosts = records.map((r, i) => ({
    HostType: r.type,
    HostName: r.hostname,
    Address: r.address,
    TTL: r.ttl.toString(),
    MXPref: r.mxPref || (i + 10).toString(),
  }));

  try {
    await namecheapRequest('namecheap.domains.dns.setHosts', {
      SLD: sld,
      TLD: tld,
      ...Object.fromEntries(hosts.flatMap((h, i) => [
        [`HostType${i + 1}`, h.HostType],
        [`HostName${i + 1}`, h.HostName],
        [`Address${i + 1}`, h.Address],
        [`TTL${i + 1}`, h.TTL],
        [`MXPref${i + 1}`, h.MXPref],
      ])),
    });
    return true;
  } catch {
    return false;
  }
}

// Renovar dominio
export async function renewDomain(domain: string, years: number = 1) {
  const sld = domain.split('.')[0];
  const tld = domain.split('.').slice(1).join('.');

  try {
    await namecheapRequest('namecheap.domains.renew', {
      DomainName: domain,
      Years: years.toString(),
    });
    return true;
  } catch {
    return false;
  }
}

// Obtener precios de dominios
export function getDomainPrice(tld: string): number {
  const prices: Record<string, number> = {
    'com': 8.88, 'net': 10.98, 'org': 7.98, 'io': 32.98, 'dev': 11.98,
    'app': 11.98, 'ai': 49.98, 'cloud': 9.98, 'tech': 9.98, 'store': 14.98,
    'xyz': 1.98, 'co': 9.98, 'info': 2.98, 'online': 2.98, 'site': 2.98,
    'blog': 3.98, 'shop': 2.98, 'website': 2.98, 'space': 2.98,
  };
  return prices[tld] || 9.98;
}

// Transferir dominio
export async function transferDomain(domain: string, authCode: string) {
  const sld = domain.split('.')[0];
  const tld = domain.split('.').slice(1).join('.');

  try {
    await namecheapRequest('namecheap.domains.transfer.create', {
      DomainName: domain,
      EPPCode: authCode,
    });
    return true;
  } catch {
    return false;
  }
}

// Obtener TLDs disponibles
export function getAvailableTLDs() {
  return [
    { tld: 'com', name: '.com', price: 8.88, popular: true },
    { tld: 'net', name: '.net', price: 10.98, popular: true },
    { tld: 'org', name: '.org', price: 7.98, popular: true },
    { tld: 'io', name: '.io', price: 32.98, popular: true },
    { tld: 'dev', name: '.dev', price: 11.98 },
    { tld: 'app', name: '.app', price: 11.98 },
    { tld: 'ai', name: '.ai', price: 49.98, popular: true },
    { tld: 'cloud', name: '.cloud', price: 9.98 },
    { tld: 'tech', name: '.tech', price: 9.98 },
    { tld: 'store', name: '.store', price: 14.98 },
    { tld: 'xyz', name: '.xyz', price: 1.98 },
    { tld: 'co', name: '.co', price: 9.98 },
    { tld: 'online', name: '.online', price: 2.98 },
    { tld: 'site', name: '.site', price: 2.98 },
    { tld: 'blog', name: '.blog', price: 3.98 },
  ];
}
