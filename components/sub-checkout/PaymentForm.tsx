'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import type { User } from '@/types';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

interface PaymentFormProps {
  user: User;
  amount: number;
  onBack: () => void;
}

export const PaymentForm = ({ user, amount, onBack }: PaymentFormProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    transactionId: '',
    paymentDate: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/payment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: formData.transactionId,
          amount: amount,
          paymentDate: formData.paymentDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit payment');
      }

      router.push('/payment-success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Enter Payment Details
        </h2>
        <button
          onClick={onBack}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="rounded-lg bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            Amount to pay: <span className="font-bold">₹{amount}</span>
          </p>
          <p className="mt-1 text-xs text-blue-600">
            UPI ID: yourbusiness@okhdfcbank
          </p>
        </div>

        <Input
          required
          value={formData.transactionId}
          onChange={(e) => setFormData({ ...formData, transactionId: e.target.value.toUpperCase() })}
          placeholder="e.g., UPI1234567890"
          pattern="[A-Za-z0-9]+"
          title="Please enter a valid transaction ID (letters and numbers only)"
        />

        <Input
          type="date"
          required
          value={formData.paymentDate}
          onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
          max={new Date().toISOString().split('T')[0]}
        />

        <div className="rounded-lg bg-gray-50 p-4">
          <h4 className="text-sm font-medium text-gray-900">Where to find Transaction ID?</h4>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-gray-600">
            <li>Google Pay: Tap transaction → View details → UPI Transaction ID</li>
            <li>PhonePe: Transaction history → Select payment → UTR Number</li>
            <li>Paytm: Payment history → Select payment → Reference ID</li>
            <li>BHIM: Transaction history → Select payment → UTR Number</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1"
          >
            Submit Payment
          </Button>
        </div>

        <p className="text-center text-xs text-gray-500">
          Your payment will be verified within 1-2 hours. You'll receive access once verified.
        </p>
      </form>
    </div>
  );
};