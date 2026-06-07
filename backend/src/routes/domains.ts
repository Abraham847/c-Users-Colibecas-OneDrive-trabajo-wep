import { Router, Request, Response } from 'express';
import { DomainService } from '../services/DomainService';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

router.get('/tlds', async (_req: Request, res: Response) => {
  try {
    const tlds = await DomainService.getTlds();
    res.json({ success: true, data: tlds });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/search', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { domain } = req.query;
    if (!domain) {
      res.status(400).json({ success: false, error: 'Dominio requerido' });
      return;
    }
    const results = await DomainService.searchDomain(domain as string);
    res.json({ success: true, data: results });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/register', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { domain, period } = req.body;
    const result = await DomainService.register(req.user!.id, domain, period);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
});

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const domains = await DomainService.getDomainsByUser(req.user!.id);
    res.json({ success: true, data: domains });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const domain = await DomainService.getDomainById(req.user!.id, req.params.id);
    res.json({ success: true, data: domain });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
});

router.put('/:id/nameservers', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const domain = await DomainService.updateNameservers(req.user!.id, req.params.id, req.body.nameservers);
    res.json({ success: true, data: domain });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
});

router.put('/:id/privacy', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const domain = await DomainService.togglePrivacy(req.user!.id, req.params.id);
    res.json({ success: true, data: domain });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
});

router.put('/:id/autorenew', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const domain = await DomainService.toggleAutoRenew(req.user!.id, req.params.id);
    res.json({ success: true, data: domain });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
});

export default router;
