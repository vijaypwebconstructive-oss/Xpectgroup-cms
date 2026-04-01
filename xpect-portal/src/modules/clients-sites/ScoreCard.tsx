import React from 'react';
import ScoreGauge from "./ScoreGauge";
interface Props {
  score: number;
}

const ScoreCard: React.FC<Props> = ({ score }) =>  {
  return (
    <div className="bg-white border border-[#e7ebf3] rounded-2xl p-5 shadow-sm flex flex-col">
      <h3 className="text-xl font-bold">
        Score
      </h3>

      <div className="h-[80px]">
        <ScoreGauge score={score} />
      </div>
    </div>
  );
};

  export default ScoreCard;