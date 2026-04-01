import React, { useEffect, useState } from 'react';
import { useInspection } from '../../context/InspectionContext';
import ChecklistSection from './ChecklistSection';
import IssuesSection from './IssuesSection';
import PhotosSection from './PhotosSection';
import CommentsSection from './CommentsSection';
import ScoreCard from './ScoreCard';
import SummaryCard from './SummaryCard';
import { Inspection } from './types';

interface Props {
  inspectionId: string;
  onBack: () => void;
}

const InspectionDetail = ({ inspectionId, onBack }) => {

    const { getInspectionById } = useInspection();
    const { deleteInspection } = useInspection();

    const [inspection, setInspection] = useState<any>(null);
    
    useEffect(() => {
      const loadInspection = async () => {
        const data = await getInspectionById(inspectionId);
        setInspection(data);
      };
    
      loadInspection();
    }, [inspectionId]);

    if (!inspection) {
        return <p>Loading inspection...</p>;
      }

      const handleDelete = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete this inspection?");
        if (!confirmDelete) return;
      
        await deleteInspection(inspection._id);
      
        onBack(); // go back to list
      };

    return (
      <div className="space-y-6">
  
        {/* 🔷 HEADER */}
        {/* <div className="flex items-center justify-between">
          <button onClick={onBack}>← Back</button>
  
          <div>
            <h1 className="text-xl font-bold">Pinnacle Annex Building</h1>
            <p className="text-sm text-[#4c669a]">12 Mar 2026 • John</p>
          </div>
        </div> */}

<div className="space-y-4">

{/* 🔙 Back + Title */}
<div className="flex items-center gap-3">
<button onClick={onBack} className="flex items-center gap-1.5 text-[#6b7a99] text-sm font-semibold hover:text-[#0d121b] transition-colors cursor-pointer mb-3"><span className="material-symbols-outlined text-[18px]">arrow_back</span>Back to Inspection Lists</button>

  
</div>

{/* 🏢 Site Name */}
<div className="flex items-center gap-3">
  <span className="material-symbols-outlined text-[28px] text-[#2e4150]">
    home
  </span>

  <h1 className="text-2xl font-bold text-[#0d121b]">
    Pinnacle Annex Building
  </h1>
</div>

{/* 📊 INFO CARD */}
<div className="bg-white border border-[#e7ebf3] rounded-2xl px-5 py-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">

  {/* LEFT INFO */}
  <div className="flex flex-wrap items-center gap-6">

    {/* Date */}
    <div className="flex items-center gap-2 text-[18px] text-[#000]">
      <span className="material-symbols-outlined text-[18px]">calendar_today</span>
      <span>
        <strong>Date:</strong> {inspection.date}
      </span>
    </div>

    {/* Inspector */}
    <div className="flex items-center gap-2 text-[18px] text-[#000]">
      <span className="material-symbols-outlined text-[18px]">person</span>
      <span>
        <strong>Inspector:</strong> {inspection.inspector}
      </span>
    </div>

          {/* Status */}
    <div className="flex items-center gap-2 text-[18px] text-[#000]">
      <span className="material-symbols-outlined text-[18px]">check_circle</span>
      <span>
        <strong>Status:</strong> 
        <span
  className={`text-[16px] px-6 rounded-full mx-1 py-2 text-white ${
    inspection.status === "Pass"
      ? "bg-green-500"
      : "bg-red-500"
  }`}
>
  {inspection.status}
</span>
        
      </span>
    </div>

  </div>

  {/* RIGHT SIDE */}
  <div className="flex items-center gap-3">

    {/* Status Dropdown */}
    {/* <select className="border border-[#e7ebf3] rounded-lg px-3 py-1 text-sm font-semibold text-[#2e4150]">
      <option>Completed</option>
      <option>In Progress</option>
      <option>Pending</option>
    </select> */}

    {/* Action Buttons */}
    <div className="flex items-center gap-2">
    <button onClick={handleDelete} className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-full h-12 px-6 py-2 text-black text-sm font-bold tracking-[0.015em] hover:bg-[#2e4150] hover:text-white transition-all cursor-pointer border-[#2e4150] border"><span className="material-symbols-outlined text-xl">delete</span><span>Delete</span></button>

      {/* <button className="flex items-center justify-center gap-2 rounded-full h-12   bg-[#2e4150]  text-white text-sm font-bold hover:bg-[#2e4150] transition-all px-6 py-2  cursor-pointer ">
        <span className="material-symbols-outlined text-[18px]">download</span>
        Download
      </button> */}

      {/* <button className="p-2 rounded-lg hover:bg-[#f2f6f9]">
        <span className="material-symbols-outlined text-[18px]">edit</span>
      </button> */}

      {/* <button className="p-2 rounded-lg hover:bg-[#f2f6f9]">
        <span className="material-symbols-outlined text-[18px]">more_vert</span>
      </button> */}
    </div>

  </div>

</div>

</div>

        
  
        {/* 🔷 MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  
          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-6">
  
          <ChecklistSection checklist={inspection.checklist} />
            <IssuesSection  issues={inspection.issues} />
            <PhotosSection photos={inspection.photos} />
            
  
          </div>
  
          {/* RIGHT SIDE */}
          <div className="space-y-6">
  
          <ScoreCard score={inspection.score || 0} />
          <CommentsSection comments={inspection.comments} />
            <SummaryCard inspection={inspection}/>
            
  
          </div>
  
        </div>
      </div>
    );
  };

  export default InspectionDetail;