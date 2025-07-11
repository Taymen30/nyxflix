import React, { useEffect, useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

const apiKey = process.env.REACT_APP_API_KEY;

export default function Player({
  id,
  type,
  onPlayClick,
  isAnime,
  playerUrls,
  animeAudio,
  onAnimeAudioChange,
}) {
  const [trailerId, setTrailerId] = useState(null);
  const [gamer] = useLocalStorage("gamer", false);

  // Effect to fetch trailer for non-gamer mode
  useEffect(() => {
    if (!gamer) {
      fetchTrailerKey(type, id);
    }
  }, [id, type, gamer]);

  // Main click handler
  function handlePlayButtonClick() {
    onPlayClick();
    createPlayerIframe(false); // Play primary source
  }

  // Double-click for secondary source in gamer mode
  function handlePlayButtonDoubleClick() {
    if (gamer && playerUrls?.secondary) {
      onPlayClick();
      createPlayerIframe(true); // 'true' for secondary source
    }
  }

  // Handler for toggling sub/dub
  function handleAudioToggle() {
    if (onAnimeAudioChange) {
      const newAudio = animeAudio === "dub" ? "sub" : "dub";
      onAnimeAudioChange(newAudio);
    }
  }

  function createPlayerIframe(useSecondary) {
    const playerContainer = document.getElementById("player-container");
    if (!playerContainer) return;

    const previousIframe = playerContainer.querySelector("iframe");
    if (previousIframe) {
      previousIframe.remove();
    }

    const iframe = document.createElement("iframe");
    iframe.className =
      "bg-black w-[90vw] h-[50vw] absolute top-[30vh] lg:top-[16vh] lg:w-[60vw] lg:h-[28vw]";
    iframe.referrerPolicy = "no-referrer";
    iframe.setAttribute("allowFullScreen", true);
    iframe.sandbox = "allow-scripts allow-same-origin allow-presentation";

    let src = "";
    if (gamer && playerUrls) {
      src = useSecondary ? playerUrls.secondary : playerUrls.primary;
    } else if (trailerId) {
      src = `https://www.youtube.com/embed/${trailerId}`;
    }

    if (!src) return; // Don't append iframe if no source is determined

    iframe.src = src;
    playerContainer.appendChild(iframe);
  }

  function fetchTrailerKey(type, id) {
    const url =
      type === "movie"
        ? `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${apiKey}`
        : `https://api.themoviedb.org/3/tv/${id}/videos?api_key=${apiKey}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const bestVideo = data.results?.find(
          (v) => v.site === "YouTube" && v.type === "Trailer"
        );
        if (bestVideo) {
          setTrailerId(bestVideo.key);
        }
      })
      .catch((error) => console.error("Error fetching trailers:", error));
  }

  return (
    <div className="flex items-center gap-3">
      {/* Play Button */}
      <div
        className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all duration-300 cursor-pointer ${"bg-white text-black hover:bg-black hover:text-white"}`}
        onClick={handlePlayButtonClick}
        onDoubleClick={handlePlayButtonDoubleClick}
        id="play-button"
        title={
          gamer
            ? `Click: Play ${
                playerUrls?.secondary ? "| Dbl-Click: Other Source" : ""
              }`
            : "Play Trailer"
        }
        style={{
          pointerEvents: !gamer && !trailerId ? "none" : "auto",
          userSelect: "none",
        }}
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
            d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
          />
        </svg>
      </div>

      {/* Anime Audio Toggle Button */}
      {gamer && isAnime && (
        <button
          onClick={handleAudioToggle}
          className="h-8 sm:h-10 px-4 rounded-full bg-purple-600 text-white font-semibold text-sm transition-all duration-300 hover:bg-purple-700"
          title="Toggle audio between Subbed and Dubbed"
        >
          {animeAudio === "dub" ? "Dub" : "Sub"}
        </button>
      )}
    </div>
  );
}
