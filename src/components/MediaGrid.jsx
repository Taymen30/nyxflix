import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useLocalStorage } from "../hooks/useLocalStorage";

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

export default function MediaGrid({ array }) {
  const [savedMediaType] = useLocalStorage("media-type", "movie");
  const [uniqueItem, setUniqueItem] = useState([]);

  useEffect(() => {
    const itemIDSet = new Set();
    const noDuplicates = array.filter((item) => {
      if (itemIDSet.has(item.id)) {
        return false;
      } else {
        itemIDSet.add(item.id);
        return true;
      }
    });
    setUniqueItem(noDuplicates);
  }, [array]);

  return (
    <div className="flex flex-wrap">
      <AnimatePresence>
        {uniqueItem.map((video) => (
          <motion.div
            key={video.id}
            layout
            transition={{
              duration: Math.random() * 2,
              type: "spring",
            }}
            className="w-1/3 md:w-1/5 group relative"
          >
            <Link
              to={`/${savedMediaType === "movie" ? "movie" : "tvshow"}/${
                video.id
              }`}
            >
              {video.poster_path ? (
                <>
                  <img
                    className="w-full group-hover:brightness-75 transition-all duration-300"
                    src={`https://image.tmdb.org/t/p/w500/${video.poster_path}`}
                    alt={video.title}
                  />
                  <MovieHoverInfo video={video} mediaType={savedMediaType} />
                </>
              ) : (
                <div className="relative flex flex-col h-[30vw] justify-center items-center border-gray-500 border group-hover:bg-gray-800 transition-colors duration-300">
                  <p className="text-1xl">No Poster</p>
                  <MovieHoverInfo video={video} mediaType={savedMediaType} />
                </div>
              )}
            </Link>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
