import React, { useState, useEffect } from "react";
import { useInspection } from "../../context/InspectionContext";

interface Inspection {
  id: string;
  siteName: string;
  inspector: string;
  date: string;
  issues: number;
  status: "Pass" | "Fail";
}

interface Props {
  onView: (id: string) => void;
  onCreate: () => void;
}

const SiteInspection: React.FC<Props> = ({ onView, onCreate }) => {
  //   const [inspections, setInspections] = useState<Inspection[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [monthFilter, setMonthFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [statsFilter, setStatsFilter] = useState("ALL");
  const { inspections } = useInspection();
  console.log(inspections);

  const filtered = inspections.filter((i) => {
    //
    // SEARCH
    //
    const matchesSearch = i.siteName
      ?.toLowerCase()
      .includes(search.toLowerCase());

    //
    // STATUS FILTER
    //
    const matchesStatus = statusFilter === "ALL" || i.status === statusFilter;

    //
    // MONTH FILTER
    //
    const matchesMonth =
      monthFilter === "ALL" ||
      new Date(i.date).getMonth() === Number(monthFilter);

    //
    // STATS FILTER
    //
    let matchesStats = true;

    if (statsFilter === "PASSED") {
      matchesStats = i.status === "Pass";
    }

    if (statsFilter === "FAILED") {
      matchesStats = i.status === "Fail";
    }

    return matchesSearch && matchesStatus && matchesMonth && matchesStats;
  });
  const total = inspections.length;

  const passed = inspections.filter((i) => i.status === "Pass").length;

  const failed = inspections.filter((i) => i.status === "Fail").length;

  const complianceRate = total ? ((passed / total) * 100).toFixed(0) : 0;

  const stats = [
    {
      label: "Total Inspections",
      value: total,
      icon: "fact_check",
      trend: "All",
      bgColor: "#eff6ff",
      borderColor: "#2563eb",
      filter: "ALL",
    },

    {
      label: "Passed",
      value: passed,
      icon: "check_circle",
      trend: "Compliant",
      bgColor: "#f0fdf4",
      borderColor: "#22c55e",
      filter: "PASSED",
    },

    {
      label: "Failed",
      value: failed,
      icon: "cancel",
      trend: "Attention",
      bgColor: "#fef2f2",
      borderColor: "#ef4444",
      filter: "FAILED",
    },

    {
      label: "Compliance Rate",
      value: `${complianceRate}%`,
      icon: "analytics",
      trend: "Performance",
      bgColor: "#f5f3ff",
      borderColor: "#7c3aed",
      filter: "COMPLIANCE",
    },
  ];

  return (
    <div className="space-y-6 sm:p-10 py-4 px-6">
      {/* 🔷 STATS (Copied pattern) */}
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const active = statsFilter === stat.filter;

          return (
            <button
              key={stat.label}
              onClick={() => {
                setStatsFilter(stat.filter);

                //
                // OPTIONAL REDIRECT
                //
                if (stat.filter === "FAILED") {
                  setStatusFilter("Fail");
                }

                if (stat.filter === "COMPLIANCE") {
                  setStatusFilter("Pass");
                }

                if (stat.filter === "ALL") {
                  setStatusFilter("ALL");
                }
              }}
              type="button"
              className={`bg-white p-4 sm:p-6 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer text-left border-b-[5px] ${
                active ? "" : ""
              }`}
              style={{
                borderBottomColor: active ? stat.borderColor : "transparent",
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className="p-4 rounded-lg"
                  style={{
                    backgroundColor: stat.bgColor,
                    color: stat.borderColor,
                  }}
                >
                  <span className="material-symbols-outlined">{stat.icon}</span>
                </div>

                <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider bg-gray-50 px-2 py-0.5 rounded-full">
                  {stat.trend}
                </span>
              </div>

              <p className="text-base font-medium text-slate-500">
                {stat.label}
              </p>

              <p className="text-3xl font-black font-bold text-gray-900 mt-1">
                {stat.value}
              </p>
            </button>
          );
        })}
      </div>

      {/* 🔷 TABLE CARD */}
      <div className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm overflow-hidden">
        {/* 🔍 Search */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#e7ebf3]">
          <div className="flex items-center h-9 bg-[#f6f6f8] rounded-lg px-3 flex-1">
            <span className="material-symbols-outlined text-[#9aa5be] text-[18px] mr-2">
              search
            </span>
            <input
              placeholder="Search site..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none w-full text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-[#e7ebf3] rounded-lg px-3 py-2 text-sm outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="Pass">Pass</option>
              <option value="Fail">Fail</option>
            </select>

            {/* Month Filter */}
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="border border-[#e7ebf3] rounded-lg px-3 py-2 text-sm outline-none "
            >
              <option value="ALL">All Months</option>
              {[...Array(12)].map((_, i) => (
                <option key={i} value={i}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={onCreate}
            className="flex items-center gap-2 rounded-full bg-[#2e4150] text-white text-xs font-bold hover:bg-[#2e4150]/90 transition-all px-4 h-9 cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Add Inspection
          </button>
        </div>

        {/* Header */}
        <div className="px-5 py-3 border-b border-[#e7ebf3] flex items-center gap-3">
          <h2 className="text-[#0d121b] text-sm sm:text-base font-semibold">
            Inspection Records
          </h2>
          <span className="bg-[#f2f6f9] text-[#4c669a] text-xs font-bold px-2 py-1 rounded-full">
            {filtered.length} records
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#e7ebf3]">
                <th className="px-4 py-3 text-xs text-[#4c669a] text-left">
                  Site
                </th>
                <th className="px-4 py-3 text-xs text-[#4c669a] text-left">
                  Inspector
                </th>
                <th className="px-4 py-3 text-xs text-[#4c669a] text-left">
                  Date
                </th>
                <th className="px-4 py-3 text-xs text-[#4c669a] text-left">
                  Status
                </th>
                <th className="px-4 py-3 text-xs text-[#4c669a] text-left">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#e7ebf3]">
              {filtered.map((i) => (
                <tr key={i._id}>
                  <td className="px-5 py-4 font-semibold">{i.siteName}</td>
                  <td className="px-5 py-4 font-semibold">{i.inspector}</td>
                  <td className="px-5 py-4 font-semibold">{i.date}</td>
                  <td
                    className={`px-5 py-4 font-semibold ${i.status === "Pass" ? "text-[#00a63e]" : "text-[#eb191a]"} `}
                  >
                    {i.status}
                  </td>

                  <td className="px-5 py-4 font-semibold ">
                    <button
                      className="cursor-pointer"
                      onClick={() => onView(i._id)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#e7ebf3] bg-[#f8fafc] text-xs text-[#4c669a]">
          Showing {filtered.length} of {inspections.length} inspections
        </div>
      </div>
    </div>
  );
};

export default SiteInspection;
