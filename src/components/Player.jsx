import React, { useEffect, useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

const apiKey = process.env.REACT_APP_API_KEY;

export default function Player({
  imdb_id,
  id,
  type,
  season,
  episode,
  onPlayClick,
  isAnime,
  playerUrls,
}) {
  const [trailerId, setTrailerId] = useState(null);
  const [gamer, setGamer] = useLocalStorage("gamer", false);

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
    fetchTrailerKey(type, id);
  }, [id, type]);

  function handlePlayButtonClick() {
    onPlayClick();
    createPlayerIframe(false);
  }

  function handlePlayButtonDoubleClick() {
    if (gamer) {
      onPlayClick();
      createPlayerIframe(true);
    }
  }

  function createPlayerIframe(useSecondary) {
    // Remove any existing iframe
    const previousIframe = document.querySelector("#player-container iframe");
    if (previousIframe) {
      previousIframe.remove();
    }

    // Create a new iframe
    const iframe = document.createElement("iframe");
    iframe.className =
      "bg-black w-[90vw] h-[50vw] absolute top-[12vh] md:w-[60vw] md:h-[28vw]";
    iframe.referrerPolicy = "no-referrer";
    iframe.setAttribute("allowFullScreen", true);

    // Add sandbox attribute to all iframes for better security
    iframe.sandbox = "allow-scripts allow-same-origin allow-presentation";

    // Log for debugging
    console.log("Creating player with:", {
      isAnime,
      gamer,
      useSecondary,
      playerUrls,
      chosenUrl:
        gamer && playerUrls
          ? useSecondary
            ? playerUrls.secondary
            : playerUrls.primary
          : `https://www.youtube.com/embed/${trailerId}`,
    });

    // Determine the source URL
    if (gamer && playerUrls) {
      iframe.src = useSecondary ? playerUrls.secondary : playerUrls.primary;
    } else {
      iframe.src = `https://www.youtube.com/embed/${trailerId}`;
    }

    // Add the iframe to the container
    document.getElementById("player-container").appendChild(iframe);
  }

  function toggleGamerStatus() {
    setGamer((prevGamer) => !prevGamer);
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
        if (videos?.length === 0) {
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
      className={`${
        isAnime && gamer ? "bg-red-500" : "bg-white"
      } text-black text-xs w-20 md:w-32 h-7 md:h-9 rounded-2xl flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity duration-300`}
      onClick={handlePlayButtonClick}
      onDoubleClick={handlePlayButtonDoubleClick}
      id="play-button"
      disabled={!trailerId && !isAnime}
    >
      Play
    </div>
  );
}
