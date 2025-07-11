import Stripe from 'stripe';
import { storage } from './storage';

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-05-28.basil',
});

// Create payment intent for one-time purchases
export async function createPaymentIntent(amount: number, metadata?: Record<string, string>) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata
    });
    
    return { clientSecret: paymentIntent.client_secret };
  } catch (error: any) {
    throw new Error(`Error creating payment intent: ${error.message}`);
  }
}

// Create or retrieve subscription
export async function getOrCreateSubscription(userId: number, email: string, username: string) {
  try {
    const user = await storage.getUser(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // If user already has a subscription, retrieve it
    if (user.stripeSubscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      
      return {
        subscriptionId: subscription.id,
        clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
      };
    }
    
    // Create a customer if one doesn't exist
    let customerId = user.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        name: username,
      });
      
      customerId = customer.id;
    }
    
    // Create a subscription
    if (!process.env.STRIPE_PRICE_ID) {
      throw new Error('Missing required Stripe price ID: STRIPE_PRICE_ID');
    }
    
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{
        price: process.env.STRIPE_PRICE_ID,
      }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });
    
    // Update user with Stripe information
    await storage.updateUserStripeInfo(userId, {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id
    });
    
    return {
      subscriptionId: subscription.id,
      clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
    };
  } catch (error: any) {
    throw new Error(`Error creating subscription: ${error.message}`);
  }
}

// Handle Stripe webhook events
export async function handleWebhookEvent(event: Stripe.Event) {
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        // Handle successful payment
        break;
        
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        // Handle subscription changes
        break;
        
      case 'customer.subscription.deleted':
        // Handle subscription cancellation
        break;
    }
    
    return { received: true };
  } catch (error: any) {
    throw new Error(`Error handling webhook: ${error.message}`);
  }
}
