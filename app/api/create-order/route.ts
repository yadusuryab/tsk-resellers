// app/api/create-order/route.ts
import { NextResponse } from "next/server";
import { sanityClient } from "@/lib/sanity";
import { TelegramService } from "@/lib/telegram";

export async function POST(request: Request) {
  try {
    const orderData = await request.json();

    // Log received data for debugging
    console.log('Creating order with reseller data:', {
      resellerEmail: orderData.resellerEmail,
      resellerId: orderData.resellerId,
      resellerName: orderData.resellerName,
      buyerEmail: orderData.buyerEmail,
      buyerName: orderData.buyerName,
    });

    // Validate required reseller information
    if (!orderData.resellerEmail) {
      console.error('Missing reseller email');
      return NextResponse.json(
        { success: false, message: "Reseller email is required" },
        { status: 400 }
      );
    }

    // 1. Create the order in Sanity with all fields including reseller info
    const createdOrder = await sanityClient.create({
      _type: "order",
      
      // ── Reseller Information (Account owner) ──
      resellerEmail: orderData.resellerEmail,
      resellerId: orderData.resellerId || null,
      resellerName: orderData.resellerName || null,
      
      // ── Buyer Information (Shipping details) ──
      customerName: orderData.customerName || orderData.buyerName,
      buyerEmail: orderData.buyerEmail || orderData.resellerEmail, // Fallback to reseller email
      phoneNumber: orderData.phoneNumber,
      alternatePhone: orderData.alternatePhone || "",
      instagramId: orderData.instagramId || "",
      address: orderData.address,
      district: orderData.district,
      state: orderData.state,
      pincode: orderData.pincode,
      landmark: orderData.landmark || "",
      
      // ── Payment Information ──
      paymentMode: orderData.paymentMode,
      paymentStatus: orderData.paymentStatus ? "paid" : "pending",
      transactionId: orderData.transactionId || "",
      shippingCharges: orderData.shippingCharges || 0,
      totalAmount: orderData.totalAmount,
      advanceAmount: orderData.advanceAmount || 0,
      codRemaining: orderData.codRemaining || 0,
      
      // ── Order Status ──
      orderStatus: "pending",
      orderedAt: new Date().toISOString(),
      
      // ── Products ──
      products: orderData.products.map((item: any, index: number) => ({
        _key: `product-${Date.now()}-${index}`,
        _type: "object",
        product: {
          _type: "reference",
          _ref: item.product,
        },
        quantity: item.quantity,
        size: item.size || null,
        color: item.color || null,
      })),
    });

    console.log('Order created successfully:', createdOrder._id);

    // 2. Update product quantities
    for (const item of orderData.products) {
      try {
        const product = await sanityClient.getDocument(item.product);
        
        if (!product) {
          console.warn(`Product not found: ${item.product}`);
          continue;
        }

        const currentQuantity = product.quantity || 0;
        const newQuantity = Math.max(0, currentQuantity - item.quantity);
        const soldOut = newQuantity === 0;

        await sanityClient
          .patch(item.product)
          .set({
            quantity: newQuantity,
            soldOut: soldOut,
          })
          .commit();

        console.log(`Updated product ${item.product}: quantity ${currentQuantity} -> ${newQuantity}`);
      } catch (error) {
        console.error(`Failed to update product ${item.product}:`, error);
        // Continue with other products even if one fails
      }
    }

    // 3. Send Telegram notification with complete order details
    try {
      const fullOrder = await sanityClient.fetch(
        `*[_type == "order" && _id == $id][0]{
          _id,
          customerName,
          resellerEmail,
          resellerName,
          phoneNumber,
          alternatePhone,
          instagramId,
          address,
          district,
          state,
          pincode,
          landmark,
          paymentMode,
          paymentStatus,
          transactionId,
          shippingCharges,
          totalAmount,
          advanceAmount,
          codRemaining,
          orderStatus,
          orderedAt,
          products[]{
            quantity,
            size,
            color,
            product->{
              _id,
              name,
              salesPrice,
              image
            }
          }
        }`,
        { id: createdOrder._id }
      );

      if (fullOrder) {
        await TelegramService.sendOrderNotification(fullOrder);
        console.log('Telegram notification sent');
      }
    } catch (telegramError) {
      console.error('Failed to send Telegram notification:', telegramError);
      // Don't fail the order if notification fails
    }

    return NextResponse.json(
      { 
        success: true, 
        orderId: createdOrder._id,
        message: 'Order created successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to create order"
      },
      { status: 500 }
    );
  }
}