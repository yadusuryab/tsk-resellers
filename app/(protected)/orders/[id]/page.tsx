"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  IconPackage, IconTruck, IconCheck, IconClock, IconX, 
  IconMapPin, IconPhone, IconMail, IconReceipt, IconArrowLeft 
} from '@tabler/icons-react';
import { createClient } from "@/lib/supabase/client";

export default function OrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (!user) {
        window.location.href = '/login';
      }
    };
    
    checkAuth();
  }, [supabase]);

  useEffect(() => {
    if (user && params.id) {
      fetchOrder();
    }
  }, [user, params.id]);

  const fetchOrder = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch(`/api/orders/${params.id}`);
    
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Order not found');
        }
        throw new Error('Failed to fetch order');
      }
      
      const data = await response.json();
      setOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-xl border border-gray-200 p-12">
            <IconPackage size={48} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {error || 'Order not found'}
            </h2>
            <Link
              href="/orders"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mt-4"
            >
              <IconArrowLeft size={16} />
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <Link 
          href="/orders" 
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <IconArrowLeft size={16} />
          Back to Orders
        </Link>

        {/* Order Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Order ID</p>
              <h1 className="text-2xl font-bold text-gray-900 font-mono">
                #{order._id.slice(-8).toUpperCase()}
              </h1>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Order Date</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(order.orderedAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs text-gray-500 mb-1">Order Status</p>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${
                order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800 border-green-200' :
                order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-800 border-red-200' :
                'bg-blue-100 text-blue-800 border-blue-200'
              }`}>
                {order.orderStatus === 'delivered' && <IconCheck size={16} />}
                {order.orderStatus === 'cancelled' && <IconX size={16} />}
                {order.orderStatus === 'shipped' && <IconTruck size={16} />}
                {order.orderStatus === 'processing' && <IconPackage size={16} />}
                {order.orderStatus === 'pending' && <IconClock size={16} />}
                {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
              </span>
            </div>
            {order.trackingNumber && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Tracking Number</p>
                <p className="text-sm font-mono font-medium">{order.trackingNumber}</p>
              </div>
            )}
          </div>
        </div>

        {/* Products */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.products?.map((item: any, index: number) => (
              <div key={index} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                {item.product?.image && (
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                  />
                )}
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.product?.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                    {item.size && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span className="text-sm text-gray-500">Size: {item.size}</span>
                      </>
                    )}
                    {item.color && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span className="text-sm text-gray-500">Color: {item.color}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    ₹{item.product?.salesPrice * item.quantity}
                  </p>
                  <p className="text-sm text-gray-500">₹{item.product?.salesPrice} each</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer & Payment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <IconMapPin size={20} className="text-gray-400" />
              Shipping Address
            </h2>
            <div className="space-y-2">
              <p className="font-medium text-gray-900">{order.customerName}</p>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <IconPhone size={14} />
                {order.phoneNumber}
              </p>
              {order.alternatePhone && (
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <IconPhone size={14} />
                  {order.alternatePhone}
                </p>
              )}
              <p className="text-sm text-gray-600 mt-3">
                {order.address}<br />
                {order.landmark && `${order.landmark}, `}
                {order.district}, {order.state} - {order.pincode}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <IconReceipt size={20} className="text-gray-400" />
              Payment Details
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-sm text-gray-900">₹{order.totalAmount - (order.shippingCharges || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Shipping</span>
                <span className="text-sm text-gray-900">
                  {order.shippingCharges === 0 ? 'Free' : `₹${order.shippingCharges}`}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-200">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-semibold text-gray-900">₹{order.totalAmount}</span>
              </div>
              
              <div className="pt-3 mt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Payment Method</p>
                <p className="font-medium text-gray-900">
                  {order.paymentMode === 'online' ? 'Online Payment' : 'Cash on Delivery'}
                </p>
                {order.paymentMode === 'online' && order.transactionId && (
                  <p className="text-xs text-gray-500 mt-1">
                    Transaction ID: {order.transactionId}
                  </p>
                )}
                {order.paymentMode === 'cod' && (
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600">
                      Advance Paid: ₹{order.advanceAmount || 100}
                    </p>
                    <p className="text-sm text-gray-600">
                      Remaining: ₹{order.codRemaining || order.totalAmount - 100}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tracking Button */}
        {order.trackingUrl && (
          <div className="mt-6">
            <a
              href={order.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <IconTruck size={18} />
              Track Your Order
            </a>
          </div>
        )}
      </div>
    </div>
  );
}