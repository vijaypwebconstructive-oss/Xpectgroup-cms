import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { PPEIssueRecord, PPEInventoryRecord } from '../types';
import api from '../services/api';

interface PPERecordsContextType {
  records: PPEIssueRecord[];
  inventory: PPEInventoryRecord[];
  loading: boolean;
  error: string | null;
  refreshRecords: () => Promise<void>;
  refreshInventory: () => Promise<void>;
  refreshAll: () => Promise<void>;
  addRecord: (data: Omit<PPEIssueRecord, 'id'>) => Promise<PPEIssueRecord>;
  updateRecord: (id: string, updates: Partial<PPEIssueRecord>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  addInventoryItem: (data: Omit<PPEInventoryRecord, 'id'>) => Promise<PPEInventoryRecord>;
  updateInventoryItem: (id: string, updates: Partial<PPEInventoryRecord>) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
}

const PPERecordsContext = createContext<PPERecordsContextType | undefined>(undefined);

export const usePPERecords = () => {
  const ctx = useContext(PPERecordsContext);
  if (!ctx) throw new Error('usePPERecords must be used within PPERecordsProvider');
  return ctx;
};

interface PPERecordsProviderProps {
  children: ReactNode;
}

export const PPERecordsProvider: React.FC<PPERecordsProviderProps> = ({ children }) => {
  const [records, setRecords] = useState<PPEIssueRecord[]>([]);
  const [inventory, setInventory] = useState<PPEInventoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshRecords = useCallback(async () => {
    try {
      const list = await api.ppe.getRecords();
      setRecords(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch PPE records');
      setRecords([]);
    }
  }, []);

  const refreshInventory = useCallback(async () => {
    try {
      const list = await api.ppe.getInventory();
      setInventory(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch PPE inventory');
      setInventory([]);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    await Promise.all([refreshRecords(), refreshInventory()]);
    setLoading(false);
  }, [refreshRecords, refreshInventory]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const addRecord = useCallback(async (data: Omit<PPEIssueRecord, 'id'>): Promise<PPEIssueRecord> => {
    const created = await api.ppe.createRecord(data);
    setRecords(prev => [created, ...prev]);
    return created;
  }, []);

  const updateRecord = useCallback(async (id: string, updates: Partial<PPEIssueRecord>) => {
    const updated = await api.ppe.updateRecord(id, updates);
    setRecords(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
  }, []);

  const deleteRecord = useCallback(async (id: string) => {
    await api.ppe.deleteRecord(id);
    setRecords(prev => prev.filter(r => r.id !== id));
  }, []);

  const addInventoryItem = useCallback(async (data: Omit<PPEInventoryRecord, 'id'>): Promise<PPEInventoryRecord> => {
    const created = await api.ppe.createInventoryItem(data);
    setInventory(prev => [created, ...prev]);
    return created;
  }, []);

  const updateInventoryItem = useCallback(async (id: string, updates: Partial<PPEInventoryRecord>) => {
    const updated = await api.ppe.updateInventoryItem(id, updates);
    setInventory(prev => prev.map(i => i.id === id ? { ...i, ...updated } : i));
  }, []);

  const deleteInventoryItem = useCallback(async (id: string) => {
    await api.ppe.deleteInventoryItem(id);
    setInventory(prev => prev.filter(i => i.id !== id));
  }, []);

  return (
    <PPERecordsContext.Provider
      value={{
        records,
        inventory,
        loading,
        error,
        refreshRecords,
        refreshInventory,
        refreshAll,
        addRecord,
        updateRecord,
        deleteRecord,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
      }}
    >
      {children}
    </PPERecordsContext.Provider>
  );
};
