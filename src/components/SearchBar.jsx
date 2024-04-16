import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HomeButton from "./HomeButton";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

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



  if (!show) {
    return (
      <div className="flex fixed right-1 top-2">
        <HomeButton />
        <img
          onClick={handleShowSearch}
          src="/search.512x512.png"
          alt=""
          className="w-[40px] h-[40px] hover:cursor-pointer hover:opacity-90 mx-3"
        />
      </div>
    );
  }

  return (
    <div className="px-2 flex fixed right-1 top-2">
      <HomeButton />
      <input
        value={query}
        onChange={handleInput}
        type="text"
        className="bg-black text-white border border-white rounded mx-3"
      />
      <button className=" text-white px-1" onClick={handleClick}>
        Search
      </button>
    </div>
  );
}
