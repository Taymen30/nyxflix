import React from "react";

export default function PosterSkeleton({ className = "" }) {
  return (
    <div aria-hidden="true" className={`poster-skeleton relative aspect-[2/3] overflow-hidden bg-[#101218] shadow-[inset_0_0_0_1px_rgba(255,255,255,.025)] after:absolute after:inset-0 after:-translate-x-full after:animate-ghost-shimmer after:bg-[linear-gradient(105deg,transparent_15%,rgba(180,199,215,.045)_50%,transparent_85%)] after:content-[''] motion-reduce:after:hidden ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(92,110,128,.07),transparent_65%),linear-gradient(to_top,rgba(59,15,22,.12),transparent_50%)]" />
      <div className="absolute bottom-5 left-5 right-5 space-y-2 opacity-40">
        <div className="h-2 w-2/3 rounded-full bg-white/[.07]" />
        <div className="h-1.5 w-1/3 rounded-full bg-white/[.05]" />
      </div>
    </div>
  );
}
