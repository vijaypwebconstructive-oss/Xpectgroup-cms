import React, { useRef } from "react";
import { Cleaner, AppView } from "../types";

interface ReportViewProps {
  cleaner: Cleaner;
  onNavigate: (view: AppView, cleaner?: Cleaner) => void;
}

const ReportView: React.FC<ReportViewProps> = ({ cleaner, onNavigate }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const complianceChecks = [
    {
      label: "Identity Check",
      meta: cleaner.documents?.find((d) =>
        d.name.toLowerCase().includes("passport"),
      )
        ? "Identity document uploaded"
        : "Identity document missing",
      icon: "badge",
      status: cleaner.documents?.some(
        (d) =>
          d.name.toLowerCase().includes("passport") && d.status === "Verified",
      )
        ? "VALID"
        : "PENDING",
    },

    {
      label: "Background Check",
      meta:
        cleaner.verificationStatus === "Verified"
          ? "Background verification complete"
          : "Background verification pending",
      icon: "security",
      status: cleaner.verificationStatus === "Verified" ? "CLEAR" : "PENDING",
    },

    {
      label: "Right To Work",
      meta:
        cleaner.shareCode || cleaner.citizenshipStatus === "UK Citizen"
          ? "Right to work confirmed"
          : "Requires RTW review",
      icon: "gavel",
      status:
        cleaner.shareCode || cleaner.citizenshipStatus === "UK Citizen"
          ? "PASS"
          : "REVIEW",
    },
  ];

  const handlePrint = () => {
    if (!reportRef.current) return;

    const printContents = reportRef.current.innerHTML;

    const originalContents = document.body.innerHTML;

    document.body.innerHTML = `
    <html>
      <head>
        <title>Compliance Report</title>

        <style>
          body {
            font-family: Arial, sans-serif;
            background: white;
            margin: 0;
            padding: 20px;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-sizing: border-box;
          }

          img {
            max-width: 100%;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          @page {
            size: A4;
            margin: 10mm;
          }
        </style>
      </head>

      <body>
        ${printContents}
      </body>
    </html>
  `;

    window.print();

    document.body.innerHTML = originalContents;

    window.location.reload();
  };
  return (
    <div className="py-6 sm:py-10 px-4 flex flex-col items-center bg-[#f6f6f8] print:min-h-0 animate-in fade-in duration-500">
      <div className="w-[210mm] w-full mb-6 flex items-center justify-between no-print flex-row gap-4">
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => onNavigate("CLEANERS_LIST")}
            className="text-[#4c669a] hover:text-[#135bec]"
          >
            Management
          </button>
          <span className="material-symbols-outlined text-sm text-[#4c669a]">
            chevron_right
          </span>
          <span className="text-[#0d121b] font-medium">Compliance Report</span>
        </div>
        <div className="flex gap-2 ">
          <button
            onClick={() => {
              handlePrint();
            }}
            className="flex items-center gap-2 bg-[#2e4150] text-white px-4 py-2 rounded-full h-10 sm:h-12 text-sm font-bold hover:bg-[#2e4150]/90 transition-all"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Download PDF
          </button>
          {/* <button
            onClick={() => window.print()}
            className="flex items-center gap-2 h-10 sm:h-12 bg-white border border-[#e7ebf3] px-[30px] py-[15px] rounded-full text-sm font-bold hover:bg-gray-50 transition-all"
          >
            <span className="material-symbols-outlined text-sm">print</span>
            Print
          </button> */}
        </div>
      </div>

      <div
        ref={reportRef}
        className="w-full max-w-[800px] bg-white shadow-2xl rounded-2xl print:break-inside-avoid p-4 sm:p-8 relative overflow-hidden border border-gray-100 print:p-5 print:shadow-none print:border-none"
      >
        {" "}
        <div className="absolute top-20 right-[-40px] rotate-[35deg] opacity-[0.03] pointer-events-none select-none">
          <p className="text-[140px] font-black leading-none">VERIFIED</p>
        </div>
        <div className="flex justify-between flex-col sm:flex-row items-start border-b border-[#e7ebf3] pb-4 sm:pb-8 mb-4 sm:mb-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#000]">
              <span className="material-symbols-outlined text-3xl font-bold">
                verified_user
              </span>
              <h1 className="text-2xl font-black  font-bold">
                Staff Verification Report
              </h1>
            </div>
            <p className="text-[#4c669a] text-[14px] font-medium ">
              Official Document | Internal Compliance Record
            </p>
            <div className="mt-0 sm:mt-2 flex gap-4 text-[12px] sm:text-[14px] font-mono uppercase text-[#4c669a]">
              <span>Report ID: {cleaner.id}</span>
              <span>Generated: {new Date().toLocaleDateString("en-GB")}</span>
            </div>
          </div>
          <div className="text-right mt-2 sm:mt-0">
            <div
              className={`px-4 py-1 rounded-full text-[10px] font-black mb-2 sm:mb-4 inline-block tracking-wider border ${
                cleaner.verificationStatus === "Verified"
                  ? "bg-green-100 text-green-700 border-green-500"
                  : cleaner.verificationStatus === "Pending"
                    ? "bg-amber-100 text-amber-700 border-amber-500"
                    : "bg-red-100 text-red-700 border-red-500"
              }`}
            >
              COMPLIANCE STATUS: {cleaner.verificationStatus}
            </div>
            {/* <div className="h-12 w-32 bg-[#f0f2f5] rounded-xl flex items-center justify-center border border-dashed border-gray-300">
              <span className="text-[10px] text-gray-400 font-mono font-bold uppercase">Xpect Group</span>
            </div> */}
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4 mb-4 sm:mb-10 ">
          <div className="size-24 rounded-2xl border-4 border-white shadow-xl overflow-hidden flex-shrink-0">
            <img
              src={cleaner.avatar}
              alt={cleaner.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <div className="col-span-2">
              <h2 className="text-xl sm:text-3xl font-bold font-black text-[#0d121b] tracking-tight">
                {cleaner.name}
              </h2>
              <p className="text-[#34d399] font-bold">Verified Professional</p>
            </div>
            <div>
              <p className="text-[10px] text-[#4c669a] uppercase font-bold tracking-wider mb-0.5">
                Location
              </p>
              <p className="text-sm font-bold">{cleaner.location}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#4c669a] uppercase font-bold tracking-wider mb-0.5">
                Email Address
              </p>
              <p className="text-sm font-bold">{cleaner.email}</p>
            </div>
          </div>
        </div>
        <div className="mb-4 print:mb-3">
          <h3 className="text-[14px] sm:text-[16px] font-black uppercase tracking-[0.2em] text-[#4c669a] border-b border-[#e7ebf3] pb-2 mb-6">
            Compliance Checklist
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {complianceChecks.map((check) => (
              <div
                key={check.label}
                className="border border-[#e7ebf3] rounded-2xl p-4 bg-[#f8f9fc]"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="material-symbols-outlined text-[#2e4150]">
                    {check.icon}
                  </span>
                  <span className="text-[9px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-black tracking-wider">
                    {check.status}
                  </span>
                </div>
                <p className="text-[14px] font-bold sm:text-[14px] font-black mb-1">
                  {check.label}
                </p>
                <p className="text-[14px] sm:text-[16px] text-[#4c669a] font-medium">
                  {check.meta}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#4c669a] border-b border-[#e7ebf3] pb-2 mb-4">
            Verified Documentation
          </h3>
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[10px] uppercase text-[#4c669a] tracking-widest font-black">
                <th className="p-3 border-b border-[#e7ebf3]">Document Type</th>
                <th className="p-3 border-b border-[#e7ebf3]">
                  Verification Date
                </th>
                <th className="p-3 border-b border-[#e7ebf3]">Expiry</th>
              </tr>
            </thead>
            <tbody className="font-medium text-xs">
              {(cleaner.documents || []).map((doc) => (
                <tr key={doc.id} className="border-b border-[#e7ebf3]">
                  <td className="p-3">{doc.name}</td>

                  <td className="p-3">
                    {new Date(doc.uploadDate).toLocaleDateString("en-GB")}
                  </td>

                  <td className="p-3">
                    <span
                      className={`font-bold ${
                        doc.status === "Verified"
                          ? "text-green-600"
                          : doc.status === "Rejected"
                            ? "text-red-500"
                            : "text-amber-500"
                      }`}
                    >
                      {doc.status}
                    </span>
                  </td>
                </tr>
              ))}
              {(!cleaner.documents || cleaner.documents.length === 0) && (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-gray-400">
                    No documents uploaded
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-end mt-4 sm:mt-6 flex-col sm:flex-row">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-green-600 text-base">
                check_circle
              </span>
              <p className="text-[11px] font-black uppercase tracking-wider">
                Electronically Signed by Auditor
              </p>
            </div>
            <div className="pt-2">
              <p className="text-lg font-serif italic border-b border-gray-300 pb-2 px-2">
                ZAIN
              </p>
              <p className="text-[9px] text-[#4c669a] font-bold uppercase tracking-widest mt-1">
                Compliance Lead (AUD-44)
              </p>
            </div>
          </div>
          <div className="text-right border-2 border-[#135bec]/40 rounded-xl p-4 mx-auto sm:mx-0 mt-4 sm:mt-0 text-[#135bec] rotate-[-2deg] bg-white shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="material-symbols-outlined font-bold">
                verified
              </span>
              <p className="text-xl font-black tracking-tighter uppercase leading-none">
                Verified OK
              </p>
            </div>
            <p className="text-[9px] font-mono font-black leading-none uppercase tracking-widest">
              XPECT GROUP QUALITY CONTROL
            </p>
            <p className="text-[8px] font-mono leading-none mt-1 uppercase opacity-70">
              {new Date().toLocaleString("en-GB")}
            </p>
          </div>
        </div>
        <footer className="mt-8 sm:mt-10pt-6 pt-4 sm:pt-6 border-t border-[#e7ebf3] text-center">
          <p className="text-[12px] text-[#4c669a] font-bold font-black">
            Confidential - Xpect Group Ltd
          </p>
          <p className="text-[10px] text-[#4c669a] mt-2 max-w-md mx-auto opacity-70 leading-relaxed font-medium">
            This document is a digital representation of the verified onboarding
            record. For verification, visit portal.xpectgroup.com/verify
          </p>
        </footer>
      </div>

      <div className="mt-8 flex gap-4 no-print">
        <button
          onClick={() => onNavigate("CLEANERS_LIST")}
          className="bg-white border border-[#e7ebf3] text-[#0d121b] px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-50 transition-colors"
        >
          Return to List
        </button>
        <button
          onClick={() => onNavigate("CLEANER_DETAIL", cleaner)}
          className="bg-[#2e4150] text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-[#2e4150]/90 transition-all"
        >
          Update Compliance
        </button>
      </div>
      <style>
        {`
    @media print {
      @page {
        size: A4;
        margin: 10mm;
      }

      body {
        background: white !important;
      }

      html,
      body {
        height: auto !important;
      }

      .no-print {
        display: none !important;
      }

      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  `}
      </style>
    </div>
  );
};

export default ReportView;
