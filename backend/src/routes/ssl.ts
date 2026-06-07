import { Router, Request, Response } from 'express';
import { SSLService } from '../services/SSLService';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

router.post('/request/:domainId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await SSLService.requestSSL(req.params.domainId, req.user!.id);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
});

router.post('/renew/:domainId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await SSLService.renewSSL(req.params.domainId, req.user!.id);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
});

router.get('/status/:domainId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await SSLService.getSSLStatus(req.params.domainId, req.user!.id);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
});

router.post('/hosting/:planId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await SSLService.enableSSL(req.params.planId, req.user!.id);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
});

export default router;
