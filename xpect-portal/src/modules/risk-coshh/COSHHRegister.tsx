import React, { useState, useMemo } from 'react';
import { MOCK_CHEMICALS } from './mockData';

interface Props {
  onSelectChemical: (id: string) => void;
  onBack: () => void;
  onNavigateSDS: () => void;
}

const hazardColor = (type: string) => {
  if (type.includes('Corrosive'))   return 'bg-red-100 text-red-700 border border-red-200';
  if (type.includes('Flammable'))   return 'bg-orange-100 text-orange-700 border border-orange-200';
  if (type.includes('Oxidising'))   return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
  if (type.includes('Irritant'))    return 'bg-amber-100 text-amber-700 border border-amber-200';
  return                                   'bg-gray-100 text-gray-600 border border-gray-200';
};

const COSHHRegister: React.FC<Props> = ({ onSelectChemical, onBack, onNavigateSDS }) => {
  const [search, setSearch]       = useState('');
  const [hazardFilter, setHazard] = useState('');

  const hazardTypes = useMemo(() => [...new Set(MOCK_CHEMICALS.map(c => c.hazardType))], []);

  const filtered = useMemo(() => {
    let list = [...MOCK_CHEMICALS];
    if (search)       list = list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.manufacturer.toLowerCase().includes(search.toLowerCase()));
    if (hazardFilter) list = list.filter(c => c.hazardType === hazardFilter);
    return list;
  }, [search, hazardFilter]);

  const stats = {
    total:   MOCK_CHEMICALS.length,
    noSDS:   MOCK_CHEMICALS.filter(c => !c.sdsAvailable).length,
    high:    MOCK_CHEMICALS.filter(c => ['Corrosive', 'Flammable', 'Oxidising'].some(h => c.hazardType.includes(h))).length,
  };

  return (
    <div className="min-h-full bg-[#f6f7fb] w-screen sm:w-full sm:max-w-full">

      {/* Header */}
      <div className="bg-white border-b border-[#e7ebf3] sm:px-8 px-4 sm:py-5 py-3">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#6b7a99] hover:text-[#0d121b] transition-colors mb-4">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Risk Assessments
        </button>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2e4150] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white text-[20px]">science</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0d121b]">COSHH Chemical Register</h1>
              <p className="text-base text-[#4c669a]">Control of Substances Hazardous to Health</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={onNavigateSDS}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#e7ebf3] text-sm font-semibold text-[#2e4150] bg-white hover:bg-[#f6f7fb] transition-colors">
              <span className="material-symbols-outlined text-[18px]">menu_book</span>
              SDS Library
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2e4150] text-white text-sm font-semibold hover:bg-[#3a5268] transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Chemical
            </button>
          </div>
        </div>
      </div>

      <div className="sm:px-8 px-4 sm:py-6 py-3 space-y-5">

        {/* Stats + SDS warning */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-4 flex items-start gap-3 flex-col">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">science</span>
            </div>
            <div><p className="text-xs font-bold text-[#4c669a] uppercase tracking-wide">Registered Chemicals</p><p className="text-xl sm:text-[30px] font-bold text-[#0d121b]">{stats.total}</p></div>
          </div>
          <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-4 flex items-start gap-3 flex-col">
            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">warning</span>
            </div>
            <div><p className="text-xs font-bold text-[#4c669a] uppercase tracking-wide">High Hazard Chemicals</p><p className="text-xl sm:text-[30px] font-bold text-[#0d121b]">{stats.high}</p></div>
          </div>
          <div className={`rounded-xl border shadow-sm p-4 flex items-start gap-3 flex-col bg-white border-[#e7ebf3] `}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${stats.noSDS > 0 ? 'bg-red-100 text-red-600' : 'bg-green-50 text-green-600'}`}>
              <span className="material-symbols-outlined text-[20px]">{stats.noSDS > 0 ? 'gpp_bad' : 'verified'}</span>
            </div>
            <div>
            <p className="text-xs font-bold text-[#4c669a] uppercase tracking-wide">Missing SDS Sheets</p>
              <p className={`text-xl sm:text-[30px] font-bold ${stats.noSDS > 0 ? 'text-red-600' : 'text-[#0d121b]'}`}>{stats.noSDS}</p>
              
            </div>
          </div>
        </div>

        {stats.noSDS > 0 && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
            <span className="material-symbols-outlined text-red-500 text-[20px] shrink-0 mt-0.5">gpp_bad</span>
            <div>
              <p className="text-sm font-bold text-red-700">SDS Sheets Missing</p>
              <p className="text-xs text-red-600 mt-0.5">
                {stats.noSDS} chemical{stats.noSDS > 1 ? 's' : ''} do not have a Safety Data Sheet. Under COSHH regulations (SI 2002/2677), SDS must be available for all hazardous substances. Action required immediately.
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#6b7a99]">search</span>
            <input type="text" placeholder="Search chemicals or manufacturer…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] placeholder:text-[#6b7a99] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20" />
          </div>
          <select value={hazardFilter} onChange={e => setHazard(e.target.value)}
            className="px-3 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20 min-w-[160px]">
            <option value="">All Hazard Types</option>
            {hazardTypes.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
          {(search || hazardFilter) && (
            <button onClick={() => { setSearch(''); setHazard(''); }}
              className="text-sm text-[#6b7a99] hover:text-[#0d121b] flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">close</span>Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e7ebf3] bg-[#f6f7fb]">
                  {['Chemical Name', 'Manufacturer', 'Hazard Type', 'Storage Location', 'PPE Required', 'SDS Available', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7ebf3]">
                {filtered.length === 0
                  ? (
                    <tr><td colSpan={7} className="px-4 py-16 text-center">
                      <span className="material-symbols-outlined text-[48px] text-[#e7ebf3] block mb-3">science</span>
                      <p className="text-[#6b7a99] font-medium">No chemicals found</p>
                    </td></tr>
                  )
                  : filtered.map(c => (
                    <tr key={c.id} onClick={() => onSelectChemical(c.id)} className="cursor-pointer hover:bg-[#f6f7fb] transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">science</span>
                          <span className="font-semibold text-[#0d121b] max-w-[180px] truncate">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[#6b7a99]">{c.manufacturer}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${hazardColor(c.hazardType)}`}>
                          {c.hazardType}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-[#6b7a99] max-w-[160px] truncate">{c.storageLocation}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {c.ppeRequired.map(p => (
                            <span key={p} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#f0f2f7] text-[#2e4150]">{p}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {c.sdsAvailable
                          ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">Yes</span>
                          : <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">Missing</span>
                        }
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-sm font-semibold text-[#2e4150] hover:underline">View</span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-[#e7ebf3] bg-[#f6f7fb] text-xs text-[#6b7a99]">
              Showing {filtered.length} of {MOCK_CHEMICALS.length} chemicals
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default COSHHRegister;
