import React from 'react';

interface EmployeeInfo {
  employeeId: string;
  employeeName: string;
  department: string;
  jobTitle: string;
  employmentType: string;
  payRateDisplay: string;
  niNumber: string;
  taxCode: string;
}

export interface CleanerOption {
  id: string;
  name: string;
  email?: string;
  hourlyPayRate?: number;
  monthlySalary?: number;
  payType?: 'Hourly' | 'Weekly' | 'Monthly';
  employmentType?: string;
  location?: string;
}

interface Props {
  value: EmployeeInfo;
  onChange: (v: Partial<EmployeeInfo>) => void;
  cleaners?: CleanerOption[];
  onCleanerSelect?: (cleaner: CleanerOption) => void;
}

const inputCls = 'w-full px-3 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] placeholder:text-[#6b7a99] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20';

const EmployeeInformationForm: React.FC<Props> = ({ value, onChange, cleaners = [], onCleanerSelect }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold text-[#6b7a99] uppercase tracking-wide">Employee Information</h2>
      <div>
        <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Employee Name <span className="text-red-500">*</span></label>
        {cleaners.length > 0 ? (
          <select
            value={value.employeeId || ''}
            onChange={e => {
              const id = e.target.value;
              const cleaner = cleaners.find(c => c.id === id);
              if (cleaner && onCleanerSelect) {
                onCleanerSelect(cleaner);
              } else if (!id) {
                onChange({
                  employeeId: '',
                  employeeName: '',
                  department: '',
                  jobTitle: '',
                  employmentType: '',
                  payRateDisplay: '',
                });
              }
            }}
            className={inputCls}
          >
            <option value="">-- Select employee --</option>
            {cleaners.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        ) : (
          <p className="text-sm text-[#6b7a99] py-2">No staff available. Add employees in the Staff module first.</p>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Employee ID</label>
          <input
            type="text"
            value={value.employeeId}
            onChange={e => onChange({ employeeId: e.target.value })}
            className={inputCls}
            placeholder="Auto-filled when employee selected"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Department</label>
          <input
            type="text"
            value={value.department}
            onChange={e => onChange({ department: e.target.value })}
            className={inputCls}
            placeholder="Cleaning Operations"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Job Title</label>
          <input
            type="text"
            value={value.jobTitle}
            onChange={e => onChange({ jobTitle: e.target.value })}
            className={inputCls}
            placeholder="Cleaner"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Employment Type</label>
          <input
            type="text"
            value={value.employmentType}
            onChange={e => onChange({ employmentType: e.target.value })}
            className={inputCls}
            placeholder="Permanent / Contractor"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Pay Rate</label>
          <input
            type="text"
            value={value.payRateDisplay}
            onChange={e => onChange({ payRateDisplay: e.target.value })}
            className={inputCls}
            placeholder="£12.50/hr or £2000/month"
          />
        </div>
        <div />
        <div>
          <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">National Insurance Number</label>
          <input
            type="text"
            value={value.niNumber}
            onChange={e => onChange({ niNumber: e.target.value })}
            className={inputCls}
            placeholder="QQ123456C"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Tax Code</label>
          <input
            type="text"
            value={value.taxCode}
            onChange={e => onChange({ taxCode: e.target.value })}
            className={inputCls}
            placeholder="1257L"
          />
        </div>
      </div>
    </div>
  );
};

export default EmployeeInformationForm;
