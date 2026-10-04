import React from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useMedia } from "../context/MediaContext";

export default function BookmarkButton({ id, mediaType, className = "" }) {
  const { currentMediaType } = useMedia();
  const [movies, setMovies] = useLocalStorage("bookmarked-movie", []);
  const [tvShows, setTvShows] = useLocalStorage("bookmarked-tv", []);
  const resolvedType = (mediaType || currentMediaType) === "tvshow" ? "tv" : mediaType || currentMediaType;
  const bookmarks = resolvedType === "tv" ? tvShows : movies;
  const setBookmarks = resolvedType === "tv" ? setTvShows : setMovies;
  const itemId = Number(id);
  const isBookmarked = Array.isArray(bookmarks) && bookmarks.some((value) => Number(value) === itemId);
  const label = isBookmarked ? "Remove from bookmarks" : "Save to bookmarks";

  function toggleBookmark() {
    setBookmarks((previous) => {
      const ids = Array.isArray(previous) ? previous : [];
      return ids.some((value) => Number(value) === itemId)
        ? ids.filter((value) => Number(value) !== itemId)
        : [...ids, itemId];
    });
  }

  return (
    <button type="button" aria-label={label} title={label} aria-pressed={isBookmarked} disabled={!Number.isFinite(itemId)} onClick={toggleBookmark} className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${isBookmarked ? "border-white/30 bg-white/[.16] text-white hover:bg-white/25" : "border-white/15 bg-white/[.08] text-white/75 hover:bg-white/15 hover:text-white"} ${className}`}>
      <svg aria-hidden="true" fill={isBookmarked ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12v18l-6-4-6 4V3Z" /></svg>
    </button>
  );
}
