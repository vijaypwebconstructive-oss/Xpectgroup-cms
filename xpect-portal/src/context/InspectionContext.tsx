import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import { shouldFetchProviderData } from "../utils/lazyProvider";

interface InspectionContextType {
  inspections: any[];
  addInspection: (data: any) => Promise<any>;
  getInspectionById: (id: string) => Promise<any>;
  deleteInspection: (id: string) => Promise<void>;
}

const InspectionContext = createContext<InspectionContextType | null>(null);

export const InspectionProvider = ({ children }) => {
  const [inspections, setInspections] = useState<any[]>([]);

  // 🔥 Load from backend
  useEffect(() => {
    if (!shouldFetchProviderData()) {
      return;
    }
    loadInspections();
  }, []);

  const loadInspections = async () => {
    const data = await api.inspections.getAll();
    setInspections(data);
  };

  const deleteInspection = async (id: string) => {
    await api.inspections.delete(id);

    setInspections((prev) => prev.filter((i) => i._id !== id));
  };

  // 🔥 Create
  const addInspection = async (data: any) => {
    const saved = await api.inspections.create(data);

    setInspections((prev) => [saved, ...prev]);

    return saved;
  };

  // 🔥 Get by ID (FIXED)
  const getInspectionById = async (id: string) => {
    const local = inspections.find((i) => i._id === id);

    if (local) return local;

    // fallback to backend
    const data = await api.inspections.getById(id);
    return data;
  };

  return (
    <InspectionContext.Provider
      value={{
        inspections,
        addInspection,
        getInspectionById,
        deleteInspection,
      }}
    >
      {children}
    </InspectionContext.Provider>
  );
};

export const useInspection = () => useContext(InspectionContext)!;
