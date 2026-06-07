import fs from 'fs';
import path from 'path';
import Datastore from 'nedb-promises';
import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';
import { DomainService } from './DomainService';
import { deployToGitHubPages } from './GitHubService';
import { createOrUpdateDuckDNS } from './DuckDNSService';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const DEPLOYMENTS_DIR = path.join(process.cwd(), 'uploads', 'deployments');
const SITES_DIR = path.join(process.cwd(), 'uploads', 'sites');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Initialize dirs
ensureDir(DEPLOYMENTS_DIR);
ensureDir(SITES_DIR);

const deploymentStore = Datastore.create({ filename: path.join(DEPLOYMENTS_DIR, 'deployments.db'), autoload: true });

function copyDirSync(src: string, dest: string) {
  ensureDir(dest);
  const items = fs.readdirSync(src, { withFileTypes: true });
  for (const item of items) {
    const srcPath = path.join(src, item.name);
    const destPath = path.join(dest, item.name);
    if (item.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Deploy a project
export async function deployProject(userId: string, projectName: string, sourceDir: string) {
  const siteId = uuidv4();
  const slug = projectName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  const siteDir = path.join(SITES_DIR, siteId);

  // Copy files from source to site directory
  const sourcePath = path.join(UPLOAD_DIR, sourceDir);
  if (!fs.existsSync(sourcePath)) {
    throw new Error('Directorio fuente no encontrado');
  }

  copyDirSync(sourcePath, siteDir);

  const deployment = {
    _id: siteId,
    userId,
    name: projectName,
    slug,
    sourceDir,
    siteDir,
    url: `/site/${siteId}`,
    publicUrl: `http://localhost:5000/site/${siteId}`,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    customDomain: null,
    ssl: true,
    views: 0,
  };

  await deploymentStore.insert(deployment);
  return deployment;
}

// Get deployments for a user
export async function getDeployments(userId: string) {
  return deploymentStore.find({ userId }).sort({ createdAt: -1 });
}

// Get a single deployment
export async function getDeployment(id: string) {
  return deploymentStore.findOne({ _id: id });
}

// Delete a deployment
export async function deleteDeployment(id: string) {
  const deployment = await deploymentStore.findOne({ _id: id });
  if (deployment) {
    const siteDir = path.join(SITES_DIR, id);
    if (fs.existsSync(siteDir)) {
      fs.rmSync(siteDir, { recursive: true, force: true });
    }
    await deploymentStore.remove({ _id: id });
  }
  return deployment;
}

// Redeploy (update from source)
export async function redeploy(id: string) {
  const deployment = await deploymentStore.findOne({ _id: id });
  if (!deployment) throw new Error('Despliegue no encontrado');

  const siteDir = path.join(SITES_DIR, id);
  const sourcePath = path.join(UPLOAD_DIR, deployment.sourceDir);

  if (fs.existsSync(siteDir)) {
    fs.rmSync(siteDir, { recursive: true, force: true });
  }
  copyDirSync(sourcePath, siteDir);

  await deploymentStore.update({ _id: id }, { $set: { updatedAt: new Date() } });
  return deploymentStore.findOne({ _id: id });
}

// Increment views
export async function incrementViews(id: string) {
  await deploymentStore.update({ _id: id }, { $inc: { views: 1 } });
}

// Set custom domain
export async function setCustomDomain(id: string, domain: string) {
  await deploymentStore.update({ _id: id }, { $set: { customDomain: domain, publicUrl: `http://${domain}`, updatedAt: new Date() } });
  return deploymentStore.findOne({ _id: id });
}

// API Routes
const router = Router();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const deployments = await getDeployments(req.user!.id);
    res.json({ success: true, data: deployments });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, sourceDir, domain, tld, target } = req.body;

    if (target === 'github') {
      const sourcePath = path.join(UPLOAD_DIR, sourceDir);
      if (!fs.existsSync(sourcePath)) {
        res.status(400).json({ success: false, error: 'Directorio fuente no encontrado' });
        return;
      }

      let customDomain: string | undefined;
      if (domain && tld === 'duckdns') {
        const subdomain = domain.toLowerCase().replace(/[^a-z0-9-]/g, '-');
        const duck = await createOrUpdateDuckDNS(subdomain);
        if (duck.success) customDomain = duck.domain;
      } else if (domain && tld) {
        const fullDomain = `${domain}${tld}`;
        customDomain = fullDomain;
      }

      const result = await deployToGitHubPages(sourcePath, name, customDomain);
      if (result.success) {
        res.status(201).json({ success: true, data: {
          name, sourceDir,
          publicUrl: customDomain ? `https://${customDomain}` : result.url,
          status: 'active', target: 'github', customDomain: customDomain || null,
        }});
      } else {
        res.status(500).json({ success: false, error: result.error || 'Error al desplegar en GitHub Pages' });
      }
      return;
    }

    if (!name || !sourceDir) {
      res.status(400).json({ success: false, error: 'Nombre y directorio fuente requeridos' });
      return;
    }
    const deployment = await deployProject(req.user!.id, name, sourceDir);

    if (domain && tld) {
      const fullDomain = `${domain}${tld}`;
      try {
        const result = await DomainService.register(req.user!.id, fullDomain, 1);
        await setCustomDomain(deployment._id, result.domain);
        deployment.customDomain = result.domain;
        deployment.publicUrl = `http://${result.domain}`;
      } catch {
        await setCustomDomain(deployment._id, fullDomain);
        deployment.customDomain = fullDomain;
        deployment.publicUrl = `http://${fullDomain}`;
      }
    }

    res.status(201).json({ success: true, data: deployment });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const deployment = await getDeployment(req.params.id);
    if (!deployment || deployment.userId !== req.user!.id) {
      res.status(404).json({ success: false, error: 'No encontrado' });
      return;
    }
    res.json({ success: true, data: deployment });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:id/redeploy', async (req: AuthRequest, res: Response) => {
  try {
    const deployment = await redeploy(req.params.id);
    res.json({ success: true, data: deployment });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    await deleteDeployment(req.params.id);
    res.json({ success: true, message: 'Despliegue eliminado' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id/domain', async (req: AuthRequest, res: Response) => {
  try {
    const deployment = await setCustomDomain(req.params.id, req.body.domain);
    res.json({ success: true, data: deployment });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve deployed sites
export function serveSite(req: Request, res: Response) {
  const { siteId } = req.params;
  const siteDir = path.join(SITES_DIR, siteId);

  if (!fs.existsSync(siteDir)) {
    res.status(404).send(`
      <html><body style="font-family:sans-serif;background:#0a0a1a;color:#fff;display:flex;justify-content:center;align-items:center;height:100vh;margin:0">
        <div style="text-align:center"><h1>404</h1><p>Sitio no encontrado</p></div>
      </body></html>
    `);
    return;
  }

  incrementViews(siteId).catch(() => {});

  const reqPath = req.path === '/' ? '/index.html' : req.path;
  const filePath = path.join(siteDir, reqPath);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    // Try index.html
    const indexPath = path.join(siteDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
      return;
    }
    res.status(404).send(`
      <html><body style="font-family:sans-serif;background:#0a0a1a;color:#fff;display:flex;justify-content:center;align-items:center;height:100vh;margin:0">
        <div style="text-align:center"><h1>404</h1><p>Archivo no encontrado</p></div>
      </body></html>
    `);
    return;
  }

  res.sendFile(filePath);
}

export default router;
