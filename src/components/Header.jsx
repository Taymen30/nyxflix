import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import MediaTypeToggle from "./MediaTypeToggle";
import { useLocalStorage } from "../hooks/useLocalStorage";

const iconButton = "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white/75 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
const paths = {
  home: "M3 10.5 12 3l9 7.5M5 9v12h5v-7h4v7h5V9",
  bookmark: "M6 3h12v18l-6-4-6 4V3Z",
  search: "m21 21-5-5M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z",
  shuffle: "M3 6h3c5 0 7 12 12 12h3m-4-4 4 4-4 4M3 18h3c2 0 4-2 6-6s4-6 6-6h3m-4-4 4 4-4 4",
  close: "m6 6 12 12M6 18 18 6",
};
function Icon({ name }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d={paths[name]} /></svg>;
}

export default function Header({ title, currentMediaType, setCurrentMediaType, movies, setMovies, controlsClassName = "" }) {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [query, setQuery] = useState("");
  const [, setIsGamer] = useLocalStorage("gamer", false);
  const inputRef = useRef(null);
  const dialogRef = useRef(null);
  const searchButtonRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const isMedia = /^\/(movie|tvshow)\//.test(location.pathname);
  const isPerson = location.pathname.startsWith("/person/");
  const showToggle = !isMedia && !isPerson;
  const isHome = location.pathname === "/";
  const displayTitle = title || (location.pathname === "/search" ? "Search" : "");

  useEffect(() => {
    setIsSearchVisible(false);
    setQuery(new URLSearchParams(location.search).get("query") || "");
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!isSearchVisible) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    const handleKey = (event) => {
      if (event.key === "Escape") setIsSearchVisible(false);
      if (event.key !== "Tab") return;
      const elements = dialogRef.current?.querySelectorAll("button:not(:disabled), input");
      if (!elements?.length) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [isSearchVisible]);

  function handleSubmit(event) {
    event.preventDefault();
    const term = query.trim();
    if (!term) return;
    if (term.toLowerCase() === "gamer") {
      setIsGamer(true);
      setQuery("");
      setIsSearchVisible(false);
      return;
    }
    setIsSearchVisible(false);
    navigate(`/search?${new URLSearchParams({ query: term })}`);
  }

  function shuffleMovies() {
    const shuffled = [...(movies || [])];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setMovies?.(shuffled);
  }

  return (
    <>
      <header className={isMedia ? "relative z-40" : "sticky top-0 z-40 border-b border-white/[.08] bg-[#08090c]/90 backdrop-blur-xl"}>
        <div className={`flex flex-wrap items-center gap-x-5 gap-y-4 px-[clamp(24px,4vw,72px)] py-5 sm:py-6 ${controlsClassName}`}>
          {displayTitle && (
            <h1 title={displayTitle} className={`order-1 min-w-0 flex-1 font-outfit text-2xl font-semibold tracking-tight text-white sm:text-3xl ${isPerson ? "break-words" : "truncate"} ${isHome ? "!font-bold !tracking-[.14em]" : ""}`}>
              {isHome && <span aria-hidden="true" className="mr-3 inline-block h-2 w-2 rounded-full bg-red-500 shadow-[0_0_14px_rgba(239,68,68,.6)]" />}
              {displayTitle}
            </h1>
          )}
          {showToggle && <div className="order-3 flex w-full justify-center sm:order-2 sm:w-auto"><MediaTypeToggle currentMediaType={currentMediaType} setCurrentMediaType={setCurrentMediaType} /></div>}
          <nav aria-label="Main navigation" className="order-2 ml-auto flex shrink-0 items-center gap-0.5 rounded-full border border-white/10 bg-white/[.04] p-1 backdrop-blur-xl sm:order-3">
            {!isHome && <Link to="/" aria-label="Home" title="Home" className={iconButton}><Icon name="home" /></Link>}
            {isHome && currentMediaType === "movie" && <button type="button" onClick={shuffleMovies} aria-label="Shuffle movies" title="Shuffle movies" className={iconButton}><Icon name="shuffle" /></button>}
            <Link to="/bookmarks" onClick={() => { if (isMedia) setCurrentMediaType(location.pathname.startsWith("/tvshow/") ? "tv" : "movie"); }} aria-label="Bookmarks" title="Bookmarks" aria-current={location.pathname === "/bookmarks" ? "page" : undefined} className={`${iconButton} ${location.pathname === "/bookmarks" ? "bg-white/10 !text-white" : ""}`}><Icon name="bookmark" /></Link>
            <button ref={searchButtonRef} type="button" onClick={() => setIsSearchVisible(true)} aria-label="Open search" title="Search" aria-haspopup="dialog" aria-expanded={isSearchVisible} className={iconButton}><Icon name="search" /></button>
          </nav>
        </div>
      </header>
      {createPortal(
        <AnimatePresence>
          {isSearchVisible && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.18 }} onClick={(event) => { if (event.target === event.currentTarget) setIsSearchVisible(false); }} className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/80 px-5 pb-8 pt-[min(18vh,140px)] backdrop-blur-md">
              <motion.section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="search-heading" initial={{ y: reduceMotion ? 0 : 12 }} animate={{ y: 0 }} exit={{ y: reduceMotion ? 0 : 12 }} className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#111217] p-6 text-white shadow-[0_24px_100px_rgba(0,0,0,.6)] sm:p-8">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div><p className="mb-1 text-xs font-medium uppercase tracking-[.2em] text-white/40">Find your next watch</p><h2 id="search-heading" className="font-outfit text-2xl font-semibold tracking-tight">Search the collection</h2></div>
                  <button type="button" onClick={() => setIsSearchVisible(false)} aria-label="Close search" className={iconButton}><Icon name="close" /></button>
                </div>
                <MediaTypeToggle currentMediaType={currentMediaType} setCurrentMediaType={setCurrentMediaType} />
                <form onSubmit={handleSubmit} className="mt-6">
                  <label htmlFor="search-input" className="sr-only">Search titles</label>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-black/30 px-4 focus-within:border-white/50 focus-within:ring-1 focus-within:ring-white/20">
                    <span className="text-white/40"><Icon name="search" /></span>
                    <input id="search-input" ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} type="search" autoComplete="off" placeholder={currentMediaType === "movie" ? "Search movies…" : "Search TV shows…"} className="min-w-0 flex-1 bg-transparent py-4 text-base text-white outline-none placeholder:text-white/35" />
                  </div>
                  <button type="submit" disabled={!query.trim()} className="mt-4 min-h-12 w-full rounded-2xl bg-white px-5 text-sm font-semibold text-black transition-colors hover:bg-white/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:cursor-default disabled:bg-white/10 disabled:text-white/30">Search</button>
                </form>
              </motion.section>
            </motion.div>
          )}
        </AnimatePresence>, document.body
      )}
    </>
  );
}
