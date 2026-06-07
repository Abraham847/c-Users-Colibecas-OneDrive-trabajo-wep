import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';
import { getDomainPrice, checkDomainAvailability, getAvailableTLDs } from '../services/NamecheapService';
import { logger } from '../utils/logger';

const router = Router();

// Check domain availability (real)
router.get('/domain/check/:domain', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await checkDomainAvailability(req.params.domain);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get available TLDs
router.get('/domain/tlds', (req, res) => {
  res.json({ success: true, data: getAvailableTLDs() });
});

export default router;
