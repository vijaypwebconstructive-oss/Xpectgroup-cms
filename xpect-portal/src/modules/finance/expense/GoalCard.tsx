import React, { useState, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";

interface GoalCardProps {
  title: string;
  type: string;
  actual: number;
  target: number;
  onSave?: (type: string, value: number) => void;
  icon?: React.ReactNode;
  isCurrency?: boolean; // 🔥 reusable
}

const GoalCard: React.FC<GoalCardProps> = ({
  title,
  type,
  actual,
  target,
  onSave,
  icon,
  isCurrency = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTarget, setTempTarget] = useState(target);

  // ✅ sync when parent updates
  useEffect(() => {
    setTempTarget(target);
  }, [target]);

  const progress = Math.min((actual / (tempTarget || 1)) * 100, 100);

  const handleSave = () => {
    setIsEditing(false);
    onSave?.(type, tempTarget);
  };

  const handleCancel = () => {
    setTempTarget(target);
    setIsEditing(false);
  };

  // ✅ dynamic color
  const progressColor =
    progress > 75
      ? "bg-green-600"
      : progress > 40
        ? "bg-yellow-500"
        : "bg-yellow-500";

  // ✅ dynamic symbol
  const symbol = isCurrency ? "£" : "";

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm text-gray-500">{title}</h4>
        <div className="bg-indigo-100 p-2 rounded-lg">{icon}</div>
      </div>

      {/* VALUE / EDIT */}
      {!isEditing ? (
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">
            {symbol}
            {actual}
            <span className="text-gray-400 text-sm">
              {" "}
              / {symbol}
              {tempTarget}
            </span>
          </h2>

          <button
            onClick={() => setIsEditing(true)}
            className="p-1 rounded hover:bg-gray-100"
          >
            <Pencil size={16} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={tempTarget}
            onChange={(e) => setTempTarget(Number(e.target.value))}
            className="border px-2 py-1 rounded w-24 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          <button
            onClick={handleSave}
            className="text-green-600 hover:scale-110"
          >
            <Check size={18} />
          </button>

          <button
            onClick={handleCancel}
            className="text-red-500 hover:scale-110"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* PROGRESS */}
      <div className="mt-3 h-2 bg-gray-200 rounded overflow-hidden">
        <div
          className={`h-full transition-all ${progressColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-xs text-gray-500 mt-1">
        {progress.toFixed(1)}% of target
      </p>
    </div>
  );
};

export default GoalCard;
