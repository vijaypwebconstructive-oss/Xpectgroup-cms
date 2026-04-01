import React from "react";
import { ChecklistItem } from './types';

interface Props {
  checklist: ChecklistItem[];
}

const ChecklistSection: React.FC<Props> = ({ checklist }) => {
  return (
    <div className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm p-5 space-y-4">
      <h3 className="text-xl font-bold">Cleaning Quality</h3>

      {(checklist || []).map((item, index) => (
        <div
          key={index}
          className="flex p-4 rounded items-center justify-between py-2 border-b border  border-[#e7ebf3] bg-[#f2f6f9] "
        >
          {/* LEFT */}
          <span className="text-sm text-[#0d121b] font-medium">
            {item.label}
          </span>

          {/* RIGHT → STAR RATING */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`material-symbols-outlined text-[18px] ${
                  star <= item.rating
                    ? "text-yellow-400"
                    : "text-gray-300"
                }`}
              >
                star
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChecklistSection;