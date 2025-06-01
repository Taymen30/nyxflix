import React, { useState, useEffect } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

export default function BookmarkButton({ id }) {
  const [mediaType] = useLocalStorage("media-type", "movie");
  const [bookmarks, setBookmarks] = useLocalStorage(
    `bookmarked-${mediaType}`,
    []
  );
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    setIsBookmarked(bookmarks.includes(id));
  }, [id, bookmarks]);

  function toggleFavorite() {
    if (isBookmarked) {
      setBookmarks(bookmarks.filter((movieId) => movieId !== id));
    } else {
      setBookmarks([...bookmarks, id]);
    }
    setIsBookmarked(!isBookmarked);
  }

  return (
    <button
      className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white hover:bg-black hover:text-white transition-all duration-300 ${
        isBookmarked ? "bg-yellow-400 hover:bg-yellow-500" : "text-black"
      }`}
      onClick={toggleFavorite}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill={isBookmarked ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6 sm:w-7 sm:h-7"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
        />
      </svg>
    </button>
  );
}
