import { useState, useRef } from "react";
import ContractViewer from "./ContractViewer";
import SignatureModal from "../components/SignatureModal";
import { generateContract } from "./generateContract";
import { overlayFields as contractOverlayFields } from "../utils/overlayFields";
import { ethicsOverlayFields } from "../utils/ethicsOverlayFields";
import { downloadGeneratedContract } from "./downloadGeneratedContract";

interface EmploymentContractStepProps {
  invitation: any;
  personalDetails: any;

  contractRead: boolean;
  contractAccepted: boolean;

  setContractRead: React.Dispatch<React.SetStateAction<boolean>>;
  setContractAccepted: React.Dispatch<React.SetStateAction<boolean>>;

  ethicsRead: boolean;
  ethicsAccepted: boolean;

  setEthicsRead: React.Dispatch<React.SetStateAction<boolean>>;
  setEthicsAccepted: React.Dispatch<React.SetStateAction<boolean>>;

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

  ethicsRead,
  ethicsAccepted,
  setEthicsRead,
  setEthicsAccepted,

  validationErrors,
  displayStep,

  employeeSignature,
  setEmployeeSignature,
}: EmploymentContractStepProps) => {
  const [showSignatureModal, setShowSignatureModal] = useState(false);

  const [activeDocument, setActiveDocument] = useState<"contract" | "ethics">(
    "contract",
  );

  const [downloading, setDownloading] = useState(false);

  const documentRef = useRef<HTMLDivElement>(null);

  /*
   * ============================================================
   * OVERLAY DATA
   * ============================================================
   *
   * These values are shared by both documents.
   *
   * The overlay coordinates are different for each PDF,
   * but the actual data is the same.
   */

  // console.log("ethicsOverlayFields", ethicsOverlayFields);

  const overlayData = {
    employeeName: personalDetails?.name || "",

    employeeAddress: personalDetails?.address || "",

    contractDate: new Date().toLocaleDateString(),

    salary:
      invitation?.salaryAmount && invitation?.salaryType
        ? `${invitation.salaryType} / £${invitation.salaryAmount}`
        : "",

    Ownername: invitation?.senderName || "",

    designation: invitation?.senderDesignation || "",

    ownerDate: new Date().toLocaleDateString(),

    employeeDate: new Date().toLocaleDateString(),

    /*
     * SAME SIGNATURE IS USED FOR BOTH DOCUMENTS
     */
    employeeSignature,

    ownerSignature: null,
  };

  /*
   * ============================================================
   * ACTIVE DOCUMENT
   * ============================================================
   */

  const activePdf =
    activeDocument === "contract" ? "/contract.pdf" : "/EmployeeEthics.pdf";

  const activeOverlayFields =
    activeDocument === "contract" ? contractOverlayFields : ethicsOverlayFields;

  /*
   * ============================================================
   * DOWNLOAD CURRENT DOCUMENT
   * ============================================================
   */

  const handleDownload = async () => {
    try {
      setDownloading(true);

      const pdfBytes = await generateContract({
        pdfUrl: activePdf,

        overlayFields: activeOverlayFields,

        overlayData,

        /*
         * IMPORTANT
         *
         * This must match the coordinate system used
         * inside your overlayFields files.
         */
        previewWidth: 850,
      });

      const fileName =
        activeDocument === "contract"
          ? "EmploymentContract.pdf"
          : "EmployeeEthics.pdf";

      downloadGeneratedContract(pdfBytes, fileName);
    } catch (error) {
      console.error("Error generating document:", error);
    } finally {
      setDownloading(false);
    }
  };

  /*
   * ============================================================
   * SWITCH DOCUMENT
   * ============================================================
   */

  const handleDocumentChange = (document: "contract" | "ethics") => {
    setActiveDocument(document);
  };

  return (
    <div className="space-y-6">
      {/* ======================================================
          STEP TITLE
      ====================================================== */}

      <h2 className="text-l font-semibold border-b pb-4 uppercase tracking-wider text-gray-500 text-base">
        Step {displayStep}: Employment Documents
      </h2>

      {/* ======================================================
          INTRO
      ====================================================== */}

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex gap-4">
        <span className="material-symbols-outlined text-[#135bec] text-3xl">
          description
        </span>

        <div>
          <h3 className="font-bold text-[#2E4150]">Employment Documents</h3>

          <p className="text-sm text-gray-600 mt-1">
            Please carefully review both the Employment Contract and Employee
            Ethics document before proceeding.
          </p>
        </div>
      </div>

      {/* ======================================================
          DOCUMENT CONTAINER
      ====================================================== */}

      <div className="bg-white border border-[#e7ebf3] rounded-2xl overflow-hidden">
        {/* ====================================================
            DOCUMENT HEADER
        ==================================================== */}

        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h3 className="font-bold text-[#2E4150]">
              {activeDocument === "contract"
                ? "Employment Contract"
                : "Employee Ethics"}
            </h3>

            <p className="text-sm text-gray-500">Version 1.0</p>
          </div>

          {/* DOWNLOAD BUTTON */}

          <button
            type="button"
            disabled={downloading}
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined">download</span>

            {downloading ? "Generating..." : "Download"}
          </button>
        </div>

        {/* ====================================================
            DOCUMENT TABS
        ==================================================== */}

        <div className="flex border-b">
          {/* CONTRACT TAB */}

          <button
            type="button"
            onClick={() => handleDocumentChange("contract")}
            className={`flex-1 px-5 py-4 font-semibold transition ${
              activeDocument === "contract"
                ? "text-[#fff] border-b-2 border-[#000] bg-black"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Employment Contract
          </button>

          {/* ETHICS TAB */}

          <button
            type="button"
            onClick={() => handleDocumentChange("ethics")}
            className={`flex-1 px-5 py-4 font-semibold transition ${
              activeDocument === "ethics"
                ? "text-[#fff] border-b-2 border-[#000] bg-black"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Employee Ethics
          </button>
        </div>

        {/* ====================================================
            PDF VIEWER
        ==================================================== */}

        <ContractViewer
          ref={documentRef}
          pdfUrl={activePdf}
          invitation={invitation}
          personalDetails={personalDetails}
          employeeSignature={employeeSignature}
          overlayFields={activeOverlayFields}
        />
      </div>

      {/* ======================================================
          CONTRACT AGREEMENT
      ====================================================== */}

      {
        <div className="bg-white border border-[#e7ebf3] rounded-2xl p-6 space-y-5">
          {/* CONTRACT */}

          <div className="border-b pb-5">
            <h4 className="font-semibold text-[#2E4150] mb-4">
              Employment Contract
            </h4>

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
            </label>

            {validationErrors.contractRead && (
              <p className="mt-2 ml-8 text-sm text-red-500">
                {validationErrors.contractRead}
              </p>
            )}

            <label className="flex gap-3 items-start cursor-pointer mt-4">
              <input
                type="checkbox"
                checked={contractAccepted}
                onChange={(e) => setContractAccepted(e.target.checked)}
                className="mt-1 size-5"
              />

              <span className="text-sm font-medium">
                I agree to all terms and conditions contained within the
                Employment Contract.
              </span>
            </label>

            {validationErrors.contractAccepted && (
              <p className="mt-2 ml-8 text-sm text-red-500">
                {validationErrors.contractAccepted}
              </p>
            )}
          </div>

          {/* ETHICS */}

          <div>
            <h4 className="font-semibold text-[#2E4150] mb-4">
              Employee Ethics
            </h4>

            <label className="flex gap-3 items-start cursor-pointer">
              <input
                type="checkbox"
                checked={ethicsRead}
                onChange={(e) => setEthicsRead(e.target.checked)}
                className="mt-1 size-5"
              />

              <span className="text-sm font-medium">
                I confirm that I have read the Employee Ethics document.
              </span>
            </label>

            {validationErrors.ethicsRead && (
              <p className="mt-2 ml-8 text-sm text-red-500">
                {validationErrors.ethicsRead}
              </p>
            )}

            <label className="flex gap-3 items-start cursor-pointer mt-4">
              <input
                type="checkbox"
                checked={ethicsAccepted}
                onChange={(e) => setEthicsAccepted(e.target.checked)}
                className="mt-1 size-5"
              />

              <span className="text-sm font-medium">
                I agree to all terms and conditions contained within the
                Employee Ethics document.
              </span>
            </label>

            {validationErrors.ethicsAccepted && (
              <p className="mt-2 ml-8 text-sm text-red-500">
                {validationErrors.ethicsAccepted}
              </p>
            )}
          </div>
        </div>
      }

      {/* ======================================================
          ETHICS AGREEMENT
      ====================================================== */}

      {/* ======================================================
          DIGITAL SIGNATURE
      ====================================================== */}

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 flex flex-col items-start gap-3">
        <span className="material-symbols-outlined text-amber-600">info</span>

        <div>
          <p className="font-semibold text-amber-900">
            Digital Signature Required
          </p>

          <p className="text-sm text-amber-700 mt-1">
            Your electronic signature will be applied to both the Employment
            Contract and the Employee Ethics document.
          </p>
        </div>

        {/* ====================================================
            SIGNATURE EXISTS
        ==================================================== */}

        {employeeSignature ? (
          <div className="w-full rounded-xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-green-700">Signature Added</p>

                <p className="text-sm text-gray-500 mt-1">
                  Your signature will appear on both employment documents.
                </p>
              </div>

              <div className="flex gap-2">
                {/* REPLACE */}

                <button
                  type="button"
                  onClick={() => setShowSignatureModal(true)}
                  className="px-4 py-2 rounded-lg border"
                >
                  Replace
                </button>

                {/* REMOVE */}

                <button
                  type="button"
                  onClick={() => setEmployeeSignature(null)}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white"
                >
                  Remove
                </button>
              </div>
            </div>

            {/* SIGNATURE PREVIEW */}

            <div className="mt-4 rounded-lg border bg-white p-3 inline-block">
              <img
                src={employeeSignature}
                alt="Employee Signature"
                className="h-20 object-contain"
              />
            </div>
          </div>
        ) : (
          /* ==================================================
             SIGN BUTTON
             ================================================== */

          <button
            type="button"
            className="h-12 px-6 rounded-xl bg-black text-white hover:bg-gray-800"
            onClick={() => setShowSignatureModal(true)}
          >
            Sign Documents
          </button>
        )}

        {/* ====================================================
            SIGNATURE MODAL
        ==================================================== */}

        <SignatureModal
          open={showSignatureModal}
          onClose={() => setShowSignatureModal(false)}
          onSave={(signature) => {
            setEmployeeSignature(signature);
          }}
        />

        {/* SIGNATURE VALIDATION */}

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
