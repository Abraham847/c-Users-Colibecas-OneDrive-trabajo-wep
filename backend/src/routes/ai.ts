import { Router, Request, Response } from 'express';
import { AIService } from '../ai/AIService';
import { authenticate, optionalAuth } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

router.post('/generate-website', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { prompt, style } = req.body;
    if (!prompt) {
      res.status(400).json({ success: false, error: 'Descripción requerida' });
      return;
    }
    const result = await AIService.generateWebsite(prompt, style);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/chat', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { message, context } = req.body;
    if (!message) {
      res.status(400).json({ success: false, error: 'Mensaje requerido' });
      return;
    }
    const result = await AIService.chatWithAI(message, context);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/generate-dns', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { domain, type } = req.body;
    const config = await AIService.generateDNSConfig(domain, type || 'basic');
    res.json({ success: true, data: { config } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/analyze-code', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { code, language } = req.body;
    const result = await AIService.analyzeCode(code, language || 'javascript');
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/detect-errors', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { logs } = req.body;
    const errors = await AIService.detectErrors(logs);
    res.json({ success: true, data: errors });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
