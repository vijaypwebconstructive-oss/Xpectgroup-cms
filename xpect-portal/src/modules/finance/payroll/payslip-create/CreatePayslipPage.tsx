import React, { useEffect, useState } from 'react';
import api from '../../../../services/api';
import type { PayslipFormData } from './payslipFormTypes';
import PayslipForm from './PayslipForm';

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

const CreatePayslipPage: React.FC = () => {
  const [initialData, setInitialData] = useState<Partial<PayslipFormData> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.payslipSettings
      .get()
      .then((settings) => setInitialData(mapSettingsToFormData(settings)))
      .catch(() => setInitialData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-[#6b7a99]">Loading...</p>
      </div>
    );
  }

  return <PayslipForm mode="create" initialData={initialData ?? undefined} />;
};

export default CreatePayslipPage;
