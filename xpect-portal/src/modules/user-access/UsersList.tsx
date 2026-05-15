import React, { useState, useMemo, useEffect } from "react";
import { useUserAccess } from "../../context/UserAccessContext";
import api from "../../services/api";
import {
  SystemUser,
  UserRole,
  AccountStatus,
  ROLE_DESCRIPTIONS,
} from "./types";
import { useCleaners } from "../../context/CleanersContext";
import { useClientsSites } from "../../context/ClientsSitesContext";

interface Props {
  onSelectUser: (id: string) => void;
}

const ROLES: UserRole[] = ["Admin", "Supervisor", "Custom", "Default"];

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
  const map: Record<AccountStatus, { cls: string; label: string }> = {
    active: {
      cls: "bg-green-100 text-green-700 border border-green-200",
      label: "Active",
    },
    disabled: {
      cls: "bg-red-50 text-red-500 border border-red-200",
      label: "Disabled",
    },
    pending: {
      cls: "bg-amber-100 text-amber-700 border border-amber-200",
      label: "Pending",
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

const fmtTime = (d?: string) => {
  if (!d) return "Never";
  const date = new Date(d);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

interface UserForm {
  fullName: string;
  email: string;
  phone: string;
  role: UserRole | "";
  password: string;
  confirmPassword: string;
  status: AccountStatus;
  modules: string[]; // ✅
  clientAccess: string[]; // ✅ NEW
  siteAccess: string[];
  cleanerId?: string;
}

const emptyForm: UserForm = {
  fullName: "",
  email: "",
  role: "",
  password: "",
  confirmPassword: "",
  modules: [],
  status: "active",
  clientAccess: [],
  siteAccess: [],
  cleanerId: "",
};

const UsersList: React.FC<Props> = ({ onSelectUser }) => {
  const { users: usersList, addUser, deleteUser } = useUserAccess();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [statusFilter, setStatusFilter] = useState<AccountStatus | "">("");
  const { cleaners } = useCleaners();
  const completedCleaners = cleaners.filter(
    (c) => (c.onboardingProgress ?? 0) === 100,
  );
  const { clients, sites } = useClientsSites();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<UserForm>({ ...emptyForm });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState("");
  const setField = (key: keyof UserForm, val: string) => {
    setForm((f) => ({ ...f, [key]: val }));
    setFormErrors((e) => {
      const n = { ...e };
      delete n[key];
      return n;
    });
  };

  const flash = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleDelete = async (id: string) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this user?",
    );
    if (!confirm) return;

    await deleteUser(id);
    flash("User deleted successfully");
  };

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email address.";
    if (!form.role) e.role = "Role is required.";
    if (!form.password) e.password = "Password is required.";
    else if (form.password.length < 8)
      e.password = "Password must be at least 8 characters.";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match.";
    const allEmails = usersList.map((u) => u.email?.toLowerCase());
    if (form.email && allEmails.includes(form.email.toLowerCase().trim()))
      e.email = "This email is already in use.";
    return e;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      return;
    }

    const newUser = await addUser({
      fullName: form.fullName.trim(),
      email: form.email.trim().toLowerCase(),
      role: form.role as UserRole,
      status: form.status,
      password: form.password,
      modules: form.modules, // ✅
      clientAccess: form.clientAccess,
      siteAccess: form.siteAccess,
      cleanerId: form.cleanerId,
    });
    setForm({ ...emptyForm });
    setFormErrors({});
    setIsModalOpen(false);
    flash(`User "${newUser.fullName}" created successfully.`);
  };

  const openModal = () => {
    setForm({ ...emptyForm });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const filtered = useMemo(() => {
    let list = [...usersList];
    console.log("list", list);
    if (search)
      list = list.filter(
        (u) =>
          u.fullName.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()),
      );
    if (roleFilter) list = list.filter((u) => u.role === roleFilter);
    if (statusFilter) list = list.filter((u) => u.status === statusFilter);
    return list;
  }, [usersList, search, roleFilter, statusFilter]);

  const stats = useMemo(
    () => ({
      total: usersList.length,
      admins: usersList.filter((u) => u.role === "Admin").length,
      supervisors: usersList.filter((u) => u.role === "Supervisor").length,
      custom: usersList.filter((u) => u.role === "Custom").length,
      active: usersList.filter((u) => u.status === "active").length,
      disabled: usersList.filter((u) => u.status === "disabled").length,
    }),
    [usersList],
  );

  const fieldCls = (key: string) =>
    `w-full px-3 py-2.5 bg-[#f6f7fb] border rounded-xl text-sm text-[#0d121b] placeholder:text-[#6b7a99] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20 ${
      formErrors[key]
        ? "border-red-300 focus:ring-red-300/30"
        : "border-[#e7ebf3]"
    }`;

  const filteredSites = sites.filter((site: any) =>
    form.clientAccess.includes(site.clientId),
  );

  const hasSiteAccess =
    form.modules.includes("client") ||
    form.modules.includes("sites") ||
    form.modules.includes("site allocation");

  const financeModules = [
    "payroll",
    "invoice",
    "quotation",
    "prospect",
    "performance",
  ];
  return (
    <div className="min-h-full bg-[#f6f7fb] w-screen sm:w-full sm:max-w-full">
      {/* Header */}
      <div className="bg-white border-b border-[#e7ebf3] sm:px-8 px-4 sm:py-6 py-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2e4150] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white text-[20px]">
                manage_accounts
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0d121b]">
                User Access Management
              </h1>
              <p className="text-base text-[#4c669a]">
                Manage CMS portal users, roles & permissions
              </p>
            </div>
          </div>
          <button
            onClick={openModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2e4150] text-white text-sm font-semibold hover:bg-[#3a5268] transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">
              person_add
            </span>
            Add User
          </button>
        </div>
      </div>

      {/* Success toast */}
      {successMsg && (
        <div className="sm:mx-8 mx-4 mt-4 flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-3 animate-in slide-in-from-top-2 duration-300">
          <span className="material-symbols-outlined text-green-500 text-[20px]">
            check_circle
          </span>
          <p className="text-sm font-semibold text-green-700">{successMsg}</p>
        </div>
      )}

      <div className="sm:px-8 px-4 sm:py-6 py-3 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Users",
              value: stats.total,
              icon: "group",
              bg: "bg-blue-50 text-blue-600",
            },
            {
              label: "Admins",
              value: stats.admins,
              icon: "shield_person",
              bg: "bg-purple-50 text-purple-600",
            },
            {
              label: "Supervisors",
              value: stats.supervisors,
              icon: "supervisor_account",
              bg: "bg-blue-50 text-blue-600",
            },
            {
              label: "Custom",
              value: stats.custom,
              icon: "edit_note",
              bg: "bg-teal-50 text-teal-600",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm sm:p-4 p-2 flex items-start gap-3 flex-col"
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${s.bg}`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {s.icon}
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-[#4c669a] uppercase tracking-wide">
                  {s.label}
                </p>
                <p className="text-xl sm:text-[30px] font-bold text-[#0d121b]">
                  {s.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#6b7a99]">
              search
            </span>
            <input
              type="text"
              placeholder="Search name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] placeholder:text-[#6b7a99] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRole | "")}
            className="px-3 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20 sm:min-w-[160px] min-w-full"
          >
            <option value="">All Roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          {/* <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as AccountStatus | "")
            }
            className="px-3 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20 sm:min-w-[140px] min-w-full"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
            <option value="pending">Pending</option>
          </select> */}
          {(search || roleFilter || statusFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setRoleFilter("");
                setStatusFilter("");
              }}
              className="text-sm text-[#6b7a99] hover:text-[#0d121b] flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">
                close
              </span>
              Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e7ebf3] bg-[#f6f7fb]">
                  {["User", "Email", "Role", "Created At", "Action"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wide whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7ebf3]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <span className="material-symbols-outlined text-[48px] text-[#e7ebf3] block mb-3">
                        person_off
                      </span>
                      <p className="text-[#6b7a99] font-medium">
                        No users found
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => {
                    const rb = roleBadge(u.role);
                    const sb = statusBadge(u.status);
                    const initials = u.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();
                    return (
                      <tr
                        key={u.id}
                        onClick={() => onSelectUser(u.id)}
                        className="cursor-pointer hover:bg-[#f6f7fb] transition-colors"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#2e4150] text-white text-xs font-bold flex items-center justify-center shrink-0">
                              {initials}
                            </div>
                            <span className="font-semibold text-[#0d121b]">
                              {u.fullName}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-[#6b7a99]">{u.email}</td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold`}
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {rb.icon}
                            </span>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold`}
                          >
                            {fmt(u.createdAt)}
                          </span>
                        </td>
                        <td className="px-4 gap-2 py-4 text-[#6b7a99] flex ">
                          <span className="text-sm font-semibold text-[#2e4150] hover:underline">
                            View
                          </span>
                          <span
                            className="text-sm font-semibold text-red-500 hover:underline cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(u.id);
                            }}
                          >
                            Delete
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-[#e7ebf3] bg-[#f6f7fb] text-xs text-[#6b7a99]">
              Showing {filtered.length} of {usersList.length} users
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e7ebf3] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#2e4150] flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[18px]">
                    person_add
                  </span>
                </div>
                <h2 className="text-lg font-bold text-[#0d121b]">
                  Add New User
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f2f6f9] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px] text-[#4c669a]">
                  close
                </span>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Smith"
                  value={form.fullName}
                  onChange={(e) => setField("fullName", e.target.value)}
                  className={fieldCls("fullName")}
                />
                {formErrors.fullName && (
                  <p className="text-xs text-red-500 mt-1">
                    {formErrors.fullName}
                  </p>
                )}
              </div>

              {/* Email + Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. john@xpectcleaning.co.uk"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    className={fieldCls("email")}
                  />
                  {formErrors.email && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.email}
                    </p>
                  )}
                </div>
                {/* <div>
                  <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Phone Number</label>
                  <input type="text" placeholder="e.g. +44 7700 900000" value={form.phone}
                    onChange={e => setField('phone', e.target.value)} className={fieldCls('phone')} />
                </div> */}
              </div>

              {/* CLEANER ACCESS (OPTIONAL) */}
              {/* <div>
                <label className="block text-xs font-semibold text-[#6b7a99] uppercase mb-2">
                  Assign Cleaner (Optional)
                </label>

                <select
                  value={form.cleanerId || ""}
                  onChange={(e) => {
                    const cleanerId = e.target.value;
                    const cleaner = cleaners.find((c) => c.id === cleanerId);

                    setForm((prev) => ({
                      ...prev,
                      cleanerId,

                      // ✅ PRE-FILL BUT NOT OVERRIDE
                      clientAccess: Array.from(
                        new Set([
                          ...(prev.clientAccess || []),
                          ...(cleaner?.clientIds || []),
                        ]),
                      ),

                      siteAccess: Array.from(
                        new Set([
                          ...(prev.siteAccess || []),
                          ...(cleaner?.siteIds || []),
                        ]),
                      ),
                    }));
                  }}
                  className="w-full px-3 py-2 border rounded-lg bg-[#f6f7fb]"
                >
                  <option value="">No cleaner assigned</option>

                  {cleaners.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div> */}

              {/* Role + Status */}
              <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) => {
                      const role = e.target.value as UserRole;

                      let modules: string[] = [];

                      if (role === "Admin") {
                        modules = [
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
                        ];
                      }

                      if (role === "Supervisor") {
                        modules = [
                          "sites",
                          "risk",
                          "employee compliance",
                          "incident",
                        ];
                      }

                      if (role === "Custom") {
                        modules = [];
                      }

                      if (role === "Default") {
                        modules = ["timesheet"];
                      }

                      setForm((prev) => ({
                        ...prev,
                        role,
                        modules,
                      }));
                    }}
                    className={fieldCls("role")}
                  >
                    <option value="">Select role…</option>
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  {formErrors.role && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.role}
                    </p>
                  )}
                </div>
                {/* <div>
                  <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">
                    Account Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setField("status", e.target.value as AccountStatus)
                    }
                    className={fieldCls("status")}
                  >
                    <option value="active">Active</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div> */}

                {form.role === "Custom" && (
                  <div>
                    <label className="block text-xs font-semibold text-[#6b7a99] uppercase mb-2">
                      Module Access
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      {[
                        "dashboard",
                        "employee compliance",
                        "client",
                        "sites",
                        "risk",
                        "timesheet",
                        "site allocation",
                        "site inspection",
                        "ppe",
                        "incident",
                        "document",
                        "users",
                        "finance",
                      ].map((mod) => (
                        <label
                          key={mod}
                          className="flex items-center gap-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={form.modules.includes(mod)}
                            onChange={(e) => {
                              const checked = e.target.checked;

                              setForm((prev) => ({
                                ...prev,
                                modules: checked
                                  ? [...prev.modules, mod]
                                  : prev.modules.filter((m) => {
                                      if (m === mod) return false;

                                      // remove finance child permissions
                                      if (
                                        mod === "finance" &&
                                        financeModules.includes(m)
                                      ) {
                                        return false;
                                      }

                                      return true;
                                    }),
                              }));
                            }}
                          />
                          <span className="capitalize">{mod}</span>
                        </label>
                      ))}
                    </div>
                    {form.modules.includes("finance") && (
                      <div className="mt-5 border border-[#e7ebf3] rounded-xl p-4 bg-[#f9fafc]">
                        <label className="block text-xs font-semibold text-[#6b7a99] uppercase mb-3">
                          Finance Access
                        </label>

                        <div className="grid grid-cols-2 gap-2">
                          {financeModules.map((mod) => (
                            <label
                              key={mod}
                              className="flex items-center gap-2 text-sm"
                            >
                              <input
                                type="checkbox"
                                checked={form.modules.includes(mod)}
                                onChange={(e) => {
                                  const checked = e.target.checked;

                                  setForm((prev) => ({
                                    ...prev,
                                    modules: checked
                                      ? [...prev.modules, mod]
                                      : prev.modules.filter((m) => m !== mod),
                                  }));
                                }}
                              />

                              <span className="capitalize">{mod}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* CLIENT ACCESS */}
                    {form.role === "Custom" &&
                      hasSiteAccess &&
                      !form.cleanerId && (
                        <div className="mt-5 border border-[#e7ebf3] rounded-xl p-4 bg-[#f9fafc]">
                          <label className="block text-xs font-semibold text-[#6b7a99] uppercase mb-2">
                            Client Access
                          </label>

                          <div className="grid grid-cols-2 gap-2">
                            {clients.map((client: any) => (
                              <label
                                key={client.id}
                                className="flex items-center gap-2 text-sm"
                              >
                                <input
                                  type="checkbox"
                                  checked={form.clientAccess.includes(
                                    client.id,
                                  )}
                                  onChange={(e) => {
                                    const checked = e.target.checked;

                                    setForm((prev) => ({
                                      ...prev,
                                      clientAccess: checked
                                        ? [...prev.clientAccess, client.id]
                                        : prev.clientAccess.filter(
                                            (id) => id !== client.id,
                                          ),

                                      // 🔥 IMPORTANT: remove sites if client removed
                                      siteAccess: checked
                                        ? prev.siteAccess
                                        : prev.siteAccess.filter(
                                            (siteId) =>
                                              !sites.some(
                                                (s: any) =>
                                                  s.clientId === client.id &&
                                                  s.id === siteId,
                                              ),
                                          ),
                                    }));
                                  }}
                                />
                                <span>{client.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* SITE ACCESS */}
                    {form.clientAccess.length > 0 && !form.cleanerId && (
                      <div className="mt-5 border border-[#e7ebf3] rounded-xl p-4 bg-[#f9fafc]">
                        <label className="block text-xs font-semibold text-[#6b7a99] uppercase mb-2">
                          Site Access
                        </label>

                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-lg p-2">
                          {filteredSites.length === 0 ? (
                            <p className="text-xs text-gray-400">
                              No sites available
                            </p>
                          ) : (
                            filteredSites.map((site: any) => (
                              <label
                                key={site.id}
                                className="flex items-center gap-2 text-sm"
                              >
                                <input
                                  type="checkbox"
                                  checked={form.siteAccess.includes(site.id)}
                                  onChange={(e) => {
                                    const checked = e.target.checked;

                                    setForm((prev) => ({
                                      ...prev,
                                      siteAccess: checked
                                        ? [...prev.siteAccess, site.id]
                                        : prev.siteAccess.filter(
                                            (id) => id !== site.id,
                                          ),
                                    }));
                                  }}
                                />
                                <span>{site.name}</span>
                              </label>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Role description */}
              {/* {form.role && (
                <div className="p-3 bg-[#f6f7fb] rounded-xl border border-[#e7ebf3] text-xs text-[#6b7a99] flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#4c669a] shrink-0 mt-0.5">
                    info
                  </span>
                  <span>
                    <strong className="text-[#0d121b]">{form.role}:</strong>{" "}
                    {ROLE_DESCRIPTIONS[form.role as UserRole]}
                  </span>
                </div>
              )} */}

              {/* Password + Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={(e) => setField("password", e.target.value)}
                    className={fieldCls("password")}
                  />
                  {formErrors.password && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.password}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Re-enter password"
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setField("confirmPassword", e.target.value)
                    }
                    className={fieldCls("confirmPassword")}
                  />
                  {formErrors.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-blue-500 shrink-0 mt-0.5">
                  info
                </span>
                <span>
                  Login credentials will be sent to the user's email address.
                  Password is stored securely and cannot be viewed after
                  creation.
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e7ebf3] shrink-0">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-[#e7ebf3] text-sm font-semibold text-[#6b7a99] bg-white hover:bg-[#f6f7fb] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-5 py-2.5 rounded-xl bg-[#2e4150] text-white text-sm font-semibold hover:bg-[#3a5268] transition-colors shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">
                    person_add
                  </span>
                  Create User
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;
