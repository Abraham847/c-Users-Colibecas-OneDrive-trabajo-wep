import { Router, Request, Response } from 'express';
import { SupportTicket } from '../models/SupportTicket';
import { authenticate } from '../middleware/auth';
import { AIService } from '../ai/AIService';
import { AuthRequest } from '../types';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tickets = await SupportTicket.find({ userId: req.user!.id }).sort({ updatedAt: -1 });
    res.json({ success: true, data: tickets });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const ticket = await SupportTicket.create({
      userId: req.user!.id,
      ...req.body,
      messages: [{
        sender: req.user!.id,
        senderRole: 'user',
        message: req.body.message,
        createdAt: new Date(),
      }],
    });

    try {
      const aiResponse = await AIService.chatWithAI(req.body.message);
      if (aiResponse.message) {
        ticket.messages.push({
          sender: req.user!.id,
          senderRole: 'ai',
          message: aiResponse.message,
          createdAt: new Date(),
        });
        await ticket.save();
      }
    } catch {
      // AI not available, ticket still created
    }

    res.status(201).json({ success: true, data: ticket });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const ticket = await SupportTicket.findOne({ _id: req.params.id, userId: req.user!.id });
    if (!ticket) {
      res.status(404).json({ success: false, error: 'Ticket no encontrado' });
      return;
    }
    res.json({ success: true, data: ticket });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:id/messages', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const ticket = await SupportTicket.findOne({ _id: req.params.id, userId: req.user!.id });
    if (!ticket) {
      res.status(404).json({ success: false, error: 'Ticket no encontrado' });
      return;
    }

    ticket.messages.push({
      sender: req.user!.id,
      senderRole: 'user',
      message: req.body.message,
      attachments: req.body.attachments,
      createdAt: new Date(),
    });
    ticket.status = 'open';
    await ticket.save();

    res.json({ success: true, data: ticket });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id/close', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const ticket = await SupportTicket.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.id },
      { status: 'closed', resolvedAt: new Date(), rating: req.body.rating },
      { new: true }
    );
    res.json({ success: true, data: ticket });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
