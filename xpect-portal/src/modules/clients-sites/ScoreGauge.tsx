import React from "react";

interface Props {
  score: number; // 0 - 100
}

const ScoreGauge: React.FC<Props> = ({ score }) => {
  const radius = 50;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  const getColor = () => {
    if (score >= 80) return "#22c55e"; // green
    if (score >= 50) return "#f59e0b"; // yellow
    return "#ef4444"; // red
  };

  const strokeDashoffset =
    circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center mt-[-20px]">
      <svg height={radius * 2} width={radius * 2}>
        {/* Background circle */}
        <circle
          stroke='#f5f5f5'
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />

        {/* Progress circle */}
        <circle
          stroke={getColor()}
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          style={{
            transition: "stroke-dashoffset 0.5s ease",
            transform: "rotate(-90deg)",
            transformOrigin: "50% 50%",
          }}
        />
      </svg>

      {/* Center text */}
      <div className="-mt-[75px] text-center">
        <p className="text-2xl font-bold text-[#0d121b]">
          {score}%
        </p>
        <p className="text-xs text-[#000] mt-1">Score</p>
      </div>
    </div>
  );
};

export default ScoreGauge;