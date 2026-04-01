import React, { useState } from 'react';
import api from '../../../services/api';
import { financeNavigate } from '../financeNavStore';

const PayslipUploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [employeeId, setEmployeeId] = useState('');
  const [period, setPeriod] = useState('');

  const handleSubmit = async () => {
    if (!file) {
      alert("Please upload a PDF");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('employeeId', employeeId);
    formData.append('period', period);

    try {
      await api.finance.salarySlips.upload(formData);
      alert("Payslip uploaded successfully");
      financeNavigate('payroll-list');
    } catch (err) {
      alert("Upload failed");
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Upload Payslip</h2>

      <input
        className="border p-2 w-full"
        placeholder="Employee ID"
        value={employeeId}
        onChange={(e) => setEmployeeId(e.target.value)}
      />

      <input
        className="border p-2 w-full"
        placeholder="Period (Mar 2026)"
        value={period}
        onChange={(e) => setPeriod(e.target.value)}
      />

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button
        onClick={handleSubmit}
        className="bg-[#2e4150] text-white px-4 py-2 rounded"
      >
        Upload
      </button>
    </div>
  );
};

export default PayslipUploadPage;