import React,{useState,useEffect} from "react";
import { useClientsSites } from '../../context/ClientsSitesContext';
import { useInspection } from '../../context/InspectionContext';

interface Props {
    onBack: () => void;
    onSubmit: (id: string) => void;
  }


const InspectionCreate: React.FC<Props>= ({ onBack, onSubmit}) => {
    const [form, setForm] = useState({
        site: '',
        siteName: '', 
        inspector: '',
        date: '',
        status: '',
        checklist: [
          { label: 'Floors', rating: 0 },
          { label: 'Dusting', rating: 0 },
          { label: 'Washrooms', rating: 0 },
        ],
        issues: [
          { title: '', severity: 'Low' }
        ],
        comments: '',
        photos: []  as any[], 
      });
      const { sites, loading } = useClientsSites();

      const { addInspection } = useInspection();

      const fileToDataUrl = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(String(r.result));
          r.onerror = () => reject(new Error('Failed to read file'));
          r.readAsDataURL(file);
        });


      const handleSubmit = async () => {
        if (!form.site || !form.inspector) {
          alert("Please fill required fields");
          return;
        }
        
        const photosBase64 = await Promise.all(
            form.photos.map(p => fileToDataUrl(p.file))
          );
          
          const finalData = {
            ...form,
            photos: photosBase64, // ✅ store base64
            score: calculateScore(),
            createdAt: new Date().toISOString(),
          };
      
        const saved = await addInspection(finalData);
      
        // 🔥 Mongo uses _id
        onSubmit(saved._id);
      };
  
    const calculateScore = () => {
        const total = form.checklist.reduce((sum, item) => sum + item.rating, 0);
        const max = form.checklist.length * 5;
      
        return form.checklist.length
          ? Math.round((total / max) * 100)
          : 0;
      };

      useEffect(() => {
        return () => {
          form.photos.forEach(photo => URL.revokeObjectURL(photo.preview));
        };
      }, [form.photos]);

    return (
      <div className="space-y-6">
  
        {/* 🔷 HEADER */}
        <div className="flex flex-col items-start gap-1">
<button onClick={onBack} className="flex items-center gap-1.5 text-[#6b7a99] text-sm font-semibold hover:text-[#0d121b] transition-colors cursor-pointer mb-3"><span className="material-symbols-outlined text-[18px]">arrow_back</span>Back to Inspection Lists</button>
<h2 className="text-[#0d121b] text-xl  sm:text-[26px] font-bold   font-black">Create Inspection Report</h2>
  
</div>
  

        <div className=" bg-white rounded-xl border border-[#e7ebf3] shadow-sm sm:p-6 p-4 space-y-5 w-[70%]">
                {/* 🔷 BASIC INFO */}
        <div className="bg-white rounded-2xl border border-[#e7ebf3] p-5 space-y-4">
          <h3 className="font-bold text-[#0d121b]">Basic Information</h3>
  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  
            <div className="flex flex-col gap-1">
  <label className="text-sm font-semibold text-[#000]">
    Site
  </label>

  <select
    className="border border-[#e7ebf3] rounded-lg px-3 py-2 text-sm outline-none"
    value={form.site}
    required
    onChange={(e) => {
      const selected = sites.find(s => s.id === e.target.value);

      setForm({
        ...form,
        site: selected?.id || '',
        siteName: selected?.name || '', // 🔥 important
      });
    }}
  >
    <option value="">
      {loading ? 'Loading sites...' : 'Select Site'}
    </option>

    {sites.map(site => (
      <option key={site.id} value={site.id}>
        {site.name}
      </option>
    ))}
  </select>
</div>
  
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#000]">Inspector</label>
              <input
                className="border border-[#e7ebf3] rounded-lg px-3 py-2 text-sm outline-none"
                placeholder="Inspector name"
                onChange={e => setForm({ ...form, inspector: e.target.value })}
              />
            </div>
  
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#000]">Date</label>
              <input
                type="date"
                className="border border-[#e7ebf3] rounded-lg px-3 py-2 text-sm outline-none"
                onChange={e => setForm({ ...form, date: e.target.value })}
              />
            </div>

            <div>
  <label className="block text-sm font-semibold mb-1">
    Status
  </label>

  <select
    value={form.status}
    onChange={(e) =>
      setForm({ ...form, status: e.target.value })
    }
    className="w-full border border-[#e7ebf3] rounded-lg px-3 py-2 text-sm outline-none"
  > <option value="Select" >Select</option>
    <option value="Pass">Pass</option>
    <option value="Fail">Fail</option>
  </select>
</div>
  
          </div>
        </div>
  
        {/* 🔷 CHECKLIST */}
        <div className="bg-white rounded-2xl border border-[#e7ebf3] p-5 space-y-4">
  <div className="flex justify-between items-center">
    <h3 className="font-bold">Add Cleaning Quality</h3>

    <button
      onClick={() =>
        setForm({
          ...form,
          checklist: [...form.checklist, { label: '', rating: 0 }],
        })
      }
      className="text-sm font-bold text-[#2e4150]"
    >
      + Add Item
    </button>
  </div>

  {form.checklist.map((item, index) => (
    <div key={index} className="flex items-center gap-3">

      {/* Label */}
      <input
        className="border border-[#e7ebf3] px-3 py-2 rounded-lg flex-1 text-sm outline-none"
        placeholder="Enter item (e.g. Floors)"
        value={item.label}
        onChange={e => {
          const updated = [...form.checklist];
          updated[index].label = e.target.value;
          setForm({ ...form, checklist: updated });
        }}
      />

      {/* Stars */}
      <div className="flex gap-1">
        {[1,2,3,4,5].map(num => (
          <button
            key={num}
            type="button"
            onClick={() => {
              const updated = [...form.checklist];
              updated[index].rating = num;
              setForm({ ...form, checklist: updated });
            }}
            className={`text-lg ${
              item.rating >= num ? 'text-yellow-500' : 'text-gray-300'
            }`}
          >
            ★
          </button>
        ))}
      </div>

      {/* Remove */}
      <button
        onClick={() => {
          const updated = form.checklist.filter((_, i) => i !== index);
          setForm({ ...form, checklist: updated });
        }}
        className="text-red-500 text-sm"
      >
        ✕
      </button>

    </div>
  ))}
</div>

{/* issues */}

<div className="bg-white rounded-2xl border border-[#e7ebf3] p-5 space-y-4">

  <div className="flex justify-between items-center">
    <h3 className="font-bold">Add Issues</h3>

    <button
      onClick={() =>
        setForm({
          ...form,
          issues: [...form.issues, { title: '', severity: 'Low' }],
        })
      }
      className="text-sm font-bold text-[#2e4150]"
    >
      + Add Issue
    </button>
  </div>

  {form.issues.map((issue, index) => (
    <div key={index} className="flex items-center gap-3">

      {/* Issue Title */}
      <input
        className="border border-[#e7ebf3] px-3 py-2 rounded-lg flex-1 text-sm outline-none"
        placeholder="Issue description"
        value={issue.title}
        onChange={e => {
          const updated = [...form.issues];
          updated[index].title = e.target.value;
          setForm({ ...form, issues: updated });
        }}
      />

      {/* Severity */}
      <select
        className="border border-[#e7ebf3] px-2 py-2 rounded-lg text-sm"
        value={issue.severity}
        onChange={e => {
          const updated = [...form.issues];
          updated[index].severity = e.target.value;
          setForm({ ...form, issues: updated });
        }}
      >
        <option>Low</option>
        <option>Medium</option>
        <option>High</option>
      </select>

      {/* Remove */}
      <button
        onClick={() => {
          const updated = form.issues.filter((_, i) => i !== index);
          setForm({ ...form, issues: updated });
        }}
        className="text-red-500 text-sm"
      >
        ✕
      </button>

    </div>
  ))}

</div>

{/* photos */}

<div className="bg-white rounded-2xl border border-[#e7ebf3] p-5 space-y-4">

  <div className="flex justify-between items-center">
    <h3 className="font-bold">Add Site Photos</h3>
    <p className="text-xs text-[#4c669a]">
      Max 5 images
    </p>
  </div>

  {/* Upload Input */}
  <input
    type="file"
    accept="image/*"
    multiple
    onChange={(e) => {
      const files = Array.from(e.target.files || []);

      if (form.photos.length + files.length > 5) {
        alert("You can upload maximum 5 images");
        return;
      }

      const newPhotos = files.map(file => ({
        file,
        preview: URL.createObjectURL(file),
      }));

      setForm({
        ...form,
        photos: [...form.photos, ...newPhotos],
      });
    }}
    className="text-sm"
  />

  {/* Preview Grid */}
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

    {form.photos.map((photo, index) => (
      <div key={index} className="relative group">

        <img
          src={photo.preview}
          alt="preview"
          className="w-full h-24 object-cover rounded-lg border"
        />

        {/* Remove Button */}
        <button
          onClick={() => {
            const updated = form.photos.filter((_, i) => i !== index);
            setForm({ ...form, photos: updated });
          }}
          className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100"
        >
          ✕
        </button>

      </div>
    ))}

  </div>

</div>
  
        {/* 🔷 COMMENTS */}
        <div className="bg-white rounded-2xl border border-[#e7ebf3] p-5 space-y-2">
          <h3 className="font-bold text-[#0d121b]">Add note</h3>
  
          <textarea
            className="w-full border border-[#e7ebf3] rounded-lg p-3 text-sm"
            placeholder="Write comments..."
            rows={4}
            onChange={e => setForm({ ...form, comments: e.target.value })}
          />
        </div>
  
        {/* 🔷 SUBMIT */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-[#2e4150] text-white px-6 py-2 rounded-lg text-sm font-bold hover:opacity-90"
          >
            Submit Report
          </button>
        </div>

        </div>
        
  
      </div>
    );
  };

  export default InspectionCreate;