import React, { useEffect, useState } from 'react';
import api from '../../../../services/api';
import type { PayrollRecord } from '../../finance-payroll/types';
import type { PayslipFormData } from '../payslip-create/payslipFormTypes';
import PayslipForm from '../payslip-create/PayslipForm';

const MONTH_NAMES = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface PayslipEditPageProps {
  payslipId: string | null;
}

function mapPayrollToFormData(p: PayrollRecord): Partial<PayslipFormData> {
  const payPeriod = p.month && p.year ? `${MONTH_NAMES[p.month]} ${p.year}` : '';
  const payDate = p.paymentDate || (p.month && p.year ? `${p.month}/${p.year}` : '');
  const payType = p.payType === 'Monthly' ? 'Monthly' : 'Hourly';
  const isMonthly = payType === 'Monthly';
  const basicPayRow = isMonthly
    ? { description: 'Basic Pay', hours: '—', rate: '—', amount: String((p.monthlySalary ?? p.totalSalary ?? 0).toFixed(2)) }
    : { description: 'Basic Pay', hours: String(p.hoursWorked ?? 160), rate: String((p.hourlyRate ?? 0).toFixed(2)), amount: String((p.totalSalary ?? 0).toFixed(2)) };
  return {
    payType,
    company: {
      companyName: 'Xpect Group',
      companyAddress: 'Address Line 1, City, Postcode',
      payeReference: '123/AB45678',
      payPeriod,
      payDate,
      payslipNumber: `PS-${p.id}`,
      month: p.month,
      year: p.year,
    },
    employee: {
      employeeId: p.workerId,
      employeeName: p.workerName || '',
      department: 'Operations',
      jobTitle: p.role || 'Cleaner',
      employmentType: '',
      payRateDisplay: p.hourlyRate != null ? `£${p.hourlyRate.toFixed(2)}/hr` : p.monthlySalary != null ? `£${p.monthlySalary.toFixed(2)}/month` : '',
      niNumber: '',
      taxCode: '',
    },
    earningsRows: [
      basicPayRow,
      { description: 'Overtime Pay', hours: '0', rate: '15.00', amount: '0.00' },
      { description: 'Holiday Pay', hours: '0', rate: '10.00', amount: '0.00' },
      { description: 'Bonus', hours: '0', rate: '0.00', amount: '0.00' },
      { description: 'Allowance', hours: '0', rate: '0.00', amount: '0.00' },
    ],
    deductionsRows: [
      { description: 'PAYE Tax', amount: '0.00' },
      { description: 'National Insurance', amount: '0.00' },
      { description: 'Pension Contribution', amount: '0.00' },
      { description: 'Student Loan', amount: '0.00' },
      { description: 'Other Deductions', amount: '0.00' },
    ],
    netPay: String((p.totalSalary ?? 0).toFixed(2)),
    netPayInWords: '',
  };
}

const PayslipEditPage: React.FC<PayslipEditPageProps> = ({ payslipId }) => {
  const [initialData, setInitialData] = useState<Partial<PayslipFormData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!payslipId) {
      setLoading(false);
      setError('No payroll ID provided');
      return;
    }
    setLoading(true);
    setError(null);
    api.finance.payroll
      .getById(payslipId)
      .then((p: PayrollRecord) => {
        setInitialData(mapPayrollToFormData(p));
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to load payroll');
      })
      .finally(() => setLoading(false));
  }, [payslipId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-[#6b7a99]">Loading payroll...</p>
      </div>
    );
  }

  if (error || !initialData) {
    return (
      <div className="space-y-4">
        <p className="text-red-600">{error || 'Payroll not found'}</p>
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

  return <PayslipForm mode="edit" payslipId={payslipId} initialData={initialData} />;
};

export default PayslipEditPage;
