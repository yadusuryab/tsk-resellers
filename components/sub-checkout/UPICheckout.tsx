'use client';

import { useState, useEffect } from 'react';
import { UPI_CONFIG } from '@/lib/config/upi';

import Image from 'next/image';
import type { User } from '@/types';
import { Button } from '../ui/button';
import { PaymentForm } from './PaymentForm';

interface UPICheckoutProps {
  user: User;
  existingPayment: any;
}

export const UPICheckout = ({ user, existingPayment }: UPICheckoutProps) => {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const upiLink = UPI_CONFIG.generateUPILink();
  const qrCodeUrl = UPI_CONFIG.generateQRCode();

  // If there's a pending payment, show that instead
  if (existingPayment) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Payment Pending Verification
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Your payment is being verified. This usually takes 1-2 hours.</p>
              <p className="mt-1">Transaction ID: {existingPayment.transaction_id}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const openUPIApp = (app: string) => {
    setSelectedApp(app);
    
    // Create app-specific deep links
    const appLinks: Record<string, string> = {
      gpay: `gpay://upi/pay?pa=${UPI_CONFIG.UPI_ID}&pn=${UPI_CONFIG.PAYEE_NAME}&am=${UPI_CONFIG.SUBSCRIPTION_AMOUNT}&cu=INR`,
      phonepe: `phonepe://upi/pay?pa=${UPI_CONFIG.UPI_ID}&pn=${UPI_CONFIG.PAYEE_NAME}&am=${UPI_CONFIG.SUBSCRIPTION_AMOUNT}&cu=INR`,
      paytm: `paytm://upi/pay?pa=${UPI_CONFIG.UPI_ID}&pn=${UPI_CONFIG.PAYEE_NAME}&am=${UPI_CONFIG.SUBSCRIPTION_AMOUNT}&cu=INR`,
      bhim: `bhim://upi/pay?pa=${UPI_CONFIG.UPI_ID}&pn=${UPI_CONFIG.PAYEE_NAME}&am=${UPI_CONFIG.SUBSCRIPTION_AMOUNT}&cu=INR`,
    };

    window.location.href = appLinks[app] || upiLink;
    
    // Show payment form after opening app
    setTimeout(() => {
      setShowPaymentForm(true);
    }, 2000);
  };

  const copyUPIId = () => {
    navigator.clipboard.writeText(UPI_CONFIG.UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {!showPaymentForm ? (
        <>
          {/* Payment Options */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">Pay ₹300 via UPI</h2>
            
            {/* UPI ID Display */}
            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-700">UPI ID</p>
              <div className="mt-1 flex items-center justify-between">
                <code className="text-lg font-mono">{UPI_CONFIG.UPI_ID}</code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyUPIId}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>

            {/* QR Code */}
            <div className="mt-6 flex justify-center">
              <div className="text-center">
                <img 
                  src={qrCodeUrl} 
                  alt="UPI QR Code" 
                  className="h-64 w-64"
                />
                <p className="mt-2 text-sm text-gray-600">
                  Scan with any UPI app
                </p>
              </div>
            </div>

            {/* UPI Apps */}
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-700">Pay directly with:</p>
              <div className="mt-3 grid grid-cols-4 gap-3">
                {Object.entries({
                  gpay: { name: 'Google Pay', color: 'bg-blue-600' },
                  phonepe: { name: 'PhonePe', color: 'bg-purple-600' },
                  paytm: { name: 'Paytm', color: 'bg-blue-500' },
                  bhim: { name: 'BHIM', color: 'bg-orange-600' },
                }).map(([key, app]) => (
                  <button
                    key={key}
                    onClick={() => openUPIApp(key)}
                    className={`${app.color} rounded-lg px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity`}
                  >
                    {app.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Manual Entry Button */}
          <div className="text-center">
            <button
              onClick={() => setShowPaymentForm(true)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Already paid? Enter Transaction ID →
            </button>
          </div>
        </>
      ) : (
        <PaymentForm 
          user={user} 
          amount={UPI_CONFIG.SUBSCRIPTION_AMOUNT}
          onBack={() => setShowPaymentForm(false)}
        />
      )}

      {/* Instructions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="font-semibold text-gray-900">Payment Instructions:</h3>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-gray-600">
          <li>Open any UPI app (Google Pay, PhonePe, Paytm, etc.)</li>
          <li>Scan the QR code or enter the UPI ID: {UPI_CONFIG.UPI_ID}</li>
          <li>Enter amount: ₹{UPI_CONFIG.SUBSCRIPTION_AMOUNT}</li>
          <li>Complete the payment</li>
          <li>After payment, enter the Transaction ID/UTR number below</li>
          <li>Your account will be activated after verification (usually 1-2 hours)</li>
        </ol>
      </div>
    </div>
  );
};