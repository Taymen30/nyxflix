import React from "react";

export default function Player({ imdb_id }) {
  return (
    <>
      <div
        className="bg-white w-32 rounded-2xl h-9 flex items-center justify-center cursor-pointer"
        onClick={() => {
          const iframe = document.createElement("iframe");
          iframe.className = "bg-black w-1/3 h-1/3 absolute top-1/3 left-1/3";
          iframe.src = `https://vidsrc.to/embed/movie/${imdb_id}?autoplay=1`;
          iframe.referrerPolicy = "no-referrer";
          iframe.sandbox = "allow-scripts allow-same-origin";
          iframe.allowFullScreen = true;
          iframe.allow = "autoplay";
          document.getElementById("player-container").appendChild(iframe);
          document.getElementById("play-button").style.display = "none";
        }}
        id="play-button"
      >
        {" "}
        Play
      </div>
    </>
  );
}
