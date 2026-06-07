import axios from 'axios';
import { logger } from '../utils/logger';

// ============================================
// HETZNER CLOUD API - Servidores VPS reales
// Docs: https://docs.hetzner.cloud/
// ============================================

const HETZNER_API = 'https://api.hetzner.cloud/v1';

function getToken() {
  return process.env.HETZNER_API_TOKEN || '';
}

function getClient() {
  return axios.create({
    baseURL: HETZNER_API,
    headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
    timeout: 30000,
  });
}

export interface HetznerServer {
  id: number;
  name: string;
  status: string;
  server_type: { name: string; description: string; cores: number; memory: number; disk: number };
  public_net: { ipv4: { ip: string }; ipv6: { ip: string } | null };
  image: { name: string };
  created_at: string;
}

// Planos de Hetzner reales
export const HETZNER_PLANS: Record<string, { type: string; name: string; cores: number; memory: number; disk: number; price: number }> = {
  'cx22': { type: 'cx22', name: 'Hetzner 2GB', cores: 2, memory: 2048, disk: 40, price: 5.29 },
  'cx32': { type: 'cx32', name: 'Hetzner 4GB', cores: 4, memory: 4096, disk: 80, price: 11.49 },
  'cx42': { type: 'cx42', name: 'Hetzner 8GB', cores: 8, memory: 8192, disk: 160, price: 22.49 },
  'cx52': { type: 'cx52', name: 'Hetzner 16GB', cores: 16, memory: 16384, disk: 320, price: 44.99 },
};

// Crear servidor VPS real
export async function createHetznerServer(params: {
  name: string;
  type: string;         // cx22, cx32, etc.
  image: string;        // ubuntu-22.04
  sshKeys?: number[];
  location?: string;    // fsn1, nbg1, hel1
  userData?: string;
}): Promise<HetznerServer> {
  const client = getClient();
  try {
    const response = await client.post('/servers', {
      name: params.name,
      server_type: params.type,
      image: params.image || 'ubuntu-22.04',
      ssh_keys: params.sshKeys || [],
      location: params.location || 'fsn1',
      start_after_create: true,
      user_data: params.userData || '',
    });
    const server = response.data.server;
    logger.info(`Hetzner server created: ${server.name} (${server.id}) - IP: ${server.public_net.ipv4.ip}`);
    return server;
  } catch (error: any) {
    logger.error('Hetzner server creation failed:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'Error creating Hetzner server');
  }
}

// Listar servidores
export async function listHetznerServers(): Promise<HetznerServer[]> {
  const client = getClient();
  try {
    const response = await client.get('/servers');
    return response.data.servers;
  } catch (error: any) {
    logger.error('Hetzner list servers failed:', error.message);
    return [];
  }
}

// Obtener servidor por ID
export async function getHetznerServer(serverId: number): Promise<HetznerServer | null> {
  const client = getClient();
  try {
    const response = await client.get(`/servers/${serverId}`);
    return response.data.server;
  } catch (error: any) {
    logger.error('Hetzner get server failed:', error.message);
    return null;
  }
}

// Apagar servidor
export async function shutdownHetznerServer(serverId: number): Promise<boolean> {
  const client = getClient();
  try {
    await client.post(`/servers/${serverId}/actions/poweroff`);
    return true;
  } catch (error: any) {
    logger.error('Hetzner shutdown failed:', error.message);
    return false;
  }
}

// Encender servidor
export async function startHetznerServer(serverId: number): Promise<boolean> {
  const client = getClient();
  try {
    await client.post(`/servers/${serverId}/actions/poweron`);
    return true;
  } catch (error: any) {
    logger.error('Hetzner start failed:', error.message);
    return false;
  }
}

// Reiniciar servidor
export async function rebootHetznerServer(serverId: number): Promise<boolean> {
  const client = getClient();
  try {
    await client.post(`/servers/${serverId}/actions/reboot`);
    return true;
  } catch (error: any) {
    logger.error('Hetzner reboot failed:', error.message);
    return false;
  }
}

// Eliminar servidor
export async function deleteHetznerServer(serverId: number): Promise<boolean> {
  const client = getClient();
  try {
    await client.delete(`/servers/${serverId}`);
    logger.info(`Hetzner server ${serverId} deleted`);
    return true;
  } catch (error: any) {
    logger.error('Hetzner delete failed:', error.message);
    return false;
  }
}

// Obtener IPs disponibles
export async function getHetznerIPs() {
  const client = getClient();
  try {
    const response = await client.get('/ips');
    return response.data.ips;
  } catch (error: any) {
    return [];
  }
}

// Obtener ubicaciones
export async function getHetznerLocations() {
  const client = getClient();
  try {
    const response = await client.get('/locations');
    return response.data.locations;
  } catch (error: any) {
    return [];
  }
}

// Obtener tipos de servidor
export async function getHetznerServerTypes() {
  const client = getClient();
  try {
    const response = await client.get('/server_types');
    return response.data.server_types;
  } catch (error: any) {
    return [];
  }
}

// User data script para instalar nginx + php + mysql
export function generateServerUserData(options: {
  nginx?: boolean;
  php?: boolean;
  mysql?: boolean;
  nodejs?: boolean;
  python?: boolean;
} = {}): string {
  const packages: string[] = ['curl', 'wget', 'git', 'unzip'];
  if (options.nginx) packages.push('nginx');
  if (options.php) packages.push('php-fpm', 'php-mysql', 'php-curl', 'php-gd', 'php-mbstring', 'php-xml');
  if (options.mysql) packages.push('mysql-server');
  if (options.nodejs) packages.push('nodejs', 'npm');
  if (options.python) packages.push('python3', 'python3-pip');

  return `#!/bin/bash
apt-get update
apt-get install -y ${packages.join(' ')}

# Create web directory
mkdir -p /var/www/html
chown -R www-data:www-data /var/www/html

# Nginx config
if command -v nginx &> /dev/null; then
cat > /etc/nginx/sites-available/default <<'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    root /var/www/html;
    index index.html index.htm index.nginx-debian.html;
    server_name _;
    location / {
        try_files $uri $uri/ =404;
    }
}
EOF
systemctl restart nginx
fi

# MySQL setup
if command -v mysql &> /dev/null; then
mysql -e "CREATE DATABASE IF NOT EXISTS cloudhost_db;"
mysql -e "CREATE USER IF NOT EXISTS 'cloudhost_user'@'localhost' IDENTIFIED BY '$(openssl rand -base64 16)';"
mysql -e "GRANT ALL PRIVILEGES ON cloudhost_db.* TO 'cloudhost_user'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"
fi

echo "CloudHost server setup complete" > /root/setup-complete.txt
date >> /root/setup-complete.txt`;
}
