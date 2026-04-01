export interface MonthlyMetric {
  month: string;
  recurring: number;
  oneTime: number;
  total: number;
  clientCount: number;
}

export const CHART_COLORS = {
  recurring: "#6366f1", // Indigo 500
  oneTime: "#10b981", // Emerald 500
  total: "#3b82f6", // Blue 500
  grid: "#e2e8f0",
  text: "#64748b",
};

export interface MonthlyMetric {
  month: string;
  recurring: number;
  oneTime: number;
  total: number;
}

export interface Sale {
  id: string;
  clientName: string;
  amount: number;
  date: string; // ISO format
  type: ClientType;
  service: string;
  assignedTo?: string; // Team member assigned to this sale
}

export enum ClientType {
  RECURRING = "RECURRING",
  ONE_TIME = "ONE_TIME",
}
