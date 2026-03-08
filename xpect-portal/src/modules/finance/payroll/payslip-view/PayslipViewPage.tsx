import React, { useEffect, useState } from 'react';
import { financeNavigate } from '../../financeNavStore';
import api from '../../../../services/api';
import type { PayrollRecord } from '../../finance-payroll/types';
import PayslipTemplate from '../../../../components/payroll/PayslipTemplate';
import {
  buildPayslipTemplateData,
  type PayslipSettingsLike,
} from '../../../../components/payroll/buildPayslipTemplateData';
import type { PayslipTemplateData } from '../../../../components/payroll/payslipTemplateTypes';

interface PayslipViewPageProps {
  payslipId: string;
}

const PayslipViewPage: React.FC<PayslipViewPageProps> = ({ payslipId }) => {
  const [payroll, setPayroll] = useState<PayrollRecord | null>(null);
  const [settings, setSettings] = useState<PayslipSettingsLike | null>(null);
  const [loading, setLoading] = useState(true);

  const isPlaceholder = payslipId === 'preview' || payslipId === 'generated' || payslipId === 'updated';

  useEffect(() => {
    const load = async () => {
      if (isPlaceholder || !payslipId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [payrollRes, settingsRes] = await Promise.all([
          api.finance.payroll.getById(payslipId) as Promise<PayrollRecord>,
          api.payslipSettings.get() as Promise<PayslipSettingsLike>,
        ]);
        setPayroll(payrollRes);
        setSettings(settingsRes);
      } catch {
        setPayroll(null);
        setSettings(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [payslipId, isPlaceholder]);

  useEffect(() => {
    if (isPlaceholder && !settings) {
      api.payslipSettings.get().then((s) => setSettings(s as PayslipSettingsLike)).catch(() => {});
    }
  }, [isPlaceholder, settings]);

  const handlePrint = () => window.print();

  const templateData: PayslipTemplateData = buildPayslipTemplateData(payroll, settings);

  if (loading && !isPlaceholder) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-[#6b7a99]">Loading payslip...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Screen-only: back + print */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 print:hidden">
        <button
          type="button"
          onClick={() => financeNavigate('payroll-list')}
          className="flex items-center gap-2 text-[#4c669a] hover:text-[#2e4150] font-semibold"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Back to Payroll
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-[#2e4150] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-[18px]">print</span>
          Print Payslip
        </button>
      </div>

      <PayslipTemplate data={templateData} />
    </div>
  );
};

export default PayslipViewPage;
