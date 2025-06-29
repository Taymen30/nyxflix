import React, { useState } from "react";
import Header from "../components/Header";
import MediaGrid from "../components/MediaGrid";
import { motion, AnimatePresence } from "framer-motion";
import { getTitle } from "../utils/Helpers";
import { useLocalStorage } from "../hooks/useLocalStorage";
import CenteredSpinner from "../components/CenteredSpinner";
import { useMedia } from "../context/MediaContext";
import { useMediaFetch } from "../hooks/useMediaFetch";

export default function Home() {
  const { currentMediaType, setCurrentMediaType, movies, setMovies, tvShows } =
    useMedia();
  const { media, loading } = useMediaFetch();
  const [animationShown, setAnimationShown] = useLocalStorage(
    "animationShown",
    false
  );

  return (
    <>
      <AnimatePresence>
        {!animationShown && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0,
              x: window.innerWidth,
              y: window.innerHeight,
            }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            transition={{ duration: 0.5 }}
            onAnimationComplete={() => {
              setAnimationShown(true);
            }}
          >
            <Header
              title={getTitle()}
              currentMediaType={currentMediaType}
              setCurrentMediaType={setCurrentMediaType}
              movies={movies}
              setMovies={setMovies}
            />
            <MediaGrid setArray={setMovies} array={media} loading={loading} />
          </motion.div>
        )}
        {animationShown && (
          <div>
            <Header
              title={getTitle()}
              currentMediaType={currentMediaType}
              setCurrentMediaType={setCurrentMediaType}
              movies={movies}
              setMovies={setMovies}
            />
            <MediaGrid setArray={setMovies} array={media} loading={loading} />
          </div>
        )}
      </AnimatePresence>
      {loading &&
        (currentMediaType === "movie"
          ? movies.length === 0
          : tvShows.length === 0) && <CenteredSpinner />}
    </>
  );
}
