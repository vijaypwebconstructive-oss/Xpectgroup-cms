import React, { useEffect, useState } from 'react';
import api from '../../../../services/api';
import type { PayslipFormData } from '../payslip-create/payslipFormTypes';
import PayslipForm from '../payslip-create/PayslipForm';

function mapSettingsToFormData(settings: {
  payType?: 'Hourly' | 'Monthly';
  company?: Record<string, unknown>;
  earningsRows?: Array<{ description: string; hours: string; rate: string; amount: string }>;
  deductionsRows?: Array<{ description: string; amount: string }>;
  leaveRows?: Array<{ leaveType: string; entitled: string; used: string; balance: string }>;
  ytdSummary?: Record<string, string>;
  notes?: string;
}): Partial<PayslipFormData> {
  return {
    payType: settings.payType ?? 'Hourly',
    company: settings.company as PayslipFormData['company'],
    earningsRows: settings.earningsRows ?? undefined,
    deductionsRows: settings.deductionsRows ?? undefined,
    leaveRows: settings.leaveRows ?? undefined,
    ytdSummary: settings.ytdSummary as PayslipFormData['ytdSummary'],
    notes: settings.notes ?? '',
  };
}

const PayslipTemplatePage: React.FC = () => {
  const [initialData, setInitialData] = useState<Partial<PayslipFormData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.payslipSettings
      .get()
      .then((settings) => {
        setInitialData(mapSettingsToFormData(settings));
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load payslip template');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-[#6b7a99]">Loading template...</p>
      </div>
    );
  }

  if (error || !initialData) {
    return (
      <div className="space-y-4">
        <p className="text-red-600">{error || 'Failed to load template'}</p>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="text-sm font-semibold text-[#4c669a] hover:text-[#2e4150]"
        >
          Back to Payroll
        </button>
      </div>
    );
  }

  return <PayslipForm mode="template" initialData={initialData} />;
};

export default PayslipTemplatePage;
