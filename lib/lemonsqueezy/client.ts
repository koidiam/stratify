import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';

let initialized = false;

export function initLemonSqueezy() {
  if (initialized) return;
  
  const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
  if (!apiKey) {
    console.warn('LEMON_SQUEEZY_API_KEY is dummy or not set. Checkout will fail if calling real API.');
  }

  lemonSqueezySetup({
    apiKey: apiKey || 'dummy-key',
    onError: (error) => console.error('Lemon Squeezy Integration Error:', error),
  });
  
  initialized = true;
}
