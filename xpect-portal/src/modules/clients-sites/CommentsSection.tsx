import React from "react";
interface Props {
  comments: string;
}

const CommentsSection: React.FC<Props> = ({ comments }) => {
  return (
    <div className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm p-5">
      <h3 className="text-xl font-bold">Comments</h3>

      <p className="text-sm text-[#4c669a]">
        {comments || "No comments"}
      </p>
    </div>
  );
};

  export default CommentsSection;