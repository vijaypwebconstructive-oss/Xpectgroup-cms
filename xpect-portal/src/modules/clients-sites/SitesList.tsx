import React, { useState } from "react";
import { Site, RiskLevel, SiteComplianceDocument } from "./types";
import { useClientsSites } from "../../context/ClientsSitesContext";
import GeoFenceMap from "./components/GeoFenceMap";
import { useCurrentUser } from "../../hook/useCurrentUser";

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("Failed to read file"));
    r.readAsDataURL(file);
  });

interface SitesListProps {
  onSelectSite: (siteId: string) => void;
  onNavigateAllocation: () => void;
}

const RISK_BADGE = {
  Low: "bg-green-100 text-green-700 border border-green-200",
  Medium: "bg-amber-100 text-amber-700 border border-amber-200",
  High: "bg-red-100 text-red-700 border border-red-200",
};

const COMPLIANCE_BADGE = {
  Compliant: "bg-green-100 text-green-700 border border-green-200",
  Expiring: "bg-amber-100 text-amber-700 border border-amber-200",
  "Non-Compliant": "bg-red-100 text-red-700 border border-red-200",
};

type ComplianceKey = "Compliant" | "Expiring" | "Non-Compliant";

const TRAINING_OPTIONS = [
  "Manual Handling",
  "COSHH Awareness",
  "Fire Safety",
  "Enhanced DBS",
  "Child Safeguarding",
  "Biohazard Handling",
  "Clinical Waste",
  "Infection Control",
  "CSCS Card",
  "Working at Height",
  "PPE Awareness",
  "Food Hygiene L2",
  "First Aid",
];

interface SiteForm {
  name: string;
  clientId: string;
  address: string;
  postcode: string;
  allocationPeriod: "Weekly" | "Monthly" | "";
  inspectionFrequency: "Weekly" | "Monthly" | "";
  allocatedHours: string;
  riskLevel: string;
  emergencyContact: string;
  emergencyPhone: string;
  accessInstructions: string;
  inspectionAlertDays: string;
  requiredTrainings: string[];
  geoFenceEnabled: boolean;
  geoFenceRadius: string;
  latitude: number | null;
  longitude: number | null;
}

const emptyForm: SiteForm = {
  name: "",
  clientId: "",
  address: "",
  postcode: "",
  riskLevel: "",
  emergencyContact: "",
  emergencyPhone: "",
  allocationPeriod: "",
  allocatedHours: "",
  accessInstructions: "",
  requiredTrainings: [],
  inspectionFrequency: "",
  inspectionAlertDays: "",
  geoFenceEnabled: false,
  geoFenceRadius: "100",
  latitude: null,
  longitude: null,
};

