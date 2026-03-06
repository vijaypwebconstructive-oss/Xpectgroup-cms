import React from 'react';
import { useRiskCoshh } from '../../context/RiskCoshhContext';

interface Props {
  chemicalId: string;
  onBack: () => void;
  onViewSDS: (id: string) => void;
}

const hazardColor = (type: string) => {
  if (type.includes('Corrosive'))   return 'bg-red-100 text-red-700 border border-red-200';
  if (type.includes('Flammable'))   return 'bg-orange-100 text-orange-700 border border-orange-200';
  if (type.includes('Oxidising'))   return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
  if (type.includes('Irritant'))    return 'bg-amber-100 text-amber-700 border border-amber-200';
  return                                   'bg-gray-100 text-gray-600 border border-gray-200';
};

const InfoSection: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-6">
    <h2 className="text-base font-bold text-[#0d121b] mb-4 flex items-center gap-2">
      <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">{icon}</span>
      {title}
    </h2>
    {children}
  </div>
);

const COSHHDetail: React.FC<Props> = ({ chemicalId, onBack, onViewSDS }) => {
  const { getChemicalById, getSDSByChemicalId } = useRiskCoshh();
  const chemical = getChemicalById(chemicalId);
  const sds = chemical ? getSDSByChemicalId(chemical.id) : undefined;

  if (!chemical) {
    return (
      <div className="min-h-full bg-[#f6f7fb] flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-[48px] text-[#e7ebf3] block mb-3">science</span>
          <p className="text-[#6b7a99]">Chemical not found</p>
          <button onClick={onBack} className="mt-4 text-sm text-[#2e4150] font-semibold hover:underline">← Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#f6f7fb]">

      {/* Header */}
      <div className="bg-white border-b border-[#e7ebf3] px-8 py-5">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#6b7a99] hover:text-[#0d121b] transition-colors mb-4">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to COSHH Register
        </button>
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-12 h-12 rounded-xl bg-[#2e4150] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-white text-[24px]">science</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-[#0d121b]">{chemical.name}</h1>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="text-sm text-[#6b7a99]">{chemical.manufacturer}</span>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${hazardColor(chemical.hazardType)}`}>
                {chemical.hazardType}
              </span>
              {!chemical.sdsAvailable && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                  <span className="material-symbols-outlined text-[14px]">gpp_bad</span>
                  SDS Missing
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SDS missing warning */}
      {!chemical.sdsAvailable && (
        <div className="mx-8 mt-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
          <span className="material-symbols-outlined text-red-500 text-[20px] shrink-0 mt-0.5">gpp_bad</span>
          <div>
            <p className="text-sm font-bold text-red-700">Safety Data Sheet Missing</p>
            <p className="text-xs text-red-600 mt-0.5">
              A Safety Data Sheet (SDS) is legally required under REACH Regulation (EC) No 1907/2006 for this substance.
              Work involving this chemical must not proceed until the SDS is obtained from the manufacturer.
            </p>
          </div>
        </div>
      )}

      <div className="px-8 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left */}
        <div className="lg:col-span-2 space-y-5">

          {/* Chemical information */}
          <InfoSection title="Chemical Information" icon="info">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Product Name',    value: chemical.name },
                { label: 'Manufacturer',    value: chemical.manufacturer },
                { label: 'Hazard Type',     value: chemical.hazardType },
                { label: 'Storage Location',value: chemical.storageLocation },
                ...(chemical.maxExposureLimit ? [{ label: 'Max Exposure Limit', value: chemical.maxExposureLimit }] : []),
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-[#0d121b]">{value}</p>
                </div>
              ))}
            </div>
            {chemical.hazardSymbols.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[#e7ebf3]">
                <p className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-2">GHS Hazard Symbols</p>
                <div className="flex flex-wrap gap-2">
                  {chemical.hazardSymbols.map(sym => (
                    <span key={sym} className="px-3 py-1 rounded-lg bg-[#f0f2f7] text-xs font-bold text-[#2e4150] font-mono border border-[#e7ebf3]">{sym}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-[#e7ebf3]">
              <p className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Handling Instructions</p>
              <p className="text-sm text-[#0d121b] leading-relaxed">{chemical.handlingInstructions}</p>
            </div>
          </InfoSection>

          {/* First Aid */}
          <InfoSection title="First Aid Measures" icon="medical_services">
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-sm text-[#0d121b] leading-relaxed">{chemical.firstAidMeasures}</p>
            </div>
          </InfoSection>

          {/* Spill Response */}
          <InfoSection title="Spill Response" icon="warning">
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
              <p className="text-sm text-[#0d121b] leading-relaxed">{chemical.spillResponse}</p>
            </div>
          </InfoSection>

          {/* Disposal */}
          <InfoSection title="Disposal Method" icon="delete">
            <div className="p-4 bg-[#f6f7fb] border border-[#e7ebf3] rounded-xl">
              <p className="text-sm text-[#0d121b] leading-relaxed">{chemical.disposalMethod}</p>
            </div>
          </InfoSection>
        </div>

        {/* Right */}
        <div className="space-y-5">

          {/* Required PPE */}
          <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-6">
            <h2 className="text-base font-bold text-[#0d121b] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">safety_check</span>
              Required PPE
            </h2>
            <div className="space-y-2">
              {chemical.ppeRequired.map(p => (
                <div key={p} className="flex items-center gap-2.5 p-2.5 bg-green-50 border border-green-100 rounded-xl">
                  <span className="material-symbols-outlined text-green-600 text-[16px]">check_circle</span>
                  <span className="text-sm font-medium text-green-800">{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SDS card */}
          <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-6">
            <h2 className="text-base font-bold text-[#0d121b] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">menu_book</span>
              Safety Data Sheet
            </h2>
            {sds ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-[#f6f7fb] border border-[#e7ebf3] rounded-xl">
                  <div className="w-10 h-10 bg-[#2e4150] rounded-lg flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-white text-[18px]">picture_as_pdf</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0d121b] truncate">{sds.fileName ?? `SDS-${sds.id}.pdf`}</p>
                    <p className="text-xs text-[#6b7a99]">{sds.revision} · {sds.fileSize ?? '—'}</p>
                  </div>
                </div>
                <button onClick={() => onViewSDS(sds.id)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#e7ebf3] text-sm font-semibold text-[#2e4150] bg-white hover:bg-[#f6f7fb] transition-colors">
                  <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                  View Full SDS
                </button>
              </div>
            ) : (
              <div className="p-6 border-2 border-dashed border-red-200 bg-red-50 rounded-xl text-center">
                <span className="material-symbols-outlined text-[32px] text-red-300 block mb-2">gpp_bad</span>
                <p className="text-sm font-semibold text-red-700">No SDS Available</p>
                <p className="text-xs text-red-600 mt-1">Contact manufacturer to obtain SDS</p>
                <button className="mt-3 text-sm font-semibold text-[#2e4150] hover:underline">Upload SDS</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default COSHHDetail;
