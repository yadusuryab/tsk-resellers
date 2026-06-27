import { NextRequest, NextResponse } from "next/server";
import { sanityClient } from "@/lib/sanity";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params
    const { id } = await params;
    
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
    const { data: userData } :any = await supabase
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

    // Fix: Use the id directly, not orderId.id
    const order = await sanityClient.fetch(
      `*[_type == "order" && _id == $orderId && resellerEmail == $email][0] {
        _id,
        customerName,
        phoneNumber,
        alternatePhone,
        instagramId,
        address,
        district,
        state,
        pincode,
        landmark,
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
        shippingProvider,
        resellerEmail,
        resellerName,
        "products": products[]{
          quantity,
          size,
          color,
          "product": @->{
            _id,
            name,
            salesPrice,
            "image": image.asset->url
          }
        }
      }`,
      { 
        orderId: id, // Fixed: use id directly
        email: userData.email 
      }
    );

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ order }, { status: 200 });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}