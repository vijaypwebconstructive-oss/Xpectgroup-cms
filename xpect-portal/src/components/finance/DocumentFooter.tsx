import React from 'react';

const DEFAULT_FOOTER = 'This document is computer generated and does not require a signature.';

interface DocumentFooterProps {
  footer?: string | null;
}

const DocumentFooter: React.FC<DocumentFooterProps> = ({ footer }) => {
  const text = (footer || DEFAULT_FOOTER).trim();
  if (!text) return null;
  return (
    <div className="mt-10 pt-6 border-t border-[#e7ebf3]">
      <p className="text-sm text-[#0d121b] whitespace-pre-wrap">{text}</p>
    </div>
  );
};

export default DocumentFooter;
