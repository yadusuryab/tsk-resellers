import { getSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase:any = await getSupabaseServerClient();
    
    // Get current user
    const { data: { user: authUser }, error: authError }:any = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { transactionId, amount, paymentDate } = await request.json();

    // Validate transaction ID
    if (!transactionId || transactionId.length < 6) {
      return NextResponse.json(
        { error: 'Invalid transaction ID' },
        { status: 400 }
      );
    }

    // Check if transaction ID already exists
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('transaction_id', transactionId)
      .single();

    if (existingPayment) {
      return NextResponse.json(
        { error: 'This transaction ID has already been used' },
        { status: 400 }
      );
    }

    // Check if user has pending payment
    const { data: pendingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('user_id', authUser.id)
      .eq('status', 'pending')
      .single();

    if (pendingPayment) {
      return NextResponse.json(
        { error: 'You already have a pending payment awaiting verification' },
        { status: 400 }
      );
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: authUser.id,
        amount: amount,
        transaction_id: transactionId,
        status: 'pending',
        payment_date: paymentDate,
      })
      .select()
      .single();

    if (paymentError) {
      throw paymentError;
    }

    return NextResponse.json({
      success: true,
      payment,
      message: 'Payment submitted successfully. Awaiting verification.',
    });
  } catch (error) {
    console.error('Payment submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit payment' },
      { status: 500 }
    );
  }
}