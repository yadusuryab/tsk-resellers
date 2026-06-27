export interface Payment {
  id: string;
  userId: string;
  amount: number;
  transactionId: string;
  status: 'pending' | 'verified' | 'rejected';
  paymentDate: Date;
  verifiedAt: Date | null;
  verifiedBy: string | null;
  adminNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  isPaid: boolean;
  isAdmin: boolean;
  trialStart: Date;
  trialEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ... existing types remain the same
  
  export interface TrialStatus {
    isActive: boolean;
    daysLeft: number;
    isExpired: boolean;
    hasAccess: boolean;
  }
  
  export interface AuthUser {
    id: string;
    email?: string;
    user_metadata?: {
      name?: string;
      phone?: string;
    };
  }
  
  export type AccessCheckResult = {
    hasAccess: boolean;
    reason: 'active' | 'paid' | 'expired' | 'unauthorized';
    user?: User;
  };