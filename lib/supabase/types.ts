export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  isPaid: boolean;
  isAdmin: boolean;
  isBanned: boolean;
  banReason: string | null;
  bannedAt: Date | null;
  emailVerified: boolean;
  lastSignIn: Date | null;
  trialStart: Date;
  trialEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

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

export interface AdminLog {
  id: string;
  adminId: string;
  action: string;
  targetUserId: string | null;
  details: any;
  createdAt: Date;
}

export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingPayments: number;
  activeTrials: number;
  paidUsers: number;
  bannedUsers: number;
  recentOrders: any[];
  recentUsers: any[];
}
// In your types.ts or database.types.ts
export type Database = {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Omit<User, 'id'>>;
      };
      payments: {
        Row: Payment;
        Insert: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Omit<Payment, 'id'>>;
      };
      admin_logs: {
        Row: AdminLog;
        Insert: Omit<AdminLog, 'id' | 'createdAt'>;
        Update: Partial<Omit<AdminLog, 'id'>>;
      };
    };
  };
};