import React from 'react';
import { useProspects } from '../../context/ProspectContext';
import ProspectForm from './ProspectForm';

interface Props {
  onBack: () => void;
  onCreated: (id: string) => void;
}

const ProspectCreate: React.FC<Props> = ({ onBack, onCreated }) => {
  const { addProspect } = useProspects();

  const handleSubmit = async (data: Parameters<typeof addProspect>[0]) => {
    const created = await addProspect(data);
    onCreated(created.id);
  };

  return (
    <div className="min-h-full bg-[#f6f7fb]">
      <div className="bg-white border-b border-[#e7ebf3] sm:px-8 px-4 sm:py-5 py-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-[#6b7a99] hover:text-[#0d121b] transition-colors mb-4"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Prospect List
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2e4150] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-white text-[20px]">person_add</span>
          </div>
          <div>
            <h1 className="sm:text-xl text-lg font-bold text-[#0d121b]">Add Prospect</h1>
            <p className="text-base text-[#4c669a]">Create a new potential client record</p>
          </div>
        </div>
      </div>

      <div className="sm:px-8 px-4 sm:py-6 py-3">
        <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-6 max-w-2xl">
          <ProspectForm
            onSubmit={handleSubmit}
            onCancel={onBack}
            submitLabel="Add Prospect"
          />
        </div>
      </div>
    </div>
  );
};

export default ProspectCreate;
