import { Router, Request, Response } from 'express';
import { HostingService } from '../services/HostingService';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

router.get('/plans', async (req: Request, res: Response) => {
  try {
    const { type } = req.query;
    const plans = await HostingService.getAvailablePlans(type as string);
    res.json({ success: true, data: plans });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/subscribe', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { planId, interval } = req.body;
    const plan = await HostingService.createPlan(req.user!.id, planId, interval);
    res.status(201).json({ success: true, data: plan });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
});

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const plans = await HostingService.getUserPlans(req.user!.id);
    res.json({ success: true, data: plans });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const plan = await HostingService.getPlanById(req.user!.id, req.params.id);
    res.json({ success: true, data: plan });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
});

router.put('/:id/cancel', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const plan = await HostingService.cancelPlan(req.user!.id, req.params.id);
    res.json({ success: true, data: plan });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
});

router.get('/:id/websites', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const websites = await HostingService.getWebsites(req.user!.id);
    res.json({ success: true, data: websites });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/websites', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const website = await HostingService.createWebsite(req.user!.id, req.body);
    res.status(201).json({ success: true, data: website });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
});

export default router;
