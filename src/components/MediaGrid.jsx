import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

export default function MediaGrid({ array }) {
  let savedMediaType = localStorage.getItem("media-type");
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
        {uniqueItem.map((video, i) => (
          <motion.div
            key={video.id}
            layout
            transition={{
              duration: Math.random() * 2,
              type: "spring",
            }}
            className="w-[10%] md:w-[10%] hover:opacity-70 transition-opacity duration-300"
          >
            <Link
              to={`/${savedMediaType === "movie" ? "movie" : "tvshow"}/${
                video.id
              }`}
            >
              {video.poster_path ? (
                <img
                  className="w-full"
                  src={`https://image.tmdb.org/t/p/w500/${video.poster_path}`}
                  alt={video.title}
                />
              ) : (
                <div className="flex flex-col h-[30vw] justify-center items-center border-gray-500 border">
                  <p className=" text-2xl text-center">{video.title}</p>
                  <br />
                  <p className=" text-1xl">No Poster</p>
                </div>
              )}
            </Link>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
