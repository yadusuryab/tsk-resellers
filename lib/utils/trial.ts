import type { User, TrialStatus, AccessCheckResult } from '@/types';

export const calculateTrialStatus = (user: User): TrialStatus => {
  const now = new Date();
  const trialEnd = new Date(user.trialEnd);
  const isActive = now <= trialEnd;
  const daysLeft = isActive 
    ? Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return {
    isActive,
    daysLeft,
    isExpired: !isActive,
    hasAccess: isActive || user.isPaid,
  };
};

export const checkUserAccess = (user: User | null): AccessCheckResult => {
  if (!user) {
    return {
      hasAccess: false,
      reason: 'unauthorized',
    };
  }

  if (user.isPaid) {
    return {
      hasAccess: true,
      reason: 'paid',
      user,
    };
  }

  const trialStatus = calculateTrialStatus(user);
  
  if (trialStatus.isActive) {
    return {
      hasAccess: true,
      reason: 'active',
      user,
    };
  }

  return {
    hasAccess: false,
    reason: 'expired',
    user,
  };
};

export const formatTrialStatus = (user: User): string => {
  const trialStatus = calculateTrialStatus(user);
  
  if (user.isPaid) {
    return 'Paid User';
  }
  
  if (trialStatus.isActive) {
    return `Trial Active (${trialStatus.daysLeft} days left)`;
  }
  
  return 'Trial Expired';
};