import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { RiskAssessment, RAMS, Chemical, SDS, Hazard, ComplianceRequirement } from '../modules/risk-coshh/types';
import api from '../services/api';

interface RiskCoshhContextType {
  // Risk Assessments
  riskAssessments: RiskAssessment[];
  riskLoading: boolean;
  riskError: string | null;
  refreshRiskAssessments: () => Promise<void>;
  addRiskAssessment: (ra: Omit<RiskAssessment, 'id'>) => Promise<RiskAssessment>;
  updateRiskAssessment: (id: string, updates: { hazards?: Hazard[]; requiredPPE?: string[]; complianceRequirements?: ComplianceRequirement[] }) => Promise<void>;
  deleteRiskAssessment: (id: string) => Promise<void>;
  getRiskById: (id: string) => RiskAssessment | undefined;

  // RAMS
  ramsList: RAMS[];
  ramsLoading: boolean;
  ramsError: string | null;
  refreshRAMS: () => Promise<void>;
  addRAMS: (r: Omit<RAMS, 'id'> & { documentData?: string }) => Promise<RAMS>;
  deleteRAMS: (id: string) => Promise<void>;
  getRAMSById: (id: string) => RAMS | undefined;

  // Chemicals
  chemicals: Chemical[];
  chemicalsLoading: boolean;
  chemicalsError: string | null;
  refreshChemicals: () => Promise<void>;
  addChemical: (c: Omit<Chemical, 'id'>) => Promise<Chemical>;
  getChemicalById: (id: string) => Chemical | undefined;

  // SDS
  sdsList: SDS[];
  sdsLoading: boolean;
  sdsError: string | null;
  refreshSDS: () => Promise<void>;
  addSDS: (s: Omit<SDS, 'id'> & { documentData: string }) => Promise<SDS>;
  getSDSById: (id: string) => SDS | undefined;
  getSDSByChemicalId: (chemicalId: string) => SDS | undefined;
}

const RiskCoshhContext = createContext<RiskCoshhContextType | undefined>(undefined);

export const useRiskCoshh = () => {
  const ctx = useContext(RiskCoshhContext);
  if (!ctx) throw new Error('useRiskCoshh must be used within RiskCoshhProvider');
  return ctx;
};

interface RiskCoshhProviderProps {
  children: ReactNode;
}

