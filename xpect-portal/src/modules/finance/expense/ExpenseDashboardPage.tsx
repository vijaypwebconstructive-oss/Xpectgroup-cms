import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import GoalCard from "./GoalCard";
import { Building2, MapPin } from "lucide-react";
import StatCard from "./StatCard";
import TrendCard from "./TrendStats";
import SalesCharts from "./SalesChart";
import MonthlyLedger from "./MonthlyLedger";
import SalesTable from "./SalesTable";
import ClientMRR from "./ClientMRR";

import {
  DollarSign,
  ClipboardCheck,
  Zap,
  BarChart3,
  UserPlus,
  Briefcase,
  AlertTriangle,
  Users,
  FileText,
  PoundSterling,
  TrendingUp,
  RefreshCcw,
} from "lucide-react";

// ✅ Define TypeScript type for API response
interface PerformanceData {
  revenue: number;
  payroll: number;
  profit: number;
  employees: number;
  sites: number;
  incidents: number;
  recurringRevenue: number;
  oneTimeRevenue: number;
  avgMonthly: number;
  avgInspectionScore: number;
  clients: number;
  totalProspects: number;
  convertedProspects: number;
  conversionRate: number;
  totalClients: number;
  totalQuotations: number;
  acceptedQuotations: number;
  acceptanceRate: number;
  revenueTrend: number;
  revenueTrendUp: boolean;
  recurringTrend: number;
  oneTimeTrend: number;
  oneTimeTrendUp: boolean;
  pipelineValue: number;
}

export interface MonthlyMetric {
  month: string;
  recurring: number;
  oneTime: number;
  total: number;
}

export interface Sale {
  id: string;
  clientName: string;
  service: string;
  date: string;
  type: "RECURRING" | "ONE_TIME";
  amount: number;
}
type FilterType = "all" | "week" | "month" | "quarter" | "year";

const getGoalIcon = (type: string) => {
  switch (type) {
    case "revenue":
      return <DollarSign size={18} />;
    case "inspection":
      return <ClipboardCheck size={18} />;
    case "employee":
      return <Users size={18} />;
    case "incident":
      return <AlertTriangle size={18} />;
    case "conversion":
      return <TrendingUp size={18} />;
    default:
      return null;
  }
};

export interface chartmetric {
  month: String;
  recurring: number;
  oneTime: number;
  total: number;
}

export interface Transactions {
  month: string;
  recurring: number;
  oneTime: number;
  total: number;
}

const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<chartmetric[]>([]);
  const [data, setData] = useState<PerformanceData | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState<boolean>(false);
  const [goals, setGoals] = useState<any>({});
  const [sales, setSales] = useState<Sale[]>([]);

  const [transaction, setTransaction] = useState<MonthlyMetric[]>([]);
  const [filterTable, setFilterTable] = useState("year");

  console.log("sales", sales);

  useEffect(() => {
    const fetchGoals = async () => {
      const res = await api.performance.getGoals();
      setGoals(res);
    };

    fetchGoals();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.performance.getDashboard(filter);
        setData(res);
      } catch (err) {
        console.error("Error fetching performance:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const fetchCharts = async () => {
      const data = await api.performance.getCharts(filter);
      console.log("flieter", filter);
      setMetrics(data);
    };

    fetchCharts();

    const fetchSales = async () => {
      const data = await api.performance.getSales(filter);

      setSales(data);
    };

    fetchSales();
  }, [filter]);

  // useEffect(() => {
  //   const fetchMonthlyData = async () => {
  //     const data = await api.performance.getTransaction(filter);

  //     setTransaction(data);
  //   };

  //   fetchMonthlyData();
  // }, [filter]);

  // monthly revenue ledger

  // useEffect(() => {

  // }, [filter]);

  // ✅ Card Component with types
  const Card: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
  }> = ({ title, value, subtitle }) => (
    <div>
      <h4>{title}</h4>
      <h2>{value}</h2>
      <p>{subtitle}</p>
    </div>
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleSaveGoal = async (type: string, value: number) => {
    await api.performance.updateGoal({
      type,
      targetValue: value,
    });

    setGoals((prev: any) => ({
      ...prev,
      [type]: value,
    }));
  };

  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-2xl font-bold">Performance Dashboard</h1>
          <p className="text-gray-500 text-sm">
            Real-time analysis of your cleaning business
          </p>
        </div>

        {/* FILTER */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as FilterType)}
          className="px-3 py-2 rounded-lg border border-gray-300"
        >
          <option value="all">All Time</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* GOAL CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <GoalCard
          title="Revenue Goal"
          type="revenue"
          actual={data?.revenue ?? 0}
          target={goals.revenue ?? 0}
          icon={<PoundSterling size={20} />}
          onSave={handleSaveGoal}
          isCurrency={true}
        />
        {/* 🏢 Clients */}

        <GoalCard
          title="Client Acquisition Goal"
          type="clients"
          actual={data?.totalClients ?? 0}
          target={goals.clients ?? 0}
          icon={<Users size={20} />}
          onSave={handleSaveGoal}
        />

        {/* 📍 Sites */}
        <GoalCard
          title="Active Sites Goal"
          type="sites"
          actual={data?.sites ?? 0}
          target={goals.sites ?? 0}
          icon={<MapPin size={20} />}
          onSave={handleSaveGoal}
        />

        <TrendCard
          title="Total Revenue"
          value={`${data?.revenue ?? 0}`}
          trend={`${data?.revenueTrend ?? 0}%`}
          trendUp={data?.revenueTrendUp}
          icon={<TrendingUp size={20} />}
        />

        <TrendCard
          title="Recurring Revenue"
          value={`${data?.recurringRevenue ?? 0}`}
          trend={`${data?.recurringTrend ?? 0}%`}
          trendUp={data?.revenueTrendUp}
          icon={<RefreshCcw size={20} />}
        />

        <TrendCard
          title="Onetime Revenue"
          value={`${data?.oneTimeRevenue ?? 0}`}
          trend={`${data?.oneTimeTrend ?? 0}%`}
          trendUp={data?.oneTimeTrendUp}
          icon={<Zap size={20} />}
        />

        <StatCard
          title="Avg. Monthly"
          value={data?.avgMonthly ?? 0}
          icon={<BarChart3 size={20} />}
          isCurrency={true}
        />

        <StatCard
          title="Active Prospects"
          value={data?.totalProspects ?? 0}
          icon={<UserPlus size={20} />}
        />

        <StatCard
          title="Pipeline Value"
          value={data?.pipelineValue ?? 0}
          icon={<Briefcase size={20} />}
          isCurrency={true}
        />
      </div>

      <div className="grid grid-flow-col grid-cols-1 ">
        <SalesCharts metrics={metrics} />
      </div>
      <div className="grid grid-flow-col grid-cols-1 ">
        <MonthlyLedger metrics={metrics} />
      </div>
      <div className="grid grid-flow-col grid-cols-1 ">
        <SalesTable sales={sales} />
      </div>
      <div className="grid grid-flow-col grid-cols-1 ">
        <ClientMRR sales={sales} />
      </div>
    </div>
  );
};

export default PerformanceDashboard;
