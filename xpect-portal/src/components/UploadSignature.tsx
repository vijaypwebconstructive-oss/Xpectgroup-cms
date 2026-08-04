import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";

interface UploadSignatureProps {
  onSave: (image: string | null) => void;
}

export default function UploadSignature({ onSave }: UploadSignatureProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      if (!file) return;

      const reader = new FileReader();

      reader.onload = () => {
        onSave(reader.result as string);
      };

      reader.readAsDataURL(file);
    },
    [onSave],
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "image/png": [],
      "image/jpeg": [],
      "image/jpg": [],
    },
  });

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed border-blue-500 rounded-xl h-56 cursor-pointer hover:bg-blue-50 transition flex flex-col items-center justify-center"
    >
      <input {...getInputProps()} />

      <UploadCloud size={50} className="text-blue-500 mb-4" />

      <p className="font-medium text-gray-700">Drag and drop or click</p>

      <p className="text-blue-600 text-sm mt-1">Browse files</p>
    </div>
  );
}
