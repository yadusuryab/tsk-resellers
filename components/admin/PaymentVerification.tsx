'use client';

import { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';


interface PaymentVerificationProps {
  payments: any[];
}

export const PaymentVerification = ({ payments: initialPayments }: PaymentVerificationProps) => {
  const [payments, setPayments] = useState(initialPayments);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);

  const handleVerification = async (paymentId: string, action: 'verify' | 'reject') => {
    setLoading(paymentId);
    
    try {
      const response = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          action,
          notes: notes[paymentId] || '',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Remove from list
        setPayments(payments.filter(p => p.id !== paymentId));
        // Clear notes
        const newNotes = { ...notes };
        delete newNotes[paymentId];
        setNotes(newNotes);
      } else {
        alert(data.error || 'Failed to process');
      }
    } catch (error) {
      alert('An error occurred');
    } finally {
      setLoading(null);
    }
  };

  if (payments.length === 0) {
    return (
      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-12 text-center">
        <p className="text-gray-600">No pending payments to verify</p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      {payments.map((payment) => (
        <div key={payment.id} className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-gray-900">{payment.user?.name}</h3>
              <p className="text-sm text-gray-600">{payment.user?.email}</p>
              <p className="text-sm text-gray-600">{payment.user?.phone}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">₹{payment.amount}</p>
              <p className="text-xs text-gray-500">
                {new Date(payment.payment_date).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-700">Transaction ID:</p>
            <code className="mt-1 block text-lg font-mono">{payment.transaction_id}</code>
          </div>

          <div className="mt-4">
            <Input
              value={notes[payment.id] || ''}
              onChange={(e) => setNotes({ ...notes, [payment.id]: e.target.value })}
              placeholder="Add notes about this payment..."
            />
          </div>

          <div className="mt-4 flex gap-3">
            <Button
              onClick={() => handleVerification(payment.id, 'verify')}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              ✓ Verify Payment
            </Button>
            <Button
              onClick={() => handleVerification(payment.id, 'reject')}
              variant="outline"
              className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
            >
              ✗ Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};