import React from "react";

const MovieHoverInfo = ({ video, mediaType }) => {
  const getReleaseInfo = () => {
    const dateString =
      mediaType === "movie" ? video.release_date : video.first_air_date;
    if (!dateString) return "Date unknown";

    const releaseDate = new Date(dateString);
    const today = new Date();

    if (releaseDate > today) {
      const daysUntil = Math.ceil(
        (releaseDate - today) / (1000 * 60 * 60 * 24)
      );
      return `In ${daysUntil} days`;
    }

    return releaseDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2">
      <div className="flex justify-between px-2">
        <p className="text-sm text-white">{getReleaseInfo()}</p>
        {video.vote_average > 0 && (
          <p className="text-sm text-white">{video.vote_average.toFixed(1)}</p>
        )}
      </div>
    </div>
  );
};

export default MovieHoverInfo;
