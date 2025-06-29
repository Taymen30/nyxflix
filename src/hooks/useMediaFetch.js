import { useState, useEffect, useCallback } from "react";
import { useMedia } from "../context/MediaContext";

const apiKey = process.env.REACT_APP_API_KEY;

export const useMediaFetch = () => {
  const {
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
  } = useMedia();

  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
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
        ? `https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=en-US&page=${currentMoviePage}`
        : `https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}&language=en-US&page=${currentTvPage}`;

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
  }, [
    currentMediaType,
    currentMoviePage,
    currentTvPage,
    lastFetchedMoviePage,
    lastFetchedTvPage,
    setMovies,
    setLastFetchedMoviePage,
    setTvShows,
    setLastFetchedTvPage,
  ]);

  useEffect(() => {
    if (!loading) {
      fetchData();
    }
  }, [currentMoviePage, currentTvPage, currentMediaType, fetchData, loading]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = 200;
      if (
        window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - scrollThreshold &&
        !loading
      ) {
        if (currentMediaType === "movie") {
          setCurrentMoviePage((prevPage) => prevPage + 1);
        } else {
          setCurrentTvPage((prevPage) => prevPage + 1);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, currentMediaType, setCurrentMoviePage, setCurrentTvPage]);

  const media = currentMediaType === "movie" ? movies : tvShows;

  return { media, loading };
};
