import React from "react";

export default function MovieHoverInfo({ video, mediaType }) {
  const title = video.title || video.name;
  const dateString = mediaType === "movie" ? video.release_date : video.first_air_date;
  const releaseDate = dateString ? new Date(`${dateString}T00:00:00`) : null;
  const releaseInfo = releaseDate && !Number.isNaN(releaseDate.getTime())
    ? releaseDate.toLocaleDateString("en-AU", { month: "short", year: "numeric" })
    : "Date unknown";
  const rating = Number(video.vote_average);

  return (
    <div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-black/95 via-black/10 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none">
      <div className="w-full translate-y-2 px-3 pb-4 pt-12 transition-transform duration-200 group-hover:translate-y-0 group-focus-within:translate-y-0 motion-reduce:transform-none motion-reduce:transition-none sm:px-5 sm:pb-5">
        <h2 className="line-clamp-2 font-outfit text-base font-semibold leading-tight text-white sm:text-xl">{title}</h2>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] text-white/65 sm:text-xs">
          <span>{releaseInfo}</span>
          {rating > 0 && <span aria-label={`Rating ${rating.toFixed(1)} out of 10`} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[.08] px-2 py-0.5 text-white/90"><svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3 text-amber-200/90"><path d="m10 2 2.47 5.01L18 7.82l-4 3.9.94 5.51L10 14.63l-4.94 2.6L6 11.72l-4-3.9 5.53-.81L10 2Z" /></svg>{rating.toFixed(1)}</span>}
        </div>
      </div>
    </div>
  );
}
