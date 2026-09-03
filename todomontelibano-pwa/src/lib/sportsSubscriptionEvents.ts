export const SPORTS_SUBSCRIPTION_REQUIRED = 'sports-subscription-required';

export function emitSportsSubscriptionRequired() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(SPORTS_SUBSCRIPTION_REQUIRED));
}
