import React, { useState, useEffect } from 'react';

export enum PayType {
  HOURLY = 'Hourly',
  WEEKLY = 'Weekly',
  MONTHLY = 'Monthly'
}

export enum ShiftType {
  MORNING = 'Morning',
  EVENING = 'Evening',
  NIGHT = 'Night'
}

export enum ContractStatus {
  ACTIVE = 'Active',
  PAUSED = 'Paused',
  ENDED = 'Ended'
}

export interface EmploymentDetails {
  hourlyPayRate?: number;
  payType?: PayType;
  workLocation?: {
    siteName: string;
    city: string;
  };
  shiftType?: ShiftType;
  contractStatus?: ContractStatus;
  startDate?: string;
  endDate?: string;
}

interface EmploymentAllocationCardProps {
  employmentDetails: EmploymentDetails;
  employmentType?: string;
  onEdit?: () => void;
  onSave?: (details: EmploymentDetails) => void;
  isEditing?: boolean;
  onCancel?: () => void;
}

const EmploymentAllocationCard: React.FC<EmploymentAllocationCardProps> = ({ 
  employmentDetails,
  employmentType,
  onEdit,
  onSave,
  isEditing = false,
  onCancel
}) => {
  const [editedDetails, setEditedDetails] = useState<EmploymentDetails>(employmentDetails);

  useEffect(() => {
    setEditedDetails(employmentDetails);
  }, [employmentDetails]);

  const {
    hourlyPayRate,
    payType,
    workLocation,
    shiftType,
    contractStatus,
    startDate,
    endDate
  } = isEditing ? editedDetails : employmentDetails;

  const handleSave = () => {
    if (onSave) {
      onSave(editedDetails);
    }
  };

  const handleCancel = () => {
    setEditedDetails(employmentDetails);
    if (onCancel) {
      onCancel();
    }
  };

  const getContractStatusColor = (status?: ContractStatus) => {
    switch (status) {
      case ContractStatus.ACTIVE:
        return 'bg-green-100 text-green-700';
      case ContractStatus.PAUSED:
        return 'bg-amber-100 text-amber-700';
      case ContractStatus.ENDED:
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white border border-[#e7ebf3] rounded-2xl overflow-hidden shadow-sm">
      <div className="px-4 sm:px-6 py-4 border-b border-[#e7ebf3] flex justify-between items-center bg-gray-50/30">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#000] text-xl">work</span>
          <h2 className="text-sm sm:text-base font-black font-bold tracking-widest text-gray-900">
            Employment & Allocation Details
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="text-[#000] text-xs font-bold cursor-pointer hover:text-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="text-[#135bec] text-xs font-bold cursor-pointer hover:text-[#0d47a1] transition-colors"
              >
                Save Changes
              </button>
            </>
          ) : (
            onEdit && (
              <button
                onClick={onEdit}
                className="text-[#000] text-xs font-bold cursor-pointer hover:text-[#135bec] transition-colors"
              >
                Edit Details
              </button>
            )
          )}
        </div>
      </div>
      
      <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
        <div>
          <p className="text-[#4c669a] text-[12px] font-black uppercase tracking-wider mb-1">
            Hourly Pay Rate
          </p>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900">£</span>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full h-10 rounded-lg border-[#e7ebf3] bg-gray-50 px-3 text-sm font-bold text-gray-900 outline-none focus:ring-[#135bec]"
                value={editedDetails.hourlyPayRate || ''}
                onChange={(e) => setEditedDetails(prev => ({ 
                  ...prev, 
                  hourlyPayRate: e.target.value ? parseFloat(e.target.value) : undefined 
                }))}
                placeholder="0.00"
              />
              <span className="text-sm font-bold text-gray-500">/ hour</span>
            </div>
          ) : (
            <p className="text-sm font-bold text-gray-900">
              {hourlyPayRate ? `$${hourlyPayRate.toFixed(2)} / hour` : 'Not provided'}
            </p>
          )}
        </div>

        <div>
          <p className="text-[#4c669a] text-[12px] font-black uppercase tracking-wider mb-1">
            Pay Type
          </p>
          {isEditing ? (
            <select
              className="w-full h-10 rounded-lg border-[#e7ebf3] bg-gray-50 px-3 text-sm font-bold text-gray-900 outline-none focus:ring-[#135bec]"
              value={editedDetails.payType || ''}
              onChange={(e) => setEditedDetails(prev => ({ 
                ...prev, 
                payType: e.target.value as PayType || undefined 
              }))}
            >
              <option value="">Select Pay Type</option>
              <option value={PayType.HOURLY}>{PayType.HOURLY}</option>
              <option value={PayType.WEEKLY}>{PayType.WEEKLY}</option>
              <option value={PayType.MONTHLY}>{PayType.MONTHLY}</option>
            </select>
          ) : (
            <p className="text-sm font-bold text-gray-900">
              {payType || 'Not provided'}
            </p>
          )}
        </div>

        <div>
          <p className="text-[#4c669a] text-[12px] font-black uppercase tracking-wider mb-1">
            Work Location
          </p>
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                className="w-full h-10 rounded-lg border-[#e7ebf3] bg-gray-50 px-3 text-sm font-bold text-gray-900 outline-none focus:ring-[#135bec]"
                placeholder="Site Name"
                value={editedDetails.workLocation?.siteName || ''}
                onChange={(e) => setEditedDetails(prev => ({ 
                  ...prev, 
                  workLocation: { 
                    siteName: e.target.value, 
                    city: prev.workLocation?.city || '' 
                  } 
                }))}
              />
              <input
                type="text"
                className="w-full h-10 rounded-lg border-[#e7ebf3] bg-gray-50 px-3 text-sm font-bold text-gray-900 outline-none focus:ring-[#135bec]"
                placeholder="City"
                value={editedDetails.workLocation?.city || ''}
                onChange={(e) => setEditedDetails(prev => ({ 
                  ...prev, 
                  workLocation: { 
                    siteName: prev.workLocation?.siteName || '', 
                    city: e.target.value 
                  } 
                }))}
              />
            </div>
          ) : (
            <p className="text-sm font-bold text-gray-900">
              {workLocation 
                ? `${workLocation.siteName}, ${workLocation.city}`
                : 'Not provided'
              }
            </p>
          )}
        </div>

        <div>
          <p className="text-[#4c669a] text-[12px] font-black uppercase tracking-wider mb-1">
            Shift Type
          </p>
          {isEditing ? (
            <select
              className="w-full h-10 rounded-lg border-[#e7ebf3] bg-gray-50 px-3 text-sm font-bold text-gray-900 outline-none focus:ring-[#135bec]"
              value={editedDetails.shiftType || ''}
              onChange={(e) => setEditedDetails(prev => ({ 
                ...prev, 
                shiftType: e.target.value as ShiftType || undefined 
              }))}
            >
              <option value="">Select Shift Type</option>
              <option value={ShiftType.MORNING}>{ShiftType.MORNING}</option>
              <option value={ShiftType.EVENING}>{ShiftType.EVENING}</option>
              <option value={ShiftType.NIGHT}>{ShiftType.NIGHT}</option>
            </select>
          ) : (
            <p className="text-sm font-bold text-gray-900">
              {shiftType || 'Not provided'}
            </p>
          )}
        </div>

        <div>
          <p className="text-[#4c669a] text-[12px] font-black uppercase tracking-wider mb-1">
            Contract Status
          </p>
          {isEditing ? (
            <select
              className="w-full h-10 rounded-lg border-[#e7ebf3] bg-gray-50 px-3 text-sm font-bold text-gray-900 outline-none focus:ring-[#135bec]"
              value={editedDetails.contractStatus || ''}
              onChange={(e) => setEditedDetails(prev => ({ 
                ...prev, 
                contractStatus: e.target.value as ContractStatus || undefined 
              }))}
            >
              <option value="">Select Status</option>
              <option value={ContractStatus.ACTIVE}>{ContractStatus.ACTIVE}</option>
              <option value={ContractStatus.PAUSED}>{ContractStatus.PAUSED}</option>
              <option value={ContractStatus.ENDED}>{ContractStatus.ENDED}</option>
            </select>
          ) : (
            contractStatus ? (
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getContractStatusColor(contractStatus)}`}>
                {contractStatus}
              </span>
            ) : (
              <p className="text-sm font-bold text-gray-900">Not provided</p>
            )
          )}
        </div>

        <div>
          <p className="text-[#4c669a] text-[12px] font-black uppercase tracking-wider mb-1">
            Start Date
          </p>
          {isEditing ? (
            <input
              type="date"
              className="w-full h-10 rounded-lg border-[#e7ebf3] bg-gray-50 px-3 text-sm font-bold text-gray-900 outline-none focus:ring-[#135bec]"
              value={editedDetails.startDate || ''}
              onChange={(e) => setEditedDetails(prev => ({ 
                ...prev, 
                startDate: e.target.value || undefined 
              }))}
            />
          ) : (
            <p className="text-sm font-bold text-gray-900">
              {startDate 
                ? new Date(startDate).toLocaleDateString('en-GB', { 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric' 
                  })
                : 'Not provided'
              }
            </p>
          )}
        </div>

        {(employmentType === 'Temporary' || employmentType === 'Contractor') && (
          <div>
            <p className="text-[#4c669a] text-[12px] font-black uppercase tracking-wider mb-1">
              End Date
            </p>
            {isEditing ? (
              <input
                type="date"
                className="w-full h-10 rounded-lg border-[#e7ebf3] bg-gray-50 px-3 text-sm font-bold text-gray-900 outline-none focus:ring-[#135bec]"
                value={editedDetails.endDate || ''}
                onChange={(e) => setEditedDetails(prev => ({
                  ...prev,
                  endDate: e.target.value || undefined
                }))}
              />
            ) : (
              <p className="text-sm font-bold text-gray-900">
                {endDate
                  ? new Date(endDate).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })
                  : 'Not provided'
                }
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmploymentAllocationCard;
