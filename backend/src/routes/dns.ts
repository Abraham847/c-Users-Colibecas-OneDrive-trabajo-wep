import { Router, Request, Response } from 'express';
import { DNSService } from '../services/DNSService';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

router.get('/:domain', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const records = await DNSService.getRecords(req.params.domain);
    res.json({ success: true, data: records });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
});

router.post('/:domain/records', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const dns = await DNSService.addRecord(req.user!.id, req.params.domain, req.body);
    res.status(201).json({ success: true, data: dns });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
});

router.put('/:domain/records/:recordId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const dns = await DNSService.updateRecord(req.user!.id, req.params.domain, req.params.recordId, req.body);
    res.json({ success: true, data: dns });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
});

router.delete('/:domain/records/:recordId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const dns = await DNSService.deleteRecord(req.user!.id, req.params.domain, req.params.recordId);
    res.json({ success: true, data: dns });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
});

export default router;
