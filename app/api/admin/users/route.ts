// app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  console.log('=== API Route Started ===');
  
  const supabase = await getSupabaseServerClient();
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  console.log('Auth user:', user?.email);
  console.log('Auth error:', authError);
  
  if (!user) {
    console.log('No user found');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Check admin status
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('is_admin, email')
    .eq('id', user.id)
    .single();
  
  console.log('User data from DB:', userData);
  console.log('User DB error:', userError);
  console.log('Is admin:', userData?.is_admin);
  
  if (!userData?.is_admin) {
    console.log('User is not admin');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  // Check if service role key exists
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  console.log('Service role key exists:', !!serviceRoleKey);
  console.log('Supabase URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
  
  if (!serviceRoleKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is missing!');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }
  
  // Create admin client
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
  
  // Try to fetch all users
  console.log('Fetching all users with admin client...');
  const { data: users, error: usersError } = await supabaseAdmin
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });
  
  console.log('Users fetched count:', users?.length);
  console.log('Users error:', usersError);
  
  if (usersError) {
    console.error('Error fetching users:', usersError);
    return NextResponse.json({ error: usersError.message }, { status: 500 });
  }
  
  console.log('First user:', users?.[0]?.email);
  console.log('=== API Route Finished ===');
  
  return NextResponse.json({ users });
}

// Add POST method for actions
export async function POST(request: Request) {
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

    // Create admin client for operations
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

    const { action, userId, data } = await request.json();

    switch (action) {
      case 'ban': {
        const { error } = await supabaseAdmin
          .from('users')
          .update({ 
            is_banned: true, 
            ban_reason: data.reason, 
            banned_at: new Date().toISOString() 
          })
          .eq('id', userId);
        
        if (error) throw error;
        
        // Log admin action
        await supabaseAdmin.from('admin_logs').insert({
          admin_id: user?.id,
          action: 'ban_user',
          target_user_id: userId,
          details: { reason: data.reason },
        });
        break;
      }
      
      case 'unban': {
        const { error } = await supabaseAdmin
          .from('users')
          .update({ 
            is_banned: false, 
            ban_reason: null, 
            banned_at: null 
          })
          .eq('id', userId);
        
        if (error) throw error;
        
        // Log admin action
        await supabaseAdmin.from('admin_logs').insert({
          admin_id: user?.id,
          action: 'unban_user',
          target_user_id: userId,
          details: {},
        });
        break;
      }
      
      case 'toggle_admin': {
        const { error } = await supabaseAdmin
          .from('users')
          .update({ is_admin: data.is_admin })
          .eq('id', userId);
        
        if (error) throw error;
        
        // Log admin action
        await supabaseAdmin.from('admin_logs').insert({
          admin_id: user?.id,
          action: data.is_admin ? 'make_admin' : 'remove_admin',
          target_user_id: userId,
          details: {},
        });
        break;
      }
      
      case 'reset_password': {
        // Use regular supabase client for password reset (requires email)
        const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password`,
        });
        
        if (error) throw error;
        
        // Log admin action
        await supabaseAdmin.from('admin_logs').insert({
          admin_id: user?.id,
          action: 'reset_password',
          target_user_id: userId,
          details: { email: data.email },
        });
        break;
      }
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error in POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}