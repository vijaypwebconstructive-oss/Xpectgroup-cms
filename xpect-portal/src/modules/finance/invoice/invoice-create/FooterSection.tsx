import React from 'react';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

const FooterSection: React.FC<Props> = ({ value, onChange }) => (
  <div className="space-y-4">
    <h2 className="text-sm font-bold text-[#6b7a99] uppercase tracking-wide">Invoice Footer</h2>
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      rows={3}
      className="w-full px-3 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] placeholder:text-[#6b7a99] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20 resize-y"
      placeholder="e.g. This invoice is computer generated and does not require a signature. Thank you for your business."
    />
  </div>
);

export default FooterSection;