export const RiskCoshhProvider: React.FC<RiskCoshhProviderProps> = ({ children }) => {
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);
  const [riskLoading, setRiskLoading] = useState(true);
  const [riskError, setRiskError] = useState<string | null>(null);

  const [ramsList, setRAMSList] = useState<RAMS[]>([]);
  const [ramsLoading, setRamsLoading] = useState(true);
  const [ramsError, setRamsError] = useState<string | null>(null);

  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [chemicalsLoading, setChemicalsLoading] = useState(true);
  const [chemicalsError, setChemicalsError] = useState<string | null>(null);

  const [sdsList, setSDSList] = useState<SDS[]>([]);
  const [sdsLoading, setSdsLoading] = useState(true);
  const [sdsError, setSdsError] = useState<string | null>(null);

  const refreshRiskAssessments = useCallback(async () => {
    setRiskError(null);
    try {
      const list = await api.riskCoshh.riskAssessments.getAll();
      setRiskAssessments(Array.isArray(list) ? list : []);
    } catch (err) {
      setRiskError(err instanceof Error ? err.message : 'Failed to fetch risk assessments');
      setRiskAssessments([]);
    } finally {
      setRiskLoading(false);
    }
  }, []);

  const refreshRAMS = useCallback(async () => {
    setRamsError(null);
    try {
      const list = await api.riskCoshh.rams.getAll();
      setRAMSList(Array.isArray(list) ? list : []);
    } catch (err) {
      setRamsError(err instanceof Error ? err.message : 'Failed to fetch RAMS');
      setRAMSList([]);
    } finally {
      setRamsLoading(false);
    }
  }, []);

  const refreshChemicals = useCallback(async () => {
    setChemicalsError(null);
    try {
      const list = await api.riskCoshh.chemicals.getAll();
      setChemicals(Array.isArray(list) ? list : []);
    } catch (err) {
      setChemicalsError(err instanceof Error ? err.message : 'Failed to fetch chemicals');
      setChemicals([]);
    } finally {
      setChemicalsLoading(false);
    }
  }, []);

  const refreshSDS = useCallback(async () => {
    setSdsError(null);
    try {
      const list = await api.riskCoshh.sds.getAll();
      setSDSList(Array.isArray(list) ? list : []);
    } catch (err) {
      setSdsError(err instanceof Error ? err.message : 'Failed to fetch SDS');
      setSDSList([]);
    } finally {
      setSdsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshRiskAssessments();
    refreshRAMS();
    refreshChemicals();
    refreshSDS();
  }, [refreshRiskAssessments, refreshRAMS, refreshChemicals, refreshSDS]);

  const addRiskAssessment = useCallback(async (ra: Omit<RiskAssessment, 'id'>): Promise<RiskAssessment> => {
    const created = await api.riskCoshh.riskAssessments.create(ra);
    setRiskAssessments(prev => [created, ...prev]);
    return created;
  }, []);

  const updateRiskAssessment = useCallback(async (id: string, updates: { hazards?: Hazard[]; requiredPPE?: string[]; complianceRequirements?: ComplianceRequirement[] }) => {
    const updated = await api.riskCoshh.riskAssessments.update(id, updates);
    setRiskAssessments(prev => prev.map(r => r.id === id ? updated : r));
  }, []);

  const deleteRiskAssessment = useCallback(async (id: string) => {
    await api.riskCoshh.riskAssessments.delete(id);
    setRiskAssessments(prev => prev.filter(r => r.id !== id));
  }, []);

  const addRAMS = useCallback(async (r: Omit<RAMS, 'id'> & { documentData?: string }): Promise<RAMS> => {
    const created = await api.riskCoshh.rams.create(r);
    setRAMSList(prev => [created, ...prev]);
    return created;
  }, []);

  const deleteRAMS = useCallback(async (id: string) => {
    await api.riskCoshh.rams.delete(id);
    setRAMSList(prev => prev.filter(r => r.id !== id));
  }, []);

  const addChemical = useCallback(async (c: Omit<Chemical, 'id'>): Promise<Chemical> => {
    const created = await api.riskCoshh.chemicals.create(c);
    setChemicals(prev => [created, ...prev]);
    return created;
  }, []);

  const addSDS = useCallback(async (s: Omit<SDS, 'id'> & { documentData: string }): Promise<SDS> => {
    const created = await api.riskCoshh.sds.create(s);
    setSDSList(prev => [created, ...prev]);
    return created;
  }, []);

  const getRiskById = useCallback((id: string) => riskAssessments.find(r => r.id === id), [riskAssessments]);
  const getRAMSById = useCallback((id: string) => ramsList.find(r => r.id === id), [ramsList]);
  const getChemicalById = useCallback((id: string) => chemicals.find(c => c.id === id), [chemicals]);
  const getSDSById = useCallback((id: string) => sdsList.find(s => s.id === id), [sdsList]);
  const getSDSByChemicalId = useCallback((chemicalId: string) => sdsList.find(s => s.chemicalId === chemicalId), [sdsList]);

  return (
    <RiskCoshhContext.Provider value={{
      riskAssessments,
      riskLoading,
      riskError,
      refreshRiskAssessments,
      addRiskAssessment,
      updateRiskAssessment,
      deleteRiskAssessment,
      getRiskById,
      ramsList,
      ramsLoading,
      ramsError,
      refreshRAMS,
      addRAMS,
      deleteRAMS,
      getRAMSById,
      chemicals,
      chemicalsLoading,
      chemicalsError,
      refreshChemicals,
      addChemical,
      getChemicalById,
      sdsList,
      sdsLoading,
      sdsError,
      refreshSDS,
      addSDS,
      getSDSById,
      getSDSByChemicalId,
    }}>
      {children}
    </RiskCoshhContext.Provider>
  );
};
