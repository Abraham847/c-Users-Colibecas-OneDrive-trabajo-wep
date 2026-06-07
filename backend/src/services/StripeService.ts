import Stripe from 'stripe';
import { logger } from '../utils/logger';

// ============================================
// STRIPE - Pagos reales
// Docs: https://docs.stripe.com/
// ============================================

let stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY no configurada. Ve a https://dashboard.stripe.com para obtenerla.');
    stripe = new Stripe(key, { apiVersion: '2024-11-20.acacia' });
  }
  return stripe;
}

// Crear cliente Stripe para un usuario
export async function createStripeCustomer(email: string, name: string): Promise<Stripe.Customer> {
  const s = getStripe();
  const customer = await s.customers.create({ email, name });
  logger.info(`Stripe customer created: ${customer.id} (${email})`);
  return customer;
}

// Crear sesión de pago único
export async function createPaymentSession(params: {
  amount: number;           // en centavos
  currency: string;
  customerId?: string;
  email: string;
  productName: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}): Promise<{ sessionId: string; url: string }> {
  const s = getStripe();
  const session = await s.checkout.sessions.create({
    mode: 'payment',
    customer: params.customerId || undefined,
    customer_email: params.customerId ? undefined : params.email,
    line_items: [{
      price_data: {
        currency: params.currency,
        product_data: { name: params.productName },
        unit_amount: params.amount,
      },
      quantity: 1,
    }],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata || {},
  });
  logger.info(`Stripe checkout session created: ${session.id}`);
  return { sessionId: session.id, url: session.url! };
}

// Crear suscripción con Stripe
export async function createSubscription(params: {
  customerId: string;
  priceId?: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  productName: string;
  metadata?: Record<string, string>;
}): Promise<{ subscriptionId: string; clientSecret: string }> {
  const s = getStripe();

  // Crear precio
  const price = await s.prices.create({
    unit_amount: params.amount,
    currency: params.currency,
    recurring: { interval: params.interval },
    product: { name: params.productName },
  });

  // Crear suscripción
  const subscription = await s.subscriptions.create({
    customer: params.customerId,
    items: [{ price: price.id }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
    metadata: params.metadata || {},
  });

  const invoice = subscription.latest_invoice as Stripe.Invoice;
  const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

  logger.info(`Stripe subscription created: ${subscription.id}`);
  return {
    subscriptionId: subscription.id,
    clientSecret: paymentIntent.client_secret || '',
  };
}

// Cancelar suscripción
export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  const s = getStripe();
  try {
    await s.subscriptions.cancel(subscriptionId);
    logger.info(`Stripe subscription cancelled: ${subscriptionId}`);
    return true;
  } catch (error: any) {
    logger.error('Stripe cancel failed:', error.message);
    return false;
  }
}

// Verificar pago por session ID
export async function verifyPayment(sessionId: string): Promise<{
  paid: boolean;
  amount: number;
  currency: string;
  customerId?: string;
  subscriptionId?: string;
} | null> {
  const s = getStripe();
  try {
    const session = await s.checkout.sessions.retrieve(sessionId);
    return {
      paid: session.payment_status === 'paid',
      amount: session.amount_total || 0,
      currency: session.currency || 'usd',
      customerId: session.customer as string || undefined,
      subscriptionId: session.subscription as string || undefined,
    };
  } catch (error: any) {
    logger.error('Stripe verify failed:', error.message);
    return null;
  }
}

// Webhook de Stripe
export async function handleWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      logger.info(`Payment completed: ${session.id}`);
      return { type: 'payment', sessionId: session.id, paid: true };
    }
    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice;
      logger.info(`Invoice paid: ${invoice.id}`);
      return { type: 'subscription_payment', invoiceId: invoice.id };
    }
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      logger.info(`Subscription updated: ${subscription.id} - ${subscription.status}`);
      return { type: 'subscription_update', subscriptionId: subscription.id, status: subscription.status };
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      logger.info(`Subscription cancelled: ${subscription.id}`);
      return { type: 'subscription_cancel', subscriptionId: subscription.id };
    }
    default:
      return { type: 'unknown', eventType: event.type };
  }
}

// Obtener balance de la cuenta
export async function getBalance() {
  const s = getStripe();
  const balance = await s.balance.retrieve();
  return balance;
}

// Reembolsar pago
export async function refundPayment(paymentIntentId: string, amount?: number): Promise<boolean> {
  const s = getStripe();
  try {
    await s.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount,
    });
    return true;
  } catch (error: any) {
    logger.error('Stripe refund failed:', error.message);
    return false;
  }
}

// Public key para el frontend
export function getPublicKey(): string {
  return process.env.STRIPE_PUBLISHABLE_KEY || '';
}
