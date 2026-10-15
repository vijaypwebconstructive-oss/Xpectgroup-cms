import React, { useEffect, useRef, useState } from "react";
import api from "../services/api";
import LoadingOverlay from "../components/LoadingOverlay";

/**
 * "My Application" — shown instead of the ERP to an employee whose
 * verification status is "Docs Required". They can update basic details,
 * re-upload rejected documents and submit the application for review again.
 */

interface MyApplicationDocument {
  id: string;
  name: string;
  type: string;
  status: "Verified" | "Pending" | "Rejected";
  uploadDate: string;
  fileName: string;
  hasFile: boolean;
  reuploadedAt: string | null;
}

interface MyApplicationData {
  id: string;
  applicationRef: string;
  name: string;
  email: string;
  dob: string;
  phoneNumber: string;
  address: string;
  citizenshipStatus: string;
  shareCode: string;
  canEditShareCode: boolean;
  avatar: string;
  verificationStatus: string;
  auditorNotes: string;
  username: string;
  documents: MyApplicationDocument[];
}

interface MyApplicationProps {
  onSubmitted: () => void;
  onLogout: () => void;
}

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const MyApplication: React.FC<MyApplicationProps> = ({
  onSubmitted,
  onLogout,
}) => {
  const [application, setApplication] = useState<MyApplicationData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [details, setDetails] = useState({
    phoneNumber: "",
    address: "",
    shareCode: "",
  });
  const [detailsError, setDetailsError] = useState("");
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetRef = useRef<MyApplicationDocument | null>(null);

  const applyApplication = (data: MyApplicationData) => {
    setApplication(data);
    setDetails({
      phoneNumber: data.phoneNumber || "",
      address: data.address || "",
      shareCode: data.shareCode || "",
    });
  };

  const showNotice = (type: "success" | "error", message: string) => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 4000);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const data = (await api.myApplication.get()) as MyApplicationData;
        applyApplication(data);
      } catch (err: any) {
        setLoadError(err?.message || "Unable to load your application.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2f6f9]">
        <p className="text-sm text-gray-500">Loading your application...</p>
      </div>
    );
  }

  if (loadError || !application) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2f6f9] px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Unable to load your application
          </h2>
          <p className="text-sm text-gray-500">{loadError}</p>
          <button
            onClick={onLogout}
            className="mt-6 px-5 py-2.5 rounded-xl bg-[#2e4150] text-white text-sm font-semibold hover:bg-[#3a5268]"
          >
            Log out
          </button>
        </div>
      </div>
    );
  }

  const rejectedDocs = application.documents.filter(
    (d) => d.status === "Rejected",
  );
  const reuploadedDocs = application.documents.filter(
    (d) => d.status === "Pending" && d.reuploadedAt,
  );
  const totalToReupload = rejectedDocs.length + reuploadedDocs.length;
  const canSubmit = rejectedDocs.length === 0;

  const detailsChanged =
    details.phoneNumber.trim() !== (application.phoneNumber || "") ||
    details.address.trim() !== (application.address || "") ||
    (application.canEditShareCode &&
      details.shareCode.trim().toUpperCase() !==
        (application.shareCode || "").toUpperCase());

  const validateDetails = (): string => {
    if (!details.phoneNumber.trim()) return "Phone number is required.";
    if (!details.address.trim()) return "Address is required.";
    if (
      application.canEditShareCode &&
      details.shareCode.trim() &&
      !/^[A-Za-z0-9]{9}$/.test(details.shareCode.trim())
    ) {
      return "Share code must be 9 letters or numbers.";
    }
    return "";
  };

  const saveDetails = async (): Promise<boolean> => {
    const error = validateDetails();
    if (error) {
      setDetailsError(error);
      return false;
    }
    setDetailsError("");

    const payload: { phoneNumber: string; address: string; shareCode?: string } =
      {
        phoneNumber: details.phoneNumber.trim(),
        address: details.address.trim(),
      };
    if (application.canEditShareCode && details.shareCode.trim()) {
      payload.shareCode = details.shareCode.trim().toUpperCase();
    }

    try {
      setLoadingMessage("Saving your details...");
      const data = (await api.myApplication.updateDetails(
        payload,
      )) as MyApplicationData;
      applyApplication(data);
      showNotice("success", "Your details have been saved.");
      return true;
    } catch (err: any) {
      setDetailsError(err?.message || "Failed to save your details.");
      return false;
    } finally {
      setLoadingMessage(null);
    }
  };

  const chooseFile = (doc: MyApplicationDocument) => {
    uploadTargetRef.current = doc;
    fileInputRef.current?.click();
  };

  const handleFileChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const doc = uploadTargetRef.current;
    e.target.value = ""; // allow choosing the same file again
    if (!file || !doc) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      showNotice("error", "Please upload a PDF, JPG, PNG or WEBP file.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      showNotice("error", "File is too large. Maximum size is 10MB.");
      return;
    }

    try {
      setLoadingMessage(`Uploading ${doc.name}...`);
      const data = (await api.myApplication.uploadDocument(
        doc.id,
        file,
      )) as MyApplicationData;
      applyApplication(data);
      showNotice("success", `${doc.name} uploaded successfully.`);
    } catch (err: any) {
      showNotice("error", err?.message || "Upload failed. Please try again.");
    } finally {
      setLoadingMessage(null);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    if (
      !window.confirm(
        "Submit your application for review? You won't be able to change your documents until our team has reviewed them.",
      )
    ) {
      return;
    }

    // Save any unsaved detail changes first
    if (detailsChanged) {
      const saved = await saveDetails();
      if (!saved) return;
    }

    try {
      setLoadingMessage("Submitting your application...");
      await api.myApplication.submit();
      onSubmitted();
    } catch (err: any) {
      showNotice("error", err?.message || "Failed to submit. Please try again.");
    } finally {
      setLoadingMessage(null);
    }
  };

  const fieldCls =
    "w-full h-11 rounded-xl border border-[#e7ebf3] bg-white px-4 text-sm text-[#0d121b] outline-none focus:ring-2 focus:ring-[#2e4150]/20";

  return (
    <div className="min-h-screen bg-[#f2f6f9]">
      <LoadingOverlay message={loadingMessage} />
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={handleFileChosen}
      />

      {/* Top bar */}
      <header className="bg-white border-b border-[#e7ebf3] px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.webp" alt="Xpect Group" className="h-8 w-auto" />
          <span className="hidden sm:inline text-sm font-bold text-[#2e4150]">
            My Application
          </span>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#e7ebf3] text-sm font-semibold text-[#2e4150] hover:bg-[#f6f7fb]"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Log out
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        {notice && (
          <div
            className={`rounded-xl px-4 py-3 text-sm font-semibold ${
              notice.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-600 border border-red-200"
            }`}
          >
            {notice.message}
          </div>
        )}

        {/* Status banner */}
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-amber-600 text-[28px]">
              assignment_late
            </span>
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-[#0d121b]">
                Action required: please re-upload your documents
              </h1>
              <p className="mt-1 text-sm text-amber-800 leading-6">
                Hello {application.name}, our team reviewed your application and
                some documents need to be uploaded again. Upload the documents
                marked <b>Rejected</b> below, then click{" "}
                <b>Submit for review</b>.
              </p>
              {application.auditorNotes && (
                <div className="mt-4 rounded-xl bg-white/70 border border-amber-200 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                    Notes from our team
                  </p>
                  <p className="mt-1 text-sm text-[#0d121b] leading-6 whitespace-pre-line">
                    {application.auditorNotes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Documents */}
        <section className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm">
          <div className="px-5 sm:px-6 py-4 border-b border-[#e7ebf3] flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-bold text-[#0d121b]">Your Documents</h2>
            {totalToReupload > 0 && (
              <span className="text-xs font-bold text-[#4c669a]">
                {reuploadedDocs.length} of {totalToReupload} re-uploaded
              </span>
            )}
          </div>
          <ul className="divide-y divide-[#e7ebf3]">
            {application.documents.map((doc) => {
              const isRejected = doc.status === "Rejected";
              const isReuploaded = doc.status === "Pending" && !!doc.reuploadedAt;
              return (
                <li
                  key={doc.id}
                  className="px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isRejected
                          ? "bg-red-50 text-red-500"
                          : doc.status === "Verified"
                            ? "bg-green-50 text-green-600"
                            : "bg-gray-50 text-gray-500"
                      }`}
                    >
                      <span className="material-symbols-outlined">
                        {doc.type === "PDF" ? "picture_as_pdf" : "image"}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#0d121b]">
                        {doc.name}
                      </p>
                      <p className="text-xs text-[#4c669a] truncate">
                        {isReuploaded
                          ? `Re-uploaded ${formatDate(doc.reuploadedAt)} · ${doc.fileName}`
                          : doc.fileName || "No file"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:justify-end">
                    {isRejected && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-600">
                        Rejected
                      </span>
                    )}
                    {isReuploaded && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700">
                        Re-uploaded
                      </span>
                    )}
                    {doc.status === "Verified" && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-100 text-green-700">
                        Verified
                      </span>
                    )}
                    {doc.status === "Pending" && !isReuploaded && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-600">
                        Under review
                      </span>
                    )}

                    {(isRejected || isReuploaded) && (
                      <button
                        onClick={() => chooseFile(doc)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold ${
                          isRejected
                            ? "bg-[#2e4150] text-white hover:bg-[#3a5268]"
                            : "border border-[#e7ebf3] text-[#2e4150] hover:bg-[#f6f7fb]"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          upload
                        </span>
                        {isRejected ? "Re-upload" : "Replace"}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
            {application.documents.length === 0 && (
              <li className="px-6 py-8 text-center text-sm text-gray-500">
                No documents on file.
              </li>
            )}
          </ul>
          <p className="px-5 sm:px-6 py-3 text-xs text-[#6b7a99] border-t border-[#e7ebf3]">
            Accepted files: PDF, JPG, PNG or WEBP, up to 10MB.
          </p>
        </section>

        {/* Details */}
        <section className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm">
          <div className="px-5 sm:px-6 py-4 border-b border-[#e7ebf3]">
            <h2 className="text-base font-bold text-[#0d121b]">Your Details</h2>
            <p className="text-xs text-[#6b7a99] mt-0.5">
              Contact the office if your name, email or date of birth is wrong.
            </p>
          </div>
          <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#4c669a]">
                Full name
              </p>
              <p className="mt-1 text-sm font-semibold text-[#0d121b]">
                {application.name}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#4c669a]">
                Email
              </p>
              <p className="mt-1 text-sm font-semibold text-[#0d121b] break-all">
                {application.email}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#4c669a]">
                Date of birth
              </p>
              <p className="mt-1 text-sm font-semibold text-[#0d121b]">
                {formatDate(application.dob)}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#4c669a]">
                Application reference
              </p>
              <p className="mt-1 text-sm font-semibold text-[#0d121b]">
                {application.applicationRef || "—"}
              </p>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-[#4c669a]">
                Phone number
              </span>
              <input
                type="tel"
                className={fieldCls}
                value={details.phoneNumber}
                onChange={(e) =>
                  setDetails((p) => ({ ...p, phoneNumber: e.target.value }))
                }
              />
            </label>

            {application.canEditShareCode && (
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-[#4c669a]">
                  Right to work share code
                </span>
                <input
                  type="text"
                  maxLength={9}
                  className={`${fieldCls} uppercase`}
                  value={details.shareCode}
                  onChange={(e) =>
                    setDetails((p) => ({ ...p, shareCode: e.target.value }))
                  }
                />
              </label>
            )}

            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-xs font-bold uppercase tracking-wide text-[#4c669a]">
                Current address
              </span>
              <textarea
                rows={3}
                className="w-full rounded-xl border border-[#e7ebf3] bg-white px-4 py-3 text-sm text-[#0d121b] outline-none focus:ring-2 focus:ring-[#2e4150]/20"
                value={details.address}
                onChange={(e) =>
                  setDetails((p) => ({ ...p, address: e.target.value }))
                }
              />
            </label>

            {detailsError && (
              <p className="sm:col-span-2 text-sm text-red-500">{detailsError}</p>
            )}

            <div className="sm:col-span-2 flex justify-end">
              <button
                onClick={saveDetails}
                disabled={!detailsChanged}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold ${
                  detailsChanged
                    ? "bg-[#2e4150] text-white hover:bg-[#3a5268]"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                Save details
              </button>
            </div>
          </div>
        </section>

        {/* Submit */}
        <section className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <h2 className="text-base font-bold text-[#0d121b]">
              Submit for review
            </h2>
            <p className="text-sm text-[#4c669a] mt-1">
              {canSubmit
                ? "All rejected documents have been re-uploaded. Submit your application so our team can review it again."
                : `Re-upload ${rejectedDocs.length} more document${rejectedDocs.length === 1 ? "" : "s"} to submit your application.`}
            </p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold ${
              canSubmit
                ? "bg-[#34d399] text-white hover:bg-[#22c08a]"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
            Submit for review
          </button>
        </section>
      </main>
    </div>
  );
};

export default MyApplication;
