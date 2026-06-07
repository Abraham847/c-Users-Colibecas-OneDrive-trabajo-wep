import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

const GITHUB_API = 'https://api.github.com';

function getConfig() {
  return {
    token: process.env.GITHUB_TOKEN || '',
    username: process.env.GITHUB_USERNAME || '',
  };
}

function getHeaders() {
  const { token } = getConfig();
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };
}

async function ensureRepo(owner: string, repoName: string): Promise<boolean> {
  try {
    await axios.get(`${GITHUB_API}/repos/${owner}/${repoName}`, { headers: getHeaders() });
    return true;
  } catch {
    try {
      await axios.post(`${GITHUB_API}/user/repos`, { name: repoName, private: false, auto_init: true }, { headers: getHeaders() });
      logger.info(`GitHub repo created: ${owner}/${repoName}`);
      return true;
    } catch (error: any) {
      logger.error(`Failed to create GitHub repo: ${error.message}`);
      return false;
    }
  }
}

async function getDefaultBranch(owner: string, repo: string): Promise<string> {
  try {
    const { data } = await axios.get(`${GITHUB_API}/repos/${owner}/${repo}`, { headers: getHeaders() });
    return data.default_branch || 'main';
  } catch {
    return 'main';
  }
}

async function pushFiles(owner: string, repo: string, branch: string, sourceDir: string, repoPath: string = ''): Promise<boolean> {
  const files: string[] = [];

  function walkDir(dir: string) {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        walkDir(fullPath);
      } else {
        files.push(fullPath);
      }
    }
  }

  if (!fs.existsSync(sourceDir)) {
    logger.error(`Source directory not found: ${sourceDir}`);
    return false;
  }

  walkDir(sourceDir);

  for (const filePath of files) {
    const relativePath = path.relative(sourceDir, filePath).replace(/\\/g, '/');
    const apiPath = repoPath ? `${repoPath}/${relativePath}` : relativePath;
    const content = fs.readFileSync(filePath);
    const base64Content = content.toString('base64');

    try {
      let sha: string | undefined;
      try {
        const { data } = await axios.get(`${GITHUB_API}/repos/${owner}/${repo}/contents/${apiPath}`, {
          headers: { ...getHeaders(), Accept: 'application/vnd.github.v3+json' },
          params: { ref: branch },
        });
        sha = data.sha;
      } catch { }

      await axios.put(`${GITHUB_API}/repos/${owner}/${repo}/contents/${apiPath}`, {
        message: `Add ${relativePath}`,
        content: base64Content,
        sha,
        branch,
      }, { headers: getHeaders() });

      logger.debug(`Pushed ${relativePath} to ${owner}/${repo}`);
    } catch (error: any) {
      logger.error(`Failed to push ${relativePath}: ${error.message}`);
      return false;
    }
  }

  return true;
}

async function enablePages(owner: string, repo: string, branch: string = 'main'): Promise<boolean> {
  try {
    await axios.post(`${GITHUB_API}/repos/${owner}/${repo}/pages`, {
      source: { branch, path: '/' },
    }, { headers: getHeaders() });
    logger.info(`GitHub Pages enabled for ${owner}/${repo}`);
    return true;
  } catch (error: any) {
    if (error.response?.status === 409) {
      // Pages already enabled
      return true;
    }
    // For 404 or other errors, pages might already be configured
    if (error.response?.status === 404) {
      // GitHub Pages API may not be available on free accounts with 2FA
      // The repo still has the files, user can enable manually
      logger.warn(`GitHub Pages API returned 404 for ${owner}/${repo}. User may need to enable manually.`);
      return true;
    }
    logger.error(`Failed to enable GitHub Pages: ${error.message}`);
    return false;
  }
}

async function setCustomDomainRepo(owner: string, repo: string, domain: string): Promise<boolean> {
  try {
    await axios.put(`${GITHUB_API}/repos/${owner}/${repo}/pages`, {
      cname: domain,
      source: { branch: 'main', path: '/' },
    }, { headers: getHeaders() });
    logger.info(`Custom domain ${domain} set for ${owner}/${repo}`);
    return true;
  } catch (error: any) {
    logger.error(`Failed to set custom domain: ${error.message}`);
    return true;
  }
}

export async function deployToGitHubPages(sourceDir: string, projectName: string, customDomain?: string): Promise<{ success: boolean; url: string; error?: string }> {
  const { token, username } = getConfig();

  if (!token || !username) {
    return { success: false, url: '', error: 'GITHUB_TOKEN y GITHUB_USERNAME requeridos en .env' };
  }

  const repoName = projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'site';

  const repoExists = await ensureRepo(username, repoName);
  if (!repoExists) {
    return { success: false, url: '', error: 'No se pudo crear el repositorio en GitHub' };
  }

  const branch = await getDefaultBranch(username, repoName);

  const pushed = await pushFiles(username, repoName, branch, sourceDir);
  if (!pushed) {
    return { success: false, url: '', error: 'Error al subir archivos a GitHub' };
  }

  await enablePages(username, repoName, branch);

  let url = `https://${username}.github.io/${repoName}`;

  if (customDomain) {
    await setCustomDomainRepo(username, repoName, customDomain);
    url = `https://${customDomain}`;
  }

  return { success: true, url };
}
