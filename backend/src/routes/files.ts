import { Router, Request, Response } from 'express';
import path from 'path';
import multer from 'multer';
import { FileService } from '../services/FileService';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

router.get('/list', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const dir = (req.query.dir as string) || '';
    const files = await FileService.listFiles(req.user!.id, dir);
    res.json({ success: true, data: files });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/directory', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { dir, name } = req.body;
    const result = await FileService.createDirectory(req.user!.id, dir || '', name);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
});

router.post('/upload', authenticate, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const userDir = FileService.userDir(userId);
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, userDir),
    filename: (_req, file, cb) => cb(null, Buffer.from(file.originalname, 'latin1').toString('utf8').replace(/\\/g, '/')),
  });
  const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });
  upload.array('files', 100)(req, res, (err: any) => {
    if (err) return res.status(400).json({ success: false, error: err.message });
    const files = (req.files as Express.Multer.File[]) || [];
    res.json({ success: true, data: { files: files.map(f => ({ filename: f.filename, size: f.size })) } });
  });
});

router.post('/upload-zip', authenticate, async (req: AuthRequest, res: Response) => {
  const upload = FileService.getUploader(`users/${req.user!.id}`);
  upload.single('file')(req, res, async (err) => {
    if (err) {
      res.status(400).json({ success: false, error: err.message });
      return;
    }
    if (!req.file) {
      res.status(400).json({ success: false, error: 'Archivo requerido' });
      return;
    }
    try {
      const userId = (req as AuthRequest).user!.id;
      const destDir = path.join('users', userId, req.body.dest || path.parse(req.file.originalname).name);
      const result = await FileService.uploadAndExtract(path.join('users', userId, req.file.filename), destDir);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
  });
});

router.get('/read', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const filePath = req.query.path as string;
    if (!filePath) {
      res.status(400).json({ success: false, error: 'Ruta requerida' });
      return;
    }
    const content = await FileService.readFile(req.user!.id, filePath);
    res.json({ success: true, data: { content } });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
});

router.post('/write', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { path: filePath, content } = req.body;
    const result = await FileService.writeFile(req.user!.id, filePath, content);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
});

router.delete('/delete', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const filePath = req.query.path as string;
    if (!filePath) {
      res.status(400).json({ success: false, error: 'Ruta requerida' });
      return;
    }
    const result = await FileService.deleteFile(req.user!.id, filePath);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
});

export default router;
