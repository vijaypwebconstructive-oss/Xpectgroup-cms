import { X } from "lucide-react";
import { useState } from "react";
import DrawSignature from "./DrawSignature";
import UploadSignature from "./UploadSignature";

interface SignatureModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (signature: string) => void;
}

export default function SignatureModal({
  open,
  onClose,
  onSave,
}: SignatureModalProps) {
  if (!open) return null;
  const [signature, setSignature] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"draw" | "upload">("draw");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center ">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden px-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 ">
          <h2 className="text-lg font-semibold text-gray-900">
            Create your signature
          </h2>

          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-gray-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 rounded-lg border overflow-hidden ">
          <button
            onClick={() => setActiveTab("draw")}
            className={`py-2 font-medium transition ${
              activeTab === "draw"
                ? "bg-black text-white"
                : "bg-white text-gray-700"
            }`}
          >
            Draw
          </button>

          <button
            onClick={() => setActiveTab("upload")}
            className={`py-2 font-medium transition ${
              activeTab === "upload"
                ? "bg-black text-white"
                : "bg-white text-gray-700"
            }`}
          >
            Upload
          </button>
        </div>

        {/* Body */}
        <div className="py-10">
          <div className="rounded-xl h-56 flex items-center justify-center">
            {activeTab === "draw" ? (
              <DrawSignature onSave={setSignature} />
            ) : (
              <UploadSignature onSave={setSignature} />
            )}
          </div>
        </div>

        {signature && (
          <div className="mt-5 rounded-xl border p-4">
            <p className="font-medium mb-3">Preview</p>

            <img
              src={signature}
              alt="Signature"
              className="h-24 object-contain"
            />
          </div>
        )}

        {/* Footer */}
        <div className="px-0 pb-6 pt-6 flex justify-between gap-3 w-full">
          <button
            onClick={onClose}
            className="rounded-lg border px-5 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Discard
          </button>

          <button
            disabled={!signature}
            onClick={() => {
              if (!signature) return;

              onSave(signature);

              onClose();
            }}
            className={`px-5 py-2 rounded-lg text-white transition ${
              signature
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Continue to signing
          </button>
        </div>
      </div>
    </div>
  );
}
