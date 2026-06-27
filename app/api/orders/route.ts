import { NextResponse } from "next/server";
import { sanityClient } from "@/lib/sanity";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user profile to get email
    const { data: userData }:any = await supabase
      .from('users')
      .select('email')
      .eq('id', user.id)
      .single();

    if (!userData?.email) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    
    // Build query
    let query = `*[_type == "order" && resellerEmail == $email`;
    
    if (status && status !== 'all') {
      query += ` && orderStatus == $status`;
    }
    
    query += `] | order(orderedAt desc)`;
    
    // Add pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    
    query += `[${start}...${end}] {
      _id,
      customerName,
      phoneNumber,
      address,
      district,
      state,
      pincode,
      totalAmount,
      paymentMode,
      paymentStatus,
      transactionId,
      shippingCharges,
      advanceAmount,
      codRemaining,
      orderStatus,
      orderedAt,
      deliveredAt,
      trackingNumber,
      trackingUrl,
      "productCount": count(products),
      products[]{
        quantity,
        size,
        color,
        product->{
          _id,
          name,
          salesPrice,
          "image": image.asset->url
        }
      }
    }`;

    // Get total count
    let countQuery = `count(*[_type == "order" && resellerEmail == $email`;
    if (status && status !== 'all') {
      countQuery += ` && orderStatus == $status`;
    }
    countQuery += `])`;

    // Execute queries
    const params: any = { email: userData.email };
    if (status && status !== 'all') {
      params.status = status;
    }

    const [orders, total] = await Promise.all([
      sanityClient.fetch(query, params),
      sanityClient.fetch(countQuery, params)
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}