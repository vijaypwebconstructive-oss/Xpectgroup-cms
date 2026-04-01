import React from "react";

interface StatCardProps {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon: React.ReactNode;
}

const TrendCard: React.FC<StatCardProps> = ({
  title,
  value,
  trend,
  trendUp,
  icon,
}) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between transition-all hover:shadow-md">
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">
          <span>£</span>
          {value}
        </h3>
        {trend && (
          <p
            className={`text-xs mt-2 font-medium flex items-center ${trendUp ? "text-emerald-600" : "text-rose-600"}`}
          >
            {trendUp ? (
              <svg
                className="w-3 h-3 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            ) : (
              <svg
                className="w-3 h-3 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            )}
            {trend} from last month
          </p>
        )}
      </div>
      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">{icon}</div>
    </div>
  );
};

export default TrendCard;
