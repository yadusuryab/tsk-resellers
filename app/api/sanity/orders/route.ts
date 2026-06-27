// app/api/sanity/orders/route.ts
import { NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';

export async function GET() {
  try {
    const orders = await sanityClient.fetch(`
      *[_type == "order"] | order(orderedAt desc) {
        _id,
        customerName,
        resellerEmail,
        resellerName,
        resellerId,
        buyerEmail,
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
        orderStatus,
        orderedAt,
        trackingNumber,
        trackingUrl,
        transactionId,
        advanceAmount,
        codRemaining,
        adminNotes,
        "productCount": count(products),
        "products": products[] {
          quantity,
          size,
          color,
          price,
          product-> {
            _id,
            name,
            price,
            salesPrice,
            "images": images[] {
              ...,
              asset->
            },
            sizes,
            colors,
            description,
            quantity,
            soldOut
          }
        }
      }
    `);
    
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { orderId, orderStatus, trackingNumber, updatedAt, trackingUrl, shippingProvider } = await request.json();
    
    const updateData: any = {
      orderStatus,
      updatedAt,
    };
    
    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }
    
    if (trackingUrl) {
      updateData.trackingUrl = trackingUrl;
    }
    
    if (shippingProvider) {
      updateData.shippingProvider = shippingProvider;
    }
    
    const updatedOrder = await sanityClient
      .patch(orderId)
      .set(updateData)
      .commit();
    
    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}