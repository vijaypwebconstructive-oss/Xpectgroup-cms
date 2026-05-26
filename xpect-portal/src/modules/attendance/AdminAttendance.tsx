import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

import { formatTime } from "../../utils/date";
import {
  CalendarDays,
  ChevronDown,
  Download,
  FileText,
  Search,
  Clock3,
} from "lucide-react";

import { useAttendance } from "../../context/AttendanceContext";

const AdminAttendance = () => {
  const { timesheets, loading } = useAttendance();

  const [search, setSearch] = useState("");
  const [siteFilter, setSiteFilter] = useState("All Sites");

  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 10;

  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const [savingSettings, setSavingSettings] = useState(false);

  const [settings, setSettings] = useState({
    globalClockInTime: "09:00",
    globalClockOutTime: "18:00",
    graceMinutes: 0,
    allowedRegularizations: null,
    autoClockOut: false,
  });

  const [cleanersMap, setCleanersMap] = useState<Record<string, any>>({});

  const dateFilteredTimesheets = useMemo(() => {
    return timesheets.filter((t) => {
      const matchesDate =
        !selectedDate ||
        new Date(t.date).toISOString().split("T")[0] === selectedDate;

      return matchesDate;
    });
  }, [timesheets, selectedDate]);

  const filteredTimesheets = useMemo(() => {
    return timesheets.filter((t) => {
      //
      // SEARCH
      //
      const matchesSearch =
        t.workerName.toLowerCase().includes(search.toLowerCase()) ||
        t.siteName.toLowerCase().includes(search.toLowerCase());

      //
      // SITE FILTER
      //
      const matchesSite =
        siteFilter === "All Sites" || t.siteName === siteFilter;

      //
      // DATE FILTER
      //
      // const matchesDate =
      //   !selectedDate ||
      //   new Date(t.date).toISOString().split("T")[0] === selectedDate;
      //
      // STATUS FILTER
      //
      const matchesStatus =
        statusFilter === "All Status"
          ? true
          : statusFilter === "OVERTIME"
            ? t.overtimeHours > 0
            : statusFilter === "Late"
              ? t.status === "Late" || t.lateMinutes > 0
              : t.status === statusFilter;

      return matchesSearch && matchesSite && matchesStatus;
    });
  }, [timesheets, search, siteFilter, statusFilter, selectedDate]);

  //
  // PAGINATION
  //
  const totalPages = Math.ceil(filteredTimesheets.length / rowsPerPage);

  const startIndex = (currentPage - 1) * rowsPerPage;

  const paginatedTimesheets = filteredTimesheets.slice(
    startIndex,
    startIndex + rowsPerPage,
  );

  const presentCount = dateFilteredTimesheets.filter(
    (t) => t.status === "Present",
  ).length;

  const completedCount = dateFilteredTimesheets.filter(
    (t) => t.status === "Completed",
  ).length;

  const absentCount = dateFilteredTimesheets.filter(
    (t) => t.status === "Absent",
  ).length;

  const lateCount = dateFilteredTimesheets.filter(
    (t) => t.status === "Late" || t.lateMinutes > 0,
  ).length;

  const overtimeHours = dateFilteredTimesheets.reduce(
    (sum, t) => sum + t.overtimeHours,
    0,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, siteFilter, statusFilter, selectedDate]);
  const uniqueSites = [
    "All Sites",

    ...new Set(timesheets.map((item) => item.siteName)),
  ];

  const statCards = [
    {
      label: "Present Today",

      value: presentCount,

      icon: "check_circle",

      trend: "Active",

      bgColor: "#ecfdf5",

      borderColor: "#22c55e",

      filter: "Present",
    },

    {
      label: "Absent Staff",

      value: absentCount,

      icon: "person_off",

      trend: "Attention",

      bgColor: "#fef2f2",

      borderColor: "#ef4444",

      filter: "Absent",
    },

    {
      label: "Late Clock-Ins",

      value: lateCount,

      icon: "alarm",

      trend: "Late",

      bgColor: "#fff7ed",

      borderColor: "#f97316",

      filter: "Late",
    },

    {
      label: "Overtime Hours",

      value: overtimeHours.toFixed(1),

      icon: "timer",

      trend: "Extra",

      bgColor: "#f3e8ff",

      borderColor: "#9333ea",

      filter: "OVERTIME",
    },
  ];

  const loadCleaners = async () => {
    try {
      const cleaners = await api.cleaners.getAll();

      //
      // CREATE MAP
      //
      const map: Record<string, any> = {};

      cleaners.forEach((cleaner: any) => {
        map[cleaner.id] = cleaner;
      });

      setCleanersMap(map);
    } catch (error) {
      console.error(error);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await api.attendance.getSettings();

      setSettings({
        globalClockInTime: response.globalClockInTime || "09:00",

        globalClockOutTime: response.globalClockOutTime || "18:00",

        graceMinutes: response.graceMinutes || 15,

        autoClockOut: response.autoClockOut || false,
        allowedRegularizations: response.allowedRegularizations ?? null,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSavingSettings(true);

      await api.attendance.updateSettings(settings);

      setShowSettingsModal(false);

      alert("Shift settings updated");
    } catch (error) {
      console.error(error);

      alert("Failed to update settings");
    } finally {
      setSavingSettings(false);
    }
  };

  useEffect(() => {
    loadSettings();
    loadCleaners();
  }, []);
  return (
    <div className="flex-1 flex flex-col py-[15px] sm:py-[30px] px-4 sm:px-[30px] bg-[#f6f8fc] min-h-[calc(100vh-160px)] overflow-hidden">
      <div className="space-y-6 w-full">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-[#0d121b] text-[1.6rem] sm:text-2xl font-bold font-black">
              Workforce Attendance
            </h1>

            <p className="text-[#4c669a] text-base mt-1">
              Monitor workforce attendance, shift compliance, attendance issues
              and productivity insights.
            </p>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />

              <button className="flex items-center justify-center w-10 h-10 rounded-full bg-[#e7ebf3] text-[#0d121b] border border-[#c7c7c7] hover:bg-[#dce1eb] transition-all">
                <CalendarDays size={18} />
              </button>
            </div>
            {selectedDate && (
              <button
                onClick={() => setSelectedDate("")}
                className="h-10 px-4 rounded-full border border-[#e7ebf3] bg-white text-sm font-medium hover:bg-[#f8fafc]"
              >
                Clear Date
              </button>
            )}

            <button
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center justify-center gap-2 rounded-full bg-[#2e4150] text-white text-sm font-bold hover:bg-[#243441] transition-all px-[24px] h-10"
            >
              <Clock3 size={16} />
              Shift Settings
            </button>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="bg-white border border-[#e7ebf3] rounded-2xl shadow-sm p-5 sm:p-6">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
            <div>
              <h2 className="text-lg sm:text-xl font-black font-bold  text-[#0d121b]">
                Attendance Details Today
              </h2>

              <p className="text-[#4c669a] mt-2 text-sm">
                Data from all employee attendance activities
              </p>
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-8">
            {statCards.map((card) => (
              <button
                key={card.label}
                onClick={() => {
                  setStatusFilter(card.filter);
                }}
                type="button"
                className={`bg-white p-4 sm:p-6 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer text-left ${
                  statusFilter === card.filter ? "ring-2 ring-[#135bec]/20" : ""
                }`}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderBottomColor = card.borderColor;

                  e.currentTarget.style.borderBottomWidth = "5px";

                  e.currentTarget.style.borderBottomStyle = "solid";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderBottomColor = "transparent";
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div
                    className="p-3 rounded-lg"
                    style={{
                      backgroundColor: card.bgColor,

                      color: card.borderColor,
                    }}
                  >
                    <span className="material-symbols-outlined">
                      {card.icon}
                    </span>
                  </div>

                  <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider bg-gray-50 px-2 py-0.5 rounded-full">
                    {card.trend}
                  </span>
                </div>

                <p className="text-base font-medium text-slate-500">
                  {card.label}
                </p>

                <p className="text-3xl font-black font-bold text-gray-900 mt-1">
                  {card.value}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white border border-[#e7ebf3] rounded-2xl shadow-sm overflow-hidden">
          {/* TOP */}
          <div className="p-4 sm:p-5 border-b border-[#edf2f7]">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-[#0d121b]">
                  Admin Attendance
                </h2>

                <p className="text-[#4c669a] text-sm mt-1">
                  Employee attendance records and shift details
                </p>
              </div>

              {/* FILTERS */}
              <div className="flex flex-wrap items-center gap-3">
                {/* <button className="h-10 px-4 rounded-full border border-[#e7ebf3] bg-white flex items-center gap-2 text-sm font-medium hover:bg-[#f8fafc]">
                  <CalendarDays size={16} />
                  12 May - 18 May
                </button> */}

                <select
                  value={siteFilter}
                  onChange={(e) => setSiteFilter(e.target.value)}
                  className="h-10 px-4 rounded-full border border-[#e7ebf3] bg-white text-sm font-medium outline-none min-w-[170px]"
                >
                  {uniqueSites.map((site) => (
                    <option key={site} value={site}>
                      {site}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10 px-4 rounded-full border border-[#e7ebf3] bg-white text-sm font-medium outline-none min-w-[170px]"
                >
                  <option value="All Status">All Status</option>

                  <option value="Present">Present</option>

                  <option value="Completed">Completed</option>

                  <option value="Absent">Absent</option>
                </select>
              </div>
            </div>
          </div>

          {/* SEARCH */}
          <div className="p-4 sm:p-5 border-b border-[#edf2f7] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-[#64748b]">
              <span className="font-medium">Total Records:</span>

              <span className="font-black text-[#0d121b]">
                {filteredTimesheets.length}
              </span>
            </div>

            <div className="relative w-full lg:w-[320px]">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search employee..."
                className="w-full h-11 rounded-full border border-[#e2e8f0] bg-white pl-11 pr-4 outline-none text-sm focus:ring-2 focus:ring-[#2e4150]/20"
              />
            </div>
          </div>

          {/* DESKTOP TABLE */}
          <div className=" lg:block overflow-x-auto w-full">
            <table className="w-full border-collapse">
              <thead className="bg-[#f8fafc]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#0d121b] whitespace-nowrap">
                    Employee
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-bold text-[#0d121b] whitespace-nowrap">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-bold text-[#0d121b] whitespace-nowrap">
                    Check In
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-bold text-[#0d121b] whitespace-nowrap">
                    Check Out
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-bold text-[#0d121b] whitespace-nowrap">
                    Site
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-bold text-[#0d121b] whitespace-nowrap">
                    Working Hours
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-14 text-center text-[#64748b]"
                    >
                      Loading attendance...
                    </td>
                  </tr>
                ) : filteredTimesheets.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-14 text-center text-[#64748b]"
                    >
                      No attendance found
                    </td>
                  </tr>
                ) : (
                  paginatedTimesheets.map((timesheet) => (
                    <tr
                      key={timesheet.id}
                      className="border-t border-[#edf2f7] hover:bg-[#fafbfd] transition-all"
                    >
                      {/* EMPLOYEE */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full border border-[#e7ebf3] overflow-hidden shadow-inner shrink-0">
                            <img
                              src={
                                cleanersMap[timesheet.workerId]?.avatar ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  timesheet.workerName,
                                )}&background=0D8ABC&color=fff`
                              }
                              onError={(e) => {
                                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  timesheet.workerName,
                                )}&background=0D8ABC&color=fff`;
                              }}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="font-bold text-[#0d121b] truncate">
                              {timesheet.workerName}
                            </p>

                            <p className="text-sm text-[#64748b] mt-1">
                              Workforce Team
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            timesheet.status === "Present"
                              ? "bg-green-100 text-green-700"
                              : timesheet.status === "Completed"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {timesheet.status}
                        </span>
                      </td>

                      {/* CLOCK IN */}
                      <td className="px-6 py-4 text-sm text-[#4c669a] font-medium whitespace-nowrap">
                        {formatTime(timesheet.clockIn)}
                      </td>

                      {/* CLOCK OUT */}
                      <td className="px-6 py-4 text-sm text-[#4c669a] font-medium whitespace-nowrap">
                        {timesheet.clockOut
                          ? formatTime(timesheet.clockOut)
                          : "-"}
                      </td>

                      {/* SITE */}
                      <td className="px-6 py-4 text-sm font-semibold text-[#0d121b]">
                        {timesheet.siteName}
                      </td>

                      {/* HOURS */}
                      <td className="px-6 py-4">
                        <span className="px-3 py-2 rounded-xl bg-[#2e4150] text-white font-bold text-xs">
                          {timesheet.workedHours.toFixed(2)} Hrs
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#edf2f7]">
              <p className="text-sm text-[#64748b]">
                Page {currentPage} of {totalPages}
              </p>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className="h-10 px-4 rounded-xl border border-[#dbe3ef] bg-white text-sm font-semibold disabled:opacity-50"
                >
                  Previous
                </button>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="h-10 px-4 rounded-xl bg-[#2e4150] text-white text-sm font-semibold disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
          {/* MOBILE CARDS */}
          {/* <div className="lg:hidden p-4 space-y-4">
            {loading ? (
              <div className="text-center py-10 text-[#64748b]">
                Loading attendance...
              </div>
            ) : filteredTimesheets.length === 0 ? (
              <div className="text-center py-10 text-[#64748b]">
                No attendance found
              </div>
            ) : (
              filteredTimesheets.map((timesheet) => (
                <div
                  key={timesheet.id}
                  className="border border-[#e7ebf3] rounded-2xl p-4 bg-[#fafbfd]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shrink-0" />

                      <div className="min-w-0">
                        <h3 className="font-bold text-[#0d121b] truncate">
                          {timesheet.workerName}
                        </h3>

                        <p className="text-sm text-[#64748b] mt-1">
                          {timesheet.siteName}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                        timesheet.status === "Present"
                          ? "bg-green-100 text-green-700"
                          : timesheet.status === "Completed"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {timesheet.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-5 text-sm">
                    <div>
                      <p className="text-[#64748b]">Check In</p>

                      <p className="font-semibold text-[#0d121b] mt-1">
                        {new Date(timesheet.clockIn).toLocaleTimeString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-[#64748b]">Check Out</p>

                      <p className="font-semibold text-[#0d121b] mt-1">
                        {timesheet.clockOut
                          ? new Date(timesheet.clockOut).toLocaleTimeString()
                          : "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[#64748b]">Worked Hours</p>

                      <p className="font-semibold text-[#0d121b] mt-1">
                        {timesheet.workedHours.toFixed(2)} Hrs
                      </p>
                    </div>

                    <div>
                      <p className="text-[#64748b]">Overtime</p>

                      <p className="font-semibold text-[#0d121b] mt-1">
                        {timesheet.overtimeHours.toFixed(1)} Hrs
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div> */}
        </div>
      </div>
      {/* SHIFT SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-[#e7ebf3] overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* HEADER */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#edf2f7]">
              <div>
                <h2 className="text-2xl font-black text-[#0d121b]">
                  Shift Settings
                </h2>

                <p className="text-sm text-[#64748b] mt-1">
                  Configure global attendance timings
                </p>
              </div>

              <button
                onClick={() => setShowSettingsModal(false)}
                className="w-10 h-10 rounded-full hover:bg-[#f1f5f9] flex items-center justify-center text-[#64748b] text-xl font-bold transition-all"
              >
                ×
              </button>
            </div>

            {/* BODY */}
            <div className="p-6 space-y-5">
              {/* CLOCK IN */}
              <div>
                <label className="block text-sm font-bold text-[#0d121b] mb-2">
                  Global Clock In Time
                </label>

                <input
                  type="time"
                  value={settings.globalClockInTime}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      globalClockInTime: e.target.value,
                    })
                  }
                  className="w-full h-12 rounded-2xl border border-[#dbe2ea] px-4 outline-none focus:ring-2 focus:ring-[#2e4150]/20"
                />
              </div>

              {/* CLOCK OUT */}
              <div>
                <label className="block text-sm font-bold text-[#0d121b] mb-2">
                  Global Clock Out Time
                </label>

                <input
                  type="time"
                  value={settings.globalClockOutTime}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      globalClockOutTime: e.target.value,
                    })
                  }
                  className="w-full h-12 rounded-2xl border border-[#dbe2ea] px-4 outline-none focus:ring-2 focus:ring-[#2e4150]/20"
                />
              </div>

              {/* GRACE */}
              <div>
                <label className="block text-sm font-bold text-[#0d121b] mb-2">
                  Grace Minutes
                </label>

                <input
                  type="number"
                  value={settings.graceMinutes}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      graceMinutes: Number(e.target.value),
                    })
                  }
                  className="w-full h-12 rounded-2xl border border-[#dbe2ea] px-4 outline-none focus:ring-2 focus:ring-[#2e4150]/20"
                />
              </div>
              {/* REGULARIZATION LIMIT */}
              <div>
                <label className="block text-sm font-bold text-[#0d121b] mb-2">
                  Allowed Regularizations
                </label>

                <input
                  type="number"
                  min={0}
                  value={settings.allowedRegularizations ?? ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,

                      allowedRegularizations:
                        e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                  placeholder="Leave empty for unlimited"
                  className="w-full h-12 rounded-2xl border border-[#dbe2ea] px-4 outline-none focus:ring-2 focus:ring-[#2e4150]/20"
                />

                <p className="text-xs text-[#64748b] mt-2">
                  Maximum number of attendance regularizations allowed per
                  cleaner.
                </p>
              </div>

              {/* AUTO CLOCK OUT */}
              {/* <div className="flex items-center justify-between rounded-2xl border border-[#edf2f7] p-4">
                <div>
                  <h3 className="font-bold text-[#0d121b]">Auto Clock Out</h3>

                  <p className="text-sm text-[#64748b] mt-1">
                    Automatically close active shifts
                  </p>
                </div>

                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={settings.autoClockOut}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        autoClockOut: e.target.checked,
                      })
                    }
                    className="peer sr-only"
                  />

                  <div className="peer h-6 w-11 rounded-full bg-[#cbd5e1] peer-checked:bg-[#2e4150] transition-all after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </div> */}
            </div>

            {/* FOOTER */}
            <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-[#edf2f7] bg-[#f8fafc]">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="h-11 px-5 rounded-2xl border border-[#dbe2ea] font-bold text-[#0d121b] hover:bg-white transition-all"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="h-11 px-6 rounded-2xl bg-[#2e4150] text-white font-bold hover:bg-[#243441] transition-all disabled:opacity-50"
              >
                {savingSettings ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAttendance;
