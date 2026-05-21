import React, { useState } from "react";
import { useUserAccess } from "../../context/UserAccessContext";
import { useCurrentUser } from "../../hook/useCurrentUser";
import { useClientsSites } from "../../context/ClientsSitesContext";
import {
  UserRole,
  AccountStatus,
  ROLE_PERMISSIONS,
  ROLE_DESCRIPTIONS,
  ACCESS_LABELS,
} from "./types";

interface Props {
  userId: string;
  onBack: () => void;
}

const ROLE_MODULES: Record<string, string[]> = {
  Admin: [
    "dashboard",
    "employee compliance",
    "client",
    "sites",
    "risk",
    "site allocation",
    "site inspection",
    "ppe",
    "incident",
    "document",
    "users",
    "finance",
    "payroll",
    "invoice",
    "quotation",
    "timesheet",
    "prospect",
    "performance",
  ],

  Supervisor: ["sites", "risk", "employee compliance", "incident"],

  Custom: [],

  Default: ["employee attendance"],
};

const roleBadge = (role: UserRole) => {
  const map: Record<UserRole, { cls: string; icon: string }> = {
    Admin: {
      cls: "bg-purple-100 text-purple-700 border border-purple-200",
      icon: "shield_person",
    },

    Supervisor: {
      cls: "bg-blue-100 text-blue-700 border border-blue-200",
      icon: "supervisor_account",
    },

    Custom: {
      cls: "bg-teal-100 text-teal-700 border border-teal-200",
      icon: "edit_note",
    },

    Default: {
      cls: "bg-orange-100 text-orange-700 border border-orange-200",
      icon: "badge",
    },
  };
  return map[role];
};

const statusBadge = (status: AccountStatus) => {
  const map: Record<
    AccountStatus,
    { cls: string; label: string; icon: string }
  > = {
    active: {
      cls: "bg-green-100 text-green-700 border border-green-200",
      label: "Active",
      icon: "check_circle",
    },
    disabled: {
      cls: "bg-red-50 text-red-500 border border-red-200",
      label: "Disabled",
      icon: "block",
    },
    pending: {
      cls: "bg-amber-100 text-amber-700 border border-amber-200",
      label: "Pending",
      icon: "schedule",
    },
  };
  return map[status];
};

const fmt = (d?: string) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const fmtDateTime = (d?: string) => {
  if (!d) return "Never logged in";
  const date = new Date(d);
  return (
    date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) +
    " at " +
    date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  );
};

