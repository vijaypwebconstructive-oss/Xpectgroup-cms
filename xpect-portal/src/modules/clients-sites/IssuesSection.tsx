import React from 'react';
import { Issue } from './types';

interface Props {
  issues: Issue[];
}

const IssuesSection: React.FC<Props> = ({ issues }) => {
  console.log(issues)
  return (
    <div className="bg-white rounded-2xl border-[#e7ebf3] shadow-sm border p-5 space-y-3">
      <h3 className="text-xl font-bold">Issues</h3>

      {issues.length === 0 && <p>No issues</p>}

      {issues.map((issue, index) => (
        <div key={index} className={`flex p-4 rounded items-center justify-between py-2 border-b border  border-[#e7ebf3] ${
          issue.severity === "High" ? "bg-red-200" :"bg-[#fffbeb]"
        }  `}>
          <span>{issue.title}</span>
          <span className="text-red-500 text-xs sm:text-[14px]">
            {issue.severity}
          </span>
        </div>
      ))}
    </div>
  );
};

  export default IssuesSection;