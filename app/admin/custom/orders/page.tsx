'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  IconSearch,
  IconEye,
  IconTruck,
  IconCheck,
  IconX,
  IconPackage,
  IconUser,
  IconMapPin,
  IconRefresh,
  IconPrinter,
  IconCurrencyRupee,
  IconBuildingStore,
  IconAlertCircle,
  IconChevronRight,
  IconCircleCheck,
  IconClock,
  IconSend,
} from '@tabler/icons-react';

interface Product {
  _id: string;
  name: string;
  price: number;
  salesPrice: number;
  images?: any[];
  sizes?: string[];
  colors?: string[];
  description?: string;
  quantity?: number;
  soldOut?: boolean;
}

interface OrderProduct {
  quantity: number;
  size?: string;
  color?: string;
  price: number;
  product?: Product;
}

interface Order {
  _id: string;
  customerName: string;
  resellerEmail: string;
  resellerName?: string;
  resellerId?: string;
  buyerEmail?: string;
  phoneNumber?: string;
  alternatePhone?: string;
  instagramId?: string;
  address?: string;
  district?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
  totalAmount: number;
  paymentMode: string;
  paymentStatus: string;
  orderStatus: string;
  orderedAt: string;
  trackingNumber?: string;
  trackingUrl?: string;
  transactionId?: string;
  advanceAmount?: number;
  codRemaining?: number;
  adminNotes?: string;
  productCount: number;
  products?: OrderProduct[];
  shippingCharges?: number;
}

const STATUS_FLOW = ['pending', 'processing', 'shipped', 'delivered'];

const STATUS_META: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
  pending:    { label: 'Pending',    color: '#92400e', bg: '#fef3c7', border: '#f59e0b', icon: IconClock },
  processing: { label: 'Processing', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6', icon: IconPackage },
  shipped:    { label: 'Shipped',    color: '#5b21b6', bg: '#ede9fe', border: '#8b5cf6', icon: IconTruck },
  delivered:  { label: 'Delivered',  color: '#065f46', bg: '#d1fae5', border: '#10b981', icon: IconCircleCheck },
  cancelled:  { label: 'Cancelled',  color: '#991b1b', bg: '#fee2e2', border: '#ef4444', icon: IconX },
};

const PAY_META: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: 'Unpaid',   color: '#92400e', bg: '#fef3c7' },
  paid:     { label: 'Paid',     color: '#065f46', bg: '#d1fae5' },
  failed:   { label: 'Failed',   color: '#991b1b', bg: '#fee2e2' },
  refunded: { label: 'Refunded', color: '#374151', bg: '#f3f4f6' },
};

function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] || STATUS_META.pending;
  const Icon = m.icon;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: m.bg, color: m.color, border: `1px solid ${m.border}` }}>
      <Icon size={12} />
      {m.label}
    </span>
  );
}

function PayBadge({ status }: { status: string }) {
  const m = PAY_META[status] || PAY_META.pending;
  return (
    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: m.bg, color: m.color }}>
      {m.label}
    </span>
  );
}

