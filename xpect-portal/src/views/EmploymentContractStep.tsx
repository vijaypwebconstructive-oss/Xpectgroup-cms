import { useState, useRef, useEffect, forwardRef } from "react";
import ContractViewer from "./ContractViewer";
import SignatureModal from "../components/SignatureModal";
import { downloadContract } from "./downloadContract";
import { generateContract } from "./generateContract";
import { overlayFields } from "../utils/overlayFields";
import { downloadGeneratedContract } from "./downloadGeneratedContract";

interface EmploymentContractStepProps {
  invitation: any;

  personalDetails: any;

  contractRead: boolean;
  contractAccepted: boolean;

  setContractRead: React.Dispatch<React.SetStateAction<boolean>>;
  setContractAccepted: React.Dispatch<React.SetStateAction<boolean>>;

  validationErrors: Record<string, string>;

  displayStep: number;
  employeeSignature: string | null;

  setEmployeeSignature: React.Dispatch<React.SetStateAction<string | null>>;
}

const EmploymentContractStep = ({
  invitation,
  personalDetails,
  contractRead,
  contractAccepted,
  setContractRead,
  setContractAccepted,
  validationErrors,
  displayStep,
  employeeSignature,
  setEmployeeSignature,
}: EmploymentContractStepProps) => {
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const contractRef = useRef<HTMLDivElement>(null);

  const overlayData = {
    employeeName: personalDetails?.name || "",

    employeeAddress: personalDetails?.address || "",

    contractDate: new Date().toLocaleDateString(),

    salary:
      invitation?.salaryAmount && invitation?.salaryType
        ? `  ${invitation.salaryType} / £${invitation.salaryAmount}`
        : "",

    Ownername: invitation?.senderName || "",

    designation: invitation?.senderDesignation || "",

    ownerDate: new Date().toLocaleDateString(),

    employeeDate: new Date().toLocaleDateString(),
    employeeSignature,
    ownerSignature: null,
  };

  return (
    <div className="space-y-6">
      <h2 className="text-l font-semibold border-b pb-4 uppercase tracking-wider text-gray-500 text-base">
        Step {displayStep}: Employment Contract
      </h2>

      {/* Intro */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex gap-4">
        <span className="material-symbols-outlined text-[#135bec] text-3xl">
          description
        </span>

        <div>
          <h3 className="font-bold text-[#2E4150]">Employment Contract</h3>

          <p className="text-sm text-gray-600 mt-1">
            Please carefully review the employment contract before proceeding.
            You must read and accept the contract before joining Xpect Group.
          </p>
        </div>
      </div>

      {/* Contract Viewer */}

      <div className="bg-white border border-[#e7ebf3] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h3 className="font-bold text-[#2E4150]">Employment Contract</h3>

            <p className="text-sm text-gray-500">Version 1.0</p>
          </div>

          <button
            disabled={downloading}
            onClick={async () => {
              if (!contractRef.current) return;

              try {
                setDownloading(true);

                const pdfBytes = await generateContract({
                  pdfUrl: "/contract.pdf",
                  overlayFields,
                  overlayData,
                  previewWidth: 850,
                });

                downloadGeneratedContract(pdfBytes);
              } finally {
                setDownloading(false);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border hover:bg-gray-50"
          >
            <span className="material-symbols-outlined">download</span>
            {downloading && (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {downloading ? "Generating..." : "Download"}
          </button>
        </div>

        <ContractViewer
          ref={contractRef}
          pdfUrl="/contract.pdf"
          invitation={invitation}
          personalDetails={personalDetails}
          employeeSignature={employeeSignature}
        />
      </div>

      {/* Agreement */}

      <div className="bg-white border border-[#e7ebf3] rounded-2xl p-6 space-y-5">
        <label className="flex gap-3 items-start cursor-pointer">
          <input
            type="checkbox"
            checked={contractRead}
            onChange={(e) => setContractRead(e.target.checked)}
            className="mt-1 size-5"
          />

          <span className="text-sm font-medium">
            I confirm that I have read the Employment Contract.
          </span>
          {validationErrors.contractRead && (
            <p className="text-sm text-red-500">
              {validationErrors.contractRead}
            </p>
          )}
        </label>

        <label className="flex gap-3 items-start cursor-pointer">
          <input
            type="checkbox"
            checked={contractAccepted}
            onChange={(e) => setContractAccepted(e.target.checked)}
            className="mt-1 size-5"
          />

          <span className="text-sm font-medium">
            I agree to all terms and conditions contained within this Employment
            Contract.
          </span>

          {validationErrors.contractAccepted && (
            <p className="text-sm text-red-500">
              {validationErrors.contractAccepted}
            </p>
          )}
        </label>
      </div>

      {/* Information */}

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 flex flex-col items-start gap-3">
        <span className="material-symbols-outlined text-amber-600">info</span>

        <div>
          <p className="font-semibold text-amber-900">
            Digital Signature Required
          </p>

          <p className="text-sm text-amber-700 mt-1">
            On the next screen you will provide your electronic signature. Once
            signed, your contract cannot be modified.
          </p>
        </div>

        {employeeSignature ? (
          <div className="w-full rounded-xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-green-700">Signature Added</p>

                <p className="text-sm text-gray-500 mt-1">
                  Your signature will appear on the employment contract.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowSignatureModal(true)}
                  className="px-4 py-2 rounded-lg border"
                >
                  Replace
                </button>

                <button
                  onClick={() => setEmployeeSignature(null)}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white"
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="mt-4 rounded-lg border bg-white p-3 inline-block">
              <img
                src={employeeSignature}
                alt="Employee Signature"
                className="h-20 object-contain"
              />
            </div>
          </div>
        ) : (
          <button
            className="h-12 px-6 rounded-xl bg-black text-white"
            onClick={() => setShowSignatureModal(true)}
          >
            Sign Contract
          </button>
        )}
        <SignatureModal
          open={showSignatureModal}
          onClose={() => setShowSignatureModal(false)}
          onSave={(signature) => {
            setEmployeeSignature(signature);
          }}
        />
        {validationErrors.employeeSignature && (
          <p className="mt-2 text-sm text-red-500">
            {validationErrors.employeeSignature}
          </p>
        )}
      </div>
    </div>
  );
};

export default EmploymentContractStep;
