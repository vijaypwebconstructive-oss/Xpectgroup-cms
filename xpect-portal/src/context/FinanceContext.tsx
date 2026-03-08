import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { PayrollRecord, SiteContract, Quotation, SalarySlip, Invoice } from '../modules/finance-payroll/types';
import api from '../services/api';

interface FinanceContextType {
  payrollRecords: PayrollRecord[];
  siteContracts: SiteContract[];
  quotations: Quotation[];
  salarySlips: SalarySlip[];
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  refreshPayroll: (params?: { month?: number; year?: number }) => Promise<void>;
  refreshSiteContracts: () => Promise<void>;
  refreshSalarySlips: (params?: { cleanerId?: string }) => Promise<void>;
  refreshQuotations: () => Promise<void>;
  refreshInvoices: (params?: { status?: string; clientName?: string; year?: number }) => Promise<void>;
  refreshAll: () => Promise<void>;
  generatePayroll: (params?: { month?: number; year?: number }) => Promise<PayrollRecord[]>;
  updatePayroll: (id: string, updates: {
    payType?: 'Hourly' | 'Monthly';
    hoursWorked?: number;
    hourlyRate?: number;
    monthlySalary?: number | null;
    totalSalary?: number;
    month?: number;
    year?: number;
    paymentStatus?: 'Pending' | 'Paid';
    paymentDate?: string;
  }) => Promise<void>;
  deletePayroll: (id: string) => Promise<void>;
  addSiteContract: (data: Omit<SiteContract, 'id'>) => Promise<SiteContract>;
  updateSiteContract: (id: string, updates: Partial<Pick<SiteContract, 'contractValue' | 'billingPeriod' | 'paymentStatus' | 'lastBillingDate' | 'paymentDate' | 'paymentDocuments'>>) => Promise<void>;
  addInvoice: (data: Omit<Invoice, 'id'>) => Promise<Invoice>;
  updateInvoice: (id: string, updates: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  addPayroll: (record: {
    workerId: string;
    workerName: string;
    month: number;
    year: number;
    payType?: 'Hourly' | 'Monthly';
    hoursWorked?: number;
    hourlyRate?: number;
    monthlySalary?: number | null;
    totalSalary: number;
    siteId?: string;
    siteName?: string;
    role?: string;
    paymentStatus?: 'Pending' | 'Paid';
    paymentDate?: string;
  }) => Promise<PayrollRecord>;
  addQuotation: (data: Omit<Quotation, 'id'>) => Promise<Quotation>;
  updateQuotation: (id: string, updates: Partial<Omit<Quotation, 'id'>>) => Promise<void>;
  deleteQuotation: (id: string) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const useFinance = () => {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
};

interface FinanceProviderProps {
  children: ReactNode;
}

export const FinanceProvider: React.FC<FinanceProviderProps> = ({ children }) => {
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [siteContracts, setSiteContracts] = useState<SiteContract[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [salarySlips, setSalarySlips] = useState<SalarySlip[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshPayroll = useCallback(async (params?: { month?: number; year?: number }) => {
    try {
      setError(null);
      const list = await api.finance.payroll.getAll(params);
      const arr = Array.isArray(list) ? list : [];
      setPayrollRecords(arr);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payroll');
    }
  }, []);

  const refreshSiteContracts = useCallback(async () => {
    try {
      setError(null);
      const list = await api.finance.siteContracts.getAll();
      setSiteContracts(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch site contracts');
      setSiteContracts([]);
    }
  }, []);

  const refreshQuotations = useCallback(async () => {
    try {
      setError(null);
      const list = await api.finance.quotations.getAll();
      setQuotations(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quotations');
      setQuotations([]);
    }
  }, []);

  const refreshSalarySlips = useCallback(async (params?: { cleanerId?: string }) => {
    try {
      setError(null);
      const list = await api.finance.salarySlips.getAll(params);
      setSalarySlips(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch salary slips');
      setSalarySlips([]);
    }
  }, []);

  const refreshInvoices = useCallback(async (params?: { status?: string; clientName?: string; year?: number }) => {
    try {
      setError(null);
      const list = await api.finance.invoices.getAll(params);
      setInvoices(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
      setInvoices([]);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([refreshPayroll(), refreshSiteContracts(), refreshQuotations(), refreshSalarySlips(), refreshInvoices()]);
    setLoading(false);
  }, [refreshPayroll, refreshSiteContracts, refreshQuotations, refreshSalarySlips, refreshInvoices]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const generatePayroll = useCallback(async (params?: { month?: number; year?: number }) => {
    const created = await api.finance.payroll.generate(params);
    const arr = Array.isArray(created) ? created : [];
    setPayrollRecords(prev => [...arr, ...prev.filter(p => !arr.some(c => c.id === p.id))]);
    return arr;
  }, []);

  const addPayroll = useCallback(async (record: {
    workerId: string;
    workerName: string;
    month: number;
    year: number;
    hoursWorked: number;
    hourlyRate: number;
    totalSalary: number;
    paymentStatus?: 'Pending' | 'Paid';
    paymentDate?: string;
  }) => {
    const created = await api.finance.payroll.create(record);
    setPayrollRecords(prev => [created, ...prev.filter(p => p.id !== created.id)]);
    return created;
  }, []);

  const updatePayroll = useCallback(async (id: string, updates: {
    payType?: 'Hourly' | 'Monthly';
    hoursWorked?: number;
    hourlyRate?: number;
    monthlySalary?: number | null;
    totalSalary?: number;
    month?: number;
    year?: number;
    paymentStatus?: 'Pending' | 'Paid';
    paymentDate?: string;
  }) => {
    const updated = await api.finance.payroll.update(id, updates);
    setPayrollRecords(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
  }, []);

  const deletePayroll = useCallback(async (id: string) => {
    await api.finance.payroll.delete(id);
    setPayrollRecords(prev => prev.filter(p => p.id !== id));
  }, []);

  const addSiteContract = useCallback(async (data: Omit<SiteContract, 'id'>) => {
    const created = await api.finance.siteContracts.create(data);
    setSiteContracts(prev => [created, ...prev.filter(c => c.id !== created.id)]);
    return created;
  }, []);

  const updateSiteContract = useCallback(async (id: string, updates: Parameters<typeof api.finance.siteContracts.update>[1]) => {
    const updated = await api.finance.siteContracts.update(id, updates);
    setSiteContracts(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
  }, []);

  const addQuotation = useCallback(async (data: Omit<Quotation, 'id'>) => {
    const created = await api.finance.quotations.create(data);
    setQuotations(prev => [created, ...prev]);
    return created;
  }, []);

  const updateQuotation = useCallback(async (id: string, updates: Partial<Omit<Quotation, 'id'>>) => {
    const updated = await api.finance.quotations.update(id, updates);
    setQuotations(prev => prev.map(q => q.id === id ? { ...q, ...updated } : q));
  }, []);

  const deleteQuotation = useCallback(async (id: string) => {
    await api.finance.quotations.delete(id);
    setQuotations(prev => prev.filter(q => q.id !== id));
  }, []);

  const addInvoice = useCallback(async (data: Omit<Invoice, 'id'>) => {
    const created = await api.finance.invoices.create(data);
    setInvoices(prev => [created, ...prev]);
    return created;
  }, []);

  const updateInvoice = useCallback(async (id: string, updates: Partial<Invoice>) => {
    const updated = await api.finance.invoices.update(id, updates);
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, ...updated } : i));
  }, []);

  const deleteInvoice = useCallback(async (id: string) => {
    await api.finance.invoices.delete(id);
    setInvoices(prev => prev.filter(i => i.id !== id));
  }, []);

  return (
    <FinanceContext.Provider
      value={{
        payrollRecords,
        siteContracts,
        quotations,
        salarySlips,
        invoices,
        loading,
        error,
        refreshPayroll,
        refreshSiteContracts,
        refreshQuotations,
        refreshSalarySlips,
        refreshInvoices,
        refreshAll,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        generatePayroll,
        updatePayroll,
        deletePayroll,
        addSiteContract,
        updateSiteContract,
        addPayroll,
        addQuotation,
        updateQuotation,
        deleteQuotation,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};
