import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import MediaGrid from "../components/MediaGrid";
import Challenge from "../components/Challenge";
import { motion, AnimatePresence } from "framer-motion";

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
  const [movieListParam, setMovieListParam] = useState("now_playing");
  const [tvListParam, setTvListParam] = useState("popular");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(() => {
    return localStorage.getItem("challenge") === "completed";
  });
  const [animationShown, setAnimationShown] = useState(() => {
    return localStorage.getItem("animationShown") === "true";
  });

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
        const filteredResults = data.results.filter((item) => item.poster_path);

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
      {!verified && <Challenge setVerified={setVerified} />}

      <AnimatePresence>
        {verified && !animationShown && (
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
              localStorage.setItem("animationShown", "true");
            }}
          >
            <Header
              title={"MovieMaster"}
              currentMediaType={currentMediaType}
              setCurrentMediaType={setCurrentMediaType}
              movies={movies}
              setMovies={setMovies}
            />
            <MediaGrid
              setArray={setMovies}
              array={currentMediaType === "movie" ? movies : tvShows}
            />
          </motion.div>
        )}
        {verified && animationShown && (
          <div>
            <Header
              title={"MovieMaster"}
              currentMediaType={currentMediaType}
              setCurrentMediaType={setCurrentMediaType}
              movies={movies}
              setMovies={setMovies}
            />
            <MediaGrid
              setArray={setMovies}
              array={currentMediaType === "movie" ? movies : tvShows}
            />
          </div>
        )}
      </AnimatePresence>
      {loading && <div>Loading...</div>}
    </>
  );
}
