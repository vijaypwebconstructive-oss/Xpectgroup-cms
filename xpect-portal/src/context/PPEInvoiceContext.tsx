import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { PPEInvoiceRecord } from '../types';
import api from '../services/api';

interface PPEInvoiceContextType {
  ppeInvoiceRecords: PPEInvoiceRecord[];
  loading: boolean;
  error: string | null;
  refreshInvoices: () => Promise<void>;
  addPPEInvoiceRecord: (record: Omit<PPEInvoiceRecord, 'id' | 'createdAt'>) => Promise<PPEInvoiceRecord>;
  updatePPEInvoiceRecord: (id: string, updates: Partial<PPEInvoiceRecord>) => Promise<void>;
}

const PPEInvoiceContext = createContext<PPEInvoiceContextType | undefined>(undefined);

export const usePPEInvoice = () => {
  const context = useContext(PPEInvoiceContext);
  if (!context) {
    throw new Error('usePPEInvoice must be used within a PPEInvoiceProvider');
  }
  return context;
};

interface PPEInvoiceProviderProps {
  children: ReactNode;
}

export const PPEInvoiceProvider: React.FC<PPEInvoiceProviderProps> = ({ children }) => {
  const [ppeInvoiceRecords, setPPEInvoiceRecords] = useState<PPEInvoiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshInvoices = useCallback(async () => {
    try {
      setError(null);
      const records = await api.ppe.getInvoices();
      setPPEInvoiceRecords(Array.isArray(records) ? records : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch PPE invoices');
      setPPEInvoiceRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshInvoices();
  }, [refreshInvoices]);

  const addPPEInvoiceRecord = useCallback(async (record: Omit<PPEInvoiceRecord, 'id' | 'createdAt'>): Promise<PPEInvoiceRecord> => {
    const newRecord = await api.ppe.createInvoice(record);
    setPPEInvoiceRecords(prev => [newRecord, ...prev]);
    return newRecord;
  }, []);

  const updatePPEInvoiceRecord = useCallback(async (id: string, updates: Partial<PPEInvoiceRecord>) => {
    const updated = await api.ppe.updateInvoice(id, { emailStatus: updates.emailStatus });
    setPPEInvoiceRecords(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
  }, []);

  return (
    <PPEInvoiceContext.Provider value={{
      ppeInvoiceRecords,
      loading,
      error,
      refreshInvoices,
      addPPEInvoiceRecord,
      updatePPEInvoiceRecord,
    }}>
      {children}
    </PPEInvoiceContext.Provider>
  );
};
