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
      className={`text-black text-xs w-20 md:w-32 h-7 md:h-9 rounded-2xl hover:opacity-70 transition-opacity duration-300 ${
        isBookmarked ? "bg-yellow-400" : "bg-white"
      }`}
      onClick={toggleFavorite}
    >
      Bookmark
    </button>
  );
}
