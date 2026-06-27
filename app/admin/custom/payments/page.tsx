'use client';

import { useState, useEffect } from 'react';
import { IconCheck, IconX, IconEye } from '@tabler/icons-react';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, [filter]);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/payments');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch payments');
      }
      
      let filteredPayments = data.payments || [];
      
      // Apply filter
      if (filter !== 'all') {
        filteredPayments = filteredPayments.filter(
          (payment: any) => payment.status === filter
        );
      }
      
      setPayments(filteredPayments);
    } catch (err: any) {
      console.error('Error fetching payments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (paymentId: string, userId: string) => {
    const notes = prompt('Add admin notes (optional):');
    
    try {
      const response = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          paymentId,
          userId,
          notes,
        }),
      });
      
      if (response.ok) {
        fetchPayments(); // Refresh the list
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error('Error verifying payment:', err);
      alert('Failed to verify payment');
    }
  };

  const handleReject = async (paymentId: string) => {
    const reason = prompt('Reason for rejection:');
    
    if (!reason) return;
    
    try {
      const response = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          paymentId,
          notes: reason,
        }),
      });
      
      if (response.ok) {
        fetchPayments(); // Refresh the list
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error('Error rejecting payment:', err);
      alert('Failed to reject payment');
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error: {error}</p>
          <button 
            onClick={fetchPayments} 
            className="mt-2 text-sm text-red-700 hover:text-red-800"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Verification</h1>
          <p className="text-gray-600 mt-1">Verify user payments</p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
          <option value="all">All</option>
        </select>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          Loading payments...
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          No payments found
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <IconEye size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{payment.user?.name}</p>
                    <p className="text-sm text-gray-500">{payment.user?.email}</p>
                    <p className="text-sm text-gray-500">{payment.user?.phone || 'No phone'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{typeof payment.amount === 'number' ? payment.amount.toLocaleString() : payment.amount}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(payment.payment_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Transaction ID:</p>
                <code className="text-lg font-mono break-all">{payment.transaction_id}</code>
              </div>

              {payment.status === 'pending' && (
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => handleVerify(payment.id, payment.user_id)}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <IconCheck size={18} />
                    Verify Payment
                  </button>
                  <button
                    onClick={() => handleReject(payment.id)}
                    className="flex-1 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 flex items-center justify-center gap-2"
                  >
                    <IconX size={18} />
                    Reject
                  </button>
                </div>
              )}

              {payment.status !== 'pending' && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Status: <span className={`font-medium ${
                      payment.status === 'verified' ? 'text-green-600' : 'text-red-600'
                    }`}>{payment.status}</span>
                  </p>
                  {payment.verified_at && (
                    <p className="text-sm text-gray-600 mt-1">
                      Verified on: {new Date(payment.verified_at).toLocaleString()}
                    </p>
                  )}
                  {payment.admin_notes && (
                    <p className="text-sm text-gray-600 mt-1">
                      Notes: {payment.admin_notes}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}