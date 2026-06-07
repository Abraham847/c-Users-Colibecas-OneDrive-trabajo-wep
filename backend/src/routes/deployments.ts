import { Router, Request, Response } from 'express';
import { Deployment } from '../models/Deployment';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const deployments = await Deployment.find({ userId: req.user!.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: deployments });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const deployment = await Deployment.create({ ...req.body, userId: req.user!.id });
    res.status(201).json({ success: true, data: deployment });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const deployment = await Deployment.findOne({ _id: req.params.id, userId: req.user!.id });
    if (!deployment) {
      res.status(404).json({ success: false, error: 'Despliegue no encontrado' });
      return;
    }
    res.json({ success: true, data: deployment });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:id/deploy', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const deployment = await Deployment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.id },
      { status: 'deploying' },
      { new: true }
    );
    if (!deployment) {
      res.status(404).json({ success: false, error: 'Despliegue no encontrado' });
      return;
    }

    setTimeout(async () => {
      await Deployment.findByIdAndUpdate(deployment._id, { status: 'success' });
    }, 5000);

    res.json({ success: true, data: deployment });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/github-webhook', async (req: Request, res: Response) => {
  try {
    const { repository, ref } = req.body;
    const branch = ref?.replace('refs/heads/', '');
    const deployments = await Deployment.find({
      repository: repository?.clone_url,
      branch,
      autoDeploy: true,
    });
    for (const dep of deployments) {
      dep.status = 'deploying';
      await dep.save();
    }
    res.json({ received: true, deploymentsMatched: deployments.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
