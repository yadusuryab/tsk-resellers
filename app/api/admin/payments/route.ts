// app/api/admin/payments/route.ts
import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    
    // Verify admin
    const { data: { user } } = await supabase.auth.getUser();
    const { data: userData } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user?.id)
      .single();

    if (!userData?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Use admin client to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Fetch all payments with user info
    const { data: payments, error } = await supabaseAdmin
      .from('payments')
      .select(`
        *,
        user:users (
          name,
          email,
          phone
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payments:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ payments });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    const { action, paymentId, userId, notes } = await request.json();

    // Verify admin
    const { data: { user } } = await supabase.auth.getUser();
    const { data: userData } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user?.id)
      .single();

    if (!userData?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Use admin client for operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    if (action === 'verify') {
      // Update payment status
      await supabaseAdmin
        .from('payments')
        .update({
          status: 'verified',
          verified_at: new Date().toISOString(),
          verified_by: user?.id,
          admin_notes: notes,
        })
        .eq('id', paymentId);

      // Update user to paid
      await supabaseAdmin
        .from('users')
        .update({ is_paid: true })
        .eq('id', userId);
    }
    
    if (action === 'reject') {
      await supabaseAdmin
        .from('payments')
        .update({
          status: 'rejected',
          verified_at: new Date().toISOString(),
          verified_by: user?.id,
          admin_notes: notes,
        })
        .eq('id', paymentId);
    }

    // Log admin action
    await supabase.from('admin_logs').insert({
      admin_id: user?.id,
      action: `payment_${action}`,
      target_user_id: userId,
      details: { paymentId, notes },
    });

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}