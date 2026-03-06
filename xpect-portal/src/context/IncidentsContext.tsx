import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Incident, CorrectiveAction } from '../modules/incidents/types';
import api from '../services/api';

interface IncidentsContextType {
  incidents: Incident[];
  loading: boolean;
  error: string | null;
  refreshIncidents: () => Promise<void>;
  getIncidentById: (id: string) => Incident | undefined;
  getActionsByIncident: (incidentId: string) => CorrectiveAction[];
  addIncident: (data: Omit<Incident, 'id'>) => Promise<Incident>;
  updateIncident: (id: string, updates: Partial<Incident>) => Promise<void>;
  deleteIncident: (id: string) => Promise<void>;
  addCorrectiveAction: (incidentId: string, data: Omit<CorrectiveAction, 'id' | 'incidentId'>) => Promise<CorrectiveAction>;
  updateCorrectiveAction: (incidentId: string, actionId: string, updates: Partial<CorrectiveAction>) => Promise<void>;
  loadActions: (incidentId: string) => Promise<CorrectiveAction[]>;
}

const IncidentsContext = createContext<IncidentsContextType | undefined>(undefined);

export const useIncidents = () => {
  const ctx = useContext(IncidentsContext);
  if (!ctx) throw new Error('useIncidents must be used within IncidentsProvider');
  return ctx;
};

interface IncidentsProviderProps {
  children: ReactNode;
}

export const IncidentsProvider: React.FC<IncidentsProviderProps> = ({ children }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [actionsByIncident, setActionsByIncident] = useState<Record<string, CorrectiveAction[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshIncidents = useCallback(async () => {
    try {
      setError(null);
      const list = await api.incidents.getAll();
      setIncidents(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch incidents');
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshIncidents();
  }, [refreshIncidents]);

  const loadActions = useCallback(async (incidentId: string): Promise<CorrectiveAction[]> => {
    try {
      const list = await api.incidents.getActions(incidentId);
      const arr = Array.isArray(list) ? list : [];
      setActionsByIncident(prev => ({ ...prev, [incidentId]: arr }));
      return arr;
    } catch {
      return [];
    }
  }, []);

  const getIncidentById = useCallback((id: string) => incidents.find(i => i.id === id), [incidents]);
  const getActionsByIncident = useCallback((incidentId: string) => actionsByIncident[incidentId] ?? [], [actionsByIncident]);

  const addIncident = useCallback(async (data: Omit<Incident, 'id'>): Promise<Incident> => {
    const created = await api.incidents.create(data);
    setIncidents(prev => [created, ...prev]);
    return created;
  }, []);

  const updateIncident = useCallback(async (id: string, updates: Partial<Incident>) => {
    const updated = await api.incidents.update(id, updates);
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, ...updated } : i));
  }, []);

  const deleteIncident = useCallback(async (id: string) => {
    await api.incidents.delete(id);
    setIncidents(prev => prev.filter(i => i.id !== id));
    setActionsByIncident(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const addCorrectiveAction = useCallback(async (incidentId: string, data: Omit<CorrectiveAction, 'id' | 'incidentId'>): Promise<CorrectiveAction> => {
    const created = await api.incidents.createAction(incidentId, data);
    setActionsByIncident(prev => ({
      ...prev,
      [incidentId]: [...(prev[incidentId] ?? []), created],
    }));
    return created;
  }, []);

  const updateCorrectiveAction = useCallback(async (incidentId: string, actionId: string, updates: Partial<CorrectiveAction>) => {
    const updated = await api.incidents.updateAction(incidentId, actionId, updates);
    setActionsByIncident(prev => ({
      ...prev,
      [incidentId]: (prev[incidentId] ?? []).map(a => a.id === actionId ? { ...a, ...updated } : a),
    }));
  }, []);

  return (
    <IncidentsContext.Provider
      value={{
        incidents,
        loading,
        error,
        refreshIncidents,
        getIncidentById,
        getActionsByIncident,
        addIncident,
        updateIncident,
        deleteIncident,
        addCorrectiveAction,
        updateCorrectiveAction,
        loadActions,
      }}
    >
      {children}
    </IncidentsContext.Provider>
  );
};
