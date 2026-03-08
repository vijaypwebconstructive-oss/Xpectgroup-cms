import React from 'react';
import type { Invoice } from '../../finance-payroll/types';

interface ServiceDetailsRow {
  siteLocation?: string;
  siteType?: string;
  supervisorName?: string;
}

function toRows(sd: unknown): ServiceDetailsRow[] {
  if (!sd) return [];
  if (Array.isArray(sd)) return sd;
  return [sd as ServiceDetailsRow];
}

interface ServiceDetailsProps {
  invoice?: Invoice | null;
}

const ServiceDetails: React.FC<ServiceDetailsProps> = ({ invoice }) => {
  const rows = toRows(invoice?.serviceDetails);
  const hasRows = rows.length > 0 && rows.some(r => r.siteLocation || r.siteType || r.supervisorName);

  return (
    <div className="mt-8 p-4 bg-[#f6f7fb] rounded-xl border border-[#e7ebf3]">
      <h3 className="text-xs font-bold text-[#6b7a99] uppercase tracking-wider mb-3">Service Details</h3>
      <div className="space-y-4">
        <div>
          <p className="text-[#6b7a99]">Service Period</p>
          <p className="font-medium text-[#0d121b] mt-0.5">{invoice?.servicePeriod || '01 Jan 2026 – 31 Jan 2026'}</p>
        </div>
        {hasRows ? (
          <div className="space-y-3">
            {rows.map((row, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm p-3 bg-white rounded-lg border border-[#e7ebf3]">
                <div>
                  <p className="text-[#6b7a99]">Site Location</p>
                  <p className="font-medium text-[#0d121b] mt-0.5">{row.siteLocation || invoice?.billTo?.clientAddress || '-'}</p>
                </div>
                <div>
                  <p className="text-[#6b7a99]">Site Type</p>
                  <p className="font-medium text-[#0d121b] mt-0.5">{row.siteType || '-'}</p>
                </div>
                <div>
                  <p className="text-[#6b7a99]">Supervisor Name</p>
                  <p className="font-medium text-[#0d121b] mt-0.5">{row.supervisorName || '-'}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[#6b7a99]">Site Location</p>
              <p className="font-medium text-[#0d121b] mt-0.5">{invoice?.billTo?.clientAddress || '-'}</p>
            </div>
            <div>
              <p className="text-[#6b7a99]">Site Type</p>
              <p className="font-medium text-[#0d121b] mt-0.5">-</p>
            </div>
            <div>
              <p className="text-[#6b7a99]">Supervisor Name</p>
              <p className="font-medium text-[#0d121b] mt-0.5">-</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceDetails;
