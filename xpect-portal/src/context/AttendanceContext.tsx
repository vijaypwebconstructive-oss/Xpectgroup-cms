import { createContext, useContext, useEffect, useMemo, useState } from "react";

import api from "../services/api";

import { Timesheet } from "../types";

interface AttendanceContextType {
  timesheets: Timesheet[];

  loading: boolean;

  refresh: () => Promise<void>;

  clockIn: (workerId: string, siteId: string) => Promise<void>;

  clockOut: (id: string) => Promise<void>;
}

const AttendanceContext = createContext<AttendanceContextType | null>(null);

export const AttendanceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);

  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      setLoading(true);

      const data = await api.attendance.getAll();

      setTimesheets(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const clockIn = async (workerId: string, siteId: string) => {
    await api.attendance.clockIn({
      workerId,
      siteId,
    });

    await refresh();
  };

  const clockOut = async (id: string) => {
    await api.attendance.clockOut(id);

    await refresh();
  };

  return (
    <AttendanceContext.Provider
      value={{
        timesheets,
        loading,
        refresh,
        clockIn,
        clockOut,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);

  if (!context) {
    throw new Error("useAttendance must be used inside AttendanceProvider");
  }

  return context;
};
