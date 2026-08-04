import React, { useState } from "react";

interface SendInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (
    name: string,
    email: string,
    senderName: string,
    senderDesignation: string,
    salaryType: string,
    salaryAmount: number,
  ) => void;
}
const SendInviteModal: React.FC<SendInviteModalProps> = ({
  isOpen,
  onClose,
  onSend,
}) => {
  const [employeeName, setEmployeeName] = useState("");
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderDesignation, setSenderDesignation] = useState("");
  const [salaryType, setSalaryType] = useState("Monthly");
  const [salaryAmount, setSalaryAmount] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    senderName?: string;
    senderDesignation?: string;
    salaryType?: string;
    salaryAmount?: string;
  }>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; email?: string } = {};

    if (!employeeName.trim()) {
      newErrors.name = "Employee name is required";
    }
    if (!salaryType) {
      newErrors.salaryType = "Salary type is required";
    }

    if (!salaryAmount.trim()) {
      newErrors.salaryAmount = "Salary amount is required";
    } else if (Number(salaryAmount) <= 0) {
      newErrors.salaryAmount = "Salary amount must be greater than 0";
    }

    if (!employeeEmail.trim()) {
      newErrors.email = "Employee email is required";
    } else if (!validateEmail(employeeEmail)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!senderName.trim()) {
      newErrors.senderName = "Sender name is required";
    }

    if (!senderDesignation.trim()) {
      newErrors.senderDesignation = "Designation is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSend(
      employeeName.trim(),
      employeeEmail.trim(),
      senderName.trim(),
      senderDesignation.trim(),
      salaryType,
      Number(salaryAmount),
    );
    setEmployeeName("");
    setEmployeeEmail("");
    setSalaryType("Monthly");
    setSalaryAmount("");
    setErrors({});
    onClose();
  };

  const handleClose = () => {
    setEmployeeName("");
    setEmployeeEmail("");
    setSenderName("");
    setSenderDesignation("");
    setSalaryType("Monthly");
    setSalaryAmount("");
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-[#0d121b]">Send Invitation</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-gray-400">
              close
            </span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className=" grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-[#0d121b] mb-2">
              Employee Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={employeeName}
              onChange={(e) => {
                setEmployeeName(e.target.value);
                if (errors.name)
                  setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              className={`w-full h-12 rounded-lg border px-4 text-sm font-semibold outline-none transition-colors ${
                errors.name
                  ? "border-red-500 bg-red-50"
                  : "border-[#e7ebf3] bg-[#f6f6f8] focus:border-[#2e4150]"
              }`}
              placeholder="Enter employee name"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-[#0d121b] mb-2">
              Employee Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={employeeEmail}
              onChange={(e) => {
                setEmployeeEmail(e.target.value);
                if (errors.email)
                  setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              className={`w-full h-12 rounded-lg border px-4 text-sm font-semibold outline-none transition-colors ${
                errors.email
                  ? "border-red-500 bg-red-50"
                  : "border-[#e7ebf3] bg-[#f6f6f8] focus:border-[#2e4150]"
              }`}
              placeholder="employee@example.com"
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-[#0d121b] mb-2">
              Invitation Sender Name <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              value={senderName}
              onChange={(e) => {
                setSenderName(e.target.value);

                if (errors.senderName) {
                  setErrors((prev) => ({
                    ...prev,
                    senderName: undefined,
                  }));
                }
              }}
              className={`w-full h-12 rounded-lg border px-4 text-sm font-semibold outline-none transition-colors ${
                errors.senderName
                  ? "border-red-500 bg-red-50"
                  : "border-[#e7ebf3] bg-[#f6f6f8] focus:border-[#2e4150]"
              }`}
              placeholder="John Smith"
            />

            {errors.senderName && (
              <p className="text-sm text-red-500 mt-1">{errors.senderName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-[#0d121b] mb-2">
              Designation <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              value={senderDesignation}
              onChange={(e) => {
                setSenderDesignation(e.target.value);

                if (errors.senderDesignation) {
                  setErrors((prev) => ({
                    ...prev,
                    senderDesignation: undefined,
                  }));
                }
              }}
              className={`w-full h-12 rounded-lg border px-4 text-sm font-semibold outline-none transition-colors ${
                errors.senderDesignation
                  ? "border-red-500 bg-red-50"
                  : "border-[#e7ebf3] bg-[#f6f6f8] focus:border-[#2e4150]"
              }`}
              placeholder="HR Manager"
            />

            {errors.senderDesignation && (
              <p className="text-sm text-red-500 mt-1">
                {errors.senderDesignation}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-[#0d121b] mb-2">
              Salary Type <span className="text-red-500">*</span>
            </label>

            <select
              value={salaryType}
              onChange={(e) => {
                setSalaryType(e.target.value);

                if (errors.salaryType) {
                  setErrors((prev) => ({
                    ...prev,
                    salaryType: undefined,
                  }));
                }
              }}
              className={`w-full h-12 rounded-lg border px-4 text-sm font-semibold outline-none transition-colors ${
                errors.salaryType
                  ? "border-red-500 bg-red-50"
                  : "border-[#e7ebf3] bg-[#f6f6f8] focus:border-[#2e4150]"
              }`}
            >
              <option value="">Select Salary Type</option>
              <option value="Hourly">Hourly</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>

            {errors.salaryType && (
              <p className="text-sm text-red-500 mt-1">{errors.salaryType}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-[#0d121b] mb-2">
              Salary Amount (€) <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                €
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                value={salaryAmount}
                onChange={(e) => {
                  setSalaryAmount(e.target.value);

                  if (errors.salaryAmount) {
                    setErrors((prev) => ({
                      ...prev,
                      salaryAmount: undefined,
                    }));
                  }
                }}
                className={`w-full h-12 pl-10 pr-4 rounded-lg border text-sm font-semibold outline-none transition-colors ${
                  errors.salaryAmount
                    ? "border-red-500 bg-red-50"
                    : "border-[#e7ebf3] bg-[#f6f6f8] focus:border-[#2e4150]"
                }`}
                placeholder="2500"
              />
            </div>

            {errors.salaryAmount && (
              <p className="text-sm text-red-500 mt-1">{errors.salaryAmount}</p>
            )}
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-full h-12 mt-2.5 rounded-full border border-gray-300 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className=" w-full h-12 mt-2.5 rounded-full bg-[#2e4150] text-white text-sm font-bold hover:bg-[#2e4150]/90 transition-colors"
          >
            Send Invitation
          </button>
        </form>
      </div>
    </div>
  );
};

export default SendInviteModal;
