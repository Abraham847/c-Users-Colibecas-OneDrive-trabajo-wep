import { Router, Request, Response } from 'express';
import { PaymentService } from '../services/PaymentService';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

router.post('/stripe/create-intent', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { amount, currency, metadata } = req.body;
    const result = await PaymentService.createStripePaymentIntent(amount, currency, metadata);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
});

router.post('/stripe/confirm', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const payment = await PaymentService.confirmStripePayment(req.body.paymentIntentId, req.user!.id);
    res.json({ success: true, data: payment });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
});

router.post('/paypal/create-order', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { amount, currency } = req.body;
    const order = await PaymentService.createPayPalOrder(amount, currency);
    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/paypal/capture', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const payment = await PaymentService.capturePayPalOrder(req.body.orderId, req.user!.id);
    res.json({ success: true, data: payment });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
});

router.get('/history', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const history = await PaymentService.getPaymentHistory(req.user!.id);
    res.json({ success: true, data: history });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
