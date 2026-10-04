import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import Header from "../components/Header";
import MediaGrid from "../components/MediaGrid";
import BookmarkButton from "../components/BookmarkButton";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useMedia } from "../context/MediaContext";

const apiKey = process.env.REACT_APP_API_KEY;

export default function Bookmarks() {
  const { currentMediaType, setCurrentMediaType } = useMedia();
  const [movieIds] = useLocalStorage("bookmarked-movie", []);
  const [tvIds] = useLocalStorage("bookmarked-tv", []);
  const [cache, setCache] = useState({});
  const [failedKey, setFailedKey] = useState(null);
  const [retryVersion, setRetryVersion] = useState(0);
  const [highlightedId, setHighlightedId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [picking, setPicking] = useState(false);
  const [pickStage, setPickStage] = useState(0);
  const timerRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const savedIds = currentMediaType === "movie" ? movieIds : tvIds;
  const ids = useMemo(() => [...new Set((Array.isArray(savedIds) ? savedIds : []).map(Number).filter(Number.isFinite))], [savedIds]);
  const requestKey = `${currentMediaType}:${ids.join(",")}`;
  const missingKey = ids.filter((id) => !cache[`${currentMediaType}-${id}`]).join(",");
  const error = failedKey === requestKey;
  const loading = Boolean(missingKey) && !error;
  const items = useMemo(() => ids.map((id) => cache[`${currentMediaType}-${id}`]).filter(Boolean), [ids, cache, currentMediaType]);
  const selected = items.find((item) => item.id === selectedId);
  const mediaLabel = currentMediaType === "movie" ? "movies" : "TV shows";

  useEffect(() => {
    if (!missingKey || failedKey === requestKey) return;
    const controller = new AbortController();
    let active = true;
    async function fetchBookmarks() {
      const results = await Promise.allSettled(missingKey.split(",").map(async (id) => {
        const response = await fetch(`https://api.themoviedb.org/3/${currentMediaType}/${id}?api_key=${apiKey}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Unable to load saved title");
        const item = await response.json();
        if (Number(item.id) !== Number(id)) throw new Error("Invalid saved title");
        return item;
      }));
      if (!active) return;
      const loaded = {};
      results.forEach((result) => { if (result.status === "fulfilled") loaded[`${currentMediaType}-${result.value.id}`] = result.value; });
      setCache((previous) => ({ ...previous, ...loaded }));
      setFailedKey(results.some((result) => result.status === "rejected") ? requestKey : null);
    }
    fetchBookmarks();
    return () => { active = false; controller.abort(); };
  }, [currentMediaType, missingKey, requestKey, failedKey, retryVersion]);

  useEffect(() => {
    clearTimeout(timerRef.current);
    setPicking(false);
    setSelectedId(null);
    setHighlightedId(null);
    return () => clearTimeout(timerRef.current);
  }, [requestKey]);

  const renderItemAction = useCallback((item) => <BookmarkButton id={item.id} mediaType={currentMediaType} className="!bg-black/65 shadow-lg backdrop-blur-md" />, [currentMediaType]);

  function pickRandom() {
    if (picking || loading || !items.length) return;
    const targetIndex = Math.floor(Math.random() * items.length);
    const target = items[targetIndex];
    setSelectedId(null);
    if (reduceMotion) {
      setHighlightedId(target.id);
      setSelectedId(target.id);
      return;
    }
    setPicking(true);
    setPickStage(0);
    // End the sequence on the randomly chosen title as the roulette slows down.
    const steps = 26;
    const startIndex = (targetIndex - (steps - 1) % items.length + items.length) % items.length;
    let step = 0;
    const highlight = () => {
      if (step === steps) {
        setSelectedId(target.id);
        setPicking(false);
        return;
      }
      setHighlightedId(items[(startIndex + step) % items.length].id);
      setPickStage(step < 16 ? 0 : step < 23 ? 1 : 2);
      const delay = 65 + Math.pow(step / (steps - 1), 3) * 560;
      timerRef.current = setTimeout(highlight, delay);
      step += 1;
    };
    highlight();
  }

  return (
    <div className="min-h-dvh bg-[#08090c]">
      <Header title="Bookmarks" currentMediaType={currentMediaType} setCurrentMediaType={setCurrentMediaType} />
      {ids.length ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-5 px-[clamp(24px,4vw,72px)] py-7">
            <div><h2 className="font-outfit text-2xl font-semibold tracking-tight">Your watchlist</h2><p className="mt-1 text-xs text-white/40">{ids.length} saved {ids.length === 1 ? currentMediaType === "movie" ? "movie" : "TV show" : mediaLabel}</p></div>
            {items.length > 1 && <button type="button" onClick={pickRandom} disabled={picking || loading} aria-busy={picking} className="inline-flex min-h-11 items-center justify-center gap-2.5 rounded-full border border-white/15 bg-white/[.04] px-5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:cursor-default disabled:opacity-70"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6h3c5 0 7 12 12 12h3m-4-4 4 4-4 4M3 18h3c2 0 4-2 6-6s4-6 6-6h3m-4-4 4 4-4 4" /></svg>{picking ? "Choosing…" : selected ? "Pick again" : "Pick for me"}</button>}
          </div>
          <div role="status" className={picking || selected ? "border-t border-white/[.06] px-[clamp(24px,4vw,72px)] pb-5 pt-4 text-sm text-white/50" : "sr-only"}>
            {picking ? ["Let fate choose your next watch…", "Slowing down…", "The final few…"][pickStage] : selected ? <>Picked for you: <Link to={`/${currentMediaType === "movie" ? "movie" : "tvshow"}/${selected.id}`} className="font-medium text-white underline decoration-white/25 underline-offset-4 hover:decoration-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">{selected.title || selected.name}</Link><button type="button" aria-label="Clear pick" onClick={() => { setSelectedId(null); setHighlightedId(null); }} className="ml-3 inline-flex h-11 w-11 items-center justify-center rounded-full text-white/45 hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4"><path strokeLinecap="round" d="m6 6 12 12M6 18 18 6" /></svg></button></> : ""}
          </div>
          <MediaGrid array={items} loading={loading} mediaType={currentMediaType} renderItemAction={renderItemAction} highlightedId={highlightedId} selectionActive={picking || Boolean(selected)} picking={picking} />
          {error && <div role="status" className="flex flex-wrap items-center justify-center gap-4 px-6 py-10 text-sm text-white/60"><p>{items.length ? "Some saved titles couldn’t load." : "Couldn’t load your bookmarks."}</p><button type="button" onClick={() => { setFailedKey(null); setRetryVersion((value) => value + 1); }} className="min-h-11 rounded-full border border-white/15 px-5 text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">Try again</button></div>}
        </>
      ) : (
        <div className="flex min-h-[60dvh] flex-col items-center justify-center px-6 py-14 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[.03] text-white/35"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="h-7 w-7"><path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12v18l-6-4-6 4V3Z" /></svg></div>
          <h2 className="font-outfit text-2xl font-semibold tracking-tight">No {mediaLabel} saved yet</h2>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/45">Save a title using the bookmark icon to find it here.</p>
          <Link to="/" className="mt-7 inline-flex min-h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-black transition-colors hover:bg-white/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Browse {mediaLabel}</Link>
        </div>
      )}
    </div>
  );
}
