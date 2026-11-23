import { getUncachableStripeClient } from './stripeClient';
import { db } from './db';
import { sql } from 'drizzle-orm';

export class StripeService {
  async createCustomer(email: string, userId: string) {
    const stripe = await getUncachableStripeClient();
    return await stripe.customers.create({
      email,
      metadata: { userId },
    });
  }

  async createPaymentIntent(amount: number, customerId: string, metadata: Record<string, string>) {
    const stripe = await getUncachableStripeClient();
    return await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      customer: customerId,
      metadata,
      automatic_payment_methods: { enabled: true },
    });
  }

  async createCheckoutSession(
    customerId: string, 
    priceId: string, 
    mode: 'payment' | 'subscription',
    successUrl: string, 
    cancelUrl: string,
    metadata?: Record<string, string>
  ) {
    const stripe = await getUncachableStripeClient();
    return await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
    });
  }

  async getProduct(productId: string) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.products WHERE id = ${productId}`
    );
    return result.rows[0] || null;
  }

  async listProducts() {
    const result = await db.execute(
      sql`SELECT * FROM stripe.products WHERE active = true`
    );
    return result.rows;
  }

  async listProductsWithPrices() {
    const result = await db.execute(
      sql`
        SELECT 
          p.id as product_id,
          p.name as product_name,
          p.description as product_description,
          p.metadata as product_metadata,
          pr.id as price_id,
          pr.unit_amount,
          pr.currency,
          pr.recurring
        FROM stripe.products p
        LEFT JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
        WHERE p.active = true
        ORDER BY p.name, pr.unit_amount
      `
    );
    return result.rows;
  }

  async getPrice(priceId: string) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.prices WHERE id = ${priceId}`
    );
    return result.rows[0] || null;
  }
}

export const stripeService = new StripeService();
