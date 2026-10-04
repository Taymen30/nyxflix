import React from "react";

export default function MediaTypeToggle({ currentMediaType, setCurrentMediaType }) {
  return (
    <div role="group" aria-label="Content type" className="media-type-toggle inline-flex rounded-full border border-white/10 bg-white/[.04] p-1">
      {[["movie", "Movies"], ["tv", "TV Shows"]].map(([value, label]) => (
        <button
          key={value}
          type="button"
          aria-pressed={currentMediaType === value}
          onClick={() => setCurrentMediaType(value)}
          className={`min-h-10 rounded-full px-5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${currentMediaType === value ? "bg-white text-black shadow-sm" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
