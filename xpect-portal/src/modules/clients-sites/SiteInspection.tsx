import React, { useState, useEffect } from 'react';
import { useInspection } from '../../context/InspectionContext';

interface Inspection {
    id: string;
    siteName: string;
    inspector: string;
    date: string;
    issues: number;
    status: 'PASS' | 'FAIL';
  }

  interface Props {
    onView: (id: string) => void;
    onCreate: () => void;
  }

  
const SiteInspection: React.FC<Props> = ({onView,onCreate}) => {
//   const [inspections, setInspections] = useState<Inspection[]>([]);
const [statusFilter, setStatusFilter] = useState('ALL');
const [monthFilter, setMonthFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const { inspections } = useInspection();
  console.log(inspections)

  

  const filtered = inspections.filter(i => {
    const matchesSearch = i.siteName
      ?.toLowerCase()
      .includes(search.toLowerCase());
  
    const matchesStatus =
      statusFilter === 'ALL' || i.status === statusFilter;
  
    const matchesMonth =
      monthFilter === 'ALL' ||
      new Date(i.date).getMonth() === Number(monthFilter);
  
    return matchesSearch && matchesStatus && matchesMonth;
  });

  const total = filtered.length;

const passed = filtered.filter(i => i.status === 'Pass').length;

const failed = filtered.filter(i => i.status === 'Fail').length;

  return (
    <div className="space-y-6">

      {/* 🔷 STATS (Copied pattern) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Inspections', value: total, icon: 'fact_check', color: 'text-[#2e4150]' },
          { label: 'Passed', value: passed, icon: 'check_circle', color: 'text-green-600' },
          { label: 'Failed', value: failed, icon: 'cancel', color: 'text-red-600' },
          { label: 'Compliance Rate', value: `${total ? ((passed/total)*100).toFixed(0) : 0}%`, icon: 'analytics', color: 'text-[#2e4150]' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm p-3 sm:p-4 flex flex-col gap-3 items-start justify-left">
            <span className={`material-symbols-outlined text-[22px] sm:text-[30px] p-2 sm:p-3 bg-[#f2f6f9] rounded-[12px] ${s.color}`}>
              {s.icon}
            </span>
            <p className="text-xs font-bold text-[#4c669a] uppercase">{s.label}</p>
            <p className="text-xl sm:text-[30px] font-bold text-black">{s.value}</p>
          </div>
        ))}
      </div>

      {/* 🔷 TABLE CARD */}
      <div className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm overflow-hidden">

        {/* 🔍 Search */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#e7ebf3]">
          <div className="flex items-center h-9 bg-[#f6f6f8] rounded-lg px-3 flex-1">
            <span className="material-symbols-outlined text-[#9aa5be] text-[18px] mr-2">search</span>
            <input
              placeholder="Search site..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent outline-none w-full text-sm"
            />
          </div>
          <div className="flex items-center gap-2">

  {/* Status Filter */}
  <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    className="border border-[#e7ebf3] rounded-lg px-3 py-2 text-sm outline-none"
  >
    <option value="ALL">All Status</option>
    <option value="Pass">Pass</option>
    <option value="Fail">Fail</option>
  </select>

  {/* Month Filter */}
  <select
    value={monthFilter}
    onChange={(e) => setMonthFilter(e.target.value)}
    className="border border-[#e7ebf3] rounded-lg px-3 py-2 text-sm outline-none "
  >
    <option value="ALL">All Months</option>
    {[...Array(12)].map((_, i) => (
      <option key={i} value={i}>
        {new Date(0, i).toLocaleString('default', { month: 'long' })}
      </option>
    ))}
  </select>

</div>
          <button  onClick={onCreate} className="flex items-center gap-2 rounded-full bg-[#2e4150] text-white text-xs font-bold hover:bg-[#2e4150]/90 transition-all px-4 h-9 cursor-pointer shrink-0"><span className="material-symbols-outlined text-[16px]">add</span>Add Inspection</button>
        </div>

        {/* Header */}
        <div className="px-5 py-3 border-b border-[#e7ebf3] flex items-center gap-3">
          <h2 className="text-[#0d121b] text-sm sm:text-base font-semibold">Inspection Records</h2>
          <span className="bg-[#f2f6f9] text-[#4c669a] text-xs font-bold px-2 py-1 rounded-full">
            {filtered.length} records
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#e7ebf3]">
                <th className="px-4 py-3 text-xs text-[#4c669a] text-left">Site</th>
                <th className="px-4 py-3 text-xs text-[#4c669a] text-left">Inspector</th>
                <th className="px-4 py-3 text-xs text-[#4c669a] text-left">Date</th>
                <th className="px-4 py-3 text-xs text-[#4c669a] text-left">Status</th>
                <th className="px-4 py-3 text-xs text-[#4c669a] text-left">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#e7ebf3]">
             

{filtered.map(i => (
  <tr key={i._id}>
    <td className='px-5 py-4 font-semibold'>{i.siteName}</td>
    <td className='px-5 py-4 font-semibold' >{i.inspector}</td>
    <td className='px-5 py-4 font-semibold' >{i.date}</td>
    <td className={`px-5 py-4 font-semibold ${ i.status === "Pass"? "text-[#00a63e]" : "text-[#eb191a]"} `} >{i.status}</td>

    <td className='px-5 py-4 font-semibold '>
      <button className='cursor-pointer' onClick={() => onView(i._id)}>
        View
      </button>
    </td>
  </tr>
))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#e7ebf3] bg-[#f8fafc] text-xs text-[#4c669a]">
          Showing {filtered.length} of {inspections.length} inspections
        </div>

      </div>
    </div>
  );
};

export default SiteInspection;