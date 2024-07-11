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
  const [isGamer, setIsGamer] = useState(false);
  const [togglePosition, setTogglePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    if (localStorage.getItem("gamer") === "true") {
      setIsGamer(true);
    }
  }, [query]);

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

  const handleInput = (e) => {
    setQuery(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.toLocaleLowerCase() === "gamer") {
      localStorage.setItem("gamer", "true");
      setQuery("");
      setIsGamer(true);
    } else {
      setSearchParams({ query });
      navigate(`/search?query=${query}`);
    }
  };

  const handleOverlayClick = (e) => {
    if (
      !e.target.closest(".media-type-toggle") &&
      !e.target.closest(".search-form")
    ) {
      setIsSearchVisible(false);
    }
  };

  const handleFormClick = (e) => {
    e.stopPropagation();
  };

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
      className={`flex items-center ${
        !title ? "absolute" : "h-14 md:h-16 sticky z-50 top-0 bg-opacity-50"
      } w-full bg-black`}
    >
      <div className="relative w-full">
        {shouldShowControls && (
          <div className="fixed top-0 left-0 right-0 z-20 flex justify-between items-center">
            <h1 className="text-3xl sm:text-4xl md:text-6xl ml-1">{title}</h1>
            <AnimatePresence>
              {!isSearchVisible && (
                <motion.div
                  className="flex-grow flex justify-center media-type-toggle"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {title && !location.pathname.includes("/person") && (
                    <MediaTypeToggle
                      currentMediaType={currentMediaType}
                      setCurrentMediaType={setCurrentMediaType}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex items-center gap-2 mr-2">
              <HomeButton
                currentMediaType={currentMediaType}
                setCurrentMediaType={setCurrentMediaType}
              />
              {location.pathname === "/" && currentMediaType === "movie" && (
                <img
                  onClick={() => shuffleMovies()}
                  src="distribute-randomize.512x480.png"
                  alt=""
                  className="w-[40px] h-[40px] hidden sm:block  hover:cursor-pointer hover:opacity-70 transition-opacity duration-300 filter invert"
                />
              )}
              {location.pathname !== "/bookmarks" && hasBookmarks() && (
                <Link to="/bookmarks">
                  <img
                    src="/bookmarks-outline.417x512.png"
                    alt=""
                    className="h-[40px] filter invert hover:cursor-pointer hover:opacity-70 transition-opacity duration-300"
                  />
                </Link>
              )}
              <motion.img
                onClick={() => setIsSearchVisible(true)}
                src="/search.512x512.png"
                alt=""
                className="w-[40px] h-[40px] hover:cursor-pointer hover:opacity-70 transition-opacity duration-300"
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
                <MediaTypeToggle
                  currentMediaType={currentMediaType}
                  setCurrentMediaType={setCurrentMediaType}
                />
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
    return (
      (localStorage.getItem("bookmarked-tv") &&
        JSON.parse(localStorage.getItem("bookmarked-tv")).length > 0) ||
      (localStorage.getItem("bookmarked-movie") &&
        JSON.parse(localStorage.getItem("bookmarked-movie")).length > 0)
    );
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
