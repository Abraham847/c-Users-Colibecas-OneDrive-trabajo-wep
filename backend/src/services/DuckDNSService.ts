import axios from 'axios';
import { logger } from '../utils/logger';

const DUCK_API = 'https://www.duckdns.org';

// GitHub Pages IPs (use the first one for A record)
const GITHUB_PAGES_IP = '185.199.108.153';

export async function createOrUpdateDuckDNS(subdomain: string): Promise<{ success: boolean; domain: string; error?: string }> {
  const token = process.env.DUCKDNS_TOKEN || '';

  if (!token) {
    return {
      success: false,
      domain: `${subdomain}.duckdns.org`,
      error: 'DUCKDNS_TOKEN no configurado en .env. Registrate en duckdns.org y obtené tu token.',
    };
  }

  try {
    const { data } = await axios.get(`${DUCK_API}/update`, {
      params: { domains: subdomain, token, ip: GITHUB_PAGES_IP, verbose: true },
      timeout: 15000,
    });

    const lines = (data || '').trim().split('\n');
    const ok = lines[0]?.trim() === 'OK';

    if (ok) {
      logger.info(`DuckDNS ${subdomain}.duckdns.org -> ${GITHUB_PAGES_IP}`);
      return { success: true, domain: `${subdomain}.duckdns.org` };
    }

    return {
      success: false,
      domain: `${subdomain}.duckdns.org`,
      error: `DuckDNS response: ${data}`,
    };
  } catch (error: any) {
    logger.error(`DuckDNS error: ${error.message}`);
    return {
      success: false,
      domain: `${subdomain}.duckdns.org`,
      error: `Error DuckDNS: ${error.message}`,
    };
  }
}
