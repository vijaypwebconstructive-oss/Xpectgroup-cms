import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  isCurrency?: boolean;
  currencySymbol?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  isCurrency = false,
  currencySymbol = "£",
}) => {
  const formattedValue =
    isCurrency && typeof value === "number"
      ? `${currencySymbol}${value.toLocaleString()}`
      : value;

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm text-gray-500">{title}</h4>
        <div className="bg-gray-100 p-2 rounded-lg">{icon}</div>
      </div>

      {/* VALUE */}
      <h2 className="text-xl font-bold">{formattedValue}</h2>

      {/* OPTIONAL SUBTEXT */}
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
};

export default StatCard;
