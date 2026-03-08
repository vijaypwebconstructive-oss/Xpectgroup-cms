import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Prospect } from '../modules/prospect/types';
import api from '../services/api';

interface ProspectContextType {
  prospects: Prospect[];
  loading: boolean;
  error: string | null;
  refreshProspects: () => Promise<void>;
  getProspectById: (id: string) => Prospect | undefined;
  addProspect: (data: Omit<Prospect, 'id' | 'createdAt'>) => Promise<Prospect>;
  updateProspect: (id: string, updates: Partial<Prospect>) => Promise<void>;
  deleteProspect: (id: string) => Promise<void>;
}

const ProspectContext = createContext<ProspectContextType | undefined>(undefined);

export const useProspects = () => {
  const ctx = useContext(ProspectContext);
  if (!ctx) throw new Error('useProspects must be used within ProspectsProvider');
  return ctx;
};

interface ProspectsProviderProps {
  children: ReactNode;
}

export const ProspectsProvider: React.FC<ProspectsProviderProps> = ({ children }) => {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProspects = useCallback(async () => {
    try {
      setError(null);
      const list = await api.prospects.getAll();
      setProspects(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prospects');
      setProspects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProspects();
  }, [refreshProspects]);

  const getProspectById = useCallback((id: string) => prospects.find(p => p.id === id), [prospects]);

  const addProspect = useCallback(async (data: Omit<Prospect, 'id' | 'createdAt'>): Promise<Prospect> => {
    const created = await api.prospects.create(data);
    setProspects(prev => [created, ...prev]);
    return created;
  }, []);

  const updateProspect = useCallback(async (id: string, updates: Partial<Prospect>) => {
    const updated = await api.prospects.update(id, updates);
    setProspects(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
  }, []);

  const deleteProspect = useCallback(async (id: string) => {
    await api.prospects.delete(id);
    setProspects(prev => prev.filter(p => p.id !== id));
  }, []);

  return (
    <ProspectContext.Provider
      value={{
        prospects,
        loading,
        error,
        refreshProspects,
        getProspectById,
        addProspect,
        updateProspect,
        deleteProspect,
      }}
    >
      {children}
    </ProspectContext.Provider>
  );
};
