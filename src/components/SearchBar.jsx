import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import HomeButton from "./HomeButton";

export default function SearchBar({ setSearchType }) {
  const [query, setQuery] = useState("");
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (show) {
      const handleKeyDown = (event) => {
        if (event.keyCode === 27) {
          setShow(false);
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [show]);

  function handleInput(e) {
    setQuery(e.target.value);
  }

  function handleClick() {
    navigate(`/search/${query}`);
  }

  function handleShowSearch() {
    setShow(true);
  }

  function handleSearchType(e) {
    e.preventDefault();
    setSearchType(e.target.value);
  }

  if (!show) {
    return (
      <div className="flex fixed gap-2 right-1 top-2 z-20">
        <HomeButton />
        {location.pathname !== "/bookmarks" ? (
          <Link to="/bookmarks">
            <img
              src="/white-medium-star.512x495.png"
              alt=""
              className="w-[40px] h-[40px] hover:cursor-pointer hover:opacity-70 transition-opacity duration-300"
            />
          </Link>
        ) : (
          <></>
        )}
        <img
          onClick={handleShowSearch}
          src="/search.512x512.png"
          alt=""
          className="w-[40px] h-[40px] hover:cursor-pointer hover:opacity-70 transition-opacity duration-300"
        />
      </div>
    );
  }

  return (
    <div className="px-2 flex fixed gap-1 right-1 top-2 z-50">
      <HomeButton />
      {location.pathname !== "/bookmarks" ? (
        <Link to="/favourites">
          <img
            src="/white-medium-star.512x495.png"
            alt=""
            className="w-[40px] h-[40px] hover:cursor-pointer hover:opacity-70 transition-opacity duration-300"
          />
        </Link>
      ) : (
        <></>
      )}
      {location.pathname === "/" ? (
        <select
          onChange={(e) => handleSearchType(e)}
          className="bg-transparent border border-white text-white rounded focus:outline-white"
        >
          <option className="bg-red-600" value="now_playing">
            Now Playing
          </option>
          <option value="popular">Popular</option>
          <option value="top_rated">Top Rated</option>
          <option value="upcoming">Upcoming</option>
        </select>
      ) : (
        <></>
      )}
      <input
        value={query}
        onChange={handleInput}
        type="text"
        className="bg-transparent text-white border border-white rounded mx-3"
      />
      <button
        className="text-white px-1 border border-white rounded hover:opacity-70 transition-opacity duration-300"
        onClick={handleClick}
      >
        Search
      </button>
    </div>
  );
}
