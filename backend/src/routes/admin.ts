import { Router, Request, Response } from 'express';
import { User } from '../models/User';
import { HostingPlan } from '../models/HostingPlan';
import { Domain } from '../models/Domain';
import { SupportTicket } from '../models/SupportTicket';
import { authenticate, requireAdmin } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/dashboard', async (req: AuthRequest, res: Response) => {
  try {
    const [users, plans, domains, tickets] = await Promise.all([
      User.countDocuments(),
      HostingPlan.countDocuments({ status: 'active' }),
      Domain.countDocuments({ status: 'active' }),
      SupportTicket.countDocuments({ status: { $ne: 'closed' } }),
    ]);

    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      data: {
        stats: { users, plans, domains, tickets },
        recentUsers,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await User.countDocuments();
    res.json({
      success: true,
      data: users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      return;
    }
    const [domains, hostingPlans] = await Promise.all([
      Domain.find({ userId: user._id }),
      HostingPlan.find({ userId: user._id }),
    ]);
    res.json({ success: true, data: { user, domains, hostingPlans } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) {
      res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      return;
    }
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/plans', async (req: AuthRequest, res: Response) => {
  try {
    const plans = await HostingPlan.find().populate('userId', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, data: plans });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/plans/:id/suspend', async (req: AuthRequest, res: Response) => {
  try {
    const plan = await HostingPlan.findByIdAndUpdate(req.params.id, { status: 'suspended' }, { new: true });
    res.json({ success: true, data: plan });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/tickets', async (req: AuthRequest, res: Response) => {
  try {
    const tickets = await SupportTicket.find().populate('userId', 'name email').sort({ updatedAt: -1 });
    res.json({ success: true, data: tickets });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/tickets/:id', async (req: AuthRequest, res: Response) => {
  try {
    const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: ticket });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
