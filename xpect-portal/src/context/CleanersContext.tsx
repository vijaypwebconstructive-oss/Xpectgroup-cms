import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Cleaner } from '../types';
import api from '../services/api';

interface CleanersContextType {
  cleaners: Cleaner[];
  loading: boolean;
  error: string | null;
  addCleaner: (cleaner: Cleaner) => Promise<void>;
  updateCleaner: (id: string, updates: Partial<Cleaner>) => Promise<void>;
  deleteCleaner: (id: string) => Promise<void>;
  refreshCleaners: () => Promise<void>;
}

const CleanersContext = createContext<CleanersContextType | undefined>(undefined);

export const useCleaners = () => {
  const context = useContext(CleanersContext);
  if (!context) {
    throw new Error('useCleaners must be used within a CleanersProvider');
  }
  return context;
};

interface CleanersProviderProps {
  children: ReactNode;
}

export const CleanersProvider: React.FC<CleanersProviderProps> = ({ children }) => {
  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCleaners = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.cleaners.getAll();
      setCleaners(data);
    } catch (err: any) {
      console.error('Failed to fetch cleaners:', err);
      const errorMessage = err.message || 'Failed to fetch cleaners';
      setError(errorMessage);
      
      // If it's a connection error, provide helpful message
      if (errorMessage.includes('Cannot connect to server')) {
        console.warn('Backend server appears to be offline. Please start the backend server.');
      }
      
      // Fallback to empty array on error
      setCleaners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCleaners();
  }, []);

  const addCleaner = async (cleaner: Cleaner) => {
    try {
      setError(null);
      const newCleaner = await api.cleaners.create(cleaner);
      setCleaners(prev => [...prev, newCleaner]);
    } catch (err: any) {
      console.error('Failed to add cleaner:', err);
      setError(err.message || 'Failed to add cleaner');
      throw err;
    }
  };

  const updateCleaner = async (id: string, updates: Partial<Cleaner>) => {
    try {
      setError(null);
      const updatedCleaner = await api.cleaners.update(id, updates);
      setCleaners(prev => prev.map(c => c.id === id ? updatedCleaner : c));
    } catch (err: any) {
      console.error('Failed to update cleaner:', err);
      setError(err.message || 'Failed to update cleaner');
      throw err;
    }
  };

  const deleteCleaner = async (id: string) => {
    try {
      setError(null);
      await api.cleaners.delete(id);
      setCleaners(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      console.error('Failed to delete cleaner:', err);
      setError(err.message || 'Failed to delete cleaner');
      throw err;
    }
  };

  const refreshCleaners = async () => {
    await fetchCleaners();
  };

  return (
    <CleanersContext.Provider value={{ 
      cleaners, 
      loading, 
      error, 
      addCleaner, 
      updateCleaner, 
      deleteCleaner,
      refreshCleaners 
    }}>
      {children}
    </CleanersContext.Provider>
  );
};
