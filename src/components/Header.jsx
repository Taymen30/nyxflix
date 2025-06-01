import React, { useState, useEffect, useRef } from "react";
import {
  useLocation,
  useNavigate,
  Link,
  useSearchParams,
} from "react-router-dom";
import HomeButton from "./HomeButton";
import MediaTypeToggle from "./MediaTypeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { useLocalStorage } from "../hooks/useLocalStorage";

export default function Header({
  title,
  currentMediaType,
  setCurrentMediaType,
  movies,
  setMovies,
}) {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [isGamer, setIsGamer] = useLocalStorage("gamer", false); // useLocalStorage for "gamer" flag
  const [bookmarkedTv] = useLocalStorage("bookmarked-tv", []);
  const [bookmarkedMovies] = useLocalStorage("bookmarked-movie", []);
  const [togglePosition, setTogglePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isSearchVisible && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchVisible]);

  useEffect(() => {
    if (!isSearchVisible) {
      const toggle = document.querySelector(".media-type-toggle");
      if (toggle) {
        const rect = toggle.getBoundingClientRect();
        setTogglePosition({ x: rect.left, y: rect.top });
      }
    }
  }, [isSearchVisible]);

  function handleInput(e) {
    setQuery(e.target.value);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (query.toLocaleLowerCase() === "gamer") {
      setIsGamer(true); // Use setIsGamer from useLocalStorage
      setQuery("");
    } else {
      setSearchParams({ query });
      navigate(`/search?query=${query}`);
    }
  }

  function handleOverlayClick(e) {
    if (
      !e.target.closest(".media-type-toggle") &&
      !e.target.closest(".search-form")
    ) {
      setIsSearchVisible(false);
    }
  }

  function handleFormClick(e) {
    e.stopPropagation();
  }

  const shouldShowControls =
    location.pathname === "/" ||
    location.pathname.includes("/search") ||
    location.pathname.includes("/tvshow") ||
    location.pathname.includes("/movie") ||
    location.pathname.includes("/genre") ||
    location.pathname.includes("/bookmarks") ||
    location.pathname.includes("/person");

  return (
    <header
      className={`${
        location.pathname.includes("/movie") ||
        location.pathname.includes("/tvshow")
          ? "absolute"
          : "sticky bg-black bg-opacity-50"
      } top-0 left-0 right-0 z-50`}
    >
      <div className="relative w-full">
        {shouldShowControls && (
          <div className="flex justify-between items-center px-4 md:px-6 py-2">
            <h1 className="text-2xl sm:text-4xl md:text-6xl">{title}</h1>
            <AnimatePresence>
              {!isSearchVisible && (
                <motion.div className="flex-grow flex justify-center media-type-toggle">
                  {title && !location.pathname.includes("/person") && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentMediaType("movie")}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full transition-colors duration-300 min-w-[120px] justify-center ${
                          currentMediaType === "movie"
                            ? "bg-white text-black"
                            : "text-white hover:bg-white hover:bg-opacity-10"
                        }`}
                      >
                        <span className="w-6 h-6 flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z"
                            />
                          </svg>
                        </span>
                        <span>Movies</span>
                      </button>
                      <button
                        onClick={() => setCurrentMediaType("tv")}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full transition-colors duration-300 min-w-[120px] justify-center ${
                          currentMediaType === "tv"
                            ? "bg-white text-black"
                            : "text-white hover:bg-white hover:bg-opacity-10"
                        }`}
                      >
                        <span className="w-6 h-6 flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 20.25h12M3.75 6v7.5A2.25 2.25 0 006 15.75h13.5A2.25 2.25 0 0021.75 13.5V6m-18 0v-.75A2.25 2.25 0 016 3h13.5A2.25 2.25 0 0121.75 5.25V6m-18 0h18"
                            />
                          </svg>
                        </span>
                        <span>TV Shows</span>
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex items-center gap-2 sm:gap-4">
              <HomeButton
                currentMediaType={currentMediaType}
                setCurrentMediaType={setCurrentMediaType}
              />
              <div className="w-[40px] h-[40px] hidden sm:block">
                {location.pathname === "/" && currentMediaType === "movie" && (
                  <img
                    onClick={() => shuffleMovies()}
                    src="distribute-randomize.512x480.png"
                    alt=""
                    className="w-full h-full hover:cursor-pointer hover:opacity-70 transition-opacity duration-300 filter invert"
                  />
                )}
              </div>
              {location.pathname !== "/bookmarks" && hasBookmarks() && (
                <Link to="/bookmarks">
                  <img
                    src="/bookmarks-outline.417x512.png"
                    alt=""
                    className="h-[30px] sm:h-[40px] filter invert hover:cursor-pointer hover:opacity-70 transition-opacity duration-300"
                  />
                </Link>
              )}
              <motion.img
                onClick={() => setIsSearchVisible(true)}
                src="/search.512x512.png"
                alt=""
                className="w-[30px] h-[30px] sm:w-[40px] sm:h-[40px] hover:cursor-pointer hover:opacity-70 transition-opacity duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              />
            </div>
          </div>
        )}

        <AnimatePresence>
          {isSearchVisible && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={handleOverlayClick}
              className="fixed inset-0 flex flex-col items-center justify-start bg-black bg-opacity-70 z-50"
            >
              <motion.div
                className="mt-20 mb-8 media-type-toggle"
                initial={{
                  x: togglePosition.x,
                  y: togglePosition.y,
                  opacity: 0,
                }}
                animate={{ x: 0, y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentMediaType("movie")}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full transition-colors duration-300 min-w-[120px] justify-center ${
                      currentMediaType === "movie"
                        ? "bg-white text-black"
                        : "text-white hover:bg-white hover:bg-opacity-10"
                    }`}
                  >
                    <span className="w-6 h-6 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z"
                        />
                      </svg>
                    </span>
                    <span>Movies</span>
                  </button>
                  <button
                    onClick={() => setCurrentMediaType("tv")}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full transition-colors duration-300 min-w-[120px] justify-center ${
                      currentMediaType === "tv"
                        ? "bg-white text-black"
                        : "text-white hover:bg-white hover:bg-opacity-10"
                    }`}
                  >
                    <span className="w-6 h-6 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 20.25h12M3.75 6v7.5A2.25 2.25 0 006 15.75h13.5A2.25 2.25 0 0021.75 13.5V6m-18 0v-.75A2.25 2.25 0 016 3h13.5A2.25 2.25 0 0121.75 5.25V6m-18 0h18"
                        />
                      </svg>
                    </span>
                    <span>TV Shows</span>
                  </button>
                </div>
              </motion.div>
              <motion.div
                onClick={handleFormClick}
                className="bg-transparent rounded shadow-lg search-form"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <form
                  onSubmit={handleSubmit}
                  className="flex bg-black rounded p-2 border border-white"
                >
                  <input
                    id="search-input"
                    ref={searchInputRef}
                    value={query}
                    onChange={handleInput}
                    type="text"
                    className="bg-transparent w-[200px] md:w-[250px] text-white border-none outline-none px-2"
                  />
                  <button
                    type="submit"
                    className={`px-4 py-1 border border-white rounded hover:opacity-70 transition-opacity duration-300 ${
                      isGamer ? "bg-red-700" : "bg-black"
                    } text-white`}
                  >
                    Search
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );

  function hasBookmarks() {
    return bookmarkedTv.length > 0 || bookmarkedMovies.length > 0; // using useLocalStorage variables
  }

  function shuffleMovies() {
    const shuffledMovies = [...movies];
    for (let i = shuffledMovies.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledMovies[i], shuffledMovies[j]] = [
        shuffledMovies[j],
        shuffledMovies[i],
      ];
    }
    setMovies(shuffledMovies);
  }
}
