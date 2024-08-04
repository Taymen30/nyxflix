import React, { useEffect, useState } from "react";

const apiKey = process.env.REACT_APP_API_KEY;

export default function Player({
  imdb_id,
  id,
  type,
  season,
  episode,
  onPlayClick,
}) {
  const [trailerId, setTrailerId] = useState(null);
  const [gamer, setGamer] = useState(false);

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
    fetchTrailerKey(type, id);
  }, [id]);

  return (
    <>
      <div
        className="bg-white text-black text-xs w-20 md:w-32 h-7 md:h-9 rounded-2xl flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity duration-300"
        onClick={handlePlayButtonClick}
        id="play-button"
        disabled={!trailerId}
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
    onPlayClick();

    const iframe = document.createElement("iframe");
    iframe.className =
      "bg-black w-[90vw] h-[50vw] absolute top-[20vh] md:w-[685px] md:h-[380px]";
    iframe.referrerPolicy = "no-referrer";
    iframe.sandbox = "allow-scripts allow-same-origin";
    iframe.setAttribute("allowFullScreen", true);
    if (gamer) {
      iframe.src =
        type === "movie"
          ? `https://www.NontonGo.win/embed/movie/${imdb_id}`
          : `https://www.NontonGo.win/embed/tv/${id}/${season}/${episode}`;
    } else {
      iframe.src = `https://www.youtube.com/embed/${trailerId}`;
    }
    document.getElementById("player-container").appendChild(iframe);
  }

  function fetchTrailerKey(type, id) {
    const url =
      type === "movie"
        ? `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${apiKey}`
        : `https://api.themoviedb.org/3/tv/${id}/videos?api_key=${apiKey}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const videos = data.results;
        if (videos.length === 0) {
          console.error("No videos found");
          return;
        }
        const sortedVideos = [...videos];
        const sortOrder = ["Trailer", "Teaser", "Clip", "Featurette"];
        sortedVideos.sort((a, b) => {
          const indexA = sortOrder.indexOf(a.type ?? "");
          const indexB = sortOrder.indexOf(b.type ?? "");
          if (indexA === -1 && indexB === -1) {
            return (a.type ?? "").localeCompare(b.type ?? "");
          } else if (indexA === -1) {
            return 1;
          } else if (indexB === -1) {
            return -1;
          } else {
            return indexA - indexB;
          }
        });
        const bestVideo = sortedVideos.find(
          (video) => video.site === "YouTube"
        );
        if (bestVideo && bestVideo.key) {
          const trailerKey = bestVideo.key;
          setTrailerId(trailerKey);
        } else {
          console.log("No suitable video found");
        }
      })
      .catch((error) => console.error("Error fetching trailers:", error));
  }
}
