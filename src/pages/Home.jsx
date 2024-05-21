import React, { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import MediaGrid from "../components/MediaGrid";
import MediaTypeToggle from "../components/MediaTypeToggle";

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
}) {
  const [movieListParam, setMovieListParam] = useState("now_playing");
  const [tvListParam, setTvListParam] = useState("popular");

  const [loading, setLoading] = useState(false);
  const [currentMediaType, setCurrentMediaType] = useState(
    localStorage.getItem("media-type") || "movie"
  );

  useEffect(() => {
    console.log(currentMoviePage, lastFetchedMoviePage);
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

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const filteredResults = data.results.filter((item) => item.poster_path);
        if (currentMediaType === "movie") {
          setMovies((prevMovies) => [...prevMovies, ...filteredResults]);
          setLastFetchedMoviePage(currentMoviePage);
        } else {
          setTvShows((prevShow) => [...prevShow, ...filteredResults]);
          setLastFetchedTvPage(currentTvPage);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, [
    movieListParam,
    tvListParam,
    currentMoviePage,
    currentTvPage,
    currentMediaType,
    lastFetchedMoviePage,
    lastFetchedTvPage,
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
      <header className="flex items-center h-14 w-full bg-black">
        <h1 className="text-white text-3xl sm:text-4xl md:text-6xl ml-1">
          MovieMaster
        </h1>
        <MediaTypeToggle
          currentMediaType={currentMediaType}
          setCurrentMediaType={setCurrentMediaType}
        />
        <SearchBar
          setMovieListParam={setMovieListParam}
          setTvListParam={setTvListParam}
          currentMediaType={currentMediaType}
        />
      </header>
      <MediaGrid array={currentMediaType === "movie" ? movies : tvShows} />
      {loading && <div>Loading...</div>}
    </>
  );
}
