import fs from 'fs';
import path from 'path';
import multer from 'multer';
import sharp from 'sharp';
import AdmZip from 'adm-zip';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

export class FileService {
  static initialize() {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
  }

  static userDir(userId: string) {
    const dir = path.join(UPLOAD_DIR, 'users', userId);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return dir;
  }

  static getStorage(destination: string = 'general') {
    const dest = path.resolve(UPLOAD_DIR, destination);
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    return multer.diskStorage({
      destination: (req, file, cb) => {
        if (file.fieldname === 'files') {
          const fullPath = path.resolve(dest, file.originalname);
          if (String(fullPath).indexOf(String(dest)) !== 0) return cb(new Error('Ruta inválida'));
          if (!fs.existsSync(path.dirname(fullPath))) fs.mkdirSync(path.dirname(fullPath), { recursive: true });
          cb(null, path.dirname(fullPath));
        } else {
          cb(null, dest);
        }
      },
      filename: (req, file, cb) => {
        if (file.fieldname === 'files') {
          cb(null, path.basename(file.originalname));
        } else {
          cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
        }
      },
    });
  }

  static getUploader(destination?: string, maxSize: number = 50 * 1024 * 1024) {
    return multer({
      storage: this.getStorage(destination),
      limits: { fileSize: maxSize },
      preservePath: true,
    });
  }

  static async listFiles(userId: string, dir: string = '') {
    const targetDir = path.join(this.userDir(userId), dir);
    if (!fs.existsSync(targetDir)) return [];
    const items = fs.readdirSync(targetDir, { withFileTypes: true });
    return items.map(item => {
      const stats = fs.statSync(path.join(targetDir, item.name));
      return {
        name: item.name,
        path: path.join(dir, item.name),
        type: item.isDirectory() ? 'directory' : 'file',
        size: item.isFile() ? stats.size : 0,
        modifiedAt: stats.mtime,
        createdAt: stats.birthtime,
        extension: item.isFile() ? path.extname(item.name) : '',
      };
    }).sort((a, b) => {
      if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }

  static async createDirectory(userId: string, dir: string, name: string) {
    const targetDir = path.join(this.userDir(userId), dir, name);
    if (fs.existsSync(targetDir)) {
      throw new AppError('El directorio ya existe', 400, 'DIR_EXISTS');
    }
    fs.mkdirSync(targetDir, { recursive: true });
    return { message: 'Directorio creado', path: path.join(dir, name) };
  }

  static async deleteFile(userId: string, filePath: string) {
    const fullPath = path.join(this.userDir(userId), filePath);
    if (!fs.existsSync(fullPath)) {
      throw new AppError('Archivo no encontrado', 404, 'FILE_NOT_FOUND');
    }
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(fullPath);
    }
    return { message: 'Archivo eliminado' };
  }

  static async readFile(userId: string, filePath: string) {
    const fullPath = path.join(this.userDir(userId), filePath);
    if (!fs.existsSync(fullPath)) {
      throw new AppError('Archivo no encontrado', 404, 'FILE_NOT_FOUND');
    }
    return fs.readFileSync(fullPath, 'utf-8');
  }

  static async writeFile(userId: string, filePath: string, content: string) {
    const fullPath = path.join(this.userDir(userId), filePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fullPath, content);
    return { message: 'Archivo guardado', path: filePath };
  }

  static async uploadAndExtract(zipPath: string, destDir: string) {
    const fullZipPath = path.join(UPLOAD_DIR, zipPath);
    if (!fs.existsSync(fullZipPath)) {
      throw new AppError('Archivo ZIP no encontrado', 404, 'FILE_NOT_FOUND');
    }
    const targetDir = path.join(UPLOAD_DIR, destDir);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    const zip = new AdmZip(fullZipPath);
    zip.extractAllTo(targetDir, true);
    fs.unlinkSync(fullZipPath);
    const files = fs.readdirSync(targetDir);
    logger.info(`ZIP extracted: ${zipPath} -> ${destDir} (${files.length} items)`);
    return { message: 'Archivos extraídos', path: destDir, items: files.length };
  }

  static async optimizeImage(filePath: string, quality: number = 80) {
    const fullPath = path.join(UPLOAD_DIR, filePath);
    const ext = path.extname(fullPath).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      const outputPath = fullPath.replace(ext, '.webp');
      await sharp(fullPath).webp({ quality }).toFile(outputPath);
      return { original: filePath, optimized: filePath.replace(ext, '.webp') };
    }
    return { original: filePath };
  }
}
