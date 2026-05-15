import { useEffect, useState } from "react";
import api from "../services/api";

export const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  let verification: string;
  useEffect(() => {
    const loadUser = async () => {
      try {
        const raw = localStorage.getItem("xpect_user");

        if (!raw) {
          setLoading(false);
          return;
        }
        // verification = raw.verificationStatus;
        const localUser = JSON.parse(raw);
        verification = loadUser.verificationStatus;
        const user = await api.users.getById(localUser.id);

        setCurrentUser(user);
      } catch (err) {
        console.error("Failed to load current user", err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  return {
    currentUser,
    loading,
    verification,
  };
};
