import React from "react";

export default function CenteredSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
      <div className="relative">
        {/* Enhanced neon glow effect */}
        <div className="absolute -inset-20 bg-pink-500/30 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute -inset-20 bg-pink-500/20 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute -inset-20 bg-pink-500/10 rounded-full blur-[200px] animate-pulse"></div>

        {/* Main spinner */}
        <div className="relative w-32 h-32">
          <div className="absolute opacity-50 inset-0 border-4 border-white rounded-full animate-[spin_2s_linear_infinite]"></div>
          <div className="absolute opacity-70 inset-4 border-4 border-white border-t-transparent rounded-full animate-[spin_1.5s_linear_infinite]"></div>
          <div className="absolute opacity-50 inset-8 border-4 border-white border-t-transparent rounded-full animate-[spin_1s_linear_infinite]"></div>
        </div>
      </div>
    </div>
  );
}
