import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";
import type { UserRole } from "../modules/user-access/types";

const STORAGE_USER_KEY = "xpect_currentUser";
const STORAGE_TOKEN_KEY = "xpect_authToken";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  setSession: (token: string, user: AuthUser) => void;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function loadStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem("xpect_user");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    if (parsed?.id && parsed?.role) return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * TODO: remove when login is wired — fallback so RBAC UI works before JWT login flow is integrated.
 */
const TEMP_DEV_FALLBACK_USER: AuthUser = {
  id: "dev-admin",
  fullName: "Dev Admin",
  email: "dev@xpect.local",
  role: "Admin",
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUserState] = useState<AuthUser | null>(() => {
    return loadStoredUser() ?? TEMP_DEV_FALLBACK_USER;
  });

  const [token, setTokenState] = useState<string | null>(() => {
    return typeof localStorage !== "undefined"
      ? localStorage.getItem(STORAGE_TOKEN_KEY)
      : null;
  });

  const setSession = useCallback((nextToken: string, nextUser: AuthUser) => {
    localStorage.setItem(STORAGE_TOKEN_KEY, nextToken);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(nextUser));
    setTokenState(nextToken);
    setUserState(nextUser);
  }, []);

  const setUser = useCallback((u: AuthUser | null) => {
    if (u) {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(u));
    } else {
      localStorage.removeItem(STORAGE_USER_KEY);
    }
    setUserState(u);
  }, []);

  /** Clears JWT/local persisted user; restores dev fallback until login UI ships. */
  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    setTokenState(null);
    setUserState(TEMP_DEV_FALLBACK_USER);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      setSession,
      setUser,
      logout,
    }),
    [user, token, setSession, setUser, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);

  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

/** Convenience: current CMS user (may be null after logout). */
export const useCurrentUser = (): AuthUser | null => {
  return useAuth().user;
};
