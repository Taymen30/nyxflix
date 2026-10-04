import React from "react";
import { mediaStyles } from "./mediaStyles";

function SkeletonShape({ className = "" }) {
  return (
    <span
      className={`skeleton-shape relative block shrink-0 overflow-hidden rounded-md bg-slate-300/[.075] shadow-[inset_0_1px_0_rgba(210,220,230,.025)] after:absolute after:inset-0 after:-translate-x-full after:animate-ghost-shimmer after:bg-[linear-gradient(105deg,transparent_15%,rgba(195,215,223,.065)_50%,transparent_85%)] after:content-[''] motion-reduce:after:hidden motion-reduce:after:animate-none ${className}`}
    />
  );
}

export default function MediaSkeleton({ type, showActions }) {
  return (
    <div
      className={`${mediaStyles.page} media-skeleton overflow-hidden`}
      role="status"
      aria-label={`Loading ${type === "tvshow" ? "show" : "movie"} details`}
    >
      <span className="sr-only">Loading details…</span>
      <div
        className="media-skeleton-fog pointer-events-none absolute -inset-[10%] animate-fog-drift bg-[radial-gradient(ellipse_at_55%_38%,rgba(103,125,137,.12),transparent_48%),radial-gradient(ellipse_at_38%_85%,rgba(110,25,38,.1),transparent_45%),radial-gradient(ellipse_at_80%_65%,rgba(80,105,115,.07),transparent_40%)] motion-reduce:animate-none"
        aria-hidden="true"
      />
      <div
        className="absolute right-[clamp(20px,4vw,72px)] top-5 flex gap-3 max-sm:right-5 max-sm:top-4"
        aria-hidden="true"
      >
        {[0, 1, 2].map((index) => (
          <SkeletonShape key={index} className="h-8 w-8 !rounded-full opacity-50" />
        ))}
      </div>
      <div className={`${mediaStyles.layout} relative`} aria-hidden="true">
        <div className={mediaStyles.stage} />
        <div className="min-w-0">
          <div className={mediaStyles.titleRow}>
            <SkeletonShape className="h-[clamp(39px,4.75vw,78px)] w-[min(75%,520px)] !bg-slate-300/[.13]" />
            <SkeletonShape className="h-4 w-[52px]" />
          </div>
          <div className={mediaStyles.genres}>
            {["w-[72px]", "w-28", "w-[88px]"].map((width) => (
              <SkeletonShape key={width} className={`h-3 ${width}`} />
            ))}
          </div>
          {type === "tvshow" && showActions && (
            <SkeletonShape className="mt-3.5 h-3.5 w-[min(65%,260px)]" />
          )}
          {type !== "tvshow" && (
            <div className={`${mediaStyles.overview} grid gap-3 py-1.5`}>
              <SkeletonShape className="h-3" />
              <SkeletonShape className="h-3 w-[76%]" />
            </div>
          )}
          {showActions && (
            <div className={mediaStyles.actions}>
              <div className="flex items-center gap-3">
                <SkeletonShape className="h-11 w-[104px] !rounded-lg !bg-slate-300/[.15]" />
                <SkeletonShape className="h-11 w-11 !rounded-full" />
                <SkeletonShape className="h-11 w-11 !rounded-full" />
              </div>
            </div>
          )}
          {type === "tvshow" && showActions && (
            <div className="mt-5 flex gap-3 overflow-hidden pt-7">
              {[0, 1, 2, 3].map((index) => (
                <SkeletonShape key={index} className="skeleton-episode h-24 w-36 !rounded-lg" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
