import React, { useEffect, useRef, useState } from "react";
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
  const layoutCleanup = useRef(null);

  useEffect(() => {
    return () => layoutCleanup.current?.();
  }, [id, type]);
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

    layoutCleanup.current?.();
    playerContainer.querySelector("iframe")?.remove();

    const iframe = document.createElement("iframe");
    iframe.className = "media-player-frame flex-shrink-0 max-w-full rounded-xl border border-white/[.12] bg-black shadow-[0_16px_60px_rgba(0,0,0,.5)]";
    iframe.title = gamer ? "Video player" : "Trailer player";
    iframe.referrerPolicy = "same-origin";
    iframe.allow = "autoplay; encrypted-media; fullscreen; picture-in-picture";
    iframe.setAttribute("allowFullScreen", true);
    // Let cross-origin players run, while keeping popups, downloads, forms,
    // and navigation of the parent page blocked for every source.
    iframe.setAttribute(
      "sandbox",
      "allow-scripts allow-same-origin allow-presentation"
    );

    let src = "";
    if (gamer && playerUrls) {
      src = useSecondary ? playerUrls.secondary : playerUrls.primary;
    } else if (trailerId) {
      src = `https://www.youtube.com/embed/${trailerId}`;
    }

    if (!src) return; // Don't append iframe if no source is determined

    iframe.src = src;
    playerContainer.appendChild(iframe);

    // Fit the player into the space above the details, including after resizing.
    const applyLayout = () => {
      const width = Math.min(
        playerContainer.clientWidth,
        (playerContainer.clientHeight * 16) / 9,
        1100
      );
      iframe.style.width = `${width}px`;
      iframe.style.height = `${(width * 9) / 16}px`;
    };
    const observer = new ResizeObserver(applyLayout);
    observer.observe(playerContainer);
    applyLayout();
    layoutCleanup.current = () => {
      observer.disconnect();
      iframe.remove();
    };
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
      <button
        type="button"
        aria-label={gamer ? "Play" : "Play trailer"}
        disabled={!gamer && !trailerId}
        className="flex h-11 items-center justify-center gap-2.5 rounded-lg bg-white pl-[18px] pr-6 text-sm font-semibold text-black transition-colors hover:bg-neutral-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[5px] focus-visible:outline-white"
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
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
          />
        </svg>
        <span className="whitespace-nowrap">{gamer ? "Play" : "Play trailer"}</span>
      </button>

      {/* Anime Audio Toggle Button */}
      {gamer && isAnime && (
        <button
          onClick={handleAudioToggle}
          className="h-11 px-4 rounded-full bg-purple-600 text-white font-semibold text-sm transition-all duration-300 hover:bg-purple-700"
          title="Toggle audio between Subbed and Dubbed"
        >
          {animeAudio === "dub" ? "Dub" : "Sub"}
        </button>
      )}
    </div>
  );
}
