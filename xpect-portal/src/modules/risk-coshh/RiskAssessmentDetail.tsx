import React, { useState, useEffect, useCallback } from 'react';
import { useRiskCoshh } from '../../context/RiskCoshhContext';
import { RiskLevel, Hazard, ComplianceRequirement } from './types';

interface Props {
  riskId: string;
  onBack: () => void;
}

const riskBadgeCls = (level: RiskLevel) => ({
  Low:    'bg-green-100 text-green-700 border border-green-200',
  Medium: 'bg-amber-100 text-amber-700 border border-amber-200',
  High:   'bg-red-100 text-red-700 border border-red-200',
}[level]);

const riskDot = (level: RiskLevel) => ({
  Low: 'bg-green-500', Medium: 'bg-amber-500', High: 'bg-red-500',
}[level]);

const RESIDUAL_OPTIONS: RiskLevel[] = ['Low', 'Medium', 'High'];
const COMMON_PPE = ['Gloves', 'Safety shoes', 'Eye protection', 'Mask', 'Hi-vis vest', 'Apron', 'Hard hat', 'Safety harness'];

const RiskAssessmentDetail: React.FC<Props> = ({ riskId, onBack }) => {
  const { getRiskById, updateRiskAssessment, deleteRiskAssessment } = useRiskCoshh();
  const ra = getRiskById(riskId);
  const [hazards, setHazards] = useState<Hazard[]>(ra?.hazards ?? []);
  const [ppe, setPPE] = useState<string[]>(ra?.requiredPPE ?? []);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [addingPPE, setAddingPPE] = useState(false);
  const [newPPE, setNewPPE] = useState('');
  const [adding, setAdding] = useState(false);
  const [newHazard, setNewHazard] = useState<Hazard>({
    hazard: '',
    harm: '',
    control: '',
    residualRisk: 'Low',
  });
  const [complianceRequirements, setComplianceRequirements] = useState<ComplianceRequirement[]>(ra?.complianceRequirements ?? []);
  const [addingCompliance, setAddingCompliance] = useState(false);
  const [newCompliance, setNewCompliance] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (ra) {
      setHazards(ra.hazards ?? []);
      setPPE(ra.requiredPPE ?? []);
      setComplianceRequirements(ra.complianceRequirements ?? []);
    }
  }, [ra]);

  const persistCompliance = useCallback(async (items: ComplianceRequirement[]) => {
    setComplianceRequirements(items);
    if (!riskId) return;
    setSaving(true);
    try {
      await updateRiskAssessment(riskId, { complianceRequirements: items });
    } finally {
      setSaving(false);
    }
  }, [riskId, updateRiskAssessment]);

  const persistPPE = useCallback(async (items: string[]) => {
    setPPE(items);
    if (!riskId) return;
    setSaving(true);
    try {
      await updateRiskAssessment(riskId, { requiredPPE: items });
    } finally {
      setSaving(false);
    }
  }, [riskId, updateRiskAssessment]);

  const handleDeleteAssessment = async () => {
    try {
      await deleteRiskAssessment(riskId);
      setShowDeleteConfirm(false);
      onBack();
    } catch {
      // Could show error toast
    }
  };

  const addPPE = (item: string) => {
    const trimmed = item.trim();
    if (trimmed && !ppe.includes(trimmed)) persistPPE([...ppe, trimmed]);
    setNewPPE('');
    setAddingPPE(false);
  };

  const removePPE = (item: string) => {
    persistPPE(ppe.filter(p => p !== item));
  };

  const addCompliance = () => {
    const trimmed = newCompliance.trim();
    if (trimmed) {
      persistCompliance([...complianceRequirements, { id: crypto.randomUUID(), label: trimmed, checked: false }]);
      setNewCompliance('');
      setAddingCompliance(false);
    }
  };

  const removeCompliance = (id: string) => {
    persistCompliance(complianceRequirements.filter(c => c.id !== id));
  };

  const toggleCompliance = (id: string) => {
    persistCompliance(complianceRequirements.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
  };

  const persistHazards = useCallback(async (h: Hazard[]) => {
    setHazards(h);
    if (!riskId) return;
    setSaving(true);
    try {
      await updateRiskAssessment(riskId, { hazards: h });
    } finally {
      setSaving(false);
    }
  }, [riskId, updateRiskAssessment]);

  const handleAdd = () => {
    if (!newHazard.hazard.trim()) return;
    persistHazards([...hazards, { ...newHazard }]);
    setNewHazard({ hazard: '', harm: '', control: '', residualRisk: 'Low' });
    setAdding(false);
  };

  const handleDelete = (index: number) => {
    persistHazards(hazards.filter((_, i) => i !== index));
  };

  if (!ra) {
    return (
      <div className="min-h-full bg-[#f6f7fb] flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-[48px] text-[#e7ebf3] block mb-3">assignment</span>
          <p className="text-[#6b7a99]">Risk assessment not found</p>
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
          Back to Risk Assessments
        </button>
        <div className="flex items-start gap-4 flex-wrap justify-between">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-12 h-12 rounded-xl bg-[#2e4150] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white text-[24px]">health_and_safety</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-[#0d121b]">{ra.title}</h1>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                {ra.sector && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#f0f2f7] text-[#2e4150]">{ra.sector}</span>
                )}
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#f0f2f7] text-[#2e4150]">{ra.taskType}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 text-sm font-semibold transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
            Delete Assessment
          </button>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#0d121b] mb-2">Delete Risk Assessment</h3>
            <p className="text-sm text-[#6b7a99] mb-6">Are you sure you want to delete &quot;{ra.title}&quot;? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAssessment}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#e7ebf3] text-[#2e4150] text-sm font-semibold hover:bg-[#f6f7fb]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-8 py-6">
        <div className="space-y-5 max-w-4xl">

          {/* A. Task Information */}
          <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-6">
            <h2 className="text-base font-bold text-[#0d121b] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">info</span>
              Task Information
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1">Task Description</p>
                <p className="text-sm text-[#0d121b] leading-relaxed">{ra.taskDescription}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 pt-2 border-t border-[#e7ebf3]">
                <div>
                  <p className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1">Work Area</p>
                  <p className="text-sm text-[#0d121b]">{ra.workArea}</p>
                </div>
                {/* <div>
                  <p className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1">Equipment Used</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ra.equipmentUsed.map((eq, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-xs font-medium bg-[#f0f2f7] text-[#2e4150]">{eq}</span>
                    ))}
                  </div>
                </div> */}
              </div>
            </div>
          </div>

          {/* B. Hazard Table */}
          <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[#e7ebf3] flex items-center gap-2 flex-wrap">
              <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">warning</span>
              <h2 className="text-base font-bold text-[#0d121b]">Risk Identification & Control</h2>
              <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold bg-[#f0f2f7] text-[#2e4150]">{hazards.length} hazards</span>
              <button
                onClick={() => setAdding(!adding)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2e4150] text-white text-sm font-semibold hover:bg-[#3a5268] transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add Risk
              </button>
            </div>

            {adding && (
              <div className="p-4 bg-[#f6f7fb] border-b border-[#e7ebf3] space-y-3">
                <input
                  placeholder="Hazard"
                  value={newHazard.hazard}
                  onChange={e => setNewHazard(h => ({ ...h, hazard: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-[#e7ebf3] text-sm"
                />
                <input
                  placeholder="Possible Harm"
                  value={newHazard.harm}
                  onChange={e => setNewHazard(h => ({ ...h, harm: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-[#e7ebf3] text-sm"
                />
                <textarea
                  placeholder="Control Measures"
                  value={newHazard.control}
                  onChange={e => setNewHazard(h => ({ ...h, control: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-[#e7ebf3] text-sm resize-none"
                />
                <select
                  value={newHazard.residualRisk}
                  onChange={e => setNewHazard(h => ({ ...h, residualRisk: e.target.value as RiskLevel }))}
                  className="px-3 py-2 rounded-lg border border-[#e7ebf3] text-sm bg-white"
                >
                  {RESIDUAL_OPTIONS.map(o => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button onClick={handleAdd} disabled={!newHazard.hazard.trim()}
                    className="px-4 py-2 rounded-lg bg-[#2e4150] text-white text-sm font-semibold hover:bg-[#3a5268] disabled:opacity-50 disabled:cursor-not-allowed">
                    Add
                  </button>
                  <button onClick={() => { setAdding(false); setNewHazard({ hazard: '', harm: '', control: '', residualRisk: 'Low' }); }}
                    className="px-4 py-2 rounded-lg border border-[#e7ebf3] text-[#2e4150] text-sm font-semibold hover:bg-[#f6f7fb]">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f6f7fb] border-b border-[#e7ebf3]">
                    {['Hazard', 'Possible Harm', 'Control Measures', 'Residual Risk', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7ebf3]">
                  {hazards.map((h, i) => (
                    <tr key={i} className="hover:bg-[#f6f7fb] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-amber-500 text-[16px] mt-0.5 shrink-0">warning_amber</span>
                          <span className="font-semibold text-[#0d121b]">{h.hazard}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#6b7a99] max-w-[160px]">{h.harm}</td>
                      <td className="px-4 py-3 text-[#0d121b] max-w-[220px] text-xs leading-relaxed">{h.control}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${riskBadgeCls(h.residualRisk)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${riskDot(h.residualRisk)}`} />
                          {h.residualRisk}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={e => { e.stopPropagation(); handleDelete(i); }}
                          className="p-1.5 rounded-lg text-[#6b7a99] hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Delete hazard"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* D. Client Compliance Requirements */}
          <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-6">
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">verified_user</span>
              <h2 className="text-base font-bold text-[#0d121b]"> Compliance Requirements</h2>
              {ra.sector && (
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#f0f2f7] text-[#2e4150]">Sector: {ra.sector}</span>
              )}
              <button
                onClick={() => setAddingCompliance(!addingCompliance)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2e4150] text-white text-sm font-semibold hover:bg-[#3a5268] transition-colors ml-2"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add
              </button>
            </div>
            <ul className="space-y-2 overflow-y-scroll max-h-[400px]">
              {complianceRequirements.map(item => (
                <li
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${item.checked ? 'border border-green-200 bg-green-50' : 'border border-[#e7ebf3] hover:bg-[#f6f7fb]'}`}
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleCompliance(item.id)}
                    className="w-5 h-5 rounded border-[#e7ebf3] text-[#2e4150] focus:ring-[#2e4150]/20"
                  />
                  <span className={`flex-1 text-sm ${item.checked ? 'text-green-800 font-medium' : 'text-[#0d121b] font-medium'}`}>
                    {item.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeCompliance(item.id)}
                    className="p-1.5 rounded-lg text-[#6b7a99] hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </li>
              ))}
            </ul>
            {addingCompliance && (
              <div className="mt-4 p-4 bg-[#f6f7fb] rounded-xl border border-[#e7ebf3] flex gap-2">
                <input
                  value={newCompliance}
                  onChange={e => setNewCompliance(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCompliance())}
                  placeholder="Enter compliance requirement..."
                  className="flex-1 px-3 py-2 rounded-lg border border-[#e7ebf3] text-sm focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20"
                />
                <button
                  type="button"
                  onClick={addCompliance}
                  disabled={!newCompliance.trim()}
                  className="px-4 py-2 rounded-lg bg-[#2e4150] text-white text-sm font-semibold hover:bg-[#3a5268] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => { setAddingCompliance(false); setNewCompliance(''); }}
                  className="px-4 py-2 rounded-lg border border-[#e7ebf3] text-[#2e4150] text-sm font-semibold hover:bg-[#f6f7fb]"
                >
                  Cancel
                </button>
              </div>
            )}
            {complianceRequirements.length === 0 && !addingCompliance && (
              <p className="text-sm text-[#6b7a99]">No compliance requirements. Click Add to add one.</p>
            )}
          </div>

          {/* C. Required PPE */}
          <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-6">
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">safety_check</span>
              <h2 className="text-base font-bold text-[#0d121b]">Required PPE</h2>
              <button
                onClick={() => setAddingPPE(!addingPPE)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2e4150] text-white text-sm font-semibold hover:bg-[#3a5268] transition-colors ml-2"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add PPE
              </button>
            </div>
            {addingPPE && (
              <div className="mb-4 p-4 bg-[#f6f7fb] rounded-xl border border-[#e7ebf3] space-y-3">
                <div className="flex gap-2 flex-wrap">
                  {COMMON_PPE.filter(p => !ppe.includes(p)).map(item => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => addPPE(item)}
                      className="px-3 py-1.5 rounded-lg border border-[#e7ebf3] text-sm font-medium text-[#2e4150] hover:bg-white hover:border-[#2e4150]/30 transition-colors"
                    >
                      + {item}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={newPPE}
                    onChange={e => setNewPPE(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addPPE(newPPE))}
                    placeholder="Or type custom PPE..."
                    className="flex-1 px-3 py-2 rounded-lg border border-[#e7ebf3] text-sm focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20"
                  />
                  <button
                    type="button"
                    onClick={() => addPPE(newPPE)}
                    disabled={!newPPE.trim()}
                    className="px-4 py-2 rounded-lg bg-[#2e4150] text-white text-sm font-semibold hover:bg-[#3a5268] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => { setAddingPPE(false); setNewPPE(''); }}
                  className="text-sm text-[#6b7a99] hover:text-[#0d121b]"
                >
                  Cancel
                </button>
              </div>
            )}
            <div className="flex flex-wrap gap-3 overflow-y-scroll max-h-[200px]">
              {ppe.map(item => (
                <div
                  key={item}
                  className="flex items-center gap-2 p-3 rounded-xl border border-green-200 bg-green-50"
                >
                  <span className="material-symbols-outlined text-[18px] text-green-600">check_circle</span>
                  <span className="text-sm font-medium text-green-800">{item}</span>
                  <button
                    type="button"
                    onClick={() => removePPE(item)}
                    className="p-1 rounded-lg text-[#6b7a99] hover:bg-red-100 hover:text-red-600 transition-colors"
                    title="Remove"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              ))}
            </div>
            {ppe.length === 0 && !addingPPE && (
              <p className="text-sm text-[#6b7a99]">No PPE required. Click &quot;Add PPE&quot; to add items.</p>
            )}
          </div>

          
        </div>
      </div>
    </div>
  );
};

export default RiskAssessmentDetail;