const UserDetail: React.FC<Props> = ({ userId, onBack }) => {
  const { getUserById, updateUser, deleteUser } = useUserAccess();
  const { clients, sites } = useClientsSites();
  const clientsLoaded = clients.length > 0;
  const sitesLoaded = sites.length > 0;
  const user = getUserById(userId);
  const [editData, setEditData] = useState({
    role: user?.role || "Custom",
    modules: user?.modules || [],
    clientAccess: user?.clientAccess || [],
    siteAccess: user?.siteAccess || [],
  });
  const [localStatus, setLocalStatus] = useState<AccountStatus | null>(null);

  // const ALL_MODULES = [
  //   { key: "users", label: "User Access", icon: "group" },
  //   { key: "sites", label: "Clients & Sites", icon: "location_on" },
  //   { key: "risk", label: "Risk & COSHH", icon: "warning" },
  //   { key: "finance", label: "Finance", icon: "payments" },
  //   { key: "compliance", label: "Compliance", icon: "verified" },
  //   { key: "dashboard", label: "Dashboard", icon: "dashboard" },
  //   { key: "incident", label: "Incident", icon: "report_problem" },
  // ];

  const MODULE_CONFIG = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: "dashboard",
    },

    {
      key: "employee compliance",
      label: "Compliance",
      icon: "verified_user",
    },

    {
      key: "client",
      label: "Clients",
      icon: "handshake",
    },

    {
      key: "sites",
      label: "Sites",
      icon: "location_on",
    },

    {
      key: "risk",
      label: "Risk & COSHH",
      icon: "warning",
    },
    {
      key: "admin attendance",
      label: "Admin Attendance",
      icon: "group",
    },

    {
      key: "employee attendance",
      label: "Employee Attendance",
      icon: "badge",
    },

    {
      key: "regularization",
      label: "Regularization",
      icon: "assignment_late",
    },
    {
      key: "site allocation",
      label: "Site Allocation",
      icon: "assignment_ind",
    },

    {
      key: "ppe",
      label: "PPE",
      icon: "health_and_safety",
    },

    {
      key: "incident",
      label: "Incident",
      icon: "report_problem",
    },

    {
      key: "document",
      label: "Documents",
      icon: "folder",
    },

    {
      key: "users",
      label: "User Access",
      icon: "group",
    },

    {
      key: "finance",
      label: "Finance",
      icon: "payments",
    },

    {
      key: "payroll",
      label: "Payroll",
      icon: "receipt_long",
    },

    {
      key: "invoice",
      label: "Invoice",
      icon: "request_quote",
    },

    {
      key: "quotation",
      label: "Quotation",
      icon: "description",
    },
    {
      key: "timesheet",
      label: "Timesheet",
      icon: "schedule",
    },
    {
      key: "prospect",
      label: "Prospect",
      icon: "person_search",
    },

    {
      key: "performance",
      label: "Performance",
      icon: "monitoring",
    },
  ];
  const [successMsg, setSuccessMsg] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");

  const flash = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?",
    );

    if (!confirmDelete) return;

    try {
      await deleteUser(id);

      setAlertType("success");

      setSuccessMsg("User deleted successfully");

      // navigate back after short delay
      setTimeout(() => {
        onBack();
      }, 800);
    } catch (err) {
      console.error(err);

      setAlertType("error");

      setSuccessMsg("Failed to delete user");

      setTimeout(() => {
        setSuccessMsg("");
      }, 3000);
    }
  };

  if (!user) {
    return (
      <div className="min-h-full bg-[#f6f7fb] flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-[56px] text-[#e7ebf3] block mb-4">
            person_off
          </span>
          <p className="text-lg font-bold text-[#0d121b]">User not found</p>
          <button
            onClick={onBack}
            className="mt-4 px-5 py-2.5 rounded-xl bg-[#2e4150] text-white text-sm font-semibold hover:bg-[#3a5268] transition-colors"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }
  console.log("user from detail", user);
  const currentStatus = localStatus ?? user.status;
  const rb = roleBadge(user.role);
  const sb = statusBadge(currentStatus);
  const userModules = user.modules || [];

  const getClientName = (id: string) => {
    if (!clientsLoaded) return "Loading...";

    return (
      clients.find((c: any) => c.id === id || c._id === id)?.name ||
      "Unknown Client"
    );
  };

  const getSiteName = (id: string) => {
    if (!sitesLoaded) return "Loading...";

    return (
      sites.find((s: any) => s.id === id || s._id === id)?.name ||
      "Unknown Site"
    );
  };

  const permissions = MODULE_CONFIG.map((mod) => ({
    module: mod.label,
    key: mod.key,
    icon: mod.icon,
    hasAccess: editData.modules.includes(mod.key),
  }));
  const initials = user.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const toggleStatus = async () => {
    const next = currentStatus === "active" ? "disabled" : "active";
    setLocalStatus(next);
    await updateUser(user.id, { status: next });
  };

  const handleSaveAccess = async () => {
    try {
      await updateUser(user.id, {
        role: editData.role,
        modules: editData.modules,
        clientAccess: editData.clientAccess,
        siteAccess: editData.siteAccess,
      });

      setAlertType("success");

      setSuccessMsg("User access updated successfully");

      setTimeout(() => {
        setSuccessMsg("");
      }, 3000);
    } catch (err) {
      console.error(err);

      setAlertType("error");

      setSuccessMsg("Failed to update access");

      setTimeout(() => {
        setSuccessMsg("");
      }, 3000);
    }
  };

  return (
    <div className="min-h-full bg-[#f6f7fb] w-screen sm:w-full sm:max-w-full">
      {/* Header */}
      <div className="bg-white border-b border-[#e7ebf3] sm:px-8 px-4 sm:py-5 py-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-[#6b7a99] hover:text-[#0d121b] transition-colors mb-4"
        >
          <span className="material-symbols-outlined text-[18px]">
            arrow_back
          </span>
          Back to Users
        </button>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#2e4150] text-white text-lg font-bold flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0d121b]">
                {user.fullName}
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {rb.icon}
                  </span>
                  {user.role}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {/* {sb.icon} */}
                  </span>
                  {/* {sb.label} */}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(userId);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm bg-red-600 text-white hover:bg-red-700"
                
            `}
          >
            <span className="material-symbols-outlined text-[18px]">
              delete
            </span>
            Delete
          </button>
        </div>
      </div>

      <div className="sm:px-8 px-4 sm:py-6 py-3 space-y-5">
        {successMsg && (
          <div className="fixed top-5 right-5 z-[9999] animate-in slide-in-from-top-3 duration-300">
            <div
              className={`min-w-[320px] max-w-[420px] rounded-2xl px-5 py-4 shadow-2xl border backdrop-blur-md flex items-start gap-3 ${
                alertType === "success"
                  ? "bg-green-50/95 border-green-200 text-green-700"
                  : "bg-red-50/95 border-red-200 text-red-600"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  alertType === "success" ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {alertType === "success" ? "check_circle" : "error"}
                </span>
              </div>

              <div className="flex-1">
                <h3 className="text-sm font-bold">
                  {alertType === "success" ? "Success" : "Error"}
                </h3>

                <p className="text-sm mt-1 leading-6">{successMsg}</p>
              </div>
            </div>
          </div>
        )}
        {/* User Info Card */}
        <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm sm:p-6 p-4">
          <h2 className="text-base font-bold text-[#0d121b] flex items-center gap-2 mb-5">
            <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">
              person
            </span>
            Account Information
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { label: "Full Name", value: user.fullName, icon: "badge" },
              { label: "Email", value: user.email, icon: "email" },
              // { label: "Phone", value: user.phone || "Not set", icon: "phone" },
              { label: "Role", value: user.role, icon: "admin_panel_settings" },
              {
                label: "Created",
                value: fmt(user.createdAt),
                icon: "calendar_today",
              },
              // {
              //   label: "Last Login",
              //   value: fmtDateTime(user.lastLogin),
              //   icon: "login",
              // },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#f6f7fb] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">
                    {item.icon}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#6b7a99] uppercase tracking-wide">
                    {item.label}
                  </p>
                  <p className="text-sm font-medium text-[#0d121b] mt-0.5">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-[#6b7a99] uppercase mb-2">
                User Role
              </label>

              <select
                value={editData.role}
                onChange={(e) => {
                  const selectedRole = e.target.value;

                  setEditData((prev) => ({
                    ...prev,

                    role: selectedRole,

                    modules: ROLE_MODULES[selectedRole] || [],
                  }));
                }}
                className="w-full sm:w-[240px] px-3 py-2 rounded-xl border border-[#e7ebf3] bg-[#f6f7fb]"
              >
                <option value="Admin">Admin</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Custom">Custom</option>
                <option value="Default">Default</option>
              </select>
            </div>
          </div>
        </div>

        {/* Role Description */}
        <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm sm:p-6 p-4">
          <h2 className="text-base font-bold text-[#0d121b] flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">
              shield_person
            </span>
            Role — {user.role}
          </h2>
          <p className="text-sm text-[#6b7a99] mb-5">
            {ROLE_DESCRIPTIONS[user.role]}
          </p>

          <div className="flex items-start gap-3 bg-[#2e4150] rounded-xl px-5 py-4 mb-5">
            <span className="material-symbols-outlined text-white/70 text-[20px] shrink-0 mt-0.5">
              info
            </span>
            <div>
              <p className="text-sm font-semibold text-white">
                Module Access Permissions
              </p>
              <p className="text-xs text-white/70 mt-0.5">
                The table below shows which modules this user can access based
                on their assigned role. Permission enforcement will be applied
                when backend authentication is enabled.
              </p>
            </div>
          </div>

          {/* Permissions Table */}
          <div className="rounded-xl border border-[#e7ebf3] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f6f7fb] border-b border-[#e7ebf3]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wide">
                    Module
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wide">
                    Access Level
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wide">
                    Module
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wide">
                    Access Level
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#e7ebf3]">
                {Array.from({
                  length: Math.ceil(permissions.length / 2),
                }).map((_, index) => {
                  const left = permissions[index * 2];
                  const right = permissions[index * 2 + 1];

                  return (
                    <tr key={index}>
                      {/* LEFT MODULE */}
                      <td
                        className={`px-4 py-3 ${
                          !left?.hasAccess ? "opacity-50" : ""
                        }`}
                      >
                        {left && (
                          <div className="flex items-center gap-2.5">
                            <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">
                              {left.icon}
                            </span>

                            <span className="font-medium text-[#0d121b]">
                              {left.module}
                            </span>
                          </div>
                        )}
                      </td>

                      <td
                        className={`px-4 py-3 ${
                          !left?.hasAccess ? "opacity-50" : ""
                        }`}
                      >
                        {left && (
                          <button
                            onClick={() => {
                              setEditData((prev) => ({
                                ...prev,

                                modules: left.hasAccess
                                  ? prev.modules.filter((m) => m !== left.key)
                                  : [...prev.modules, left.key],
                              }));
                            }}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                              left.hasAccess
                                ? "bg-green-100 text-green-700 border border-green-200 hover:bg-green-200"
                                : "bg-red-50 text-red-500 border border-red-200 hover:bg-red-100"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {left.hasAccess ? "check_circle" : "block"}
                            </span>

                            {left.hasAccess ? "Enabled" : "Disabled"}
                          </button>
                        )}
                      </td>

                      {/* RIGHT MODULE */}
                      <td
                        className={`px-4 py-3 ${
                          !right?.hasAccess ? "opacity-50" : ""
                        }`}
                      >
                        {right && (
                          <div className="flex items-center gap-2.5">
                            <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">
                              {right.icon}
                            </span>

                            <span className="font-medium text-[#0d121b]">
                              {right.module}
                            </span>
                          </div>
                        )}
                      </td>

                      <td
                        className={`px-4 py-3 ${
                          !right?.hasAccess ? "opacity-50" : ""
                        }`}
                      >
                        {right && (
                          <button
                            onClick={() => {
                              setEditData((prev) => ({
                                ...prev,

                                modules: right.hasAccess
                                  ? prev.modules.filter((m) => m !== right.key)
                                  : [...prev.modules, right.key],
                              }));
                            }}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                              right.hasAccess
                                ? "bg-green-100 text-green-700 border border-green-200 hover:bg-green-200"
                                : "bg-red-50 text-red-500 border border-red-200 hover:bg-red-100"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {right.hasAccess ? "check_circle" : "block"}
                            </span>

                            {right.hasAccess ? "Enabled" : "Disabled"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* {user.modules?.includes("finance") && (
            <div className="mt-5 bg-white rounded-xl border border-[#e7ebf3] shadow-sm sm:p-6 p-4">
              <h2 className="text-base font-bold text-[#0d121b] flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">
                  payments
                </span>
                Finance Access
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  "payroll",
                  "invoice",
                  "quotation",
                  "prospect",
                  "performance",
                ].map((mod) => {
                  const hasAccess = user.modules?.includes(mod);

                  return (
                    <div
                      key={mod}
                      className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                        hasAccess
                          ? "border-green-200 bg-green-50 text-green-700"
                          : "border-red-200 bg-red-50 text-red-500"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">
                          {hasAccess ? "check_circle" : "block"}
                        </span>

                        <span className="capitalize">{mod}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )} */}

          <div className="mt-5 border border-[#e7ebf3] rounded-xl p-4 bg-[#f9fafc]">
            <h2 className="text-base font-bold text-[#0d121b] mb-4">
              Client Access
            </h2>

            {editData.role === "Admin" ? (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 flex items-start gap-3">
                <span className="material-symbols-outlined text-[20px]">
                  check_circle
                </span>

                <div>
                  <p className="font-semibold">
                    Admin role has full client access
                  </p>

                  <p className="text-xs mt-1 text-green-600">
                    This user can access all clients in the ERP system.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {clients.map((client: any) => {
                  const checked = editData.clientAccess.includes(client.id);

                  return (
                    <label
                      key={client.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const isChecked = e.target.checked;

                          setEditData((prev) => ({
                            ...prev,

                            clientAccess: isChecked
                              ? [...prev.clientAccess, client.id]
                              : prev.clientAccess.filter(
                                  (id) => id !== client.id,
                                ),
                          }));
                        }}
                      />

                      {client.name}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
          <div className="mt-5 border border-[#e7ebf3] rounded-xl p-4 bg-[#f9fafc]">
            <h2 className="text-base font-bold text-[#0d121b] mb-4">
              Site Access
            </h2>

            {editData.role === "Admin" ? (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 flex items-start gap-3">
                <span className="material-symbols-outlined text-[20px]">
                  check_circle
                </span>

                <div>
                  <p className="font-semibold">
                    Admin role has full site access
                  </p>

                  <p className="text-xs mt-1 text-green-600">
                    This user can access all sites in the ERP system.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {sites
                  .filter((site: any) =>
                    editData.clientAccess.includes(site.clientId),
                  )
                  .map((site: any) => {
                    const checked = editData.siteAccess.includes(site.id);

                    return (
                      <label
                        key={site.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const isChecked = e.target.checked;

                            setEditData((prev) => ({
                              ...prev,

                              siteAccess: isChecked
                                ? [...prev.siteAccess, site.id]
                                : prev.siteAccess.filter(
                                    (id) => id !== site.id,
                                  ),
                            }));
                          }}
                        />

                        {site.name}
                      </label>
                    );
                  })}
              </div>
            )}
          </div>
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSaveAccess}
              className="px-5 py-2.5 rounded-xl bg-[#2e4150] text-white text-sm font-semibold hover:bg-[#3a5268]"
            >
              Save Changes
            </button>
          </div>

          {/* {user.cleanerId && (
            <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm sm:p-6 p-4">
              <h2 className="text-base font-bold text-[#0d121b] mb-3">
                Employee Assignment
              </h2>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm font-semibold">
                <span className="material-symbols-outlined text-[18px]">
                  badge
                </span>
                Employee ID: {user.cleanerId}
              </div>
            </div>
          )} */}
        </div>

        {/* Quick Actions */}
        {/* <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm sm:p-6 p-4">
          <h2 className="text-base font-bold text-[#0d121b] flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">
              settings
            </span>
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#e7ebf3] text-sm font-semibold text-[#2e4150] bg-white hover:bg-[#f6f7fb] transition-colors">
              <span className="material-symbols-outlined text-[18px]">
                lock_reset
              </span>
              Reset Password
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#e7ebf3] text-sm font-semibold text-[#2e4150] bg-white hover:bg-[#f6f7fb] transition-colors">
              <span className="material-symbols-outlined text-[18px]">
                mail
              </span>
              Resend Credentials
            </button>
            <button
              onClick={toggleStatus}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                currentStatus === "active"
                  ? "border border-red-200 text-red-600 bg-red-50 hover:bg-red-100"
                  : "border border-green-200 text-green-600 bg-green-50 hover:bg-green-100"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {currentStatus === "active" ? "block" : "check_circle"}
              </span>
              {currentStatus === "active"
                ? "Disable Account"
                : "Enable Account"}
            </button>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default UserDetail;
