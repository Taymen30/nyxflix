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

  // Decide iframe size/position using both viewport width and height.
  // Uses fixed breakpoints (sm/md/lg/xl) and caps height by a fraction of viewport height
  // so the bottom controls area is never overlapped.
  function computeIframeLayout() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const aspect = viewportWidth / viewportHeight;

    let iframeWidth;
    if (viewportWidth < 640 || aspect < 0.75) {
      // Small screens or portrait phones (e.g., 9:19.5)
      iframeWidth = Math.min(viewportWidth * 0.92, 520);
    } else if (aspect >= 2.0) {
      // Ultra wide (e.g., 19.5:9 landscape)
      iframeWidth = Math.min(viewportWidth * 0.55, 1280);
    } else if (aspect >= 1.75) {
      // 16:9 to 18:9
      iframeWidth = Math.min(viewportWidth * 0.58, 1200);
    } else {
      // 16:10 or similar
      iframeWidth = Math.min(viewportWidth * 0.6, 1150);
    }

    const heightFromAspect = (iframeWidth * 9) / 16; // 16:9 content area

    // Reserve bottom area for controls/episodes strip
    const reservedBottom = Math.max(240, viewportHeight * 0.26);
    const minimumTop =
      aspect < 0.75 ? viewportHeight * 0.14 : viewportHeight * 0.16;

    // Absolute max height that fits between minimumTop and reserved bottom
    const maxHeightFromLayout = Math.max(
      180,
      viewportHeight - reservedBottom - minimumTop
    );

    // Cap height by viewport height and by layout window
    const heightCap =
      aspect < 0.75
        ? Math.min(viewportHeight * 0.46, maxHeightFromLayout)
        : aspect >= 2.0
        ? Math.min(viewportHeight * 0.6, maxHeightFromLayout)
        : Math.min(viewportHeight * 0.52, maxHeightFromLayout); // tighter for 16:9/16:10

    let iframeHeight = Math.min(heightFromAspect, heightCap);

    // If height was constrained by the layout, recompute width from height to keep 16:9
    iframeWidth = Math.min(iframeWidth, (iframeHeight * 16) / 9);
    // Re-sync height in case width constraint above changed it
    iframeHeight = (iframeWidth * 9) / 16;

    // Center vertically within available safe area
    const centeredTop = (viewportHeight - reservedBottom - iframeHeight) / 2;
    const maxTop = viewportHeight - reservedBottom - iframeHeight;
    const iframeTop = Math.max(minimumTop, Math.min(maxTop, centeredTop));

    return { width: iframeWidth, height: iframeHeight, top: iframeTop };
  }

  function createPlayerIframe(useSecondary) {
    const playerContainer = document.getElementById("player-container");
    if (!playerContainer) return;

    const previousIframe = playerContainer.querySelector("iframe");
    if (previousIframe) {
      // Clean up any resize listener attached to a previous iframe
      if (previousIframe._applyLayout) {
        window.removeEventListener("resize", previousIframe._applyLayout);
      }
      previousIframe.remove();
    }

    const iframe = document.createElement("iframe");
    iframe.className = "bg-black rounded-md shadow-2xl absolute z-30";
    iframe.referrerPolicy = "no-referrer";
    iframe.setAttribute("allowFullScreen", true);
    iframe.sandbox = "allow-scripts allow-same-origin allow-presentation";

    // Apply computed size and position; keep horizontally centered
    const applyLayout = () => {
      const { width, height, top } = computeIframeLayout();
      iframe.style.width = `${Math.round(width)}px`;
      iframe.style.height = `${Math.round(height)}px`;
      iframe.style.top = `${Math.round(top)}px`;
      iframe.style.left = "50%";
      iframe.style.transform = "translateX(-50%)";
      iframe.style.border = "0";
    };
    applyLayout();
    // Store handler on element so it can be removed when replacing the iframe
    iframe._applyLayout = applyLayout;
    window.addEventListener("resize", applyLayout);

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
