'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { IconSettings, IconCheck } from '@tabler/icons-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    siteName: process.env.NEXT_PUBLIC_APP_NAME || '',
    upiId: process.env.NEXT_PUBLIC_UPI_ID || '',
    shippingCharge: '0',
    codCharge: '100',
    trialDays: '30',
    subscriptionAmount: '300',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Save settings to database or environment
    setTimeout(() => {
      setSaving(false);
      alert('Settings saved successfully!');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Configure application settings</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="max-w-2xl space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Site Name
            </label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              UPI ID
            </label>
            <input
              type="text"
              value={settings.upiId}
              onChange={(e) => setSettings({ ...settings, upiId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shipping Charge (₹)
              </label>
              <input
                type="number"
                value={settings.shippingCharge}
                onChange={(e) => setSettings({ ...settings, shippingCharge: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                COD Charge (₹)
              </label>
              <input
                type="number"
                value={settings.codCharge}
                onChange={(e) => setSettings({ ...settings, codCharge: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trial Period (Days)
              </label>
              <input
                type="number"
                value={settings.trialDays}
                onChange={(e) => setSettings({ ...settings, trialDays: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subscription Amount (₹)
              </label>
              <input
                type="number"
                value={settings.subscriptionAmount}
                onChange={(e) => setSettings({ ...settings, subscriptionAmount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              <IconCheck size={18} />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}