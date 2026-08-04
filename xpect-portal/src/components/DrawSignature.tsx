import { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";

interface DrawSignatureProps {
  onSave: (signature: string | null) => void;
}

export default function DrawSignature({ onSave }: DrawSignatureProps) {
  const signatureRef = useRef<SignatureCanvas>(null);

  const clearSignature = () => {
    signatureRef.current?.clear();
    onSave(null);
  };

  const saveSignature = () => {
    if (!signatureRef.current) return;

    if (signatureRef.current.isEmpty()) {
      alert("Please draw your signature.");
      return;
    }

    const image = signatureRef.current.getCanvas().toDataURL("image/png");

    onSave(image);
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-blue-500 rounded-xl overflow-hidden">
        <SignatureCanvas
          ref={signatureRef}
          penColor="black"
          canvasProps={{
            width: 450,
            height: 220,
            className: "w-full bg-white",
          }}
        />
      </div>

      <div className="flex justify-between">
        <button
          onClick={clearSignature}
          className="px-5 py-2 rounded-lg border hover:bg-gray-100"
        >
          Clear
        </button>

        <button
          onClick={saveSignature}
          className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Preview Signature
        </button>
      </div>
    </div>
  );
}
