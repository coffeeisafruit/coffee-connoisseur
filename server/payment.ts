import Stripe from "stripe";
import { ENV } from "./_core/env";

let stripeInstance: Stripe | null = null;

export function getStripeInstance(): Stripe | null {
  if (!ENV.stripeSecretKey) {
    return null;
  }
  
  if (!stripeInstance) {
    stripeInstance = new Stripe(ENV.stripeSecretKey, {
      apiVersion: "2024-12-18.acacia",
    });
  }
  
  return stripeInstance;
}

export async function createCheckoutSession(originUrl: string): Promise<{ url: string | null }> {
  const stripe = getStripeInstance();
  
  if (!stripe) {
    throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.");
  }
  
  if (!ENV.stripeStarterPriceId) {
    throw new Error("Stripe price ID is not configured. Please set STRIPE_STARTER_PRICE_ID environment variable.");
  }
  
  // Parse the origin to ensure we're using the live host (not localhost)
  const baseUrl = originUrl || ENV.betterAuthUrl;
  
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: ENV.stripeStarterPriceId,
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/checkout/cancel`,
    allow_promotion_codes: true,
  });
  
  return { url: session.url };
}
