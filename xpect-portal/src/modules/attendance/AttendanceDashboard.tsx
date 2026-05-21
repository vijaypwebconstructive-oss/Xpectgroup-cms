import React from "react";
import {
  CalendarDays,
  Plus,
  Users,
  UserCheck,
  UserX,
  TimerReset,
  ClipboardList,
} from "lucide-react";

const overviewStats = [
  {
    title: "Total Employees",
    value: "2,847",
    trend: "+12%",
    subtitle: "vs yesterday",
    icon: Users,
    bg: "#eff6ff",
    color: "#2563eb",
  },
  {
    title: "Present Today",
    value: "2,458",
    trend: "-3.2%",
    subtitle: "vs yesterday",
    icon: UserCheck,
    bg: "#f0fdf4",
    color: "#22c55e",
  },
  {
    title: "Absent Today",
    value: "124",
    trend: "+1.4%",
    subtitle: "vs yesterday",
    icon: UserX,
    bg: "#fef3c7",
    color: "#f59e0b",
  },
  {
    title: "Late Arrivals",
    value: "89",
    trend: "+12%",
    subtitle: "vs yesterday",
    icon: TimerReset,
    bg: "#eff6ff",
    color: "#3b82f6",
  },
  {
    title: "Attendance Rate",
    value: "86.3%",
    trend: "+2.5%",
    subtitle: "vs yesterday",
    icon: CalendarDays,
    bg: "#f3e8ff",
    color: "#9333ea",
  },
  {
    title: "Pending Regularizations",
    value: "42",
    trend: "-7%",
    subtitle: "vs yesterday",
    icon: ClipboardList,
    bg: "#fef2f2",
    color: "#dc2626",
  },
];

