import { getSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Admin only endpoint to verify payments
export async function POST(request: Request) {
  try {
    const supabase:any = await getSupabaseServerClient();
    
    // Get current user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', authUser.id)
      .single();

    if (!userData?.is_admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { paymentId, action, notes } = await request.json();

    if (action === 'verify') {
      // Update payment status
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .update({
          status: 'verified',
          verified_at: new Date().toISOString(),
          verified_by: authUser.id,
          admin_notes: notes,
        })
        .eq('id', paymentId)
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Update user's isPaid status
      const { error: userError } = await supabase
        .from('users')
        .update({ is_paid: true })
        .eq('id', payment.user_id);

      if (userError) throw userError;

      return NextResponse.json({
        success: true,
        message: 'Payment verified and user activated',
      });
    } else if (action === 'reject') {
      // Update payment status to rejected
      const { error: paymentError } = await supabase
        .from('payments')
        .update({
          status: 'rejected',
          verified_at: new Date().toISOString(),
          verified_by: authUser.id,
          admin_notes: notes,
        })
        .eq('id', paymentId);

      if (paymentError) throw paymentError;

      return NextResponse.json({
        success: true,
        message: 'Payment rejected',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Failed to process verification' },
      { status: 500 }
    );
  }
}