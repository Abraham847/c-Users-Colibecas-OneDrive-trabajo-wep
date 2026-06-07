import { Router, Request, Response } from 'express';
import path from 'path';
import { FileService } from '../services/FileService';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

router.get('/list', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const dir = (req.query.dir as string) || '';
    const files = await FileService.listFiles(dir);
    res.json({ success: true, data: files });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/directory', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { dir, name } = req.body;
    const result = await FileService.createDirectory(dir || '', name);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
});

router.post('/upload', authenticate, (req: AuthRequest, res: Response) => {
  const upload = FileService.getUploader('');
  const cb = upload.array('files', 100);
  cb(req, res, async (err: any) => {
    if (err) {
      res.status(400).json({ success: false, error: err.message });
      return;
    }
    const files = (req.files as Express.Multer.File[]) || [];
    const result = files.map(f => ({ filename: f.filename, path: f.path.replace(/\\/g, '/') }));
    res.json({ success: true, data: { files: result } });
  });
});

router.post('/upload-zip', authenticate, async (req: AuthRequest, res: Response) => {
  const upload = FileService.getUploader('__temp__');
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
      const destDir = req.body.dest || path.parse(req.file.originalname).name;
      const result = await FileService.uploadAndExtract(path.join('__temp__', req.file.filename), destDir);
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
    const content = await FileService.readFile(filePath);
    res.json({ success: true, data: { content } });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
});

router.post('/write', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { path: filePath, content } = req.body;
    const result = await FileService.writeFile(filePath, content);
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
    const result = await FileService.deleteFile(filePath);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
});

export default router;
