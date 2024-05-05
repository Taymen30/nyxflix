import React, { useState, useEffect } from "react";

export default function MediaTypeToggle({
  currentMediaType,
  setCurrentMediaType,
}) {
  useEffect(() => {
    let savedMediaType = localStorage.getItem("Media_Type");

    if (savedMediaType) {
      setCurrentMediaType(savedMediaType);
    } else {
      localStorage.setItem("Media_Type", currentMediaType);
    }
  }, []);

  function toggleMediaType() {
    const newMediaType = currentMediaType === "Movies" ? "TV Shows" : "Movies";
    setCurrentMediaType(newMediaType);
    localStorage.setItem("Media_Type", newMediaType);
  }

  return (
    <>
      <button onClick={toggleMediaType} className="text-white">
        {currentMediaType === "Movies" ? "TV Shows" : "Movies"}
      </button>
    </>
  );
}
