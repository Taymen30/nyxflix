import React from "react";

export default function MediaTypeToggle({
  currentMediaType,
  setCurrentMediaType,
}) {
  const mediaTypes = ["movie", "tv"];

  return (
    <div className="flex items-center gap-2 mx-2 md:gap-5 md:mx-5">
      {mediaTypes.map((mediaType) => (
        <div
          key={mediaType}
          className={`group flex cursor-pointer ${
            currentMediaType === mediaType ? "text-white" : ""
          }`}
          onClick={() => setCurrentMediaType(mediaType)}
        >
          <div
            className={`appearance-none rounded-full w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 border-2 group-hover:bg-white group-hover:border-transparent ${
              currentMediaType === mediaType
                ? "bg-white border-transparent"
                : "border-white"
            }`}
          />
          <label
            htmlFor={mediaType}
            className="text-xs sm:text-sm lg:text-lg ml-1 group-hover:cursor-pointer"
          >
            {mediaType === "movie" ? (
              "Movies"
            ) : (
              <>
                TV <span className="hidden sm:inline">Shows</span>
              </>
            )}
          </label>
        </div>
      ))}
    </div>
  );
}
