"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconPackage, IconTruck, IconCheck, IconClock, IconX, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { createClient } from "@/lib/supabase/client";

// Order status badge component
function OrderStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    pending: { 
      label: 'Pending', 
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: <IconClock size={14} className="text-yellow-600" />
    },
    processing: { 
      label: 'Processing', 
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: <IconPackage size={14} className="text-blue-600" />
    },
    shipped: { 
      label: 'Shipped', 
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: <IconTruck size={14} className="text-purple-600" />
    },
    delivered: { 
      label: 'Delivered', 
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: <IconCheck size={14} className="text-green-600" />
    },
    cancelled: { 
      label: 'Cancelled', 
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: <IconX size={14} className="text-red-600" />
    },
  };

  const config = statusConfig[status.toLowerCase()] || statusConfig.pending;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      {config.icon}
      {config.label}
    </span>
  );
}

// Payment status badge
function PaymentStatusBadge({ status, mode }: { status: string; mode: string }) {
  if (mode === 'cod') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-orange-100 text-orange-800 border-orange-200">
        <IconTruck size={14} className="text-orange-600" />
        COD
      </span>
    );
  }

  const statusConfig: Record<string, { label: string; color: string }> = {
    paid: { label: 'Paid', color: 'bg-green-100 text-green-800 border-green-200' },
    pending: { label: 'Payment Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    failed: { label: 'Payment Failed', color: 'bg-red-100 text-red-800 border-red-200' },
  };

  const config = statusConfig[status.toLowerCase()] || statusConfig.pending;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      {config.label}
    </span>
  );
}

// Loading skeleton
function OrderSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
        <div className="h-6 bg-gray-200 rounded w-24"></div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [statusFilter, setStatusFilter] = useState("all");
  
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
    if (user) {
      fetchOrders();
    }
  }, [user, pagination.page, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      const response = await fetch(`/api/orders?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="mt-2 text-sm text-gray-600">
            Track and manage your orders
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Filter by status:</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <OrderSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchOrders}
              className="mt-4 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <IconPackage size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">
              {statusFilter === 'all' 
                ? "You haven't placed any orders yet." 
                : `You don't have any ${statusFilter} orders.`}
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {orders.map((order: any) => (
                <Link href={`/orders/${order._id}`} key={order._id} className="block">
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                    {/* Order Header */}
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">Order ID</p>
                            <p className="text-sm font-mono font-medium text-gray-900">
                              #{order._id.slice(-8).toUpperCase()}
                            </p>
                          </div>
                          <div className="w-px h-8 bg-gray-200" />
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">Order Date</p>
                            <p className="text-sm text-gray-700">
                              {new Date(order.orderedAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                          <div className="w-px h-8 bg-gray-200" />
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">Total Amount</p>
                            <p className="text-sm font-semibold text-gray-900">₹{order.totalAmount}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <OrderStatusBadge status={order.orderStatus} />
                          <PaymentStatusBadge status={order.paymentStatus} mode={order.paymentMode} />
                        </div>
                      </div>
                    </div>

                    {/* Products Preview */}
                    <div className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex -space-x-2">
                          {order.products?.slice(0, 3).map((item: any, index: number) => (
                            item.product?.image && (
                              <img
                                key={index}
                                src={item.product.image}
                                alt={item.product.name}
                                className="w-12 h-12 object-cover rounded-lg border-2 border-white shadow-sm"
                              />
                            )
                          ))}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">
                            {order.productCount} {order.productCount === 1 ? 'item' : 'items'}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {order.customerName} • {order.district}, {order.state}
                          </p>
                        </div>
                        {order.trackingNumber && (
                          <div className="flex items-center gap-2 text-primary">
                            <IconTruck size={16} />
                            <span className="text-sm font-medium">Track</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} orders
                </p>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <IconChevronLeft size={18} />
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {[...Array(pagination.totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      const showPage = 
                        pageNum === 1 ||
                        pageNum === pagination.totalPages ||
                        (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1);
                      
                      if (!showPage) {
                        if (pageNum === pagination.page - 2 || pageNum === pagination.page + 2) {
                          return <span key={i} className="px-2 text-gray-400">...</span>;
                        }
                        return null;
                      }
                      
                      return (
                        <button
                          key={i}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                            pagination.page === pageNum
                              ? 'bg-primary text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <IconChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Summary Stats */}
        {orders.length > 0 && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{orders.reduce((sum: number, order: any) => sum + order.totalAmount, 0)}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">Active Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter((o: any) => !['delivered', 'cancelled'].includes(o.orderStatus)).length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}