const AttendanceDashboard = () => {
  return (
    <div className="flex-1 flex flex-col py-[15px] sm:py-[30px] px-4 sm:px-[30px] bg-[#f6f8fc] min-h-[calc(100vh-160px)] overflow-hidden">
      <div className="space-y-6 w-full">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-[#0d121b] text-[1.6rem] sm:text-2xl font-black">
              Attendance Dashboard
            </h1>

            <p className="text-[#4c669a] text-base mt-1">
              Monitor attendance analytics, employee presence and trends.
            </p>
          </div>

          {/* ACTIONS */}
        </div>

        {/* OVERVIEW */}
        <div className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm p-4 sm:p-6">
          {/* TOP */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#0d121b]">
                Overview Statistics
              </h2>

              <p className="text-[#4c669a] text-sm mt-1">
                Daily workforce and attendance insights
              </p>
            </div>

            <button className="h-10 px-4 rounded-full border border-[#e7ebf3] align-center  flex items-center gap-2 bg-white text-sm font-medium hover:bg-[#f8fafc] transition-colors">
              <CalendarDays size={16} />
              Today
            </button>
          </div>

          {/* CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {overviewStats.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="bg-white p-4 sm:p-6 rounded-2xl border-b-[5px] border-b-transparent shadow-sm hover:shadow-md transition-all duration-300"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderBottomColor = item.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderBottomColor = "transparent";
                  }}
                >
                  {/* TOP */}
                  <div className="flex justify-between items-start mb-4 gap-3">
                    <div
                      className="p-3 sm:p-4 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor: item.bg,
                        color: item.color,
                      }}
                    >
                      <Icon size={24} />
                    </div>

                    {/* <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full text-white ${
                        item.trend.includes("-") ? "bg-red-500" : "bg-green-500"
                      }`}
                    >
                      {item.trend}
                    </span> */}
                  </div>

                  {/* CONTENT */}
                  <p className="text-sm font-medium text-[#64748b]">
                    {item.title}
                  </p>

                  <h3 className="text-2xl font-black text-[#0d121b] mt-1 break-words">
                    {item.value}
                  </h3>

                  {/* <p className="text-sm text-[#94a3b8] mt-2">{item.subtitle}</p> */}
                </div>
              );
            })}
          </div>
        </div>

        {/* SECOND GRID */}
        <div className="grid grid-cols-1 ">
          {/* LEFT */}
          <div className="space-y-6 min-w-0">
            {/* TREND */}

            {/* ATTENDANCE TRENDS */}
            {/* ATTENDANCE TRENDS */}
            <div className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm p-4 sm:p-6">
              {/* HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-[#0d121b]">
                    Attendance Trends
                  </h2>

                  <p className="text-[#4c669a] text-sm mt-1">
                    Employee attendance analytics overview
                  </p>
                </div>

                {/* FILTER */}
                <div className="flex items-center bg-[#f8fafc] border border-[#e2e8f0] rounded-full p-1 w-fit">
                  {["1D", "7D", "1M", "1Y"].map((item, i) => (
                    <button
                      key={item}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                        i === 3
                          ? "bg-[#1f2937] text-white"
                          : "text-[#64748b] hover:text-[#0d121b]"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* CHART */}
              <div className="relative">
                {/* GRID */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {[100, 80, 60, 40, 20, 0].map((line) => (
                    <div
                      key={line}
                      className="border-t border-dashed border-[#e2e8f0] relative"
                    >
                      <span className="absolute -top-3 left-0 text-[11px] text-[#94a3b8] bg-white pr-2">
                        {line}%
                      </span>
                    </div>
                  ))}
                </div>

                {/* BARS */}
                <div className="h-[320px] sm:h-[380px] pt-5 pl-8">
                  <div className="grid grid-cols-12 gap-2 sm:gap-4 h-full items-end overflow-auto">
                    {[
                      { month: "Jan", value: 40 },
                      { month: "Feb", value: 22 },
                      { month: "Mar", value: 55 },
                      { month: "Apr", value: 25 },
                      { month: "May", value: 58 },
                      { month: "Jun", value: 90, active: true },
                      { month: "Jul", value: 43, orange: true },
                      { month: "Aug", value: 25 },
                      { month: "Sep", value: 68 },
                      { month: "Oct", value: 80 },
                      { month: "Nov", value: 35 },
                      { month: "Dec", value: 20 },
                    ].map((item) => (
                      <div
                        key={item.month}
                        className="flex flex-col items-center justify-end h-full relative group"
                      >
                        {/* TOOLTIP */}
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 pointer-events-none z-50">
                          <div className="bg-white border border-[#e7ebf3] shadow-xl rounded-2xl overflow-hidden min-w-[170px]">
                            {/* TOP */}
                            <div className="px-4 py-2 border-b border-[#edf2f7] bg-[#f8fafc]">
                              <p className="text-sm font-semibold text-[#64748b]">
                                {item.month}
                              </p>
                            </div>

                            {/* CONTENT */}
                            <div className="p-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-3 h-3 rounded-full ${
                                    item.active
                                      ? "bg-red-500"
                                      : item.orange
                                        ? "bg-orange-400"
                                        : "bg-[#e7cfca]"
                                  }`}
                                />

                                <p className="text-sm text-[#64748b]">
                                  Attendance:
                                  <span className="font-black text-[#0d121b] ml-2">
                                    {item.value}%
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* BACKGROUND */}
                        <div className="absolute inset-0 rounded-2xl bg-[#f3f4f6]" />

                        {/* BAR */}
                        <div
                          className={`relative z-10 w-full rounded-2xl transition-all duration-300 hover:opacity-90 cursor-pointer ${
                            item.active
                              ? "bg-gradient-to-b from-red-500 to-orange-500"
                              : item.orange
                                ? "bg-[#fb923c]"
                                : "bg-[#e7cfca]"
                          }`}
                          style={{
                            height: `${item.value}%`,
                          }}
                        >
                          {/* ACTIVE LABEL */}
                          {item.active && (
                            <div className="absolute left-1/2 -translate-x-1/2 top-[42%] bg-[#111827] text-white text-xs sm:text-sm font-black px-3 py-1 rounded-lg shadow-lg whitespace-nowrap">
                              {item.value}%
                            </div>
                          )}
                        </div>

                        {/* MONTH */}
                        <span className="absolute bottom-4 text-xs sm:text-sm font-medium text-[#334155] z-20">
                          {item.month}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* LATE ARRIVALS */}
            <div className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-[#0d121b]">
                    Late Arrivals & Alerts
                  </h2>

                  <p className="text-[#4c669a] text-sm mt-1">
                    Employees with delayed check-ins
                  </p>
                </div>

                <button className="h-10 px-4 rounded-full border border-[#e7ebf3] flex items-center gap-2 bg-white text-sm font-medium hover:bg-[#f8fafc]">
                  <CalendarDays size={16} />
                  Today
                </button>
              </div>

              {/* LIST */}
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="border border-[#edf2f7] rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 hover:bg-[#fafbfd] transition-all"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 shrink-0" />

                      <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-black text-[#0d121b] truncate">
                          Michael Johnson
                        </h3>

                        <div className="text-[#64748b] text-sm">
                          Check-in:
                          <span className="font-black text-[#0d121b] ml-2">
                            09:45 AM
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="w-2 h-8 rounded-full bg-[#2e4150]"
                        />
                      ))}
                    </div> */}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-6 min-w-0">
            {/* STATUS */}

            {/* AI */}
            {/* <div className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-[#2e4150] to-[#1f2937] text-white p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-14 rounded-full bg-white text-[#0d121b] flex items-center justify-center text-2xl shrink-0">
                    ✨
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-xl font-black truncate">
                      AI Assistant
                    </h2>

                    <p className="text-gray-300 text-sm mt-1">
                      Always here to help
                    </p>
                  </div>
                </div>

                <div className="px-3 py-1 rounded-full bg-green-500 text-white text-xs font-bold shrink-0">
                  ● Online
                </div>
              </div>

              <div className="p-5">
                <p className="text-[#64748b] text-sm leading-relaxed">
                  Hello! I'm your AI Attendance Assistant. I can help analyze
                  attendance trends, generate reports and provide insights.
                </p>

                <div className="mt-6 space-y-3">
                  <button className="w-full text-left px-4 py-3 rounded-2xl bg-[#f8fafc] border border-[#edf2f7] hover:bg-[#f1f5f9] transition text-sm">
                    Show today's attendance summary
                  </button>

                  <button className="w-full text-left px-4 py-3 rounded-2xl bg-[#f8fafc] border border-[#edf2f7] hover:bg-[#f1f5f9] transition text-sm">
                    Why is attendance low on Fridays?
                  </button>

                  <button className="w-full text-left px-4 py-3 rounded-2xl bg-[#f8fafc] border border-[#edf2f7] hover:bg-[#f1f5f9] transition text-sm">
                    Generate employee late arrival report
                  </button>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceDashboard;
