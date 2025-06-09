import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useLocalStorage } from "../hooks/useLocalStorage";
import MovieHoverInfo from "./MovieHoverInfo";
import GridSpinner from "./GridSpinner";

const MediaItem = ({ item, mediaType }) => {
  const linkPath = `/${mediaType === "movie" ? "movie" : "tvshow"}/${item.id}`;
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <motion.div
      key={item.id}
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        opacity: { duration: 0.5 },
        layout: { duration: Math.random() * 0.5 + 0.2, type: "spring" },
      }}
      className="w-1/3 md:w-1/5 group relative bg-black"
    >
      <Link to={linkPath}>
        {item.poster_path ? (
          <>
            <img
              className={`w-full group-hover:brightness-75 transition-opacity duration-500 ${
                isLoaded ? "opacity-100" : "opacity-0"
              }`}
              src={`https://image.tmdb.org/t/p/w500/${item.poster_path}`}
              alt={item.title}
              onLoad={() => setIsLoaded(true)}
            />
            <div
              className={`transition-opacity duration-500 ${
                isLoaded ? "opacity-100" : "opacity-0"
              }`}
            >
              <MovieHoverInfo video={item} mediaType={mediaType} />
            </div>
          </>
        ) : (
          <div className="relative flex flex-col h-[30vw] justify-center items-center border-gray-500 border group-hover:bg-gray-800 transition-colors duration-300">
            <p className="text-1xl">No Poster</p>
            <MovieHoverInfo video={item} mediaType={mediaType} />
          </div>
        )}
      </Link>
    </motion.div>
  );
};

export default function MediaGrid({ array, loading }) {
  const [savedMediaType] = useLocalStorage("media-type", "movie");

  const uniqueItems = useMemo(() => {
    const itemIDSet = new Set();
    return array.filter((item) => {
      if (itemIDSet.has(item.id)) {
        return false;
      }
      itemIDSet.add(item.id);
      return true;
    });
  }, [array]);

  return (
    <div className="flex flex-wrap">
      <AnimatePresence>
        {uniqueItems.map((item) => (
          <MediaItem key={item.id} item={item} mediaType={savedMediaType} />
        ))}
        {loading && <GridSpinner />}
      </AnimatePresence>
    </div>
  );
}
