import React from 'react';

interface DocumentNotesProps {
  notes?: string | null;
}

const DocumentNotes: React.FC<DocumentNotesProps> = ({ notes }) => (
  <div className="mt-6 p-4 border border-[#e7ebf3] rounded-xl">
    <h3 className="text-xs font-bold text-[#6b7a99] uppercase tracking-wider mb-2">Notes</h3>
    <p className="text-sm text-[#4c669a] leading-relaxed whitespace-pre-wrap">
      {notes || 'No additional notes.'}
    </p>
  </div>
);

export default DocumentNotes;
