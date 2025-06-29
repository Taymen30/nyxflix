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
          <div className="flex justify-between items-center px-4 md:px-6 py-1 gap-2 md:gap-4">
            <h1 className="flex-1 min-w-0 text-xl sm:text-2xl md:text-4xl lg:text-6xl font-bold tracking-wide text-white [text-shadow:_0_0_10px_#ff69b4,_0_0_20px_#ff69b4,_0_0_30px_#ff69b4]">
              {title}
            </h1>
            <div className="flex items-center gap-2 md:gap-4">
              <AnimatePresence>
                {!isSearchVisible && (
                  <motion.div className="flex justify-center media-type-toggle w-auto md:w-[280px] flex-shrink-0">
                    {title && !location.pathname.includes("/person") && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentMediaType("movie")}
                          className={`flex items-center justify-between px-2 sm:px-3 md:px-4 h-6 sm:h-7 md:h-8 rounded-full transition-all duration-300 ${
                            currentMediaType === "movie"
                              ? "bg-white text-black min-w-[70px] sm:min-w-[100px] md:min-w-[120px]"
                              : "text-white hover:bg-white hover:bg-opacity-10 min-w-[32px] sm:min-w-[40px]"
                          }`}
                        >
                          {currentMediaType === "movie" ? (
                            <>
                              <span className="hidden sm:block text-sm md:text-base">
                                Movies
                              </span>
                              <span className="sm:hidden text-sm">Movie</span>
                              <span className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 flex items-center justify-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                  className="w-4 h-4 sm:w-5 sm:h-5"
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
                            </>
                          ) : (
                            <>
                              <span className="hidden sm:block text-sm md:text-base">
                                Movies
                              </span>
                              <span className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 flex items-center justify-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                  className="w-4 h-4 sm:w-5 sm:h-5"
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
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setCurrentMediaType("tv")}
                          className={`flex items-center justify-between px-2 sm:px-3 md:px-4 h-6 sm:h-7 md:h-8 rounded-full transition-all duration-300 ${
                            currentMediaType === "tv"
                              ? "bg-white text-black min-w-[70px] sm:min-w-[100px] md:min-w-[120px]"
                              : "text-white hover:bg-white hover:bg-opacity-10 min-w-[32px] sm:min-w-[40px]"
                          }`}
                        >
                          {currentMediaType === "tv" ? (
                            <>
                              <span className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 flex items-center justify-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                  className="w-4 h-4 sm:w-5 sm:h-5"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 20.25h12M3.75 6v7.5A2.25 2.25 0 006 15.75h13.5A2.25 2.25 0 0021.75 13.5V6m-18 0v-.75A2.25 2.25 0 016 3h13.5A2.25 2.25 0 0121.75 5.25V6m-18 0h18"
                                  />
                                </svg>
                              </span>
                              <span className="hidden sm:inline text-sm md:text-base">
                                TV Shows
                              </span>
                              <span className="sm:hidden text-sm">TV</span>
                            </>
                          ) : (
                            <>
                              <span className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 flex items-center justify-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                  className="w-4 h-4 sm:w-5 sm:h-5"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 20.25h12M3.75 6v7.5A2.25 2.25 0 006 15.75h13.5A2.25 2.25 0 0021.75 13.5V6m-18 0v-.75A2.25 2.25 0 016 3h13.5A2.25 2.25 0 0121.75 5.25V6m-18 0h18"
                                  />
                                </svg>
                              </span>
                              <span className="hidden sm:block text-sm md:text-base">
                                TV Shows
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex items-center gap-1 justify-end">
                {location.pathname !== "/" && (
                  <button
                    onClick={() => navigate("/")}
                    className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-white hover:bg-white hover:text-black transition-all duration-300"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6 sm:w-7 sm:h-7"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                      />
                    </svg>
                  </button>
                )}
                {location.pathname === "/" && currentMediaType === "movie" && (
                  <button
                    onClick={() => shuffleMovies()}
                    className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full text-white hover:bg-white hover:text-black transition-all duration-300"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-7 h-7"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3"
                      />
                    </svg>
                  </button>
                )}
                {location.pathname !== "/bookmarks" && hasBookmarks() && (
                  <Link
                    to="/bookmarks"
                    className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-white hover:bg-white hover:text-black transition-all duration-300"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6 sm:w-7 sm:h-7"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
                      />
                    </svg>
                  </Link>
                )}
                <button
                  onClick={() => setIsSearchVisible(true)}
                  className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-white hover:bg-white hover:text-black transition-all duration-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 sm:w-7 sm:h-7"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                </button>
              </div>
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
                    className={`flex items-center justify-between px-2 sm:px-3 md:px-4 h-6 sm:h-7 md:h-8 rounded-full transition-all duration-300 ${
                      currentMediaType === "movie"
                        ? "bg-white text-black min-w-[70px] sm:min-w-[100px] md:min-w-[120px]"
                        : "text-white hover:bg-white hover:bg-opacity-10 min-w-[32px] sm:min-w-[40px]"
                    }`}
                  >
                    {currentMediaType === "movie" ? (
                      <>
                        <span className="hidden sm:block text-sm md:text-base">
                          Movies
                        </span>
                        <span className="sm:hidden text-sm">Movie</span>
                        <span className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4 sm:w-5 sm:h-5"
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
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:block text-sm md:text-base">
                          Movies
                        </span>
                        <span className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4 sm:w-5 sm:h-5"
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
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setCurrentMediaType("tv")}
                    className={`flex items-center justify-between px-2 sm:px-3 md:px-4 h-6 sm:h-7 md:h-8 rounded-full transition-all duration-300 ${
                      currentMediaType === "tv"
                        ? "bg-white text-black min-w-[70px] sm:min-w-[100px] md:min-w-[120px]"
                        : "text-white hover:bg-white hover:bg-opacity-10 min-w-[32px] sm:min-w-[40px]"
                    }`}
                  >
                    {currentMediaType === "tv" ? (
                      <>
                        <span className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4 sm:w-5 sm:h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 20.25h12M3.75 6v7.5A2.25 2.25 0 006 15.75h13.5A2.25 2.25 0 0021.75 13.5V6m-18 0v-.75A2.25 2.25 0 016 3h13.5A2.25 2.25 0 0121.75 5.25V6m-18 0h18"
                            />
                          </svg>
                        </span>
                        <span className="hidden sm:inline text-sm md:text-base">
                          TV Shows
                        </span>
                        <span className="sm:hidden text-sm">TV</span>
                      </>
                    ) : (
                      <>
                        <span className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4 sm:w-5 sm:h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 20.25h12M3.75 6v7.5A2.25 2.25 0 006 15.75h13.5A2.25 2.25 0 0021.75 13.5V6m-18 0v-.75A2.25 2.25 0 016 3h13.5A2.25 2.25 0 0121.75 5.25V6m-18 0h18"
                            />
                          </svg>
                        </span>
                        <span className="hidden sm:block text-sm md:text-base">
                          TV Shows
                        </span>
                      </>
                    )}
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
