import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { TrainingRecord } from '../views/trainingMockData';
import api from '../services/api';

interface TrainingContextType {
  trainingRecords: TrainingRecord[];
  loading: boolean;
  error: string | null;
  refreshRecords: () => Promise<void>;
  addTrainingRecord: (record: Omit<TrainingRecord, 'id'>) => Promise<TrainingRecord>;
  updateTrainingRecord: (id: string, updates: Partial<TrainingRecord>) => Promise<void>;
  deleteTrainingRecord: (id: string) => Promise<void>;
}

const TrainingContext = createContext<TrainingContextType | undefined>(undefined);

export const useTraining = () => {
  const context = useContext(TrainingContext);
  if (!context) {
    throw new Error('useTraining must be used within a TrainingProvider');
  }
  return context;
};

interface TrainingProviderProps {
  children: ReactNode;
}

export const TrainingProvider: React.FC<TrainingProviderProps> = ({ children }) => {
  const [trainingRecords, setTrainingRecords] = useState<TrainingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshRecords = useCallback(async () => {
    try {
      setError(null);
      const list = await api.trainingRecords.getAll();
      setTrainingRecords(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch training records');
      setTrainingRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshRecords();
  }, [refreshRecords]);

  const addTrainingRecord = useCallback(async (record: Omit<TrainingRecord, 'id'>): Promise<TrainingRecord> => {
    const created = await api.trainingRecords.create(record);
    setTrainingRecords(prev => [created, ...prev]);
    return created;
  }, []);

  const updateTrainingRecord = useCallback(async (id: string, updates: Partial<TrainingRecord>) => {
    const updated = await api.trainingRecords.update(id, updates);
    setTrainingRecords(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
  }, []);

  const deleteTrainingRecord = useCallback(async (id: string) => {
    await api.trainingRecords.delete(id);
    setTrainingRecords(prev => prev.filter(r => r.id !== id));
  }, []);

  return (
    <TrainingContext.Provider
      value={{
        trainingRecords,
        loading,
        error,
        refreshRecords,
        addTrainingRecord,
        updateTrainingRecord,
        deleteTrainingRecord,
      }}
    >
      {children}
    </TrainingContext.Provider>
  );
};
