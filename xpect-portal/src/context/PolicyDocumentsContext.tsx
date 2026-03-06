import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { PolicyDocument } from '../modules/document-control/types';
import api from '../services/api';

interface PolicyDocumentsContextType {
  documents: PolicyDocument[];
  loading: boolean;
  error: string | null;
  refreshDocuments: () => Promise<void>;
  addDocument: (data: Omit<PolicyDocument, 'id'> & { fileData?: string }) => Promise<PolicyDocument>;
  updateDocument: (id: string, updates: Partial<PolicyDocument>) => Promise<void>;
  getDocumentById: (id: string) => Promise<PolicyDocument | null>;
}

const PolicyDocumentsContext = createContext<PolicyDocumentsContextType | undefined>(undefined);

export const usePolicyDocuments = () => {
  const ctx = useContext(PolicyDocumentsContext);
  if (!ctx) throw new Error('usePolicyDocuments must be used within PolicyDocumentsProvider');
  return ctx;
};

interface PolicyDocumentsProviderProps {
  children: ReactNode;
}

export const PolicyDocumentsProvider: React.FC<PolicyDocumentsProviderProps> = ({ children }) => {
  const [documents, setDocuments] = useState<PolicyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshDocuments = useCallback(async () => {
    try {
      setError(null);
      const list = await api.policyDocuments.getAll();
      setDocuments(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments]);

  const addDocument = useCallback(async (data: Omit<PolicyDocument, 'id'> & { fileData?: string }): Promise<PolicyDocument> => {
    const created = await api.policyDocuments.create(data);
    setDocuments(prev => [created, ...prev]);
    return created;
  }, []);

  const updateDocument = useCallback(async (id: string, updates: Partial<PolicyDocument>) => {
    const updated = await api.policyDocuments.update(id, updates);
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...updated } : d));
  }, []);

  const getDocumentById = useCallback(async (id: string): Promise<PolicyDocument | null> => {
    const existing = documents.find(d => d.id === id);
    if (existing) return existing;
    try {
      const doc = await api.policyDocuments.getById(id);
      return doc ?? null;
    } catch {
      return null;
    }
  }, [documents]);

  return (
    <PolicyDocumentsContext.Provider
      value={{
        documents,
        loading,
        error,
        refreshDocuments,
        addDocument,
        updateDocument,
        getDocumentById,
      }}
    >
      {children}
    </PolicyDocumentsContext.Provider>
  );
};
