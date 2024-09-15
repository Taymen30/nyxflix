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
  }, [id, type]);

  const handlePlayButtonClick = () => {
    onPlayClick();

    const previousIframe = document.querySelector("#player-container iframe");
    if (previousIframe) {
      previousIframe.remove();
    }

    const iframe = document.createElement("iframe");
    iframe.className =
      "bg-black w-[90vw] h-[50vw] absolute top-[12vh] md:w-[60vw] md:h-[28vw]";
    iframe.referrerPolicy = "no-referrer";
    // iframe.sandbox = "allow-scripts allow-same-origin";
    iframe.setAttribute("allowFullScreen", true);
    iframe.src = gamer
      ? type === "movie"
        ? `https://vidsrc.cc/v3/embed/movie/${imdb_id}`
        : `https://vidsrc.cc/v3/embed/tv/${id}/${season}/${episode}`
      : `https://www.youtube.com/embed/${trailerId}`;

    document.getElementById("player-container").appendChild(iframe);
  };

  function toggleGamerStatus() {
    const gamerStatus = localStorage.getItem("gamer");
    localStorage.setItem("gamer", gamerStatus === "true" ? "false" : "true");
    setGamer(localStorage.getItem("gamer") === "true");
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

  return (
    <div
      className="bg-white text-black text-xs w-20 md:w-32 h-7 md:h-9 rounded-2xl flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity duration-300"
      onClick={handlePlayButtonClick}
      id="play-button"
      disabled={!trailerId}
    >
      Play
    </div>
  );
}
