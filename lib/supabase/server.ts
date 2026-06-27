import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { cache } from 'react';

export const getSupabaseServerClient = cache(async () => {
  const cookieStore = await cookies();

  return createSupabaseServerClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // CRITICAL: Ensure cookies are set with proper options
          try {
            cookieStore.set({
              name,
              value,
              ...options,
              // Add these to ensure cookies persist
              path: '/',
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
              httpOnly: true,
            });
          } catch (error) {
            // Handle cookie setting errors gracefully
            console.error('Failed to set cookie:', name, error);
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({
              name,
              value: '',
              ...options,
              path: '/',
              maxAge: 0, // Immediately expire
            });
          } catch (error) {
            console.error('Failed to remove cookie:', name, error);
          }
        },
      },
    }
  );
});

// For backward compatibility
export const createServerClient = getSupabaseServerClient;