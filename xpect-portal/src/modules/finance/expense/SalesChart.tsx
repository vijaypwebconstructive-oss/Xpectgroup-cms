import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { MonthlyMetric } from "./types";
import { CHART_COLORS } from "./types";

interface SalesChartsProps {
  metrics: MonthlyMetric[];
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-slate-200 shadow-lg rounded-lg text-sm">
        <p className="font-bold mb-2 text-slate-900">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p
            key={index}
            style={{ color: entry.color }}
            className="flex justify-between gap-4"
          >
            <span>{entry.name}:</span>
            <span className="font-semibold">{formatCurrency(entry.value)}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const SalesCharts: React.FC<SalesChartsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 sm:mt-8">
      {/* Revenue Mix Comparison */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-800 text-lg">
            Revenue Mix (Monthly)
          </h3>
          <div className="flex gap-4 text-xs">
            <span className="flex items-center">
              <span
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: CHART_COLORS.recurring }}
              ></span>{" "}
              Recurring
            </span>
            <span className="flex items-center">
              <span
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: CHART_COLORS.oneTime }}
              ></span>{" "}
              One-time
            </span>
          </div>
        </div>
        <div className="h-80  w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart
              data={metrics}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={CHART_COLORS.grid}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: CHART_COLORS.text, fontSize: 12 }}
              />
              <YAxis
                tickFormatter={(val) => `£${val / 1000}k`}
                axisLine={false}
                tickLine={false}
                tick={{ fill: CHART_COLORS.text, fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="recurring"
                name="Recurring Revenue"
                stackId="a"
                fill={CHART_COLORS.recurring}
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="oneTime"
                name="One-time Revenue"
                stackId="a"
                fill={CHART_COLORS.oneTime}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Growth Trend */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-800 text-lg">
            Total Sales Trend
          </h3>
          <span className="text-xs text-slate-500 font-medium px-2 py-1 bg-slate-100 rounded-full">
            Cumulative View
          </span>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={metrics}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={CHART_COLORS.total}
                    stopOpacity={0.1}
                  />
                  <stop
                    offset="95%"
                    stopColor={CHART_COLORS.total}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={CHART_COLORS.grid}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: CHART_COLORS.text, fontSize: 12 }}
              />
              <YAxis
                tickFormatter={(val) => `£${val / 1000}k`}
                axisLine={false}
                tickLine={false}
                tick={{ fill: CHART_COLORS.text, fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="total"
                name="Total Revenue"
                stroke={CHART_COLORS.total}
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorTotal)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SalesCharts;
