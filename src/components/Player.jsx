import React, { useEffect, useState } from "react";

const apiKey = process.env.REACT_APP_API_KEY;

export default function Player({ imdb_id, id, type }) {
  const [trailerKey, setTrailerKey] = useState(null);
  const [gamer, setGamer] = useState(false);
  const [tvShowImdb_id, setTvShowImdb_id] = useState(null);

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
    fetch(
      `https://api.themoviedb.org/3/tv/${id}/external_ids?api_key=${apiKey}`
    )
      .then((res) => res.json())
      .then((data) => {
        const tvimdb_id = data.imdb_id;
        if (tvimdb_id) {
          setTvShowImdb_id(tvimdb_id);
          console.log(tvimdb_id);
        } else {
          console.error("IMDb ID not found for TV show");
        }
      })
      .catch((error) => {
        console.error("Error fetching TV show IMDb ID:", error);
      });
  }, [id]);

  const toggleGamerStatus = () => {
    const gamerStatus = localStorage.getItem("gamer");
    localStorage.setItem("gamer", gamerStatus === "true" ? "false" : "true");
    setGamer(localStorage.getItem("gamer") === "true");
  };

  useEffect(() => {
    const url =
      type === "movie"
        ? `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${apiKey}`
        : `https://api.themoviedb.org/3/tv/${id}/videos?api_key=${apiKey}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        let trailerKey = null;

        const trailer = data.results.find(
          (result) => result.type === "Trailer" || result.type === "Featurette"
        );
        if (trailer) {
          trailerKey = trailer.key;
        } else {
          const youTubeVideo = data.results.find(
            (result) => result.site === "YouTube"
          );
          if (youTubeVideo) {
            trailerKey = youTubeVideo.key;
          }
        }

        if (trailerKey) {
          setTrailerKey(trailerKey);
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
      iframe.src =
        type === "movie"
          ? `https://vidsrc.to/embed/movie/${imdb_id}?autoplay=1`
          : `https://vidsrc.to/embed/tv/${tvShowImdb_id}`;
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