const SitesList: React.FC<SitesListProps> = ({
  onSelectSite,
  onNavigateAllocation,
}) => {
  const {
    sites,
    clients,
    assignments,
    loading,
    error,
    addSite,
    allocationHistoryFilter,
    setAllocationHistoryFilter,
  } = useClientsSites();
  const [search, setSearch] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [allocationFilter, setAllocationFilter] = useState("");
  const [statsFilter, setStatsFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<SiteForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [siteDocFiles, setSiteDocFiles] = useState<Record<string, File | null>>(
    {},
  );
  const { currentUser } = useCurrentUser();

  const setField = (
    k: keyof SiteForm,
    v: string | string[] | boolean | number | null,
  ) => {
    setForm((prev) => ({ ...prev, [k]: v }));
    if (formErrors[k])
      setFormErrors((prev) => {
        const n = { ...prev };
        delete n[k];
        return n;
      });
  };

  const assignedSiteIds = currentUser?.cleanerId
    ? assignments
        .filter((a) => a.workerId === currentUser.cleanerId)
        .map((a) => a.siteId)
    : [];
  console.log("assigned", assignments);
  const toggleTraining = (t: string) => {
    setForm((prev) => ({
      ...prev,
      requiredTrainings: prev.requiredTrainings.includes(t)
        ? prev.requiredTrainings.filter((x) => x !== t)
        : [...prev.requiredTrainings, t],
    }));
  };

  const flash = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const visibleClients =
    !currentUser || currentUser.role === "Admin"
      ? clients
      : clients.filter((client: any) =>
          currentUser.clientAccess?.includes(client.id),
        );

  const visibleSites =
    currentUser?.role === "Admin"
      ? sites
      : currentUser?.cleanerId
        ? sites.filter((site) => assignedSiteIds.includes(site.id))
        : sites.filter((site) => currentUser?.siteAccess?.includes(site.id));

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Site name is required.";
    if (!form.clientId) e.clientId = "Please select a client.";
    if (!form.address.trim()) e.address = "Address is required.";
    if (!form.postcode.trim()) e.postcode = "Postcode is required.";
    if (!form.riskLevel) e.riskLevel = "Risk level is required.";
    if (!form.inspectionFrequency)
      e.inspectionFrequency = "Inspection frequency is required.";

    if (!form.inspectionAlertDays)
      e.inspectionAlertDays = "Alert days required.";

    if (!form.allocationPeriod)
      e.allocationPeriod = "Allocation period is required.";

    if (!form.allocatedHours)
      e.allocatedHours = "Allocated hours are required.";
    if (!form.emergencyContact.trim())
      e.emergencyContact = "Emergency contact name is required.";
    if (!form.emergencyPhone.trim())
      e.emergencyPhone = "Emergency phone is required.";
    if (form.geoFenceEnabled && (!form.latitude || !form.longitude)) {
      e.geoFence = "Please select geo fence location.";
    }
    return e;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      return;
    }
    setFormErrors({});
    setSaving(true);
    try {
      const complianceDocuments: SiteComplianceDocument[] = [];
      for (const [key, file] of Object.entries(siteDocFiles)) {
        if (!file) continue;
        try {
          const dataUrl = await fileToDataUrl(file);
          complianceDocuments.push({
            key,
            name: file.name,
            dataUrl,
          });
        } catch {
          /* skip bad file */
        }
      }
      const newSite = await addSite({
        clientId: form.clientId,
        name: form.name.trim(),
        address: form.address.trim(),
        postcode: form.postcode.trim().toUpperCase(),
        riskLevel: form.riskLevel as RiskLevel,
        requiredTrainings: form.requiredTrainings,
        emergencyContact: form.emergencyContact.trim(),
        emergencyPhone: form.emergencyPhone.trim(),
        accessInstructions: form.accessInstructions.trim(),
        allocationPeriod: form.allocationPeriod,
        allocatedHours: Number(form.allocatedHours),
        activeWorkers: 0,
        inspectionAlertDays: Number(form.inspectionAlertDays),
        inspectionFrequency: form.inspectionFrequency,
        geoFence: {
          enabled: form.geoFenceEnabled,

          type: "Circle",

          coordinates: {
            latitude: form.latitude,
            longitude: form.longitude,
          },

          radius: Number(form.geoFenceRadius),
        },

        complianceDocuments:
          complianceDocuments.length > 0 ? complianceDocuments : undefined,
      });
      setForm(emptyForm);
      setSiteDocFiles({});
      setIsModalOpen(false);
      flash(`Site "${newSite.name}" added successfully.`);
    } catch {
      setFormErrors({ submit: "Failed to save site. Please try again." });
    } finally {
      setSaving(false);
    }
    console.log("new site detail", form);
  };

  const openModal = () => {
    setForm(emptyForm);
    setSiteDocFiles({});
    setFormErrors({});
    setIsModalOpen(true);
  };

  const docField = (label: string, storageKey: string, icon: string) => {
    const selected = siteDocFiles[storageKey];
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-[#c7d2e0] bg-[#fafbfd] hover:border-[#2e4150]/40 transition-colors">
        <span className="material-symbols-outlined text-[22px] text-[#4c669a]">
          {icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#0d121b]">{label}</p>
          {selected ? (
            <p className="text-xs text-green-600 font-semibold truncate">
              {selected.name}
            </p>
          ) : (
            <p className="text-xs text-[#4c669a]">No file selected</p>
          )}
        </div>
        <label className="px-3 py-1.5 rounded-lg bg-[#f2f6f9] text-[#4c669a] text-xs font-bold hover:bg-[#e7ebf3] transition-colors cursor-pointer">
          Browse
          <input
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setSiteDocFiles((prev) => ({ ...prev, [storageKey]: f }));
              e.target.value = "";
            }}
          />
        </label>
        {selected && (
          <button
            type="button"
            onClick={() =>
              setSiteDocFiles((prev) => {
                const n = { ...prev };
                delete n[storageKey];
                return n;
              })
            }
            className="text-red-400 hover:text-red-600 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>
    );
  };

  const totalSites = visibleSites.length;

  const highRisk = visibleSites.filter((s) => s.riskLevel === "High").length;
  const nonCompliant = assignments.filter(
    (a) => a.complianceStatus === "Non-Compliant",
  ).length;
  const totalWorkers = assignments.length;
  const stats = [
    {
      label: "Total Sites",
      value: totalSites,
      icon: "location_city",
      trend: "All",
      bgColor: "#eff6ff",
      borderColor: "#2563eb",
      filter: "ALL",
    },

    {
      label: "Total Workers",
      value: totalWorkers,
      icon: "group",
      trend: "Allocated",
      bgColor: "#f0fdf4",
      borderColor: "#22c55e",
      filter: "WORKERS",
    },

    {
      label: "High Risk",
      value: highRisk,
      icon: "warning",
      trend: "Attention",
      bgColor: "#fffbeb",
      borderColor: "#f59e0b",
      filter: "HIGH_RISK",
    },

    {
      label: "Non-Compliant",
      value: nonCompliant,
      icon: "person_off",
      trend: "Critical",
      bgColor: "#fef2f2",
      borderColor: "#ef4444",
      filter: "NON_COMPLIANT",
    },
  ];
  const allClients = visibleClients;

  const enriched = visibleSites.map((s) => {
    const client = allClients.find((c) => c.id === s.clientId);
    const siteAssignments = assignments.filter((a) => a.siteId === s.id);
    const nonC = siteAssignments.filter(
      (a) => a.complianceStatus === "Non-Compliant",
    ).length;
    const exp = siteAssignments.filter(
      (a) => a.complianceStatus === "Expiring",
    ).length;
    const overallStatus: ComplianceKey =
      nonC > 0 ? "Non-Compliant" : exp > 0 ? "Expiring" : "Compliant";
    return {
      ...s,
      client,
      assignmentCount: siteAssignments.length,
      overallStatus,
    };
  });

  const getAllocationData = (site: any) => {
    const workedHours = site.totalWorkedHours || 0;

    const allocated = site.allocatedHours || 0;

    const percentage =
      allocated > 0 ? Math.min((workedHours / allocated) * 100, 100) : 0;

    const remaining = Math.max(allocated - workedHours, 0);

    const overtime = workedHours > allocated ? workedHours - allocated : 0;

    const isOvertime = overtime > 0;

    return {
      workedHours,
      allocated,
      percentage,
      remaining,
      overtime,
      isOvertime,
    };
  };

  const filtered = enriched.filter((s) => {
    const q = search.toLowerCase();

    //
    // SEARCH
    //
    const matchesSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.postcode.toLowerCase().includes(q);

    //
    // CLIENT FILTER
    //
    const matchesClient = !clientFilter || s.clientId === clientFilter;

    //
    // ALLOCATION FILTER
    //
    const matchesAllocation =
      !allocationFilter || s.allocationPeriod === allocationFilter;

    //
    // STATS FILTER
    //
    let matchesStats = true;

    //
    // HIGH RISK
    //
    if (statsFilter === "HIGH_RISK") {
      matchesStats = s.riskLevel === "High";
    }

    //
    // NON COMPLIANT
    //
    if (statsFilter === "NON_COMPLIANT") {
      matchesStats = s.overallStatus === "Non-Compliant";
    }

    //
    // HAS WORKERS
    //
    if (statsFilter === "WORKERS") {
      matchesStats = s.assignmentCount > 0;
    }

    return matchesSearch && matchesClient && matchesAllocation && matchesStats;
  });

  return (
    <div className="space-y-6 sm:w-full sm:max-w-full sm:p-10 py-4 px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[#0d121b] text-[1.6rem] sm:text-2xl font-bold font-black">
            Site Management
          </h1>
          <p className="text-[#4c669a] text-base">
            Manage clients, work sites, and worker compliance allocations.
          </p>
        </div>
      </div>
      {/* Success toast */}
      {successMsg && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 duration-300">
          <span className="material-symbols-outlined text-green-500 text-[20px]">
            check_circle
          </span>
          <p className="text-green-800 text-sm font-bold">{successMsg}</p>
        </div>
      )}

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
                if (stat.filter === "WORKERS") {
                  onNavigateAllocation();
                }
              }}
              type="button"
              className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer text-left border-b-[5px]"
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

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm overflow-hidden">
        {/* Filter bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#e7ebf3] flex-wrap">
          <div className="flex items-center gap-3 flex-1 flex-wrap">
            <div className="flex items-center h-9 bg-[#f6f6f8] border border-transparent rounded-lg px-3 flex-1 min-w-[180px] focus-within:border-[#2e4150]/40 transition-all">
              <span className="material-symbols-outlined text-[#9aa5be] text-[18px] mr-2">
                search
              </span>
              <input
                className="bg-transparent border-none text-[#0d121b] placeholder:text-[#9aa5be] text-sm outline-none w-full"
                placeholder="Search site name or postcode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="h-9 bg-[#f6f6f8] border border-transparent rounded-lg px-3 text-sm text-[#0d121b] outline-none cursor-pointer font-semibold sm:min-w-[160px] min-w-full"
            >
              <option value="">All Clients</option>
              {allClients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={allocationHistoryFilter}
              onChange={(e) => setAllocationHistoryFilter(e.target.value)}
              className="h-9 bg-[#f6f6f8] border border-transparent rounded-lg px-3 text-sm text-[#0d121b] outline-none cursor-pointer font-semibold sm:min-w-[180px] min-w-full"
            >
              <option value="current">Current Period</option>

              <option value="previous-week">Previous Week</option>

              <option value="previous-month">Previous Month</option>
            </select>
            <select
              value={allocationFilter}
              onChange={(e) => setAllocationFilter(e.target.value)}
              className="h-9 bg-[#f6f6f8] border border-transparent rounded-lg px-3 text-sm text-[#0d121b] outline-none cursor-pointer font-semibold sm:min-w-[160px] min-w-full"
            >
              <option value="">All Allocation Periods</option>

              <option value="Weekly">Weekly</option>

              <option value="Monthly">Monthly</option>
            </select>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onNavigateAllocation}
              className="flex items-center gap-2 rounded-full border border-[#e7ebf3] bg-white text-[#0d121b] text-xs font-bold hover:bg-[#f6f6f8] transition-all px-4 h-9 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">
                assignment_ind
              </span>
              Allocate
            </button>
            <button
              onClick={openModal}
              className="flex items-center gap-2 rounded-full bg-[#2e4150] text-white text-xs font-bold hover:bg-[#2e4150]/90 transition-all px-4 h-9 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Add Site
            </button>
          </div>
        </div>

        {/* Table header with record count */}
        <div className="px-5 py-3 border-b border-[#e7ebf3] flex items-center gap-3">
          <h2 className="text-[#0d121b] text-sm sm:text-base font-black font-semibold">
            Site Records
          </h2>
          <span className="bg-[#f2f6f9] text-[#4c669a] text-xs font-bold px-2.5 py-1 rounded-full">
            {filtered.length} records
          </span>
        </div>

        {loading && (
          <div className="px-5 py-14 text-center">
            <span className="material-symbols-outlined text-[#4c669a] text-4xl animate-spin block mb-2">
              progress_activity
            </span>
            <p className="text-[#4c669a] text-sm font-semibold">
              Loading sites…
            </p>
          </div>
        )}
        {error && !loading && (
          <div className="px-5 py-14 text-center">
            <span className="material-symbols-outlined text-red-500 text-[48px] block mb-2">
              error
            </span>
            <p className="text-red-600 text-sm font-semibold">{error}</p>
          </div>
        )}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-[#e7ebf3] bg-[#f8fafc]">
                  <th className="text-left px-5 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">
                    Name
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">
                    Client
                  </th>
                  {/* <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">
                    Postcode
                  </th> */}
                  {/* <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">
                    Risk Level
                  </th> */}
                  <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">
                    Required Trainings
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">
                    Cleaners
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">
                    Time Allocation
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">
                    Compliance
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7ebf3]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-14 text-center">
                      <span className="material-symbols-outlined text-[#c7c7c7] text-5xl block mb-2">
                        search_off
                      </span>
                      <p className="text-[#4c669a] text-sm font-semibold">
                        No sites match your filters
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((site) => {
                    const allocation = getAllocationData(site);
                    return (
                      <tr
                        key={site.id}
                        className="hover:bg-[#f8fafc] transition-colors group"
                      >
                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-[#0d121b]">
                            {site.name}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm font-medium text-[#0d121b]">
                            {site.client?.name ?? "—"}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1">
                            {site.requiredTrainings.slice(0, 2).map((t) => (
                              <span
                                key={t}
                                className="text-xs bg-[#f2f6f9] text-[#4c669a] border border-[#e7ebf3] px-2 py-0.5 rounded font-semibold"
                              >
                                {t.length > 12 ? t.slice(0, 10) + "…" : t}
                              </span>
                            ))}
                            {site.requiredTrainings.length > 2 && (
                              <span className="text-xs bg-[#f2f6f9] text-[#4c669a] border border-[#e7ebf3] px-2 py-0.5 rounded font-bold">
                                +{site.requiredTrainings.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-[#0d121b]">
                          {site.assignmentCount}
                        </td>
                        <td className="px-4 py-4 min-w-[240px]">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-[#0d121b]">
                                {allocation.workedHours.toFixed(1)}h /{" "}
                                {allocation.allocated.toFixed(1)}h
                              </span>

                              <span className="text-[#4c669a]">
                                {site.allocationPeriod}
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div
                              className="w-full h-2.5 bg-[#edf2f7] rounded-full overflow-hidden relative group"
                              title={
                                allocation.isOvertime
                                  ? `${allocation.overtime}h overtime`
                                  : `${allocation.remaining}h remaining`
                              }
                            >
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  allocation.percentage >= 100
                                    ? "bg-red-500"
                                    : allocation.percentage >= 85
                                      ? "bg-amber-500"
                                      : "bg-green-500"
                                }`}
                                style={{
                                  width: `${allocation.percentage}%`,
                                }}
                              />
                            </div>

                            {/* Bottom status */}
                            <div className="flex items-center gap-2 text-xs">
                              {allocation.isOvertime ? (
                                <div className="flex items-center gap-1 text-red-600 font-bold">
                                  <span className="material-symbols-outlined text-[16px]">
                                    warning
                                  </span>
                                  {allocation.overtime}h overtime
                                </div>
                              ) : (
                                <span className="text-[#4c669a]">
                                  {allocation.remaining.toFixed(0)}h remaining
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold font-black uppercase tracking-wide ${COMPLIANCE_BADGE[site.overallStatus]}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${site.overallStatus === "Compliant" ? "bg-green-500" : site.overallStatus === "Expiring" ? "bg-amber-400" : "bg-red-500"}`}
                            />
                            {site.overallStatus}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => onSelectSite(site.id)}
                            className="text-[#4c669a] text-xs font-black capitalize tracking-wide transition-colors cursor-pointer"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-5 py-3 border-t border-[#e7ebf3] bg-[#f8fafc] flex items-center justify-between">
          <p className="text-xs text-[#4c669a]">
            Showing{" "}
            <span className="font-bold text-[#0d121b]">{filtered.length}</span>{" "}
            of{" "}
            <span className="font-bold text-[#0d121b]">
              {visibleSites.length}
            </span>{" "}
            sites
          </p>
        </div>
      </div>

      {/* Add Site Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e7ebf3] sticky top-0 bg-white z-10 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[24px] text-[#2e4150]">
                  add_location_alt
                </span>
                <h2 className="text-lg font-bold text-[#0d121b]">
                  Add New Site
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

            {/* Form body */}
            <div className="px-6 py-5 space-y-5">
              {/* Section: Site Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#2e4150]">
                    location_city
                  </span>
                  <h3 className="text-sm font-bold text-[#0d121b] uppercase tracking-wide">
                    Site Details
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0d121b] mb-1">
                    Site Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter site name"
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                    className={`w-full h-10 rounded-xl border px-3 text-sm text-[#0d121b] bg-white outline-none ${formErrors.name ? "border-red-400" : "border-[#c7d2e0]"}`}
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#0d121b] mb-1">
                      Client <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.clientId}
                      onChange={(e) => setField("clientId", e.target.value)}
                      className={`w-full h-10 rounded-xl border px-3 text-sm text-[#0d121b] bg-white outline-none cursor-pointer ${formErrors.clientId ? "border-red-400" : "border-[#c7d2e0]"}`}
                    >
                      <option value="">Select client…</option>
                      {allClients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.clientId && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.clientId}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0d121b] mb-1">
                      Risk Level <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.riskLevel}
                      onChange={(e) => setField("riskLevel", e.target.value)}
                      className={`w-full h-10 rounded-xl border px-3 text-sm text-[#0d121b] bg-white outline-none cursor-pointer ${formErrors.riskLevel ? "border-red-400" : "border-[#c7d2e0]"}`}
                    >
                      <option value="">Select risk level…</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                    {formErrors.riskLevel && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.riskLevel}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0d121b] mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Full site address"
                    value={form.address}
                    onChange={(e) => setField("address", e.target.value)}
                    className={`w-full rounded-xl border px-3 py-2 text-sm text-[#0d121b] bg-white outline-none resize-none ${formErrors.address ? "border-red-400" : "border-[#c7d2e0]"}`}
                  />
                  {formErrors.address && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.address}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0d121b] mb-1">
                    Postcode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. M2 4WQ"
                    value={form.postcode}
                    onChange={(e) => setField("postcode", e.target.value)}
                    className={`w-full h-10 rounded-xl border px-3 text-sm text-[#0d121b] bg-white outline-none ${formErrors.postcode ? "border-red-400" : "border-[#c7d2e0]"}`}
                  />
                  {formErrors.postcode && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.postcode}
                    </p>
                  )}
                </div>
              </div>
              <hr className="border-[#e7ebf3]" />

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#2e4150]">
                    schedule
                  </span>

                  <h3 className="text-sm font-bold text-[#0d121b] uppercase tracking-wide">
                    Working Time Allocation
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#0d121b] mb-1">
                      Allocation Period <span className="text-red-500">*</span>
                    </label>

                    <select
                      value={form.allocationPeriod}
                      onChange={(e) =>
                        setField("allocationPeriod", e.target.value)
                      }
                      className={`w-full h-10 rounded-xl border px-3 text-sm text-[#0d121b] bg-white outline-none cursor-pointer ${
                        formErrors.allocationPeriod
                          ? "border-red-400"
                          : "border-[#c7d2e0]"
                      }`}
                    >
                      <option value="">Select period…</option>

                      <option value="Weekly">Weekly</option>

                      <option value="Monthly">Monthly</option>
                    </select>

                    {formErrors.allocationPeriod && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.allocationPeriod}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0d121b] mb-1">
                      Allocated Hours <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="number"
                      placeholder="e.g. 120"
                      value={form.allocatedHours}
                      onChange={(e) =>
                        setField("allocatedHours", e.target.value)
                      }
                      className={`w-full h-10 rounded-xl border px-3 text-sm text-[#0d121b] bg-white outline-none ${
                        formErrors.allocatedHours
                          ? "border-red-400"
                          : "border-[#c7d2e0]"
                      }`}
                    />

                    {formErrors.allocatedHours && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.allocatedHours}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-[#f8fafc] border border-[#e7ebf3] rounded-xl p-3">
                  <p className="text-xs text-[#4c669a] leading-5">
                    This allocation will be used to compare actual cleaner
                    working hours against allocated site hours in the Timesheet
                    module.
                  </p>
                </div>
              </div>
              <hr className="border-[#e7ebf3]" />

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#2e4150]">
                    fact_check
                  </span>

                  <h3 className="text-sm font-bold text-[#0d121b] uppercase tracking-wide">
                    Inspection Schedule
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#0d121b] mb-1">
                      Inspection Frequency{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <select
                      value={form.inspectionFrequency}
                      onChange={(e) =>
                        setField("inspectionFrequency", e.target.value)
                      }
                      className={`w-full h-10 rounded-xl border px-3 text-sm text-[#0d121b] bg-white outline-none cursor-pointer ${
                        formErrors.inspectionFrequency
                          ? "border-red-400"
                          : "border-[#c7d2e0]"
                      }`}
                    >
                      <option value="">Select inspection frequency…</option>

                      <option value="Weekly">Weekly</option>

                      <option value="Monthly">Monthly</option>
                    </select>

                    {formErrors.inspectionFrequency && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.inspectionFrequency}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0d121b] mb-1">
                      Alert Before (Days)
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="number"
                      min={1}
                      placeholder="e.g. 7"
                      value={form.inspectionAlertDays}
                      onChange={(e) =>
                        setField("inspectionAlertDays", e.target.value)
                      }
                      className={`w-full h-10 rounded-xl border px-3 text-sm text-[#0d121b] bg-white outline-none ${
                        formErrors.inspectionAlertDays
                          ? "border-red-400"
                          : "border-[#c7d2e0]"
                      }`}
                    />

                    {formErrors.inspectionAlertDays && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.inspectionAlertDays}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-[#f8fafc] border border-[#e7ebf3] rounded-xl p-3">
                  <p className="text-xs text-[#4c669a] leading-5">
                    This schedule determines how often site inspections should
                    be completed for compliance monitoring.
                  </p>
                </div>
              </div>
              <hr className="border-[#e7ebf3]" />

              {/* Section: Emergency & Access */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#2e4150]">
                    emergency
                  </span>
                  <h3 className="text-sm font-bold text-[#0d121b] uppercase tracking-wide">
                    Emergency & Access
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#0d121b] mb-1">
                      Emergency Contact Name{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Contact name"
                      value={form.emergencyContact}
                      onChange={(e) =>
                        setField("emergencyContact", e.target.value)
                      }
                      className={`w-full h-10 rounded-xl border px-3 text-sm text-[#0d121b] bg-white outline-none ${formErrors.emergencyContact ? "border-red-400" : "border-[#c7d2e0]"}`}
                    />
                    {formErrors.emergencyContact && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.emergencyContact}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0d121b] mb-1">
                      Emergency Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="+44 xxx xxx xxxx"
                      value={form.emergencyPhone}
                      onChange={(e) =>
                        setField("emergencyPhone", e.target.value)
                      }
                      className={`w-full h-10 rounded-xl border px-3 text-sm text-[#0d121b] bg-white outline-none ${formErrors.emergencyPhone ? "border-red-400" : "border-[#c7d2e0]"}`}
                    />
                    {formErrors.emergencyPhone && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.emergencyPhone}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0d121b] mb-1">
                    Access Instructions
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Key fob from reception. Code: 4412."
                    value={form.accessInstructions}
                    onChange={(e) =>
                      setField("accessInstructions", e.target.value)
                    }
                    className="w-full rounded-xl border border-[#c7d2e0] px-3 py-2 text-sm text-[#0d121b] bg-white outline-none resize-none"
                  />
                </div>
              </div>

              <hr className="border-[#e7ebf3]" />

              {/* Section: Required Trainings */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#2e4150]">
                    school
                  </span>
                  <h3 className="text-sm font-bold text-[#0d121b] uppercase tracking-wide">
                    Required Trainings
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TRAINING_OPTIONS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTraining(t)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        form.requiredTrainings.includes(t)
                          ? "bg-[#2e4150] text-white border-[#2e4150]"
                          : "bg-white text-[#4c669a] border-[#e7ebf3] hover:border-[#2e4150]/40"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                {form.requiredTrainings.length > 0 && (
                  <p className="text-xs text-[#4c669a]">
                    {form.requiredTrainings.length} training
                    {form.requiredTrainings.length > 1 ? "s" : ""} selected
                  </p>
                )}
              </div>

              <hr className="border-[#e7ebf3]" />

              {/* Section: Geo Fence */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#2e4150]">
                    location_on
                  </span>

                  <h3 className="text-sm font-bold text-[#0d121b] uppercase tracking-wide">
                    Geo Fence Attendance
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.geolocation.getCurrentPosition((position) => {
                      setField("latitude", position.coords.latitude);

                      setField("longitude", position.coords.longitude);
                    });
                  }}
                >
                  Use Current Location
                </button>

                {/* Enable Toggle */}
                <div className="flex items-center justify-between rounded-xl border border-[#e7ebf3] p-4 bg-[#fafbfd]">
                  <div>
                    <p className="text-sm font-semibold text-[#0d121b]">
                      Enable Geo Fence
                    </p>

                    <p className="text-xs text-[#6b7a99] mt-1">
                      Cleaners can only clock-in and clock-out inside this area.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setField("geoFenceEnabled", !form.geoFenceEnabled)
                    }
                    className={`relative w-14 h-8 rounded-full transition-all ${
                      form.geoFenceEnabled ? "bg-[#2e4150]" : "bg-[#dbe3ee]"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${
                        form.geoFenceEnabled ? "left-7" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                {form.geoFenceEnabled && (
                  <div className="space-y-4">
                    {/* Radius */}
                    <div>
                      <label className="block text-sm font-semibold text-[#0d121b] mb-1">
                        Allowed Radius (Meters)
                      </label>

                      <input
                        type="number"
                        min={10}
                        max={1000}
                        value={form.geoFenceRadius}
                        onChange={(e) =>
                          setField("geoFenceRadius", e.target.value)
                        }
                        className="w-full h-10 rounded-xl border border-[#c7d2e0] px-3 text-sm text-[#0d121b] bg-white outline-none"
                      />

                      <p className="text-xs text-[#6b7a99] mt-1">
                        Recommended: 100–200 meters
                      </p>
                    </div>

                    {/* Coordinates Preview */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#f8fafc] border border-[#e7ebf3] rounded-xl p-3">
                        <p className="text-xs font-bold text-[#6b7a99] uppercase">
                          Latitude
                        </p>

                        <p className="text-sm font-semibold text-[#0d121b] mt-1">
                          {form.latitude || "Not Selected"}
                        </p>
                      </div>

                      <div className="bg-[#f8fafc] border border-[#e7ebf3] rounded-xl p-3">
                        <p className="text-xs font-bold text-[#6b7a99] uppercase">
                          Longitude
                        </p>

                        <p className="text-sm font-semibold text-[#0d121b] mt-1">
                          {form.longitude || "Not Selected"}
                        </p>
                      </div>
                    </div>

                    {/* Map */}
                    <div className="overflow-hidden rounded-2xl border border-[#e7ebf3]">
                      <GeoFenceMap
                        latitude={form.latitude || 19.2183}
                        longitude={form.longitude || 72.9781}
                        radius={Number(form.geoFenceRadius)}
                        onChange={(lat, lng) => {
                          setField("latitude", lat);
                          setField("longitude", lng);
                        }}
                      />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                      <p className="text-xs text-blue-700 leading-5">
                        Click anywhere on the map to set the attendance area.
                        Cleaners will only be able to login/logout inside this
                        radius.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <hr className="border-[#e7ebf3]" />

              {/* Section: Site Documents */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#2e4150]">
                    folder_open
                  </span>
                  <h3 className="text-sm font-bold text-[#0d121b] uppercase tracking-wide">
                    Site Documents
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {docField(
                    "Risk Assessment",
                    "riskAssessment",
                    "assignment_late",
                  )}
                  {docField("Floor Plan / Layout", "floorPlan", "map")}
                  {docField("Access Permit", "accessPermit", "key")}
                  {docField(
                    "Fire Safety Certificate",
                    "fireSafety",
                    "local_fire_department",
                  )}
                  {docField("COSHH Assessment", "coshhAssessment", "science")}
                  {docField(
                    "Site Induction Pack",
                    "siteInduction",
                    "menu_book",
                  )}
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e7ebf3] sticky bottom-0 bg-white rounded-b-2xl">
              {formErrors.submit && (
                <p className="text-red-500 text-xs mr-auto">
                  {formErrors.submit}
                </p>
              )}
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 rounded-full border border-[#c7d2e0] text-[#4c669a] text-sm font-bold hover:bg-[#f2f6f9] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#2e4150] text-white text-sm font-bold hover:bg-[#2e4150]/90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[18px]">
                  add_circle
                </span>
                {saving ? "Saving…" : "Add Site"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SitesList;
