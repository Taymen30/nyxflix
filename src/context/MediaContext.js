import React, { createContext, useState, useContext } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

const MediaContext = createContext();

export const useMedia = () => {
  return useContext(MediaContext);
};

export const MediaProvider = ({ children }) => {
  const [movies, setMovies] = useState([]);
  const [tvShows, setTvShows] = useState([]);
  const [currentTvPage, setCurrentTvPage] = useState(1);
  const [currentMoviePage, setCurrentMoviePage] = useState(1);
  const [lastFetchedMoviePage, setLastFetchedMoviePage] = useState(0);
  const [lastFetchedTvPage, setLastFetchedTvPage] = useState(0);
  const [currentMediaType, setCurrentMediaType] = useLocalStorage(
    "media-type",
    "movie"
  );

  const value = {
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
  };

  return (
    <MediaContext.Provider value={value}>{children}</MediaContext.Provider>
  );
};
