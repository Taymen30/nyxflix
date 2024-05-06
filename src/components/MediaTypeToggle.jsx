import React, { useState, useEffect } from "react";

export default function MediaTypeToggle({
  currentMediaType,
  setCurrentMediaType,
}) {
  useEffect(() => {
    let savedMediaType = localStorage.getItem("media-type");

    if (savedMediaType) {
      setCurrentMediaType(savedMediaType);
    } else {
      localStorage.setItem("media-type", currentMediaType);
    }
  }, []);

  function handleToggle(e) {
    setCurrentMediaType(e.target.value);
    localStorage.setItem("media-type", e.target.value);
  }

  return (
    <div className="flex items-center gap-2 mx-3">
      <input
        type="radio"
        value="movie"
        checked={currentMediaType === "movie"}
        onChange={handleToggle}
        className="appearance-none rounded-full w-4 h-4 border-2 border-white checked:bg-white checked:border-transparent"
      />
      <label htmlFor="movie" className="text-white">
        Movies
      </label>

      <input
        type="radio"
        value="tv"
        checked={currentMediaType === "tv"}
        onChange={handleToggle}
        className="appearance-none rounded-full w-4 h-4 border-2 border-white checked:bg-white checked:border-transparent"
      />
      <label htmlFor="tvShows" className="text-white">
        TV Shows
      </label>
    </div>
  );
}
