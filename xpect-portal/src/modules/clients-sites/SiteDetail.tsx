import React, { useState, useRef, useEffect } from "react";
import { useClientsSites } from "../../context/ClientsSitesContext";
import type { SiteComplianceDocument } from "./types";
import GeoFenceMap from "./components/GeoFenceMap";

interface SiteDetailProps {
  siteId: string;
  onBack: () => void;
}

const RISK_STYLES = {
  Low: { badge: "bg-green-100 text-green-700 border border-green-200" },
  Medium: { badge: "bg-amber-100 text-amber-700 border border-amber-200" },
  High: { badge: "bg-red-100 text-red-700 border border-red-200" },
};

const COMPLIANCE_STYLES = {
  Compliant: {
    badge: "bg-green-100 text-green-700 border border-green-200",
    dot: "bg-green-500",
    label: "Compliant",
  },
  Expiring: {
    badge: "bg-amber-100 text-amber-700 border border-amber-200",
    dot: "bg-amber-400",
    label: "Expiring",
  },
  "Non-Compliant": {
    badge: "bg-red-100 text-red-700 border border-red-200",
    dot: "bg-red-500",
    label: "Not Eligible for Site",
  },
};

interface SiteFormState {
  address: string;
  postcode: string;
  emergencyContact: string;
  emergencyPhone: string;
  accessInstructions: string;
  geoFenceEnabled: boolean;

  geoFenceRadius: number;

  latitude: number | null;

  longitude: number | null;

  allocationPeriod: "Weekly" | "Monthly";

  allocatedHours: number;

  inspectionFrequency: "Weekly" | "Monthly";

  requiredTrainings: string[];
}

const AVAILABLE_TRAININGS = [
  "COSHH",
  "Manual Handling",
  "Fire Safety",
  "Health & Safety",
  "PPE",
  "First Aid",
  "Working at Height",
  "Site Induction",
];
const COMPLIANCE_DOCS = [
  { key: "riskAssessment", label: "Risk Assessment", icon: "assignment_late" },
  { key: "floorPlan", label: "Floor Plan / Layout", icon: "map" },
  { key: "accessPermit", label: "Access Permit", icon: "key" },
  {
    key: "fireSafety",
    label: "Fire Safety Certificate",
    icon: "local_fire_department",
  },
  { key: "coshhAssessment", label: "COSHH Assessment", icon: "science" },
  { key: "siteInduction", label: "Site Induction Pack", icon: "menu_book" },
] as const;

const PREVIEWABLE_EXT = /\.(pdf|png|jpg|jpeg)$/i;
const PREVIEWABLE_MIME = /^(application\/pdf|image\/(png|jpeg|jpg))/i;
const isPreviewable = (name: string, dataUrl: string): boolean => {
  const ext = name ? PREVIEWABLE_EXT.test(name) : false;
  const mime =
    dataUrl.startsWith("data:") && PREVIEWABLE_MIME.test(dataUrl.split(";")[0]);
  return ext || mime;
};
const isPdf = (name: string, dataUrl: string): boolean => {
  const lower = name?.toLowerCase() ?? "";
  return lower.endsWith(".pdf") || dataUrl.startsWith("data:application/pdf");
};

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("Failed to read file"));
    r.readAsDataURL(file);
  });

