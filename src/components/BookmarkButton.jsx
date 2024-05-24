import React, { useState, useEffect } from "react";

export default function BookmarkButton({ id }) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [mediaType, setMediaType] = useState(
    localStorage.getItem("media-type") || "movie"
  );

  useEffect(() => {
    const bookmarks =
      JSON.parse(localStorage.getItem(`bookmarked-${mediaType}`)) || [];
    setIsBookmarked(bookmarks.includes(id));
  }, [id, mediaType]);

  return (
    <>
      <button
        className={`text-black text-xs w-20 md:w-32 h-7 md:h-9 rounded-2xl hover:opacity-70 transition-opacity duration-300 ${
          isBookmarked ? "bg-yellow-400" : "bg-white"
        }`}
        onClick={toggleFavorite}
      >
        Bookmark
      </button>
    </>
  );

  function toggleFavorite() {
    const bookmarks =
      JSON.parse(localStorage.getItem(`bookmarked-${mediaType}`)) || [];

    if (isBookmarked) {
      localStorage.setItem(
        `bookmarked-${mediaType}`,
        JSON.stringify(bookmarks.filter((movieId) => movieId !== id))
      );
    } else {
      localStorage.setItem(
        `bookmarked-${mediaType}`,
        JSON.stringify([...bookmarks, id])
      );
    }

    setIsBookmarked(!isBookmarked);
  }
}
