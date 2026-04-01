import React from "react";
import { Inspection } from './types';

interface Props {
  inspection: Inspection;
}

const SummaryCard: React.FC<Props> = ({ inspection }) => {
  console.log(inspection)
  return (
    <div className="bg-white rounded-2xl border p-4 space-y-2 border-[#e7ebf3] shadow-sm">
      <h4 className="text-xl font-bold ">Summary</h4>
      <p className="sm:text-[16px] text-base">Ispection Done: <strong>{inspection.date}</strong></p>
      <p className="sm:text-[16px] text-base">Inspector: <strong>{inspection.inspector}</strong></p>
      <p className="sm:text-[16px] text-base">Total Issues: <strong>{inspection.issues.length}</strong></p>
      <p className="sm:text-[16px] text-base">Checklist Items: <strong>{inspection.checklist.length}</strong></p>
      <p className="sm:text-[16px] text-base">Total Photos: <strong>{inspection.photos.length}</strong></p>
      <p className="sm:text-[16px] text-base">Total Score: <strong>{inspection.score}</strong></p>
      
    </div>
  );
};


  export default SummaryCard;