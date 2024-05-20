import React, { useEffect, useState } from "react";

const apiKey = process.env.REACT_APP_API_KEY;

export default function Player({ imdb_id, id, type }) {
  const [isTrailerLoaded, setIsTrailerLoaded] = useState(false);
  const [gamer, setGamer] = useState(false);
  const [tvShowImdb_id, setTvShowImdb_id] = useState(null);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.ctrlKey && event.key === "v") {
        toggleGamerStatus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    setGamer(localStorage.getItem("gamer") === "true");

    if (type === "tvshow") {
      fetchTvShowImdbId(id);
    }
  }, [id]);

  useEffect(() => {
    fetchTrailerKey(type, id);
  }, [id]);

  return (
    <>
      <div
        className="bg-white text-xs w-20 md:w-32 h-7 md:h-9 rounded-2xl flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity duration-300"
        onClick={handlePlayButtonClick}
        id="play-button"
      >
        Play
      </div>
    </>
  );

  function toggleGamerStatus() {
    const gamerStatus = localStorage.getItem("gamer");
    localStorage.setItem("gamer", gamerStatus === "true" ? "false" : "true");
    setGamer(localStorage.getItem("gamer") === "true");
  }

  function handlePlayButtonClick() {
    const iframe = document.createElement("iframe");
    iframe.className =
      "bg-black w-[90vw] h-[50vw] absolute top-[20vh] md:w-[685px] md:h-[380px]";
    iframe.referrerPolicy = "no-referrer";
    iframe.sandbox = "allow-scripts allow-same-origin";
    iframe.setAttribute("allowFullScreen", true);

    if (gamer) {
      iframe.src =
        type === "movie"
          ? `https://vidsrc.to/embed/movie/${imdb_id}?autoplay=1`
          : `https://vidsrc.to/embed/tv/${tvShowImdb_id}`;
    } else {
      iframe.src = `https://www.youtube.com/embed/${isTrailerLoaded}`;
    }

    document.getElementById("player-container").appendChild(iframe);
  }

  function fetchTvShowImdbId(id) {
    fetch(
      `https://api.themoviedb.org/3/tv/${id}/external_ids?api_key=${apiKey}`
    )
      .then((res) => res.json())
      .then((data) => {
        const tvimdb_id = data.imdb_id;
        if (tvimdb_id) {
          setTvShowImdb_id(tvimdb_id);
        } else {
          console.error("IMDb ID not found for TV show");
        }
      })
      .catch((error) => {
        console.error("Error fetching TV show IMDb ID:", error);
      });
  }

  function fetchTrailerKey(type, id) {
    const url =
      type === "movie"
        ? `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${apiKey}`
        : `https://api.themoviedb.org/3/tv/${id}/videos?api_key=${apiKey}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
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
          setIsTrailerLoaded(trailerKey);
        }
      })
      .catch((error) => console.error("Error fetching trailers:", error));
  }
}
