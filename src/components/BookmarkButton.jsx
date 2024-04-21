import React, { useState, useEffect } from "react";

export default function BookmarkButton({ id }) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    let Bookmarks = JSON.parse(localStorage.getItem("Bookmarks")) || [];
    if (!Bookmarks) {
      localStorage.setItem("Bookmarks", JSON.stringify([]));
      Bookmarks = [];
    }
    setIsBookmarked(Bookmarks.includes(id));
  }, [id]);

  const toggleFavorite = () => {
    let Bookmarks = JSON.parse(localStorage.getItem("Bookmarks")) || [];

    if (isBookmarked) {
      Bookmarks = Bookmarks.filter((movieId) => movieId !== id);
    } else {
      Bookmarks.push(id);
    }

    localStorage.setItem("Bookmarks", JSON.stringify(Bookmarks));

    setIsBookmarked(!isBookmarked);
  };

  return (
    <div>
      {isBookmarked ? (
        <button
          className="bg-yellow-400 w-32 rounded-2xl h-9 hover:opacity-70 transition-opacity duration-300"
          onClick={toggleFavorite}
        >
          Bookmark
        </button>
      ) : (
        <button
          className="bg-white w-32 rounded-2xl h-9 hover:opacity-70 transition-opacity duration-300"
          onClick={toggleFavorite}
        >
          Bookmark
        </button>
      )}
    </div>
  );
}
