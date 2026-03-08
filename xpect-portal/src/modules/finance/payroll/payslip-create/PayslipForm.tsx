import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { financeNavigate } from '../../financeNavStore';
import { useFinance } from '../../../../context/FinanceContext';
import api from '../../../../services/api';
import CompanyInformationForm from './CompanyInformationForm';
import EmployeeInformationForm, { type CleanerOption } from './EmployeeInformationForm';
import EarningsTableInput, { DEFAULT_EARNINGS_ROWS } from './EarningsTableInput';
import DeductionsTableInput, { DEFAULT_DEDUCTIONS_ROWS } from './DeductionsTableInput';
import NetSalarySummary from './NetSalarySummary';
import YearToDateSummary from './YearToDateSummary';
import LeaveSummaryInput, { DEFAULT_LEAVE_ROWS } from './LeaveSummaryInput';
import NotesSection from './NotesSection';
import FormActionButtons from './FormActionButtons';
import { DEFAULT_PAYSLIP_FORM_DATA, type PayslipFormData } from './payslipFormTypes';

interface Props {
  mode: 'create' | 'edit' | 'template';
  payslipId?: string | null;
  initialData?: Partial<PayslipFormData>;
}

const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const PayslipForm: React.FC<Props> = ({ mode, payslipId, initialData }) => {
  const { addPayroll, updatePayroll, refreshPayroll, payrollRecords } = useFinance();
  const isTemplate = mode === 'template';
  const defaults = { ...DEFAULT_PAYSLIP_FORM_DATA, ...initialData };

  const [payType, setPayType] = useState<'Hourly' | 'Monthly'>(defaults.payType ?? 'Hourly');
  const [company, setCompany] = useState(defaults.company);
  const [employee, setEmployee] = useState(defaults.employee);
  const [cleaners, setCleaners] = useState<CleanerOption[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [earningsRows, setEarningsRows] = useState(defaults.earningsRows ?? DEFAULT_EARNINGS_ROWS);
  const [deductionsRows, setDeductionsRows] = useState(defaults.deductionsRows ?? DEFAULT_DEDUCTIONS_ROWS);
  const [netPay, setNetPay] = useState(defaults.netPay ?? '1290.00');
  const [netPayInWords, setNetPayInWords] = useState(defaults.netPayInWords ?? 'One thousand two hundred ninety pounds only');
  const [ytdSummary, setYtdSummary] = useState(defaults.ytdSummary ?? DEFAULT_PAYSLIP_FORM_DATA.ytdSummary);
  const [leaveRows, setLeaveRows] = useState(defaults.leaveRows ?? DEFAULT_LEAVE_ROWS);
  const [notes, setNotes] = useState(defaults.notes ?? '');

  useEffect(() => {
    api.cleaners.getAll().then((list: CleanerOption[]) => {
      setCleaners(Array.isArray(list) ? list : []);
    }).catch(() => setCleaners([]));
  }, []);

  useEffect(() => {
    if (payType === 'Monthly') return;
    setEarningsRows(prev => prev.map((row, i) => {
      const needsFix = row.hours === '—' || row.rate === '—' || row.hours === '' || row.rate === '';
      if (!needsFix) return row;
      const isBasic = row.description === 'Basic Pay';
      const amt = parseFloat(row.amount) || 0;
      const hours = isBasic ? '160' : '0';
      const rate = isBasic && amt > 0 ? (amt / 160).toFixed(2) : isBasic ? '10.00' : '0.00';
      const h = parseFloat(hours) || 0;
      const r = parseFloat(rate) || 0;
      return { ...row, hours, rate, amount: (h * r).toFixed(2) };
    }));
  }, [payType]);

  const handleCleanerSelect = useCallback((cleaner: CleanerOption) => {
    setEmployee(prev => ({
      ...prev,
      employeeId: cleaner.id,
      employeeName: cleaner.name || prev.employeeName,
    }));
    const pt = cleaner.payType === 'Monthly' ? 'Monthly' : 'Hourly';
    setPayType(pt);
    setEarningsRows(prev => {
      const next = [...prev];
      const basicIdx = next.findIndex(r => r.description === 'Basic Pay');
      if (basicIdx >= 0) {
        if (pt === 'Monthly' && cleaner.monthlySalary != null && cleaner.monthlySalary > 0) {
          next[basicIdx] = { ...next[basicIdx], hours: '—', rate: '—', amount: String(cleaner.monthlySalary.toFixed(2)) };
        } else if (cleaner.hourlyPayRate != null && cleaner.hourlyPayRate > 0) {
          next[basicIdx] = { ...next[basicIdx], rate: String(cleaner.hourlyPayRate.toFixed(2)) };
          const h = parseFloat(next[basicIdx].hours) || 160;
          next[basicIdx].amount = (h * cleaner.hourlyPayRate).toFixed(2);
        }
      }
      return next;
    });
  }, []);

  const grossPay = useMemo(
    () => earningsRows.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0).toFixed(2),
    [earningsRows]
  );
  const totalDeductions = useMemo(
    () => deductionsRows.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0).toFixed(2),
    [deductionsRows]
  );

  const resetForm = () => {
    const d = { ...DEFAULT_PAYSLIP_FORM_DATA, ...initialData };
    setPayType(d.payType ?? 'Hourly');
    setCompany(d.company);
    setEmployee(d.employee);
    setEarningsRows(d.earningsRows ?? DEFAULT_EARNINGS_ROWS);
    setDeductionsRows(d.deductionsRows ?? DEFAULT_DEDUCTIONS_ROWS);
    setNetPay(d.netPay ?? '1290.00');
    setNetPayInWords(d.netPayInWords ?? 'One thousand two hundred ninety pounds only');
    setYtdSummary(d.ytdSummary ?? DEFAULT_PAYSLIP_FORM_DATA.ytdSummary);
    setLeaveRows(d.leaveRows ?? DEFAULT_LEAVE_ROWS);
    setNotes(d.notes ?? '');
  };

  const handleCancel = () => {
    financeNavigate('payroll-list');
  };

  const handlePreview = () => {
    if (isTemplate) return;
    financeNavigate('payslip-view', payslipId || 'preview');
  };

  const handleGenerate = async () => {
    if (isTemplate) {
      setSubmitLoading(true);
      try {
        await api.payslipSettings.update({
          payType,
          company,
          earningsRows,
          deductionsRows,
          leaveRows,
          ytdSummary,
          notes,
        });
        alert('Template saved successfully.');
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to save template');
      } finally {
        setSubmitLoading(false);
      }
      return;
    }

    const workerId = employee.employeeId?.trim();
    const workerName = employee.employeeName?.trim();
    const month = company.month ?? new Date().getMonth() + 1;
    const year = company.year ?? new Date().getFullYear();
    const totalSalary = parseFloat(grossPay) || 0;
    let hoursWorked = 0;
    let hourlyRate = 0;
    let monthlySalary: number | null = null;
    const basicRow = earningsRows.find(r => r.description === 'Basic Pay');
    if (payType === 'Monthly') {
      monthlySalary = basicRow ? (parseFloat(basicRow.amount) || totalSalary) : totalSalary;
    } else {
      if (basicRow) {
        hoursWorked = parseFloat(basicRow.hours) || 0;
        hourlyRate = parseFloat(basicRow.rate) || 0;
      }
      if (!hoursWorked) hoursWorked = earningsRows.reduce((sum, r) => sum + (parseFloat(String(r.hours)) || 0), 0);
      if (!hourlyRate && hoursWorked > 0) hourlyRate = totalSalary / hoursWorked;
      if (!hourlyRate) hourlyRate = parseFloat(earningsRows[0]?.rate || '0') || 12;
      if (!hoursWorked) hoursWorked = 160;
    }

    if (!workerId || !workerName) {
      alert('Please select an employee and ensure Employee Name is filled.');
      return;
    }
    if (totalSalary <= 0) {
      alert('Total salary (gross pay) must be greater than 0.');
      return;
    }

    if (mode === 'edit' && payslipId) {
      setSubmitLoading(true);
      try {
        await updatePayroll(payslipId, {
          payType,
          hoursWorked,
          hourlyRate,
          monthlySalary,
          totalSalary,
          month,
          year,
        });
        await refreshPayroll();
        financeNavigate('payroll-list');
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to update payroll record');
      } finally {
        setSubmitLoading(false);
      }
      return;
    }

    const exists = payrollRecords.some(
      p => p.workerId === workerId && p.month === month && p.year === year
    );
    if (exists) {
      alert('Payroll for this cleaner already exists for the selected pay period.');
      return;
    }

    setSubmitLoading(true);
    try {
      await addPayroll({
        workerId,
        workerName,
        month,
        year,
        payType,
        hoursWorked,
        hourlyRate,
        monthlySalary,
        totalSalary,
        paymentStatus: 'Pending',
      });
      await refreshPayroll();
      financeNavigate('payroll-list');
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err
        ? (err as { message?: string }).message
        : 'Failed to create payroll record';
      if (String(msg).toLowerCase().includes('conflict') || String(msg).includes('409')) {
        alert('Payroll for this cleaner already exists for the selected pay period.');
      } else {
        alert(msg);
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const title = isTemplate ? 'Payslip Template' : mode === 'create' ? 'Create Payslip' : 'Edit Payslip';

  return (
    <div className="w-full max-w-4xl">
      <div className="flex items-center gap-2 text-sm text-[#4c669a] mb-4 print:hidden">
        <button
          type="button"
          onClick={() => financeNavigate('payroll-list')}
          className="flex items-center gap-2 text-[#4c669a] hover:text-[#2e4150] font-semibold"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Back to Payroll
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-6 sm:p-8 space-y-8">
        <h1 className="text-xl font-bold text-[#0d121b]">{title}</h1>

        <div className="bg-[#fafbfd] rounded-xl border border-[#e7ebf3] p-4 sm:p-6 space-y-6">
          <CompanyInformationForm value={company} onChange={v => setCompany(prev => ({ ...prev, ...v }))} />
        </div>

        {!isTemplate && (
          <div className="bg-[#fafbfd] rounded-xl border border-[#e7ebf3] p-4 sm:p-6 space-y-6">
            <EmployeeInformationForm
              value={employee}
              onChange={v => setEmployee(prev => ({ ...prev, ...v }))}
              cleaners={cleaners}
              onCleanerSelect={handleCleanerSelect}
            />
            <div>
              <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Pay Type</label>
              <select
                value={payType}
                onChange={e => setPayType(e.target.value as 'Hourly' | 'Monthly')}
                className="w-full max-w-[200px] px-3 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20"
              >
                <option value="Hourly">Hourly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
          </div>
        )}
        {isTemplate && (
          <div className="bg-[#fafbfd] rounded-xl border border-[#e7ebf3] p-4 sm:p-6">
            <div>
              <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Default Pay Type</label>
              <select
                value={payType}
                onChange={e => setPayType(e.target.value as 'Hourly' | 'Monthly')}
                className="w-full max-w-[200px] px-3 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20"
              >
                <option value="Hourly">Hourly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#fafbfd] rounded-xl border border-[#e7ebf3] p-4 sm:p-6">
            <EarningsTableInput rows={earningsRows} onChange={setEarningsRows} payType={payType} />
          </div>
          <div className="bg-[#fafbfd] rounded-xl border border-[#e7ebf3] p-4 sm:p-6">
            <DeductionsTableInput rows={deductionsRows} onChange={setDeductionsRows} />
          </div>
        </div>

        <div className="bg-[#fafbfd] rounded-xl border border-[#e7ebf3] p-4 sm:p-6">
          <NetSalarySummary
            grossPay={grossPay}
            totalDeductions={totalDeductions}
            netPay={netPay}
            netPayInWords={netPayInWords}
            onNetPayChange={setNetPay}
            onNetPayInWordsChange={setNetPayInWords}
          />
        </div>

        <div className="bg-[#fafbfd] rounded-xl border border-[#e7ebf3] p-4 sm:p-6">
          <YearToDateSummary value={ytdSummary} onChange={v => setYtdSummary(prev => ({ ...prev, ...v }))} />
        </div>

        <div className="bg-[#fafbfd] rounded-xl border border-[#e7ebf3] p-4 sm:p-6">
          <LeaveSummaryInput rows={leaveRows} onChange={setLeaveRows} />
        </div>

        <div className="bg-[#fafbfd] rounded-xl border border-[#e7ebf3] p-4 sm:p-6">
          <NotesSection value={notes} onChange={setNotes} />
        </div>

        <FormActionButtons
          mode={isTemplate ? 'template' : mode}
          onReset={resetForm}
          onCancel={handleCancel}
          onPreview={handlePreview}
          onGenerate={handleGenerate}
          generateLabel={isTemplate ? 'Save Template' : mode === 'edit' ? 'Update Payslip' : 'Generate Payslip'}
          submitLoading={submitLoading}
        />
      </div>
    </div>
  );
};

export default PayslipForm;
