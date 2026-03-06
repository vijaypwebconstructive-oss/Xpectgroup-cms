import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { SystemUser } from '../modules/user-access/types';
import api from '../services/api';

interface UserAccessContextType {
  users: SystemUser[];
  loading: boolean;
  error: string | null;
  refreshUsers: () => Promise<void>;
  addUser: (data: Omit<SystemUser, 'id'>) => Promise<SystemUser>;
  updateUser: (id: string, updates: Partial<SystemUser>) => Promise<void>;
  getUserById: (id: string) => SystemUser | undefined;
}

const UserAccessContext = createContext<UserAccessContextType | undefined>(undefined);

export const useUserAccess = () => {
  const ctx = useContext(UserAccessContext);
  if (!ctx) throw new Error('useUserAccess must be used within UserAccessProvider');
  return ctx;
};

interface UserAccessProviderProps {
  children: ReactNode;
}

export const UserAccessProvider: React.FC<UserAccessProviderProps> = ({ children }) => {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUsers = useCallback(async () => {
    try {
      setError(null);
      const list = await api.users.getAll();
      setUsers(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  const addUser = useCallback(async (data: Omit<SystemUser, 'id'>): Promise<SystemUser> => {
    const created = await api.users.create(data);
    setUsers(prev => [created, ...prev]);
    return created;
  }, []);

  const updateUser = useCallback(async (id: string, updates: Partial<SystemUser>) => {
    const updated = await api.users.update(id, updates);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updated } : u));
  }, []);

  const getUserById = useCallback((id: string) => users.find(u => u.id === id), [users]);

  return (
    <UserAccessContext.Provider
      value={{
        users,
        loading,
        error,
        refreshUsers,
        addUser,
        updateUser,
        getUserById,
      }}
    >
      {children}
    </UserAccessContext.Provider>
  );
};
