import { getSubscription, setSubscription } from '@/src/storage/store';

// MOCKED RevenueCat - replace with real SDK when ready
export const PRODUCTS = {
  monthly: { id: 'brightbuds_monthly', title: 'Monthly', price: '$1.99/month', trialText: '3-day free trial' },
  annual: { id: 'brightbuds_annual', title: 'Annual (Best Value)', price: '$14.99/year', trialText: '' },
};

export const checkPremium = async (): Promise<boolean> => {
  const sub = await getSubscription();
  return sub.isPremium;
};

export const purchaseProduct = async (_productId: string): Promise<boolean> => {
  // MOCKED: simulates successful purchase
  await setSubscription({ isPremium: true, lastCheckedAt: new Date().toISOString() });
  return true;
};

export const restorePurchases = async (): Promise<boolean> => {
  const sub = await getSubscription();
  return sub.isPremium;
};

export const getStatus = async (): Promise<string> => {
  const sub = await getSubscription();
  return sub.isPremium ? 'Premium Active' : 'Free';
};
