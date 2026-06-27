import { getSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { User } from '@/types';
import { checkUserAccess } from './trial';
import { cache } from 'react';

// Use React cache to prevent multiple fetches
// lib/utils/auth.ts
export const getCurrentUser = cache(async (): Promise<User & { isBanned: boolean } | null> => {
  console.log('[getCurrentUser] Starting...');
  const supabase = await getSupabaseServerClient();
  
  // Check what cookies are available
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  console.log('[getCurrentUser] Available cookies:', allCookies.map(c => c.name));
  
  const { data: { user: authUser }, error } = await supabase.auth.getUser();
  console.log('[getCurrentUser] Auth result:', { 
    hasUser: !!authUser, 
    error: error?.message,
    userId: authUser?.id 
  });
  
  if (error || !authUser) {
    console.log('[getCurrentUser] No auth user, returning null');
    return null;
  }

  const { data: userData, error: dbError } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();
  
  console.log('[getCurrentUser] DB result:', { 
    hasData: !!userData, 
    error: dbError?.message 
  });

  if (!userData) {
    console.log('[getCurrentUser] User not in DB');
    return null;
  }

  console.log('[getCurrentUser] Success for user:', userData.id);
  return {
    id: userData.id,
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    isPaid: userData.is_paid,
    isAdmin: userData.is_admin || false,
    isBanned: userData.is_banned || false,
    banReason: userData.ban_reason,
    bannedAt: userData.banned_at ? new Date(userData.banned_at) : null,
    emailVerified: userData.email_verified || false,
    lastSignIn: userData.last_sign_in ? new Date(userData.last_sign_in) : null,
    trialStart: new Date(userData.trial_start),
    trialEnd: new Date(userData.trial_end),
    createdAt: new Date(userData.created_at),
    updatedAt: new Date(userData.updated_at),
  } as User & { isBanned: boolean };
});

export const requireAuth = cache(async () => {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }
  
  if (user.isBanned) {
    redirect('/banned');
  }
  
  return user;
});

export const requireAccess = cache(async () => {
  const user = await requireAuth();
  
  // Admins always have access
  if (user.isAdmin) {
    return user;
  }
  
  const access = checkUserAccess(user);
  
  if (!access.hasAccess) {
    redirect('/pricing');
  }
  
  return user;
});

export const requireAdmin = cache(async () => {
  const user = await requireAuth();
  
  if (!user.isAdmin) {
    redirect('/account');
  }
  
  return user;
});