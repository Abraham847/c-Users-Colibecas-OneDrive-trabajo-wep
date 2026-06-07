import { Router, Request, Response } from 'express';
import { PaymentService } from '../services/PaymentService';
import { logger } from '../utils/logger';

const router = Router();

router.post('/stripe', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    const result = await PaymentService.handleStripeWebhook(signature, req.body);
    res.json(result);
  } catch (error: any) {
    logger.error('Stripe webhook error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/paypal', async (req: Request, res: Response) => {
  try {
    logger.info('PayPal webhook received:', req.body.event_type);
    res.json({ received: true });
  } catch (error: any) {
    logger.error('PayPal webhook error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
