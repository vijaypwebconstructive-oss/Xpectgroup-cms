import { AppView } from "../types";

export const MODULE_TO_VIEW: Record<string, AppView> = {
  // Dashboard ecosystem
  dashboard: "DASHBOARD",
  "employee compliance": "DASHBOARD",

  // Client & Sites ecosystem
  client: "CLIENTS_SITES",
  sites: "CLIENTS_SITES",
  "site allocation": "CLIENTS_SITES",
  "site inspection": "CLIENTS_SITES",
  ppe: "CLIENTS_SITES",

  // Risk ecosystem
  risk: "RISK_COSHH",

  // Incident ecosystem
  incident: "INCIDENTS",

  // Document ecosystem
  document: "DOCUMENT_CONTROL",

  // Finance
  finance: "FINANCE",

  // User access
  users: "USER_ACCESS",

  // Attendance ecosystem
  attendance: "ATTENDANCE",
  "admin attendance": "ATTENDANCE",
  "employee attendance": "ATTENDANCE",
  regularization: "ATTENDANCE",
};

export const VIEW_TO_MODULE: Partial<Record<AppView, string[]>> = {
  DASHBOARD: ["dashboard", "employee compliance"],

  CLIENTS_SITES: [
    "client",
    "sites",
    "site allocation",
    "site inspection",
    "ppe",
  ],

  RISK_COSHH: ["risk"],

  INCIDENTS: ["incident"],

  DOCUMENT_CONTROL: ["document"],

  FINANCE: ["finance"],

  USER_ACCESS: ["users"],

  ATTENDANCE: [
    "attendance",
    "admin attendance",
    "employee attendance",
    "regularization",
  ],
};