// Add this new component for status update dropdown
function StatusUpdateDropdown({ order, onUpdate }: { order: Order; onUpdate: (id: string, status: string) => Promise<void> }) {
  const [isOpen, setIsOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === order.orderStatus) {
      setIsOpen(false);
      return;
    }
    
    setUpdating(true);
    await onUpdate(order._id, newStatus);
    setUpdating(false);
    setIsOpen(false);
  };

  // Don't show dropdown for cancelled or delivered orders
  if (order.orderStatus === 'cancelled' || order.orderStatus === 'delivered') {
    return <StatusBadge status={order.orderStatus} />;
  }

  const availableStatuses = STATUS_FLOW.filter(s => {
    const currentIndex = STATUS_FLOW.indexOf(order.orderStatus);
    const targetIndex = STATUS_FLOW.indexOf(s);
    // Allow moving forward only, unless it's cancelled
    return targetIndex > currentIndex || s === 'cancelled';
  });

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
      >
        <StatusBadge status={order.orderStatus} />
      </button>
      
      {isOpen && (
        <>
          <div 
            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
            onClick={() => setIsOpen(false)}
          />
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 8,
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 50,
            minWidth: 140,
            overflow: 'hidden'
          }}>
            {availableStatuses.map(status => {
              const m = STATUS_META[status];
              const Icon = m.icon;
              return (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={updating}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '8px 12px',
                    border: 'none',
                    background: 'none',
                    cursor: updating ? 'default' : 'pointer',
                    fontSize: 13,
                    color: m.color,
                    textAlign: 'left',
                    borderBottom: '1px solid #f3f4f6'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <Icon size={14} />
                  {updating ? 'Updating...' : `Mark as ${m.label}`}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// Add this component for payment status update
function PaymentStatusUpdateDropdown({ order, onUpdatePayment }: { order: Order; onUpdatePayment: (id: string, status: string) => Promise<void> }) {
  const [isOpen, setIsOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handlePaymentChange = async (newStatus: string) => {
    if (newStatus === order.paymentStatus) {
      setIsOpen(false);
      return;
    }
    
    setUpdating(true);
    await onUpdatePayment(order._id, newStatus);
    setUpdating(false);
    setIsOpen(false);
  };

  const paymentOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' },
  ];

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
      >
        <PayBadge status={order.paymentStatus} />
      </button>
      
      {isOpen && (
        <>
          <div 
            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
            onClick={() => setIsOpen(false)}
          />
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 8,
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 50,
            minWidth: 140,
            overflow: 'hidden'
          }}>
            {paymentOptions.map(option => {
              const m = PAY_META[option.value];
              return (
                <button
                  key={option.value}
                  onClick={() => handlePaymentChange(option.value)}
                  disabled={updating}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    padding: '8px 12px',
                    border: 'none',
                    background: 'none',
                    cursor: updating ? 'default' : 'pointer',
                    fontSize: 13,
                    color: m?.color || '#374151',
                    textAlign: 'left',
                    borderBottom: '1px solid #f3f4f6'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {updating ? 'Updating...' : option.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function ShipModal({ order, onClose, onUpdate }: { order: Order; onClose: () => void; onUpdate: (id: string, status: string, tracking?: string, url?: string) => Promise<void> }) {
  const [step, setStep] = useState<'review' | 'tracking' | 'done'>('review');
  const [trackingNum, setTrackingNum] = useState(order.trackingNumber || '');
  const [trackingUrl, setTrackingUrl] = useState(order.trackingUrl || '');
  const [saving, setSaving] = useState(false);

  const handleShip = async () => {
    setSaving(true);
    await onUpdate(order._id, 'shipped', trackingNum, trackingUrl || undefined);
    setSaving(false);
    setStep('done');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: '#111827' }}>Ship order</h2>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: '#6b7280' }}>#{order._id.slice(-8).toUpperCase()} · {order.customerName}</p>
          </div>
          <button onClick={onClose} style={{ padding: 6, border: 'none', background: 'none', cursor: 'pointer', color: '#9ca3af', borderRadius: 6 }}>
            <IconX size={20} />
          </button>
        </div>

        {step === 'review' && (
          <div style={{ padding: 24 }}>
            <div style={{ background: '#f9fafb', borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
              <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 600, color: '#6b7280', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Ship to</p>
              <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 500, color: '#111827' }}>{order.customerName}</p>
              <p style={{ margin: 0, fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>
                {order.address}<br />
                {order.district}, {order.state} – {order.pincode}
                {order.phoneNumber && <><br />{order.phoneNumber}</>}
              </p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 600, color: '#6b7280', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Items to ship ({order.productCount})</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {order.products?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {item.product?.images?.[0]?.asset?.url && (
                        <img src={item.product.images[0].asset.url} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />
                      )}
                      <div>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: '#111827' }}>{item.product?.name || 'Product'}</p>
                        <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>
                          Qty: {item.quantity}{item.size ? ` · Size: ${item.size}` : ''}{item.color ? ` · ${item.color}` : ''}
                        </p>
                      </div>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep('tracking')}
              style={{ width: '100%', padding: '11px 0', background: '#111827', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              Continue to tracking <IconChevronRight size={16} />
            </button>
          </div>
        )}

        {step === 'tracking' && (
          <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Tracking number</label>
              <input
                type="text"
                value={trackingNum}
                onChange={e => setTrackingNum(e.target.value)}
                placeholder="e.g. DL123456789IN"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none' }}
                autoFocus
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                Tracking URL <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional)</span>
              </label>
              <input
                type="text"
                value={trackingUrl}
                onChange={e => setTrackingUrl(e.target.value)}
                placeholder="https://track.dtdc.com/..."
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none' }}
              />
              <p style={{ margin: '6px 0 0', fontSize: 12, color: '#9ca3af' }}>Customers will see this link in their order page</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setStep('review')}
                style={{ flex: 1, padding: '11px 0', background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
              >
                Back
              </button>
              <button
                onClick={handleShip}
                disabled={saving}
                style={{ flex: 2, padding: '11px 0', background: saving ? '#6b7280' : '#059669', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: saving ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <IconSend size={15} />
                {saving ? 'Marking as shipped…' : 'Mark as shipped'}
              </button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div style={{ padding: 32, textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <IconCircleCheck size={28} color="#059669" />
            </div>
            <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 600, color: '#111827' }}>Order marked as shipped!</h3>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: '#6b7280' }}>
              {trackingNum ? `Tracking: ${trackingNum}` : 'No tracking number added'}
            </p>
            <button
              onClick={onClose}
              style={{ padding: '10px 28px', background: '#111827', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function OrderModal({ order, onClose, onUpdate, onUpdatePayment }: { order: Order; onClose: () => void; onUpdate: (id: string, status: string, tracking?: string, url?: string) => Promise<void>; onUpdatePayment: (id: string, status: string) => Promise<void> }) {
  const [showShipModal, setShowShipModal] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);

  const handleDeliver = async () => {
    setConfirming('delivering');
    await onUpdate(order._id, 'delivered');
    setConfirming(null);
    onClose();
  };

  const handleProcess = async () => {
    setConfirming('processing');
    await onUpdate(order._id, 'processing');
    setConfirming(null);
  };

  const currentStep = STATUS_FLOW.indexOf(order.orderStatus);

  return (
    <>
      {showShipModal && (
        <ShipModal
          order={order}
          onClose={() => setShowShipModal(false)}
          onUpdate={async (id, status, tracking, url) => {
            await onUpdate(id, status, tracking, url);
            setShowShipModal(false);
            onClose();
          }}
        />
      )}
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: '#111827' }}>Order #{order._id.slice(-8).toUpperCase()}</h2>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: '#6b7280' }}>{new Date(order.orderedAt).toLocaleString()}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <StatusBadge status={order.orderStatus} />
              <button onClick={onClose} style={{ padding: 6, border: 'none', background: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                <IconX size={20} />
              </button>
            </div>
          </div>

          {/* Add status update buttons in modal */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {STATUS_FLOW.map(status => {
              const currentIndex = STATUS_FLOW.indexOf(order.orderStatus);
              const targetIndex = STATUS_FLOW.indexOf(status);
              if (targetIndex <= currentIndex && status !== 'cancelled') return null;
              const m = STATUS_META[status];
              return (
                <button
                  key={status}
                  onClick={async () => {
                    if (status === 'shipped') {
                      setShowShipModal(true);
                    } else {
                      await onUpdate(order._id, status);
                      onClose();
                    }
                  }}
                  disabled={confirming !== null}
                  style={{
                    padding: '6px 12px',
                    background: m.bg,
                    border: `1px solid ${m.border}`,
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 500,
                    color: m.color,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <m.icon size={12} />
                  Mark as {m.label}
                </button>
              );
            })}
            {order.orderStatus !== 'cancelled' && (
              <button
                onClick={async () => {
                  if (confirm('Cancel this order?')) {
                    await onUpdate(order._id, 'cancelled');
                    onClose();
                  }
                }}
                style={{
                  padding: '6px 12px',
                  background: '#fee2e2',
                  border: '1px solid #ef4444',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 500,
                  color: '#991b1b',
                  cursor: 'pointer'
                }}
              >
                Cancel Order
              </button>
            )}
          </div>

          {order.orderStatus !== 'cancelled' && (
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 0 }}>
              {STATUS_FLOW.map((s, i) => {
                const done = i < currentStep;
                const active = i === currentStep;
                const m = STATUS_META[s];
                const Icon = m.icon;
                return (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STATUS_FLOW.length - 1 ? 1 : 'none' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: done || active ? (done ? '#d1fae5' : m.bg) : '#f3f4f6', border: `2px solid ${done ? '#10b981' : active ? m.border : '#e5e7eb'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {done ? <IconCheck size={14} color="#059669" /> : <Icon size={14} color={active ? m.color : '#9ca3af'} />}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: active ? 600 : 400, color: active ? '#111827' : done ? '#059669' : '#9ca3af', whiteSpace: 'nowrap' }}>{m.label}</span>
                    </div>
                    {i < STATUS_FLOW.length - 1 && (
                      <div style={{ flex: 1, height: 2, background: done ? '#10b981' : '#e5e7eb', margin: '0 4px', marginBottom: 18 }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Next action banner */}
          {order.orderStatus === 'pending' && (
            <div style={{ margin: '16px 24px 0', padding: '14px 16px', background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconAlertCircle size={18} color="#d97706" />
                <span style={{ fontSize: 14, color: '#92400e', fontWeight: 500 }}>Action needed: confirm and process this order</span>
              </div>
              <button
                onClick={handleProcess}
                disabled={confirming === 'processing'}
                style={{ padding: '8px 16px', background: '#d97706', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                {confirming === 'processing' ? 'Processing…' : 'Confirm order'}
              </button>
            </div>
          )}
          {order.orderStatus === 'processing' && (
            <div style={{ margin: '16px 24px 0', padding: '14px 16px', background: '#ede9fe', border: '1px solid #8b5cf6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconTruck size={18} color="#7c3aed" />
                <span style={{ fontSize: 14, color: '#5b21b6', fontWeight: 500 }}>Ready to ship — enter tracking details</span>
              </div>
              <button
                onClick={() => setShowShipModal(true)}
                style={{ padding: '8px 16px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
              >
                Ship order
              </button>
            </div>
          )}
          {order.orderStatus === 'shipped' && (
            <div style={{ margin: '16px 24px 0', padding: '14px 16px', background: '#d1fae5', border: '1px solid #10b981', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconCircleCheck size={18} color="#059669" />
                <span style={{ fontSize: 14, color: '#065f46', fontWeight: 500 }}>Package delivered? Mark it complete</span>
              </div>
              <button
                onClick={handleDeliver}
                disabled={confirming === 'delivering'}
                style={{ padding: '8px 16px', background: '#059669', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
              >
                {confirming === 'delivering' ? 'Saving…' : 'Mark delivered'}
              </button>
            </div>
          )}

          <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ padding: '14px 16px', border: '1px solid #e5e7eb', borderRadius: 8 }}>
              <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 600, color: '#6b7280', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Customer</p>
              <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 500, color: '#111827' }}>{order.customerName}</p>
              {order.phoneNumber && <p style={{ margin: '0 0 2px', fontSize: 13, color: '#6b7280' }}>{order.phoneNumber}</p>}
              {order.alternatePhone && <p style={{ margin: '0 0 2px', fontSize: 13, color: '#6b7280' }}>Alt: {order.alternatePhone}</p>}
              {order.buyerEmail && <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>{order.buyerEmail}</p>}
            </div>

            <div style={{ padding: '14px 16px', border: '1px solid #e5e7eb', borderRadius: 8 }}>
              <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 600, color: '#6b7280', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Ship to</p>
              <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
                {order.address}<br />
                {order.district}, {order.state}<br />
                Pincode: {order.pincode}
                {order.landmark && <><br />Near: {order.landmark}</>}
              </p>
            </div>

            <div style={{ padding: '14px 16px', border: '1px solid #e5e7eb', borderRadius: 8 }}>
              <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 600, color: '#6b7280', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Payment</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>Status</span>
                <PaymentStatusUpdateDropdown order={order} onUpdatePayment={onUpdatePayment} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>Mode</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#374151', textTransform: 'capitalize' }}>{order.paymentMode}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>Total</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>₹{order.totalAmount.toLocaleString()}</span>
              </div>
              {order.transactionId && (
                <div style={{ marginTop: 6, padding: '4px 8px', background: '#f9fafb', borderRadius: 4 }}>
                  <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>Txn: {order.transactionId}</p>
                </div>
              )}
            </div>

            <div style={{ padding: '14px 16px', border: '1px solid #e5e7eb', borderRadius: 8 }}>
              <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 600, color: '#6b7280', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Reseller</p>
              <p style={{ margin: '0 0 2px', fontSize: 13, color: '#374151' }}>{order.resellerEmail}</p>
              {order.resellerName && <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>{order.resellerName}</p>}
            </div>
          </div>

          {order.trackingNumber && (
            <div style={{ margin: '0 24px', padding: '12px 16px', background: '#ede9fe', border: '1px solid #8b5cf6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconTruck size={16} color="#7c3aed" />
                <span style={{ fontSize: 13, color: '#5b21b6', fontWeight: 500 }}>Tracking: {order.trackingNumber}</span>
              </div>
              {order.trackingUrl && (
                <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#7c3aed', textDecoration: 'none', fontWeight: 500 }}>
                  Track →
                </a>
              )}
            </div>
          )}

          <div style={{ margin: '0 24px 24px' }}>
            <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 600, color: '#6b7280', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Items ({order.productCount})</p>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
              {order.products?.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: i < (order.products?.length || 0) - 1 ? '1px solid #f3f4f6' : 'none', gap: 12 }}>
                  {item.product?.images?.[0]?.asset?.url ? (
                    <img src={item.product.images[0].asset.url} alt="" style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 44, height: 44, borderRadius: 6, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <IconPackage size={20} color="#9ca3af" />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 500, color: '#111827' }}>{item.product?.name || 'Product'}</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>
                      Qty: {item.quantity}{item.size ? ` · Size: ${item.size}` : ''}{item.color ? ` · ${item.color}` : ''}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 500, color: '#111827' }}>₹{(item.price * item.quantity).toLocaleString()}</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>₹{item.price} each</p>
                  </div>
                </div>
              ))}
              <div style={{ padding: '10px 16px', background: '#f9fafb', display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Total: ₹{order.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 10 }}>
            <Link href={`/order/${order._id}`} target="_blank" style={{ flex: 1, padding: '10px 0', background: '#111827', color: '#fff', borderRadius: 8, textAlign: 'center', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
              Customer view
            </Link>
            <button onClick={() => window.print()} style={{ flex: 1, padding: '10px 0', background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
              Print
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sanity/orders');
      const data = await res.json();
      setOrders(data.orders || []);
      setLastUpdate(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const t = setInterval(fetchOrders, 30000);
    return () => clearInterval(t);
  }, [fetchOrders]);

  useEffect(() => {
    let f = [...orders];
    if (statusFilter !== 'all') f = f.filter(o => o.orderStatus === statusFilter);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      f = f.filter(o =>
        o.customerName.toLowerCase().includes(q) ||
        o.resellerEmail.toLowerCase().includes(q) ||
        o._id.toLowerCase().includes(q) ||
        o.phoneNumber?.includes(q) ||
        o.transactionId?.toLowerCase().includes(q)
      );
    }
    setFilteredOrders(f);
  }, [searchTerm, statusFilter, orders]);

  const updateOrder = async (id: string, status: string, tracking?: string, url?: string) => {
    setUpdating(true);
    try {
      await fetch('/api/sanity/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id, orderStatus: status, trackingNumber: tracking, trackingUrl: url, updatedAt: new Date().toISOString() }),
      });
      await fetchOrders();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  const updatePaymentStatus = async (id: string, paymentStatus: string) => {
    setUpdating(true);
    try {
      await fetch('/api/sanity/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id, paymentStatus, updatedAt: new Date().toISOString() }),
      });
      await fetchOrders();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  const newOrders = orders.filter(o => o.orderStatus === 'pending');
  const tabs = [
    { key: 'all',        label: 'All' },
    { key: 'pending',    label: 'Pending' },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped',    label: 'Shipped' },
    { key: 'delivered',  label: 'Delivered' },
    { key: 'cancelled',  label: 'Cancelled' },
  ];

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: '#111827' }}>
      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={updateOrder}
          onUpdatePayment={updatePaymentStatus}
        />
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>Orders</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#9ca3af' }}>
            Updated {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', fontSize: 13, cursor: 'pointer', color: '#374151' }}
        >
          <IconRefresh size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {newOrders.length > 0 && (
        <div style={{ marginBottom: 20, padding: '14px 18px', background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 0 3px rgba(245,158,11,0.3)' }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#92400e' }}>
              {newOrders.length} new order{newOrders.length > 1 ? 's' : ''} waiting for action
            </span>
          </div>
          <button
            onClick={() => setStatusFilter('pending')}
            style={{ fontSize: 13, fontWeight: 500, color: '#d97706', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Review now →
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total orders', value: orders.length, color: '#111827' },
          { label: 'Revenue', value: `₹${orders.reduce((s, o) => s + o.totalAmount, 0).toLocaleString()}`, color: '#059669' },
          { label: 'Pending', value: orders.filter(o => o.orderStatus === 'pending').length, color: '#d97706' },
          { label: 'Shipped', value: orders.filter(o => o.orderStatus === 'shipped').length, color: '#7c3aed' },
          { label: 'Delivered', value: orders.filter(o => o.orderStatus === 'delivered').length, color: '#059669' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 16px' }}>
            <p style={{ margin: '0 0 4px', fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>{s.label}</p>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 600, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', gap: 2 }}>
            {tabs.map(t => {
              const count = t.key === 'all' ? orders.length : orders.filter(o => o.orderStatus === t.key).length;
              return (
                <button
                  key={t.key}
                  onClick={() => setStatusFilter(t.key)}
                  style={{
                    padding: '6px 12px', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: statusFilter === t.key ? 600 : 400,
                    background: statusFilter === t.key ? '#f3f4f6' : 'transparent',
                    color: statusFilter === t.key ? '#111827' : '#6b7280',
                  }}
                >
                  {t.label} {count > 0 && <span style={{ fontSize: 11, marginLeft: 2, color: statusFilter === t.key ? '#374151' : '#9ca3af' }}>{count}</span>}
                </button>
              );
            })}
          </div>
          <div style={{ position: 'relative' }}>
            <IconSearch size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search orders…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, width: 260, outline: 'none' }}
            />
          </div>
        </div>

        {loading && orders.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>Loading orders…</div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>No orders found</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                  {['Order', 'Customer', 'Reseller', 'Items', 'Total', 'Status', 'Payment', 'Date', ''].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr
                    key={order._id}
                    style={{ borderBottom: '1px solid #f9fafb', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 500, color: '#3b82f6' }}>
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 500, color: '#111827' }}>{order.customerName}</p>
                      {order.phoneNumber && <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>{order.phoneNumber}</p>}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <p style={{ margin: '0 0 2px', fontSize: 13, color: '#374151' }}>{order.resellerEmail}</p>
                      {order.resellerName && <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>{order.resellerName}</p>}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: 13, color: '#374151' }}>{order.productCount} item{order.productCount !== 1 ? 's' : ''}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 600, color: '#111827' }}>₹{order.totalAmount.toLocaleString()}</p>
                      <p style={{ margin: 0, fontSize: 12, color: '#9ca3af', textTransform: 'capitalize' }}>{order.paymentMode}</p>
                    </td>
                    <td style={{ padding: '14px 16px' }} onClick={e => e.stopPropagation()}>
                      <StatusUpdateDropdown order={order} onUpdate={updateOrder} />
                    </td>
                    <td style={{ padding: '14px 16px' }} onClick={e => e.stopPropagation()}>
                      <PaymentStatusUpdateDropdown order={order} onUpdatePayment={updatePaymentStatus} />
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: 13, color: '#9ca3af' }}>{new Date(order.orderedAt).toLocaleDateString()}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => setSelectedOrder(order)} style={{ padding: '6px 8px', border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', cursor: 'pointer', color: '#6b7280' }} title="View">
                          <IconEye size={14} />
                        </button>
                        <Link href={`/order/${order._id}`} target="_blank" onClick={e => e.stopPropagation()} style={{ padding: '6px 8px', border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', color: '#6b7280', display: 'flex', alignItems: 'center' }} title="Print">
                          <IconPrinter size={14} />
                        </Link>
                        {order.orderStatus === 'processing' && (
                          <button
                            onClick={() => setSelectedOrder(order)}
                            style={{ padding: '6px 10px', border: 'none', borderRadius: 6, background: '#7c3aed', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}
                          >
                            <IconTruck size={13} /> Ship
                          </button>
                        )}
                        {order.orderStatus === 'pending' && (
                          <button
                            onClick={() => setSelectedOrder(order)}
                            style={{ padding: '6px 10px', border: 'none', borderRadius: 6, background: '#d97706', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}
                          >
                            Review
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}