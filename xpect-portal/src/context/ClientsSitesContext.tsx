import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Client, Site, SiteComplianceDocument, WorkerAssignment } from '../modules/clients-sites/types';
import api from '../services/api';

export const daysUntil = (dateStr: string): number => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

export const contractHealth = (client: Client): 'Valid' | 'Expiring' | 'Expired' => {
  const contractDays = daysUntil(client.contractEnd);
  const insuranceDays = daysUntil(client.insuranceExpiry);
  if (contractDays < 0 || insuranceDays < 0) return 'Expired';
  if (contractDays <= 30 || insuranceDays <= 30) return 'Expiring';
  return 'Valid';
};

interface ClientsSitesContextType {
  clients: Client[];
  sites: Site[];
  assignments: WorkerAssignment[];
  loading: boolean;
  error: string | null;
  refreshClients: () => Promise<void>;
  refreshSites: () => Promise<void>;
  refreshAssignments: () => Promise<void>;
  refreshAll: () => Promise<void>;
  addClient: (c: Omit<Client, 'id'>) => Promise<Client>;
  addSite: (s: Omit<Site, 'id'>) => Promise<Site>;
  updateSiteCompliance: (siteId: string, complianceDocuments: SiteComplianceDocument[]) => Promise<Site>;
  addAssignment: (a: Omit<WorkerAssignment, 'id'>) => Promise<WorkerAssignment>;
  removeAssignment: (workerId: string, siteId: string) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  deleteSite: (id: string) => Promise<void>;
  getClientById: (id: string) => Client | undefined;
  getSiteById: (id: string) => Site | undefined;
  getSitesByClient: (clientId: string) => Site[];
  getAssignmentsBySite: (siteId: string) => WorkerAssignment[];
  getAssignmentsByClient: (clientId: string) => WorkerAssignment[];
  getAssignmentsByWorker: (workerId: string) => WorkerAssignment[];
  getSiteCountByWorker: (workerId: string) => number;
}

const ClientsSitesContext = createContext<ClientsSitesContextType | undefined>(undefined);

export const useClientsSites = () => {
  const ctx = useContext(ClientsSitesContext);
  if (!ctx) throw new Error('useClientsSites must be used within ClientsSitesProvider');
  return ctx;
};

interface ClientsSitesProviderProps {
  children: ReactNode;
}

export const ClientsSitesProvider: React.FC<ClientsSitesProviderProps> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [assignments, setAssignments] = useState<WorkerAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshClients = useCallback(async () => {
    try {
      setError(null);
      const list = await api.clientsSites.getClients();
      setClients(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clients');
      setClients([]);
    }
  }, []);

  const refreshSites = useCallback(async () => {
    try {
      setError(null);
      const list = await api.clientsSites.getSites();
      setSites(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sites');
      setSites([]);
    }
  }, []);

  const refreshAssignments = useCallback(async () => {
    try {
      setError(null);
      const list = await api.clientsSites.getAssignments();
      setAssignments(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch assignments');
      setAssignments([]);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([refreshClients(), refreshSites(), refreshAssignments()]);
    setLoading(false);
  }, [refreshClients, refreshSites, refreshAssignments]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const addClient = useCallback(async (c: Omit<Client, 'id'>): Promise<Client> => {
    const created = await api.clientsSites.createClient(c);
    setClients(prev => [created, ...prev]);
    return created;
  }, []);

  const addSite = useCallback(async (s: Omit<Site, 'id'>): Promise<Site> => {
    const created = await api.clientsSites.createSite(s);
    setSites(prev => [created, ...prev]);
    return created;
  }, []);

  const updateSiteCompliance = useCallback(async (siteId: string, complianceDocuments: SiteComplianceDocument[]): Promise<Site> => {
    const updated = await api.clientsSites.updateSite(siteId, { complianceDocuments });
    setSites(prev => prev.map(s => s.id === siteId ? updated : s));
    return updated;
  }, []);

  const addAssignment = useCallback(async (a: Omit<WorkerAssignment, 'id'>): Promise<WorkerAssignment> => {
    const created = await api.clientsSites.createAssignment(a);
    setAssignments(prev => [created, ...prev]);
    return created;
  }, []);

  const removeAssignment = useCallback(async (workerId: string, siteId: string) => {
    await api.clientsSites.removeAssignment(workerId, siteId);
    setAssignments(prev => prev.filter(a => !(a.workerId === workerId && a.siteId === siteId)));
  }, []);

  const deleteClient = useCallback(async (id: string) => {
    await api.clientsSites.deleteClient(id);
    const siteIds = sites.filter(s => s.clientId === id).map(s => s.id);
    setClients(prev => prev.filter(c => c.id !== id));
    setSites(prev => prev.filter(s => s.clientId !== id));
    setAssignments(prev => prev.filter(a => !siteIds.includes(a.siteId)));
  }, [sites]);

  const deleteSite = useCallback(async (id: string) => {
    await api.clientsSites.deleteSite(id);
    setSites(prev => prev.filter(s => s.id !== id));
    setAssignments(prev => prev.filter(a => a.siteId !== id));
  }, []);

  const getClientById = useCallback((id: string) => clients.find(c => c.id === id), [clients]);
  const getSiteById = useCallback((id: string) => sites.find(s => s.id === id), [sites]);
  const getSitesByClient = useCallback((clientId: string) => sites.filter(s => s.clientId === clientId), [sites]);
  const getAssignmentsBySite = useCallback((siteId: string) => assignments.filter(a => a.siteId === siteId), [assignments]);
  const getAssignmentsByClient = useCallback((clientId: string) => assignments.filter(a => a.clientId === clientId), [assignments]);
  const getAssignmentsByWorker = useCallback((workerId: string) => assignments.filter(a => a.workerId === workerId), [assignments]);
  const getSiteCountByWorker = useCallback((workerId: string) => new Set(getAssignmentsByWorker(workerId).map(a => a.siteId)).size, [getAssignmentsByWorker]);

  return (
    <ClientsSitesContext.Provider
      value={{
        clients,
        sites,
        assignments,
        loading,
        error,
        refreshClients,
        refreshSites,
        refreshAssignments,
        refreshAll,
        addClient,
        addSite,
        updateSiteCompliance,
        addAssignment,
        removeAssignment,
        deleteClient,
        deleteSite,
        getClientById,
        getSiteById,
        getSitesByClient,
        getAssignmentsBySite,
        getAssignmentsByClient,
        getAssignmentsByWorker,
        getSiteCountByWorker,
      }}
    >
      {children}
    </ClientsSitesContext.Provider>
  );
};
