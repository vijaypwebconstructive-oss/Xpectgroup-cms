import { useEffect, useState } from "react";

import { AttendanceView } from "./types";

import {
  getAttendanceState,
  subscribeAttendance,
  initAttendanceRoute,
} from "./attendanceNavStore";
import AttendanceRegularization from "./AttendanceRegularization";

import AdminAttendance from "./AdminAttendance";
import EmployeeAttendance from "./EmployeeAttendance";
import AttendanceDashboard from "./AttendanceDashboard";

const AttendanceModule = () => {
  const [view, setView] = useState<AttendanceView>(getAttendanceState().view);

  useEffect(() => {
    initAttendanceRoute();

    setView(getAttendanceState().view);

    return subscribeAttendance((s) => {
      setView(s.view);
    });
  }, []);

  switch (view) {
    case "dashboard":
      return <AttendanceDashboard />;

    case "admin-attendance":
      return <AdminAttendance />;

    case "employee-attendance":
      return <EmployeeAttendance />;

    case "regularization":
      return <AttendanceRegularization />;

    default:
      return <AttendanceDashboard />;
  }
};

export default AttendanceModule;
