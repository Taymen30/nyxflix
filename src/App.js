import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import MediaDetails from "./pages/Media";
import Search from "./pages/Search";
import Genre from "./pages/Genre";
import Bookmarks from "./pages/Bookmarks";
import Person from "./pages/Person";
import { Analytics } from "@vercel/analytics/react";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [tvShows, setTvShows] = useState([]);
  const [currentTvPage, setCurrentTvPage] = useState(1);
  const [currentMoviePage, setCurrentMoviePage] = useState(1);
  const [lastFetchedMoviePage, setLastFetchedMoviePage] = useState(0);
  const [lastFetchedTvPage, setLastFetchedTvPage] = useState(0);
  const [currentMediaType, setCurrentMediaType] = useState(
    localStorage.getItem("media-type") || "movie"
  );
  return (
    <>
      <Router>
        <Routes>
          <Route
            exact
            path="/"
            element={
              <Home
                movies={movies}
                setMovies={setMovies}
                tvShows={tvShows}
                setTvShows={setTvShows}
                currentTvPage={currentTvPage}
                setCurrentTvPage={setCurrentTvPage}
                currentMoviePage={currentMoviePage}
                setCurrentMoviePage={setCurrentMoviePage}
                lastFetchedMoviePage={lastFetchedMoviePage}
                setLastFetchedMoviePage={setLastFetchedMoviePage}
                lastFetchedTvPage={lastFetchedTvPage}
                setLastFetchedTvPage={setLastFetchedTvPage}
                currentMediaType={currentMediaType}
                setCurrentMediaType={setCurrentMediaType}
              />
            }
          />
          <Route
            exact
            path="/:type/:id"
            element={
              <MediaDetails
                currentMediaType={currentMediaType}
                setCurrentMediaType={setCurrentMediaType}
              />
            }
          />
          <Route
            exact
            path="/search"
            element={
              <Search
                currentMediaType={currentMediaType}
                setCurrentMediaType={setCurrentMediaType}
              />
            }
          />
          <Route
            exact
            path="/genre/:genre"
            element={
              <Genre
                currentMediaType={currentMediaType}
                setCurrentMediaType={setCurrentMediaType}
              />
            }
          />
          <Route
            exact
            path="/bookmarks"
            element={
              <Bookmarks
                currentMediaType={currentMediaType}
                setCurrentMediaType={setCurrentMediaType}
              />
            }
          />
          <Route
            exact
            path="/person/:id"
            element={
              <Person
                currentMediaType={currentMediaType}
                setCurrentMediaType={setCurrentMediaType}
              />
            }
          />
        </Routes>
      </Router>
      <Analytics />
    </>
  );
}