const SiteDetail: React.FC<SiteDetailProps> = ({ siteId, onBack }) => {
  const {
    getSiteById,
    updateSite,
    getClientById,
    getAssignmentsBySite,
    deleteSite,
    updateSiteCompliance,
  } = useClientsSites();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [viewDoc, setViewDoc] = useState<{
    name: string;
    dataUrl: string;
  } | null>(null);
  const [viewError, setViewError] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const site = getSiteById(siteId);
  const [editingInfo, setEditingInfo] = useState(false);
  const [editingWorkers, setEditingWorkers] = useState(false);
  const assignments = site ? getAssignmentsBySite(siteId) : [];
  const [workerAssignments, setWorkerAssignments] = useState(assignments);
  const [editingGeoFence, setEditingGeoFence] = useState(false);
  const [editingTraining, setEditingTraining] = useState(false);

  const [siteForm, setSiteForm] = useState<SiteFormState>({
    address: site?.address || "",
    postcode: site?.postcode || "",
    emergencyContact: site?.emergencyContact || "",
    emergencyPhone: site?.emergencyPhone || "",
    accessInstructions: site?.accessInstructions || "",

    allocationPeriod: site?.allocationPeriod || "Weekly",

    allocatedHours: site?.allocatedHours || 0,

    inspectionFrequency: site?.inspectionFrequency || "Monthly",

    requiredTrainings: site?.requiredTrainings || [],
    geoFenceEnabled: site?.geoFence?.enabled || false,

    geoFenceRadius: site?.geoFence?.radius || 100,

    latitude: site?.geoFence?.coordinates?.latitude || null,

    longitude: site?.geoFence?.coordinates?.longitude || null,
  });

  const client = site ? getClientById(site.clientId) : undefined;

  useEffect(() => {
    setWorkerAssignments(assignments);
  }, [assignments]);

  const handleSaveWorkers = async () => {
    try {
      // temporary local save
      // later connect API

      setEditingWorkers(false);
    } catch (error) {
      console.error(error);
    }
  };
  const complianceDocs = site?.complianceDocuments ?? [];
  const getDocByKey = (key: string) =>
    complianceDocs.find((d) => d.key === key);

  const handleDelete = async () => {
    try {
      await deleteSite(siteId);
      setShowDeleteConfirm(false);
      onBack();
    } catch {
      // Could show error toast
    }
  };

  const handleSaveInfo = async () => {
    try {
      await updateSite(siteId, {
        ...site,
        ...siteForm,
      });

      setEditingInfo(false);
    } catch (error) {
      console.error(error);
    }
  };
  const handleSaveTraining = async () => {
    try {
      await updateSite(siteId, {
        ...site,
        requiredTrainings: siteForm.requiredTrainings,
      });

      setEditingTraining(false);
    } catch (error) {
      console.error(error);
    }
  };
  const handleUpload = async (key: string, file: File) => {
    if (!site) return;
    setUploadingKey(key);
    try {
      const dataUrl = await fileToDataUrl(file);
      const existing = complianceDocs.filter((d) => d.key !== key);
      const updated = [...existing, { key, name: file.name, dataUrl }];
      await updateSiteCompliance(siteId, updated);
    } catch {
      // Could show error
    } finally {
      setUploadingKey(null);
      if (fileInputRefs.current[key])
        (fileInputRefs.current[key] as HTMLInputElement).value = "";
    }
  };
  const inspections = [
    { id: 1, date: "Mar 2026", score: 82, issues: 3, inspector: "John" },
    { id: 2, date: "Feb 2026", score: 90, issues: 1, inspector: "John" },
  ];

  const openViewer = (doc: SiteComplianceDocument) => {
    setViewDoc({ name: doc.name, dataUrl: doc.dataUrl });
    setViewError(false);
  };

  if (!site)
    return (
      <div className="flex-1 flex items-center justify-center p-10">
        <p className="text-[#6b7a99]">Site not found.</p>
      </div>
    );

  const rs = RISK_STYLES[site.riskLevel];
  const nonCompliant = assignments.filter(
    (a) => a.complianceStatus === "Non-Compliant",
  );

  return (
    <div className="flex-1 flex flex-col bg-[#f6f7fb] min-h-screen">
      {/* Page header */}
      <div className=" p-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[#6b7a99] text-sm font-semibold hover:text-[#0d121b] transition-colors cursor-pointer mb-3"
        >
          <span className="material-symbols-outlined text-[18px]">
            arrow_back
          </span>
          Back to Sites
        </button>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[#0d121b] text-xl  sm:text-[30px] font-bold   font-black">
              {site.name}
            </h1>
            <p className="text-[#6b7a99] text-sm mt-0.5">
              {client?.name ?? "—"} · {site.postcode}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-3 py-1.5 rounded text-sm font-bold uppercase tracking-wide ${rs.badge}`}
            >
              {site.riskLevel} Risk
            </span>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 text-sm font-semibold transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                delete
              </span>
              Delete
            </button>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowDeleteConfirm(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-site-title"
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id="delete-site-title"
              className="text-lg font-bold text-[#0d121b] mb-2"
            >
              Delete Site
            </h3>
            <p className="text-sm text-[#6b7a99] mb-6">
              Are you sure you want to delete &quot;{site.name}&quot;? This will
              also remove all worker assignments to this site. This action
              cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 cursor-pointer"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#e7ebf3] text-[#2e4150] text-sm font-semibold hover:bg-[#f6f7fb] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 px-0 py-5 space-y-5">
        {/* Non-compliant alert */}
        {nonCompliant.length > 0 && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <span className="material-symbols-outlined text-red-500 text-[20px]">
              warning
            </span>
            <p className="text-red-800 text-sm font-semibold">
              {nonCompliant.length} worker
              {nonCompliant.length > 1 ? "s are" : " is"} not eligible for this
              site due to missing required training.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left col */}
          <div className="space-y-5">
            {/* Site Information */}
            <div className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#eef2f7] bg-[#fcfdff]">
                <div>
                  <h3 className="text-[#0d121b] text-[15px] sm:text-[20px] font-black font-bold ">
                    Site Information
                  </h3>

                  <p className="text-base text-[#6b7a99] mt-1">
                    Manage operational and site allocation details
                  </p>
                </div>

                <button
                  onClick={() => setEditingInfo(!editingInfo)}
                  className={`h-10 px-4 rounded-xl flex items-center gap-2 text-sm font-bold transition-all ${
                    editingInfo
                      ? "bg-blue-600 text-white"
                      : "border border-[#dbe3ee] text-[#2e4150] hover:bg-[#f8fafc]"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    edit
                  </span>

                  {editingInfo ? "Editing" : "Edit"}
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                {/* Main Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    {
                      label: "Full Address",
                      field: "address",
                    },
                    {
                      label: "Postcode",
                      field: "postcode",
                    },
                    {
                      label: "Emergency Contact",
                      field: "emergencyContact",
                    },
                    {
                      label: "Emergency Phone",
                      field: "emergencyPhone",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="bg-[#fafbfd] border border-[#eef2f7] rounded-2xl p-2"
                    >
                      <p className="text-[11px] font-bold uppercase tracking-wide text-[#6b7a99] mb-2">
                        {item.label}
                      </p>

                      {editingInfo ? (
                        <input
                          type="text"
                          value={
                            siteForm[
                              item.field as keyof typeof siteForm
                            ] as string
                          }
                          onChange={(e) =>
                            setSiteForm((prev) => ({
                              ...prev,
                              [item.field]: e.target.value,
                            }))
                          }
                          className="w-full h-11 rounded-xl border border-[#dbe3ee] bg-white px-4 text-sm font-medium outline-none focus:border-blue-400"
                        />
                      ) : (
                        <p className="text-sm font-semibold text-[#0d121b] break-words">
                          {siteForm[item.field as keyof typeof siteForm]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Access Instructions */}
                <div className="bg-[#fafbfd] border border-[#eef2f7] rounded-2xl p-2">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-[#6b7a99] mb-2">
                    Access Instructions
                  </p>

                  {editingInfo ? (
                    <textarea
                      rows={4}
                      value={siteForm.accessInstructions}
                      onChange={(e) =>
                        setSiteForm((prev) => ({
                          ...prev,
                          accessInstructions: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-[#dbe3ee] bg-white px-4 py-3 text-sm outline-none resize-none focus:border-blue-400"
                    />
                  ) : (
                    <p className="text-sm leading-7 text-[#0d121b]">
                      {site.accessInstructions || "No instructions added."}
                    </p>
                  )}
                </div>

                {/* Operational Settings */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-[18px] text-[#4c669a]">
                      schedule
                    </span>

                    <h4 className="text-sm font-black uppercase tracking-wide text-[#0d121b]">
                      Operational Settings
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Allocation Period */}
                    <div className="bg-[#fafbfd] border border-[#eef2f7] rounded-2xl p-2">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-[#6b7a99] mb-2">
                        Allocation Period
                      </p>

                      {editingInfo ? (
                        <select
                          value={siteForm.allocationPeriod}
                          onChange={(e) =>
                            setSiteForm((prev) => ({
                              ...prev,
                              allocationPeriod: e.target.value as
                                | "Weekly"
                                | "Monthly",
                            }))
                          }
                          className="w-full h-11 rounded-xl border border-[#dbe3ee] bg-white px-4 text-sm font-medium outline-none"
                        >
                          <option value="Weekly">Weekly</option>

                          <option value="Monthly">Monthly</option>
                        </select>
                      ) : (
                        <div className="inline-flex px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-bold">
                          {site.allocationPeriod}
                        </div>
                      )}
                    </div>

                    {/* Allocated Hours */}
                    <div className="bg-[#fafbfd] border border-[#eef2f7] rounded-2xl p-2">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-[#6b7a99] mb-2">
                        Allocated Hours
                      </p>

                      {editingInfo ? (
                        <input
                          type="number"
                          value={siteForm.allocatedHours}
                          onChange={(e) =>
                            setSiteForm((prev) => ({
                              ...prev,
                              allocatedHours: Number(e.target.value),
                            }))
                          }
                          className="w-full h-11 rounded-xl border border-[#dbe3ee] bg-white px-4 text-sm font-medium outline-none"
                        />
                      ) : (
                        <p className="text-2xl font-bold font-black text-[#0d121b]">
                          {site.allocatedHours}
                          <span className="text-sm font-semibold text-[#6b7a99] ml-1">
                            hrs
                          </span>
                        </p>
                      )}
                    </div>

                    {/* Inspection Frequency */}
                    <div className="bg-[#fafbfd] border border-[#eef2f7] rounded-2xl p-2">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-[#6b7a99] mb-2">
                        Inspection Frequency
                      </p>

                      {editingInfo ? (
                        <select
                          value={siteForm.inspectionFrequency}
                          onChange={(e) =>
                            setSiteForm((prev) => ({
                              ...prev,
                              inspectionFrequency: e.target.value as
                                | "Weekly"
                                | "Monthly",
                            }))
                          }
                          className="w-full h-11 rounded-xl border border-[#dbe3ee] bg-white px-4 text-sm font-medium outline-none"
                        >
                          <option value="Weekly">Weekly</option>

                          <option value="Monthly">Monthly</option>
                        </select>
                      ) : (
                        <div className="inline-flex px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-sm font-bold">
                          {site.inspectionFrequency}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                {editingInfo && (
                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#eef2f7]">
                    <button
                      onClick={() => setEditingInfo(false)}
                      className="h-11 px-5 rounded-xl border border-[#dbe3ee] text-sm font-bold text-[#2e4150] hover:bg-[#f8fafc]"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handleSaveInfo}
                      className="h-11 px-5 rounded-xl bg-[#0d121b] text-white text-sm font-bold hover:opacity-90"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Compliance Documents */}
            <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-5">
              <h3
                className="text-[#0d121b] font-black text-sm sm:text-[20px]
font-bold mb-4"
              >
                Compliance Documents
              </h3>
              <div className="space-y-2">
                {COMPLIANCE_DOCS.map((docDef) => {
                  const doc = getDocByKey(docDef.key);
                  const hasDoc = !!doc?.dataUrl;
                  return (
                    <div
                      key={docDef.key}
                      className="flex items-center justify-between p-3 bg-[#f8fafc] rounded-lg border border-[#e7ebf3] gap-2 flex-wrap"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="material-symbols-outlined text-[#6b7a99] text-[17px] shrink-0">
                          {docDef.icon}
                        </span>
                        <p className="text-sm font-medium text-[#0d121b]">
                          {docDef.label}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {hasDoc ? (
                          <>
                            <button
                              onClick={() => openViewer(doc!)}
                              className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                visibility
                              </span>
                              View
                            </button>
                            <span className="text-[#c7d2e0]">|</span>
                            <label className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">
                                swap_horiz
                              </span>
                              {uploadingKey === docDef.key
                                ? "Uploading…"
                                : "Replace"}
                              <input
                                ref={(el) => {
                                  fileInputRefs.current[docDef.key] = el;
                                }}
                                type="file"
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) handleUpload(docDef.key, f);
                                }}
                              />
                            </label>
                          </>
                        ) : (
                          <label className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">
                              upload
                            </span>
                            {uploadingKey === docDef.key
                              ? "Uploading…"
                              : "Upload"}
                            <input
                              ref={(el) => {
                                fileInputRefs.current[docDef.key] = el;
                              }}
                              type="file"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleUpload(docDef.key, f);
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right col */}
          <div className="lg:col-span-2 space-y-5">
            {/* Required Trainings */}
            {/* Required Trainings */}
            <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="text-[#0d121b] font-black text-sm  tracking-wide sm:text-[20px]
font-bold"
                >
                  Required Trainings
                </h3>

                <button
                  onClick={() => setEditingTraining(!editingTraining)}
                  className="w-8 h-8 rounded-lg border border-[#e7ebf3] flex items-center justify-center hover:bg-[#f8fafc] transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#4c669a]">
                    edit
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {editingTraining
                  ? AVAILABLE_TRAININGS.map((training) => {
                      const checked =
                        siteForm.requiredTrainings.includes(training);

                      return (
                        <label
                          key={training}
                          className="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-lg border border-[#e7ebf3] cursor-pointer hover:border-blue-300 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSiteForm((prev) => ({
                                  ...prev,
                                  requiredTrainings: [
                                    ...prev.requiredTrainings,
                                    training,
                                  ],
                                }));
                              } else {
                                setSiteForm((prev) => ({
                                  ...prev,
                                  requiredTrainings:
                                    prev.requiredTrainings.filter(
                                      (t) => t !== training,
                                    ),
                                }));
                              }
                            }}
                            className="w-4 h-4"
                          />

                          <span className="text-sm font-medium text-[#0d121b]">
                            {training}
                          </span>
                        </label>
                      );
                    })
                  : site.requiredTrainings.map((training) => (
                      <div
                        key={training}
                        className="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-lg border border-[#e7ebf3]"
                      >
                        <span className="material-symbols-outlined text-blue-600 text-[18px]">
                          check_circle
                        </span>

                        <p className="text-sm font-medium text-[#0d121b]">
                          {training}
                        </p>

                        <span className="ml-auto text-xs font-bold text-red-600 uppercase">
                          Required
                        </span>
                      </div>
                    ))}
              </div>

              {editingTraining && (
                <div className="flex items-center gap-3 pt-4">
                  <button
                    onClick={handleSaveTraining}
                    className="px-4 py-2 rounded-xl bg-[#2e4150] text-white text-sm font-bold"
                  >
                    Save Trainings
                  </button>

                  <button
                    onClick={() => setEditingTraining(false)}
                    className="px-4 py-2 rounded-xl border border-[#e7ebf3] text-sm font-bold"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Assigned Workers */}
            {/* Assigned Workers */}
            <div className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#eef2f7] bg-[#fcfdff]">
                <div>
                  <h3 className="text-[#0d121b] text-[15px] sm:text-[20px] font-black font-bold">
                    Assigned Workers
                  </h3>

                  <p className="text-sm text-[#6b7a99] mt-1">
                    Manage workers assigned to this site
                  </p>
                </div>

                {/* <button
                  onClick={() => setEditingWorkers(!editingWorkers)}
                  className={`h-10 px-4 rounded-xl flex items-center gap-2 text-sm font-bold transition-all ${
                    editingWorkers
                      ? "bg-blue-600 text-white"
                      : "border border-[#dbe3ee] text-[#2e4150] hover:bg-[#f8fafc]"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    edit
                  </span>

                  {editingWorkers ? "Editing" : "Edit"}
                </button> */}
              </div>

              {/* Workers List */}
              <div className="p-6">
                {workerAssignments.length === 0 ? (
                  <div className="text-center py-10">
                    <span className="material-symbols-outlined text-[48px] text-[#c7c7c7] block mb-3">
                      group_off
                    </span>

                    <p className="text-[#6b7a99] font-medium">
                      No workers assigned
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {workerAssignments.map((worker) => (
                      <div
                        key={worker.id}
                        className="bg-[#fafbfd] border border-[#eef2f7] rounded-2xl p-4"
                      >
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 bg-black"
                            // style={{
                            //   backgroundColor: #000,
                            // }}
                          >
                            {worker.workerInitials}
                          </div>

                          {/* Worker Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h4 className="text-sm font-bold text-[#0d121b]">
                                  {worker.workerName}
                                </h4>

                                {editingWorkers ? (
                                  <select
                                    value={worker.role}
                                    onChange={(e) =>
                                      setWorkerAssignments((prev) =>
                                        prev.map((w) =>
                                          w.id === worker.id
                                            ? {
                                                ...w,
                                                role: e.target.value,
                                              }
                                            : w,
                                        ),
                                      )
                                    }
                                    className="mt-2 h-9 rounded-lg border border-[#dbe3ee] px-3 text-xs font-semibold"
                                  >
                                    <option value="Cleaner">Cleaner</option>

                                    <option value="Supervisor">
                                      Supervisor
                                    </option>

                                    <option value="Site Lead">Site Lead</option>
                                  </select>
                                ) : (
                                  <p className="text-xs text-[#6b7a99] mt-1">
                                    {worker.role}
                                  </p>
                                )}
                              </div>

                              {/* Compliance */}
                              <div
                                className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-[11px] font-bold ${
                                  COMPLIANCE_STYLES[worker.complianceStatus]
                                    .badge
                                }`}
                              >
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    COMPLIANCE_STYLES[worker.complianceStatus]
                                      .dot
                                  }`}
                                />

                                {
                                  COMPLIANCE_STYLES[worker.complianceStatus]
                                    .label
                                }
                              </div>
                            </div>

                            {/* Trainings */}
                            <div className="flex flex-wrap gap-2 mt-4">
                              {worker.completedTrainings.map((training) => (
                                <span
                                  key={training}
                                  className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold"
                                >
                                  {training}
                                </span>
                              ))}
                            </div>

                            {/* Remove */}
                            {editingWorkers && (
                              <button
                                onClick={() =>
                                  setWorkerAssignments((prev) =>
                                    prev.filter((w) => w.id !== worker.id),
                                  )
                                }
                                className="mt-4 text-xs font-bold text-red-600 hover:underline"
                              >
                                Remove Worker
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer */}
                {editingWorkers && (
                  <div className="flex items-center justify-end gap-3 pt-5 border-t border-[#eef2f7] mt-6">
                    <button
                      onClick={() => setEditingWorkers(false)}
                      className="h-11 px-5 rounded-xl border border-[#dbe3ee] text-sm font-bold text-[#2e4150]"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handleSaveWorkers}
                      className="h-11 px-5 rounded-xl bg-[#0d121b] text-white text-sm font-bold"
                    >
                      Save Workers
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Geo Fence */}
            <div className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#eef2f7] bg-[#fcfdff]">
                <div>
                  <h3 className="text-[#0d121b] text-[15px] sm:text-[20px] font-black font-bold">
                    Geo Fence Attendance
                  </h3>

                  <p className="text-sm text-[#6b7a99] mt-1">
                    Restrict cleaner attendance within allowed area
                  </p>
                </div>

                <button
                  onClick={() => setEditingGeoFence(!editingGeoFence)}
                  className={`h-10 px-4 rounded-xl flex items-center gap-2 text-sm font-bold transition-all ${
                    editingGeoFence
                      ? "bg-blue-600 text-white"
                      : "border border-[#dbe3ee] text-[#2e4150] hover:bg-[#f8fafc]"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    edit_location
                  </span>

                  {editingGeoFence ? "Editing" : "Edit"}
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* Enable Toggle */}
                <div className="flex items-center justify-between rounded-2xl border border-[#eef2f7] bg-[#fafbfd] p-4">
                  <div>
                    <p className="text-sm font-bold text-[#0d121b]">
                      Geo Fence Enabled
                    </p>

                    <p className="text-xs text-[#6b7a99] mt-1">
                      Only allow attendance inside selected area
                    </p>
                  </div>

                  {editingGeoFence ? (
                    <button
                      type="button"
                      onClick={() =>
                        setSiteForm((prev) => ({
                          ...prev,

                          geoFenceEnabled: !prev.geoFenceEnabled,
                        }))
                      }
                      className={`relative w-14 h-8 rounded-full transition-all ${
                        siteForm.geoFenceEnabled
                          ? "bg-[#2e4150]"
                          : "bg-[#dbe3ee]"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${
                          siteForm.geoFenceEnabled ? "left-7" : "left-1"
                        }`}
                      />
                    </button>
                  ) : (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        siteForm.geoFenceEnabled
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {siteForm.geoFenceEnabled ? "Enabled" : "Disabled"}
                    </span>
                  )}
                </div>

                {siteForm.geoFenceEnabled && (
                  <>
                    {/* Radius */}
                    <div className="bg-[#fafbfd] border border-[#eef2f7] rounded-2xl p-4">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-[#6b7a99] mb-2">
                        Allowed Radius
                      </p>

                      {editingGeoFence ? (
                        <input
                          type="number"
                          min={10}
                          max={1000}
                          value={siteForm.geoFenceRadius}
                          onChange={(e) =>
                            setSiteForm((prev) => ({
                              ...prev,

                              geoFenceRadius: Number(e.target.value),
                            }))
                          }
                          className="w-full h-11 rounded-xl border border-[#dbe3ee] bg-white px-4 text-sm font-medium outline-none"
                        />
                      ) : (
                        <p className="text-2xl font-black text-[#0d121b]">
                          {siteForm.geoFenceRadius}

                          <span className="text-sm text-[#6b7a99] ml-1">
                            meters
                          </span>
                        </p>
                      )}
                    </div>

                    {/* Coordinates */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#fafbfd] border border-[#eef2f7] rounded-2xl p-4">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-[#6b7a99] mb-2">
                          Latitude
                        </p>

                        <p className="text-sm font-semibold text-[#0d121b] break-all">
                          {siteForm.latitude || "Not Set"}
                        </p>
                      </div>

                      <div className="bg-[#fafbfd] border border-[#eef2f7] rounded-2xl p-4">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-[#6b7a99] mb-2">
                          Longitude
                        </p>

                        <p className="text-sm font-semibold text-[#0d121b] break-all">
                          {siteForm.longitude || "Not Set"}
                        </p>
                      </div>
                    </div>

                    {/* Map */}
                    <div className="overflow-hidden rounded-2xl border border-[#e7ebf3]">
                      <GeoFenceMap
                        latitude={siteForm.latitude || 19.2183}
                        longitude={siteForm.longitude || 72.9781}
                        radius={siteForm.geoFenceRadius}
                        onChange={(lat, lng) => {
                          if (!editingGeoFence) return;

                          setSiteForm((prev) => ({
                            ...prev,

                            latitude: lat,

                            longitude: lng,
                          }));
                        }}
                      />
                    </div>
                  </>
                )}

                {/* Footer */}
                {editingGeoFence && (
                  <div className="flex items-center justify-end gap-3 pt-5 border-t border-[#eef2f7]">
                    <button
                      onClick={() => setEditingGeoFence(false)}
                      className="h-11 px-5 rounded-xl border border-[#dbe3ee] text-sm font-bold text-[#2e4150]"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={async () => {
                        try {
                          await updateSite(siteId, {
                            geoFence: {
                              enabled: siteForm.geoFenceEnabled,

                              type: "Circle",

                              coordinates: {
                                latitude: siteForm.latitude,

                                longitude: siteForm.longitude,
                              },

                              radius: siteForm.geoFenceRadius,
                            },
                          });

                          setEditingGeoFence(false);
                        } catch (error) {
                          console.error(error);
                        }
                      }}
                      className="h-11 px-5 rounded-xl bg-[#0d121b] text-white text-sm font-bold"
                    >
                      Save Geo Fence
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {viewDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setViewDoc(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="site-doc-viewer-title"
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e7ebf3] shrink-0">
              <h3
                id="site-doc-viewer-title"
                className="text-lg font-bold text-[#0d121b] truncate pr-4"
              >
                {viewDoc.name}
              </h3>
              <button
                onClick={() => setViewDoc(null)}
                className="p-1.5 rounded-lg hover:bg-[#f6f7fb] transition-colors cursor-pointer shrink-0"
                aria-label="Close"
              >
                <span className="material-symbols-outlined text-[24px] text-[#6b7a99]">
                  close
                </span>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-[#f8fafc] min-h-[400px]">
              {!viewDoc.dataUrl ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-[48px] text-[#c7c7c7] block mb-3">
                    description
                  </span>
                  <p className="text-[#4c669a] font-semibold">
                    Unable to preview document. Please download the file.
                  </p>
                </div>
              ) : viewError || !isPreviewable(viewDoc.name, viewDoc.dataUrl) ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-[48px] text-[#c7c7c7] block mb-3">
                    description
                  </span>
                  <p className="text-[#4c669a] font-semibold">
                    Unable to preview document. Please download the file.
                  </p>
                </div>
              ) : isPdf(viewDoc.name, viewDoc.dataUrl) ? (
                <iframe
                  src={viewDoc.dataUrl}
                  title={viewDoc.name}
                  className="w-full min-h-[500px] border border-[#e7ebf3] rounded-lg bg-white"
                  style={{ minHeight: "60vh" }}
                />
              ) : (
                <img
                  src={viewDoc.dataUrl}
                  alt={viewDoc.name}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow"
                  onError={() => setViewError(true)}
                />
              )}
            </div>
            <div className="px-6 py-4 border-t border-[#e7ebf3] flex items-center justify-between gap-3 flex-wrap">
              {viewDoc.dataUrl && (
                <a
                  href={viewDoc.dataUrl}
                  download={viewDoc.name}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2e4150] text-white text-sm font-bold hover:bg-[#2e4150]/90 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    download
                  </span>
                  Download
                </a>
              )}
              <button
                onClick={() => setViewDoc(null)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#e7ebf3] text-[#0d121b] text-sm font-bold hover:bg-[#f6f7fb] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteDetail;
