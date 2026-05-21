export type AttendanceView =
  | "dashboard"
  | "admin-attendance"
  | "employee-attendance"
  | "regularization";

export type TimesheetStatus = "Active" | "Completed" | "Approved";

export interface Timesheet {
  id: string;

  workerId: string;
  workerName: string;

  siteId: string;
  siteName: string;

  date: string;

  clockIn: string;

  clockOut: string;

  workedHours: number;

  overtimeHours: number;

  status: TimesheetStatus;

  createdAt?: string;

  updatedAt?: string;
  regularizationRequested?: boolean;

  regularizationStatus?: "None" | "Pending" | "Approved" | "Rejected";
}
