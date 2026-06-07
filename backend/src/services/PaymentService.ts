import Stripe from 'stripe';
import { config } from '../config';
import { Payment } from '../models/Payment';
import { Subscription } from '../models/Subscription';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class PaymentService {
  private static stripe: Stripe | null = null;

  private static getStripe(): Stripe {
    if (!this.stripe) {
      if (!config.stripe.secretKey) {
        throw new AppError('Stripe no configurado', 500, 'STRIPE_NOT_CONFIGURED');
      }
      this.stripe = new Stripe(config.stripe.secretKey, { apiVersion: '2024-11-20.acacia' });
    }
    return this.stripe;
  }

  static async createStripePaymentIntent(amount: number, currency: string, metadata: Record<string, any>) {
    const stripe = this.getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      metadata,
      automatic_payment_methods: { enabled: true },
    });
    return { clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id };
  }

  static async confirmStripePayment(paymentIntentId: string, userId: string) {
    const stripe = this.getStripe();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      const payment = await Payment.create({
        userId,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        provider: 'stripe',
        status: 'completed',
        providerPaymentId: paymentIntentId,
        description: paymentIntent.description || 'Pago en CloudHost',
        metadata: paymentIntent.metadata,
      });
      return payment;
    }
    throw new AppError('Pago no completado', 400, 'PAYMENT_NOT_COMPLETED');
  }

  static async createPayPalOrder(amount: number, currency: string) {
    return { id: `PAYPAL_${Date.now()}`, amount, currency };
  }

  static async capturePayPalOrder(orderId: string, userId: string) {
    const payment = await Payment.create({
      userId,
      amount: 0,
      currency: 'USD',
      provider: 'paypal',
      status: 'completed',
      providerPaymentId: orderId,
      description: 'Pago vía PayPal en CloudHost',
    });
    return payment;
  }

  static async handleStripeWebhook(signature: string, body: Buffer) {
    const stripe = this.getStripe();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, config.stripe.webhookSecret);
    } catch (err) {
      throw new AppError('Firma de webhook inválida', 400, 'INVALID_SIGNATURE');
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
      case 'invoice.payment_succeeded':
        await this.handleInvoicePayment(event.data.object as Stripe.Invoice);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDelete(event.data.object as Stripe.Subscription);
        break;
    }

    return { received: true };
  }

  private static async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    logger.info(`Payment succeeded: ${paymentIntent.id}`);
  }

  private static async handleInvoicePayment(invoice: Stripe.Invoice) {
    logger.info(`Invoice payment succeeded: ${invoice.id}`);
  }

  private static async handleSubscriptionUpdate(subscription: Stripe.Subscription) {
    await Subscription.findOneAndUpdate(
      { providerSubscriptionId: subscription.id },
      { status: subscription.status as any }
    );
  }

  private static async handleSubscriptionDelete(subscription: Stripe.Subscription) {
    await Subscription.findOneAndUpdate(
      { providerSubscriptionId: subscription.id },
      { status: 'canceled' }
    );
  }

  static async getPaymentHistory(userId: string) {
    return Payment.find({ userId }).sort({ createdAt: -1 });
  }
}
