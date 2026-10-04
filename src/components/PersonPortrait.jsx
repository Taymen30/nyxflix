import React, { useEffect, useRef, useState } from "react";
import PosterSkeleton from "./PosterSkeleton";

export default function PersonPortrait({ person, className = "", priority = false }) {
  const imageRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const unavailable = !person.profile_path || failed;
  const initials = (person.name || "?").split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("");

  useEffect(() => {
    setLoaded(Boolean(imageRef.current?.complete && imageRef.current?.naturalWidth));
    setFailed(false);
  }, [person.profile_path]);

  return (
    <div role={unavailable ? "img" : undefined} aria-label={unavailable ? `${person.name}, portrait unavailable` : undefined} className={`relative aspect-[2/3] overflow-hidden bg-[#151820] ${className}`}>
      {unavailable ? (
        <div aria-hidden="true" className="flex h-full items-center justify-center bg-gradient-to-b from-[#1c222d] to-[#111217] font-outfit text-4xl font-medium tracking-tight text-white/25 sm:text-5xl">{initials}</div>
      ) : (
        <>
          {!loaded && <PosterSkeleton className="absolute inset-0" />}
          <img ref={imageRef} src={`https://image.tmdb.org/t/p/w500${person.profile_path}`} alt={person.name} width="500" height="750" loading={priority ? "eager" : "lazy"} decoding="async" onLoad={() => setLoaded(true)} onError={() => setFailed(true)} className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 motion-reduce:transition-none ${loaded ? "opacity-100" : "opacity-0"}`} />
        </>
      )}
    </div>
  );
}
