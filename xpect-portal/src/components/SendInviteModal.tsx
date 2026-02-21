import React, { useState } from 'react';

interface SendInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (name: string, email: string) => void;
}

const SendInviteModal: React.FC<SendInviteModalProps> = ({ isOpen, onClose, onSend }) => {
  const [employeeName, setEmployeeName] = useState('');
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; email?: string } = {};

    if (!employeeName.trim()) {
      newErrors.name = 'Employee name is required';
    }

    if (!employeeEmail.trim()) {
      newErrors.email = 'Employee email is required';
    } else if (!validateEmail(employeeEmail)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSend(employeeName.trim(), employeeEmail.trim());
    setEmployeeName('');
    setEmployeeEmail('');
    setErrors({});
    onClose();
  };

  const handleClose = () => {
    setEmployeeName('');
    setEmployeeEmail('');
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
            <span className="material-symbols-outlined text-gray-400">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#0d121b] mb-2">
              Employee Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={employeeName}
              onChange={(e) => {
                setEmployeeName(e.target.value);
                if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
              }}
              className={`w-full h-12 rounded-lg border px-4 text-sm font-semibold outline-none transition-colors ${
                errors.name ? 'border-red-500 bg-red-50' : 'border-[#e7ebf3] bg-[#f6f6f8] focus:border-[#2e4150]'
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
                if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
              }}
              className={`w-full h-12 rounded-lg border px-4 text-sm font-semibold outline-none transition-colors ${
                errors.email ? 'border-red-500 bg-red-50' : 'border-[#e7ebf3] bg-[#f6f6f8] focus:border-[#2e4150]'
              }`}
              placeholder="employee@example.com"
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 h-12 rounded-full border border-gray-300 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-12 rounded-full bg-[#2e4150] text-white text-sm font-bold hover:bg-[#2e4150]/90 transition-colors"
            >
              Send Invitation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendInviteModal;
