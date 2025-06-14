import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import MediaGrid from "../components/MediaGrid";
import { motion, AnimatePresence } from "framer-motion";
import { getTitle } from "../utils/Helpers";
import { useLocalStorage } from "../hooks/useLocalStorage";
import CenteredSpinner from "../components/CenteredSpinner";

const apiKey = process.env.REACT_APP_API_KEY;

export default function Home({
  movies,
  setMovies,
  tvShows,
  setTvShows,
  currentTvPage,
  setCurrentTvPage,
  currentMoviePage,
  setCurrentMoviePage,
  lastFetchedMoviePage,
  setLastFetchedMoviePage,
  lastFetchedTvPage,
  setLastFetchedTvPage,
  currentMediaType,
  setCurrentMediaType,
}) {
  const [movieListParam] = useState("now_playing");
  const [tvListParam] = useState("popular");
  const [loading, setLoading] = useState(false);
  const [animationShown, setAnimationShown] = useLocalStorage(
    "animationShown",
    false
  );

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      if (
        currentMediaType === "movie" &&
        currentMoviePage === lastFetchedMoviePage
      ) {
        setLoading(false);
        return;
      }

      if (currentMediaType === "tv" && currentTvPage === lastFetchedTvPage) {
        setLoading(false);
        return;
      }

      const url =
        currentMediaType === "movie"
          ? `https://api.themoviedb.org/3/movie/${movieListParam}?api_key=${apiKey}&language=en-US&page=${currentMoviePage}`
          : `https://api.themoviedb.org/3/tv/${tvListParam}?api_key=${apiKey}&language=en-US&page=${currentTvPage}`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        const filteredResults = data.results.filter(
          (item) =>
            item.poster_path &&
            item.vote_count > 100 &&
            ["ko", "ja", "en", "es"].includes(item.original_language)
        );

        if (currentMediaType === "movie") {
          setMovies((prevMovies) => [...prevMovies, ...filteredResults]);
          setLastFetchedMoviePage(currentMoviePage);
        } else {
          setTvShows((prevShow) => [...prevShow, ...filteredResults]);
          setLastFetchedTvPage(currentTvPage);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (!loading) {
      if (
        currentMediaType === "tv" ? tvShows.length < 20 : movies.length < 20
      ) {
        if (currentMediaType === "movie") {
          setCurrentMoviePage((prev) => prev + 1);
        } else if (currentMediaType === "tv") {
          setCurrentTvPage((prev) => prev + 1);
        }
      }
      fetchData();
    }
  }, [
    movieListParam,
    tvListParam,
    currentMoviePage,
    currentTvPage,
    currentMediaType,
    lastFetchedMoviePage,
    lastFetchedTvPage,
    loading,
  ]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = 200;
      const scrollY = window.scrollY || window.pageYOffset;
      if (
        window.innerHeight + scrollY >=
          document.documentElement.scrollHeight - scrollThreshold &&
        !loading
      ) {
        currentMediaType === "movie"
          ? setCurrentMoviePage((prevPage) => prevPage + 1)
          : setCurrentTvPage((prevPage) => prevPage + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, currentMediaType]);

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
            <MediaGrid
              setArray={setMovies}
              array={currentMediaType === "movie" ? movies : tvShows}
              loading={loading}
            />
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
            <MediaGrid
              setArray={setMovies}
              array={currentMediaType === "movie" ? movies : tvShows}
              loading={loading}
            />
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
