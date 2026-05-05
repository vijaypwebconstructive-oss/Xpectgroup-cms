import React, { useEffect, useState } from "react";
import api from "../../../services/api";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

interface Employee {
  id: string;
  name: string;
}

const UploadPayslipModal: React.FC<Props> = ({ onClose, onSuccess }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [date, setDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [cleaners, setCleaners] = useState([]);
  console.log("cleaner", cleaners);

  // 🔹 Fetch employees
  useEffect(() => {
    api.cleaners.getAll().then((list: any) => {
      const mapped = list
        .filter((c) => (c.onboardingProgress ?? 0) === 100)
        .map((c) => ({
          id: c.id,
          name: c.name,
        }));

      setCleaners(mapped);
    });
  }, []);

  const handleSubmit = async () => {
    if (!employeeId || !date || !file) {
      return alert("All fields are required");
    }

    if (file.type !== "application/pdf") {
      return alert("Only PDF allowed");
    }

    const formData = new FormData();
    formData.append("employeeId", employeeId);
    formData.append("date", date);
    formData.append("file", file);

    try {
      setLoading(true);

      await api.finance.salarySlips.upload(formData);

      await onSuccess();
      onClose();
    } catch (err: any) {
      console.error("UPLOAD ERROR:", err);

      alert(err?.message || err?.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      {/* Modal */}
      <div className="bg-white rounded-xl w-full max-w-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e7ebf3]">
          <h2 className="text-lg font-bold">Add Payroll Slip</h2>
          <button onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Employee Dropdown */}
          <div>
            <label className="text-sm font-medium">
              Employee <span className="text-red-500">*</span>
            </label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full h-10 px-3 border rounded-lg bg-[#f6f7fb] border-[#e7ebf3] outline-none"
            >
              <option value="">Select employee</option>

              {cleaners.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="text-sm font-medium">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="month"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full mt-1 h-10 px-3 border border-[#e7ebf3] rounded-lg bg-[#f6f7fb] outline-none"
            />
          </div>

          {/* Upload */}
          <div>
            <label className="text-sm font-medium">
              Upload Payslip <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full mt-1"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#e7ebf3]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-[#4c669a]"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-[#2e4150] text-white flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            {loading ? "Uploading..." : "Add Payroll"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadPayslipModal;
