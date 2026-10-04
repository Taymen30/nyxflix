import React, { memo, useMemo, useState, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { useMedia } from "../context/MediaContext";
import MovieHoverInfo from "./MovieHoverInfo";
import PosterSkeleton from "./PosterSkeleton";

const MediaItem = memo(function MediaItem({ item, mediaType, index, reduceMotion, renderItemAction, highlighted, selectionActive, picking }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const imageRef = useRef(null);
  const title = item.title || item.name || "Untitled";
  const linkPath = `/${mediaType === "movie" ? "movie" : "tvshow"}/${item.id}`;

  useEffect(() => {
    setIsLoaded(Boolean(imageRef.current?.complete && imageRef.current?.naturalWidth));
    setHasFailed(false);
  }, [item.poster_path]);

  return (
    <motion.article
      layout={reduceMotion ? false : "position"}
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0, scale: highlighted && selectionActive && !reduceMotion ? 1.035 : 1 }}
      transition={{
        opacity: { duration: 0.25, delay: (index % 5) * 0.025 },
        y: { duration: 0.25 },
        scale: { type: "spring", stiffness: 280, damping: 19 },
        layout: { type: "spring", stiffness: 170, damping: 17, mass: 0.8 },
      }}
      className={`media-poster group relative min-w-0 bg-[#101218] ${highlighted ? "z-30" : ""}`}
    >
      <Link to={linkPath} aria-label={title} className="relative block aspect-[2/3] overflow-hidden focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white">
        {!isLoaded && !hasFailed && item.poster_path && <PosterSkeleton className="absolute inset-0" />}
        {item.poster_path && !hasFailed ? (
          <img
            ref={imageRef}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 motion-reduce:transition-none ${isLoaded ? "opacity-100" : "opacity-0"}`}
            src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
            alt={title}
            width="500"
            height="750"
            loading={index < 10 ? "eager" : "lazy"}
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasFailed(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-[#161a22] to-[#0c0d11] px-4 text-center">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="h-8 w-8 text-white/20"><path d="M4 3h16v18H4zM4 7h16M4 17h16M8 3v18M16 3v18" /></svg>
            <span className="font-outfit text-sm text-white/60">{title}</span>
            <span className="text-[10px] text-white/30">Poster unavailable</span>
          </div>
        )}
        {(isLoaded || hasFailed || !item.poster_path) && <MovieHoverInfo video={item} mediaType={mediaType} />}
      </Link>
      {renderItemAction && <div className="pointer-events-none absolute right-2 top-2 z-10 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100 max-md:pointer-events-auto max-md:opacity-100">{renderItemAction(item)}</div>}
      {selectionActive && <div aria-hidden="true" className={`pointer-events-none absolute inset-0 z-20 bg-black/65 transition-opacity duration-150 motion-reduce:transition-none ${highlighted ? "opacity-0" : "opacity-100"}`} />}
      {highlighted && <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 ring-2 ring-inset ring-amber-200 shadow-[0_0_28px_rgba(253,230,138,0.3)]" />}
      {highlighted && selectionActive && !picking && <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/95 to-transparent px-2 pb-5 pt-12 text-center"><span className="rounded-full border border-amber-200/40 bg-black/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.18em] text-amber-100 md:text-xs">Your pick</span></div>}
    </motion.article>
  );
});

export default function MediaGrid({ array, loading, onLoadMore, mediaType, renderItemAction, highlightedId, selectionActive = false, picking = false }) {
  const { currentMediaType } = useMedia();
  const resolvedMediaType = mediaType || currentMediaType;
  const reduceMotion = useReducedMotion();
  const sentinelRef = useRef(null);
  const uniqueItems = useMemo(() => {
    const ids = new Set();
    return array.filter((item) => {
      if (ids.has(item.id)) return false;
      ids.add(item.id);
      return true;
    });
  }, [array]);
  const mobileSkeletons = uniqueItems.length ? (3 - uniqueItems.length % 3) % 3 + 3 : 15;
  const desktopSkeletons = uniqueItems.length ? (5 - uniqueItems.length % 5) % 5 + 5 : 15;

  useEffect(() => {
    if (!onLoadMore || !sentinelRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) onLoadMore();
    }, { rootMargin: "300px" });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [onLoadMore, uniqueItems.length]);

  return (
    <div className={selectionActive ? "overflow-x-clip" : undefined}>
      <div aria-busy={Boolean(loading)} className="media-grid grid grid-cols-3 md:grid-cols-5">
        {uniqueItems.map((item, index) => <MediaItem key={`${resolvedMediaType}-${item.id}`} item={item} mediaType={resolvedMediaType} index={index} reduceMotion={reduceMotion} renderItemAction={renderItemAction} highlighted={highlightedId === item.id} selectionActive={selectionActive} picking={picking} />)}
        {loading && Array.from({ length: Math.max(mobileSkeletons, desktopSkeletons) }, (_, index) => (
          <PosterSkeleton key={`loading-${index}`} className={`${index >= mobileSkeletons ? "max-md:hidden" : ""} ${index >= desktopSkeletons ? "md:hidden" : ""}`} />
        ))}
      </div>
      {loading && <p role="status" className="sr-only">{uniqueItems.length ? "Loading more titles…" : "Loading titles…"}</p>}
      {onLoadMore && <div ref={sentinelRef} aria-hidden="true" className="h-px" />}
    </div>
  );
}
