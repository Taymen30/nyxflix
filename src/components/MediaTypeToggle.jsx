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

  return (
    <div className="flex items-center gap-1 mx-3">
      <input
        type="radio"
        value="movie"
        checked={currentMediaType === "movie"}
        onChange={handleToggle}
        className="appearance-none rounded-full w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 border-2 border-white checked:bg-white checked:border-transparent"
      />
      <label htmlFor="movie" className=" text-sm lg:text-lg">
        Movies
      </label>

      <input
        type="radio"
        value="tv"
        checked={currentMediaType === "tv"}
        onChange={handleToggle}
        className="appearance-none rounded-full w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 border-2 border-white checked:bg-white checked:border-transparent"
      />
      <label htmlFor="tvShows" className=" text-sm lg:text-lg">
        TV
      </label>
      <label htmlFor="tvShows" className=" hidden lg:block text-sm lg:text-lg ">
        Shows
      </label>
    </div>
  );

  function handleToggle(e) {
    setCurrentMediaType(e.target.value);
    localStorage.setItem("media-type", e.target.value);
  }
}
