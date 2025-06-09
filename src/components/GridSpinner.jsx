import React from "react";

export default function GridSpinner() {
  return (
    <div className="w-1/3 md:w-1/5 relative flex justify-center items-center min-h-[300px]">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-pink-500"></div>
    </div>
  );
}
