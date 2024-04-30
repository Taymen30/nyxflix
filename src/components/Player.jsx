import React, { useEffect, useState } from "react";

export default function Player({ imdb_id, id }) {
  const [trailerKey, setTrailerKey] = useState(null);
  const [gamer, setGamer] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === "v") {
        toggleGamerStatus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  useEffect(() => {
    setGamer(localStorage.getItem("gamer") === "true");
  }, [id]);

  const toggleGamerStatus = () => {
    const gamerStatus = localStorage.getItem("gamer");
    localStorage.setItem("gamer", gamerStatus === "true" ? "false" : "true");
    setGamer(localStorage.getItem("gamer") === "true");
  };

  useEffect(() => {
    const apiKey = process.env.REACT_APP_API_KEY;
    fetch(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=${apiKey}`)
      .then((res) => res.json())
      .then((data) => {
        const trailer = data.results.find(
          (result) => result.type === "Trailer"
        );
        if (trailer) {
          setTrailerKey(trailer.key);
        }
      })
      .catch((error) => console.error("Error fetching trailers:", error));
  }, [id]);

  const handlePlayButtonClick = () => {
    const iframe = document.createElement("iframe");
    iframe.className = "bg-black w-1/2 h-1/2 absolute top-1/4 left-1/4";
    iframe.referrerPolicy = "no-referrer";
    iframe.sandbox = "allow-scripts allow-same-origin";
    iframe.setAttribute("allowFullScreen", true);

    if (gamer) {
      iframe.src = `https://vidsrc.to/embed/movie/${imdb_id}?autoplay=1`;
      iframe.allow = "autoplay";
    } else {
      iframe.src = `https://www.youtube.com/embed/${trailerKey}`;
    }

    document.getElementById("player-container").appendChild(iframe);
    document.getElementById("play-button").style.display = "none";
  };

  return (
    <>
      <div
        className="bg-white w-32  rounded-2xl h-9 flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity duration-300"
        onClick={handlePlayButtonClick}
        id="play-button"
      >
        Play
      </div>
    </>
  );
}
