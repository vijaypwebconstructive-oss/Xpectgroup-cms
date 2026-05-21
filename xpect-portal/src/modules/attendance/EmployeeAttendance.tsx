import React from "react";
import { useEffect, useState } from "react";
import { useAttendance } from "../../context/AttendanceContext";
import { formatTime, formatDate, getCurrentLocalTime } from "../../utils/date";
import {
  CalendarDays,
  ChevronDown,
  Clock3,
  Download,
  FileText,
} from "lucide-react";
import api from "../../services/api";
import { getCurrentLocation } from "../../utils/location";

const EmployeeAttendance = () => {
  const { timesheets, loading, refresh } = useAttendance();
  const [showPunchDialog, setShowPunchDialog] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem("xpect_user") || "{}");
  const workerId = currentUser.cleanerId;
  const [cleaner, setCleaner] = useState<any>(null);
  const [selectedSite, setSelectedSite] = useState("");
  const [punchInLoading, setPunchInLoading] = useState(false);

  const [punchOutLoading, setPunchOutLoading] = useState(false);

  const [loadingText, setLoadingText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [dateFilter, setDateFilter] = useState("Last 7 Days");

  const [siteFilter, setSiteFilter] = useState("All Sites");
  const [showRegularizationDialog, setShowRegularizationDialog] =
    useState(false);

  const [selectedTimesheet, setSelectedTimesheet] = useState<any>(null);

  const [regularizationType, setRegularizationType] = useState("");

  const [regularizationReason, setRegularizationReason] = useState("");
  const [requestedClockIn, setRequestedClockIn] = useState("");

  const [requestedClockOut, setRequestedClockOut] = useState("");

  const [regularizationLoading, setRegularizationLoading] = useState(false);

  type AssignedSite = {
    id: string;
    name: string;
  };

  const [assignedSites, setAssignedSites] = useState<AssignedSite[]>([]);

  const loadAssignedSites = async () => {
    try {
      if (!currentUser?.id) return;

      const response = await api.attendance.getMySites(workerId);

      setAssignedSites(response);
    } catch (error) {
      console.error(error);
    }
  };

  // const formatTime = (dateString?: string) => {
  //   if (!dateString) return "-";

  //   return new Date(dateString).toLocaleTimeString([], {
  //     hour: "2-digit",
  //     minute: "2-digit",
  //   });
  // };
  const loadCleaner = async () => {
    try {
      if (!workerId) return;

      const response = await api.cleaners.getById(workerId);

      setCleaner(response);
    } catch (error) {
      console.error(error);
    }
  };

  const myAttendance = timesheets.filter((item) => item.workerId === workerId);

  const activeShift = myAttendance.find(
    (item) =>
      (item.status === "Present" || item.status === "Late") && !item.clockOut,
  );

  const latestAttendance = myAttendance?.[0];

  const lastPunchTime = latestAttendance?.clockIn
    ? formatTime(latestAttendance.clockIn)
    : "--:--";

  const isClockedIn = !!activeShift;

  const filteredAttendance = myAttendance.filter((item) => {
    //
    // STATUS FILTER
    //
    const matchesStatus =
      statusFilter === "All" || item.status === statusFilter;

    //
    // SITE FILTER
    //
    const matchesSite =
      siteFilter === "All Sites" || item.siteName === siteFilter;

    //
    // DATE FILTER
    //
    const itemDate = new Date(item.date);

    const today = new Date();

    const diffDays = Math.floor(
      (today.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    let matchesDate = true;

    if (dateFilter === "Today") {
      matchesDate = diffDays === 0;
    }

    if (dateFilter === "Last 7 Days") {
      matchesDate = diffDays <= 7;
    }

    if (dateFilter === "Last 30 Days") {
      matchesDate = diffDays <= 30;
    }

    if (dateFilter === "This Month") {
      matchesDate =
        itemDate.getMonth() === today.getMonth() &&
        itemDate.getFullYear() === today.getFullYear();
    }

    return matchesStatus && matchesSite && matchesDate;
  });

  const canRequestRegularization = (item: any) => {
    return (
      item.status === "Late" ||
      item.status === "Early Clock-Out" ||
      item.status === "Missed Clock-Out" ||
      item.attendanceIssue === "Missed Clock-In"
    );
  };

  const today = new Date();

  //
  // TODAY HOURS
  //
  const todayHours = myAttendance
    .filter((item) => {
      const itemDate = new Date(item.date);

      return itemDate.toDateString() === today.toDateString();
    })
    .reduce((total, item) => total + (item.workedHours || 0), 0);

  //
  // WEEKLY HOURS
  //
  const weeklyHours = myAttendance
    .filter((item) => {
      const itemDate = new Date(item.date);

      const diffDays = Math.floor(
        (today.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      return diffDays <= 7;
    })
    .reduce((total, item) => total + (item.workedHours || 0), 0);

  //
  // MONTHLY HOURS
  //
  const monthlyHours = myAttendance
    .filter((item) => {
      const itemDate = new Date(item.date);

      return (
        itemDate.getMonth() === today.getMonth() &&
        itemDate.getFullYear() === today.getFullYear()
      );
    })
    .reduce((total, item) => total + (item.workedHours || 0), 0);

  //
  // OVERTIME HOURS
  //
  const overtimeHours = myAttendance.reduce(
    (total, item) => total + (item.overtimeHours || 0),
    0,
  );

  //
  // FINAL STATS
  //
  const stats = [
    {
      title: "Today's Hours",
      value: todayHours.toFixed(1),
      iconBg: "#eff6ff",
      iconColor: "#2563eb",
      trend: "Live attendance",
    },

    {
      title: "Weekly Hours",
      value: weeklyHours.toFixed(1),
      iconBg: "#f0fdf4",
      iconColor: "#22c55e",
      trend: "Last 7 days",
    },

    {
      title: "Monthly Hours",
      value: monthlyHours.toFixed(1),
      iconBg: "#fef3c7",
      iconColor: "#f59e0b",
      trend: "Current month",
    },

    {
      title: "Overtime",
      value: overtimeHours.toFixed(1),
      iconBg: "#f3e8ff",
      iconColor: "#9333ea",
      trend: "Extra hours",
    },
  ];

  const handlePunchIn = async () => {
    try {
      setPunchInLoading(true);

      setLoadingText("Requesting location access...");

      //
      // Ask GPS permission
      //
      const location = await getCurrentLocation();

      setLoadingText("Validating attendance area...");

      //
      // Extract coordinates
      //
      const latitude = location.coords.latitude;

      const longitude = location.coords.longitude;

      //
      // API request
      //
      await api.attendance.clockIn({
        workerId,

        siteId: selectedSite,

        latitude,

        longitude,
      });

      setLoadingText("Punching you in...");

      //
      // Close dialog
      //
      setShowPunchDialog(false);

      //
      // Reset
      //
      setSelectedSite("");

      //
      // Refresh attendance
      //
      await refresh();

      setLoadingText("");
    } catch (error: any) {
      console.error("PUNCH IN ERROR:", error);

      //
      // GPS permission denied
      //
      if (error.code === 1) {
        alert("Location permission denied. Please enable GPS access.");

        return;
      }

      //
      // Outside geo fence
      //
      if (error.message?.includes("outside")) {
        alert("You are outside the allowed attendance area for this site.");

        return;
      }

      //
      // Already active shift
      //
      if (error.message?.includes("active shift")) {
        alert("You already have an active shift.");

        return;
      }

      //
      // Not assigned
      //
      if (error.message?.includes("not assigned")) {
        alert("You are not assigned to this site.");

        return;
      }

      //
      // Generic
      //
      alert(error.message || "Failed to punch in");
    } finally {
      setPunchInLoading(false);

      setLoadingText("");
    }
  };

  const handlePunchOut = async () => {
    try {
      setPunchOutLoading(true);

      setLoadingText("Requesting location access...");

      //
      // Ask GPS permission again
      //
      const location = await getCurrentLocation();

      setLoadingText("Validating site location...");

      const latitude = location.coords.latitude;

      const longitude = location.coords.longitude;

      //
      // Clock out API
      //
      await api.attendance.clockOut(activeShift.id, {
        latitude,
        longitude,
      });

      setLoadingText("Punching you out...");

      //
      // Refresh
      //
      await refresh();
    } catch (error: any) {
      console.error("PUNCH OUT ERROR:", error);

      //
      // GPS permission denied
      //
      if (error.code === 1) {
        alert("Location permission denied.");

        return;
      }

      //
      // Outside site radius
      //
      if (error.message?.includes("inside site area")) {
        alert("You must be inside the site area to clock out.");

        return;
      }

      //
      // Generic
      //
      alert(error.message || "Failed to punch out");
    } finally {
      setPunchOutLoading(false);

      setLoadingText("");
    }
  };

  const buildISODateTime = (dateTime: string) => {
    //
    // Empty
    //
    if (!dateTime) {
      return "";
    }

    //
    // Convert safely
    //
    const parsed = new Date(dateTime);

    //
    // Invalid date protection
    //
    if (isNaN(parsed.getTime())) {
      return "";
    }

    return parsed.toISOString();
  };

  const handleRegularizationRequest = async () => {
    try {
      setRegularizationLoading(true);

      await api.attendanceRegularization.create({
        workerId,

        workerName: cleaner?.name,

        timesheetId: selectedTimesheet?.id,

        type: regularizationType,

        reason: regularizationReason,

        attendanceDate: selectedTimesheet?.date,

        requestedClockIn: buildISODateTime(requestedClockIn),

        requestedClockOut: buildISODateTime(requestedClockOut),
      });

      //
      // CLOSE
      //
      setShowRegularizationDialog(false);

      //
      // RESET
      //
      setSelectedTimesheet(null);

      setRegularizationType("");

      setRegularizationReason("");
      setRequestedClockIn("");

      setRequestedClockOut("");

      //
      // REFRESH
      //
      await refresh();

      alert("Regularization request submitted successfully");
    } catch (error: any) {
      console.error(error);

      alert(error.message || "Failed to submit request");
    } finally {
      setRegularizationLoading(false);
    }
  };

  const currentTime = getCurrentLocalTime();

  useEffect(() => {
    loadAssignedSites();
    loadCleaner();
  }, []);
  return (
    <div className="flex-1 flex flex-col py-[15px] sm:py-[30px] px-4 sm:px-[30px] bg-[#f6f8fc] min-h-[calc(100vh-160px)] overflow-hidden">
      <div className="space-y-6 w-full">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-[#0d121b] text-[1.6rem] sm:text-2xl font-black">
              Employee Attendance
            </h1>

            <p className="text-[#4c669a] text-base mt-1">
              Track employee attendance, working hours and productivity.
            </p>
          </div>

          {/* ACTIONS */}
          {/* <div className="flex flex-wrap gap-3 items-center">
            <button className="flex items-center justify-center w-10 h-10 rounded-full bg-[#e7ebf3] text-[#0d121b] border border-[#c7c7c7] hover:bg-[#dce1eb] transition-all">
              <Clock3 size={18} />
            </button>

            <button className="flex items-center justify-center w-10 h-10 rounded-full bg-[#e7ebf3] text-[#0d121b] border border-[#c7c7c7] hover:bg-[#dce1eb] transition-all">
              <CalendarDays size={18} />
            </button>

            <button className="flex items-center justify-center gap-2 rounded-full h-10 px-[20px] bg-[#e7ebf3] text-[#0d121b] text-sm font-bold border border-[#c7c7c7] hover:bg-[#dce1eb] transition-all">
              <Download size={16} />
              Export
              <ChevronDown size={14} />
            </button>

            <button className="flex items-center justify-center gap-2 rounded-full bg-[#2e4150] text-white text-sm font-bold hover:bg-[#243441] transition-all px-[24px] h-10">
              <FileText size={16} />
              Report
            </button>
          </div> */}
        </div>

        {/* TOP GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-6 w-full items-start">
          {/* LEFT PROFILE */}
          {/* LEFT PROFILE */}
          <div className="w-full bg-white rounded-2xl border border-[#e7ebf3] shadow-sm overflow-hidden">
            {/* TOP HEADER */}
            <div
              className={`px-6 py-2 ${
                isClockedIn
                  ? "bg-gradient-to-r from-[#22c55e] to-[#16a34a]"
                  : "bg-gradient-to-r from-[#64748b] to-[#475569]"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-white/80 text-sm font-medium">
                  {isClockedIn ? "Currently Working" : "Shift Completed"}
                </p>

                <h2 className="text-white text-xl font-black mt-1">
                  {currentTime}
                </h2>

                {/* <div
                  className={`px-4 py-2 rounded-full text-xs font-black tracking-wider uppercase ${
                    isClockedIn
                      ? "bg-white text-[#16a34a]"
                      : "bg-white text-[#475569]"
                  }`}
                >
                  {isClockedIn ? "ACTIVE" : "CLOCKED OUT"}
                </div> */}
              </div>
            </div>

            {/* BODY */}
            <div className="p-6">
              {/* PROFILE */}
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <img
                    src={
                      cleaner?.avatar
                        ? cleaner.avatar
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            cleaner?.name || "Employee",
                          )}&background=0D8ABC&color=fff`
                    }
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        cleaner?.name || "Employee",
                      )}&background=0D8ABC&color=fff`;
                    }}
                    alt=""
                    className={`w-24 h-24 rounded-full object-cover border-[5px] shadow-lg ${
                      isClockedIn ? "border-[#22c55e]" : "border-[#94a3b8]"
                    }`}
                  />

                  <div
                    className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-4 border-white ${
                      isClockedIn ? "bg-[#22c55e]" : "bg-[#94a3b8]"
                    }`}
                  />
                </div>

                <h3 className="text-[#0f172a] text-xl font-black mt-5">
                  Hello,{cleaner?.name || "Employee"}
                </h3>
              </div>

              {/* STATUS CARD */}
              <div
                className={`mt-6 rounded-2xl p-2 border ${
                  isClockedIn
                    ? "bg-green-50 border-green-100"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isClockedIn ? "bg-[#22c55e]" : "bg-[#64748b]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-white">
                      fingerprint
                    </span>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider font-black text-[#64748b]">
                      {isClockedIn ? "Punched In" : "Last Activity"}
                    </p>

                    <h4 className="text-[#0f172a] font-black text-lg mt-1">
                      {lastPunchTime}
                    </h4>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTON */}
              <button
                onClick={() => {
                  if (activeShift) {
                    handlePunchOut();
                  } else {
                    setShowPunchDialog(true);
                  }
                }}
                className={`w-full mt-6 rounded-full h-12 text-white font-bold transition-all shadow-sm ${
                  isClockedIn
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-[#2e4150] hover:bg-[#243441]"
                }`}
              >
                {isClockedIn ? "Punch Out" : "Punch In"}
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-6 w-full min-w-0">
            {/* KPI */}
            <div className="grid grid-cols-2 sm:grid-cols-2 2xl:grid-cols-4 gap-5">
              {stats.map((item) => (
                <div
                  key={item.title}
                  className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-[#e7ebf3] min-w-0"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor: item.iconBg,
                      color: item.iconColor,
                    }}
                  >
                    <Clock3 size={18} />
                  </div>

                  <h3 className="text-3xl font-black text-[#0d121b] mt-5 break-words">
                    {item.value}
                    {/* <span className="text-[#64748b] text-lg font-semibold">
                      {" "}
                      {item.sub}
                    </span> */}
                  </h3>

                  <p className="text-[#4c669a] mt-2 text-sm">{item.title}</p>

                  {/* <div className="border-t border-[#edf2f7] mt-5 pt-4">
                    <p className="text-sm font-medium text-[#4c669a]">
                      {item.trend}
                    </p>
                  </div> */}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm overflow-hidden">
          {/* TOP */}
          <div className="p-4 sm:p-5 border-b border-[#e7ebf3] flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
            <h2 className="text-lg font-black text-[#0d121b]">
              Attendance History
            </h2>

            <div className="flex flex-wrap gap-3">
              {/* STATUS FILTER */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-4 rounded-full border border-[#e7ebf3] bg-white text-sm font-medium outline-none"
              >
                <option>All</option>
                <option>Late</option>

                <option>Half Day</option>

                <option>Completed</option>

                <option>Missed Clock-Out</option>
              </select>

              {/* DATE FILTER */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="h-10 px-4 rounded-full border border-[#e7ebf3] bg-white text-sm font-medium outline-none"
              >
                <option>Today</option>

                <option>Last 7 Days</option>

                <option>Last 30 Days</option>

                <option>This Month</option>
              </select>

              {/* SITE FILTER */}
              <select
                value={siteFilter}
                onChange={(e) => setSiteFilter(e.target.value)}
                className="h-10 px-4 rounded-full border border-[#e7ebf3] bg-white text-sm font-medium outline-none"
              >
                <option>All Sites</option>

                {assignedSites.map((site) => (
                  <option key={site.id} value={site.name}>
                    {site.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* DESKTOP TABLE */}
          <div className=" lg:block overflow-x-auto w-full">
            <table className="w-full border-collapse">
              <thead className="bg-[#f8fafc]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#0d121b]">
                    Date
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-bold text-[#0d121b] whitespace-nowrap">
                    Clock In
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-bold text-[#0d121b]">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-bold text-[#0d121b] whitespace-nowrap">
                    Clock Out
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-bold text-[#0d121b]">
                    Late
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-bold text-[#0d121b]">
                    Overtime
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#0d121b]">
                    Regularization
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-[#64748b]"
                    >
                      Loading attendance...
                    </td>
                  </tr>
                ) : filteredAttendance.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-[#64748b]"
                    >
                      No attendance records found
                    </td>
                  </tr>
                ) : (
                  filteredAttendance.map((item) => (
                    <tr key={item.id} className="border-t border-[#edf2f7]">
                      {/* DATE */}
                      <td className="px-6 py-4">{formatDate(item.date)}</td>

                      {/* CLOCK IN */}
                      <td className="px-6 py-4"> {formatTime(item.clockIn)}</td>

                      {/* STATUS */}
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            item.status === "Present" ||
                            item.status === "Completed" ||
                            item.status === "Regularized"
                              ? "bg-green-100 text-green-700"
                              : item.status === "Late" ||
                                  item.status === "Missed Clock-Out" ||
                                  item.status === "Half Day"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* CLOCK OUT */}
                      <td className="px-6 py-4">{formatTime(item.clockOut)}</td>

                      {/* LATE */}
                      <td className="px-6 py-4">
                        {item.lateMinutes > 0 ? `${item.lateMinutes} min` : "-"}
                      </td>

                      {/* OVERTIME */}
                      <td className="px-6 py-4">
                        {item.overtimeHours > 0
                          ? `${item.overtimeHours} hrs`
                          : "-"}
                      </td>

                      <td className="px-6 py-4">
                        {(() => {
                          //
                          // ALWAYS SHOW FINAL REGULARIZATION STATUS
                          //
                          if (item.regularizationStatus === "Pending") {
                            return (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                                Pending
                              </span>
                            );
                          }

                          if (item.regularizationStatus === "Approved") {
                            return (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                Approved
                              </span>
                            );
                          }

                          if (item.regularizationStatus === "Rejected") {
                            return (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                                Rejected
                              </span>
                            );
                          }

                          //
                          // CAN REQUEST?
                          //
                          const canRequest = canRequestRegularization(item);

                          //
                          // NOT ALLOWED
                          //
                          if (!canRequest) {
                            return (
                              <span className="text-[#94a3b8] text-sm">-</span>
                            );
                          }

                          //
                          // REQUEST BUTTON
                          //
                          return (
                            <button
                              onClick={() => {
                                setSelectedTimesheet(item);

                                //
                                // AUTO SELECT TYPE
                                //
                                if (item.status === "Late") {
                                  setRegularizationType("Late Clock-In");
                                }

                                if (item.status === "Missed Clock-Out") {
                                  setRegularizationType("Missed Clock-Out");
                                }

                                if (
                                  item.attendanceIssue === "Missed Clock-In"
                                ) {
                                  setRegularizationType("Missed Clock-In");
                                }

                                if (
                                  item.attendanceIssue === "Early Clock-Out"
                                ) {
                                  setRegularizationType("Early Clock-Out");
                                }

                                setShowRegularizationDialog(true);
                              }}
                              className="px-4 h-9 rounded-xl bg-[#2e4150] text-white text-xs font-bold hover:bg-[#243441]"
                            >
                              Request
                            </button>
                          );
                        })()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {showPunchDialog && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#e7ebf3]">
                {/* HEADER */}
                <div className="p-6 border-b border-[#edf2f7]">
                  <h2 className="text-2xl font-black text-[#0d121b]">
                    Punch In
                  </h2>

                  <p className="text-[#64748b] mt-2">
                    Select your working site
                  </p>
                </div>

                {/* BODY */}
                <div className="p-6">
                  <label className="block text-sm font-bold text-[#0d121b] mb-3">
                    Assigned Site
                  </label>

                  <select
                    value={selectedSite}
                    onChange={(e) => setSelectedSite(e.target.value)}
                    className="w-full h-12 rounded-2xl border border-[#dbe3ef] px-4 bg-white outline-none focus:ring-2 focus:ring-[#2e4150]"
                  >
                    <option value="">Select Site</option>

                    {assignedSites.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* FOOTER */}
                <div className="p-6 border-t border-[#edf2f7] flex items-center justify-end gap-3">
                  <button
                    onClick={() => setShowPunchDialog(false)}
                    className="h-11 px-5 rounded-xl border border-[#dbe3ef] font-semibold"
                  >
                    Cancel
                  </button>

                  <button
                    disabled={!selectedSite || punchInLoading}
                    onClick={handlePunchIn}
                    className="h-11 px-6 rounded-xl bg-[#2e4150] text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2 min-w-[180px]"
                  >
                    {punchInLoading && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}

                    {punchInLoading ? "Processing..." : "Confirm Punch In"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {showRegularizationDialog && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
              <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#e7ebf3]">
                {/* HEADER */}
                <div className="p-6 border-b border-[#edf2f7]">
                  <h2 className="text-2xl font-black text-[#0d121b]">
                    Attendance Regularization
                  </h2>

                  <p className="text-[#64748b] mt-2">
                    Submit attendance correction request
                  </p>
                </div>

                {/* BODY */}
                <div className="p-6 space-y-5">
                  {/* TYPE */}
                  <div>
                    <label className="block text-sm font-bold text-[#0d121b] mb-2">
                      Request Type
                    </label>

                    <select
                      value={regularizationType}
                      onChange={(e) => {
                        setRegularizationType(e.target.value);
                        //
                        // RESET FIELDS
                        //
                        setRequestedClockIn("");

                        setRequestedClockOut("");
                      }}
                      className="w-full h-12 rounded-2xl border border-[#dbe3ef] px-4 bg-white"
                    >
                      <option value="">Select Type</option>

                      <option value="Missed Clock-In & Clock-Out">
                        Missed Clock-In & Clock-Out
                      </option>

                      <option value="Missed Clock-Out">Missed Clock-Out</option>

                      <option value="Missed Clock-In">Missed Clock-In</option>
                    </select>
                  </div>

                  {/* REASON */}
                  <div>
                    <label className="block text-sm font-bold text-[#0d121b] mb-2">
                      Reason
                    </label>

                    <textarea
                      rows={5}
                      value={regularizationReason}
                      onChange={(e) => setRegularizationReason(e.target.value)}
                      placeholder="Explain why attendance was missed..."
                      className="w-full rounded-2xl border border-[#dbe3ef] p-4 outline-none resize-none focus:ring-2 focus:ring-[#2e4150]"
                    />
                  </div>
                  {/* REQUESTED CLOCK-IN */}
                  {(regularizationType === "Missed Clock-In" ||
                    regularizationType === "Late Clock-In" ||
                    regularizationType === "Missed Clock-In & Clock-Out") && (
                    <div>
                      <label className="block text-sm font-bold text-[#0d121b] mb-2">
                        Requested Clock-In
                      </label>

                      <input
                        type="datetime-local"
                        value={requestedClockIn}
                        onChange={(e) => setRequestedClockIn(e.target.value)}
                        className="w-full h-12 rounded-2xl border border-[#dbe3ef] px-4"
                      />
                    </div>
                  )}

                  {/* REQUESTED CLOCK-OUT */}
                  {(regularizationType === "Missed Clock-Out" ||
                    regularizationType === "Missed Clock-In & Clock-Out") && (
                    <div>
                      <label className="block text-sm font-bold text-[#0d121b] mb-2">
                        Requested Clock-Out
                      </label>

                      <input
                        type="datetime-local"
                        value={requestedClockOut}
                        onChange={(e) => setRequestedClockOut(e.target.value)}
                        className="w-full h-12 rounded-2xl border border-[#dbe3ef] px-4"
                      />
                    </div>
                  )}
                </div>

                {/* FOOTER */}
                <div className="p-6 border-t border-[#edf2f7] flex items-center justify-end gap-3">
                  <button
                    onClick={() => setShowRegularizationDialog(false)}
                    className="h-11 px-5 rounded-xl border border-[#dbe3ef] font-semibold"
                  >
                    Cancel
                  </button>

                  <button
                    disabled={!regularizationReason || regularizationLoading}
                    onClick={handleRegularizationRequest}
                    className="h-11 px-6 rounded-xl bg-[#2e4150] text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2 min-w-[180px]"
                  >
                    {regularizationLoading && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}

                    {regularizationLoading ? "Submitting..." : "Submit Request"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendance;
