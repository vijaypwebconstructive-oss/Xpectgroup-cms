import React, { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

interface Props {
  photos: string[];
}

const PhotosSection: React.FC<Props> = ({ photos }) => {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const slides = photos.map((src) => ({ src }));

  return (
    <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-5 space-y-4 max-h-[300px] overflow-y-scroll ">
      {/* 🔷 Section Title */}
      <h3 className="text-xl font-bold">Photos</h3>

      {/* 🔷 Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {photos.map((img, i) => (
          <img
            key={i}
            src={img}
            onClick={() => {
              setIndex(i);
              setOpen(true);
            }}
            className="rounded-[4px] cursor-pointer hover:scale-105 transition "
          />
        ))}
      </div>

      {/* 🔷 Lightbox */}
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={slides}
        index={index}
      />
    </div>
  );
};

export default PhotosSection;



  