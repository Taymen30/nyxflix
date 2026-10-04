import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import PersonPortrait from "./PersonPortrait";
import PosterSkeleton from "./PosterSkeleton";

const apiKey = process.env.REACT_APP_API_KEY;

export default function Credits({ mediaType, id }) {
  const [open, setOpen] = useState(false);
  const [record, setRecord] = useState(null);
  const [error, setError] = useState(false);
  const [retryVersion, setRetryVersion] = useState(0);
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const key = `${mediaType}/${id}`;
  const cast = record?.key === key ? record.cast : null;

  useEffect(() => { setOpen(false); setError(false); }, [key]);

  useEffect(() => {
    if (!open || cast !== null) return;
    const controller = new AbortController();
    let active = true;
    setError(false);
    async function fetchCast() {
      try {
        const response = await fetch(`https://api.themoviedb.org/3/${key}/credits?api_key=${apiKey}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Unable to load cast");
        const data = await response.json();
        if (!Array.isArray(data.cast)) throw new Error("Invalid cast response");
        const people = new Map();
        data.cast.forEach((person) => {
          const previous = people.get(person.id);
          if (!previous) people.set(person.id, { ...person });
          else if (person.character && person.character !== previous.character) previous.character = [previous.character, person.character].filter(Boolean).join(" / ");
        });
        if (active) setRecord({ key, cast: [...people.values()] });
      } catch (failure) {
        if (active && failure.name !== "AbortError") setError(true);
      }
    }
    fetchCast();
    return () => { active = false; controller.abort(); };
  }, [open, cast, key, retryVersion]);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const shouldLockBody = previousOverflow !== "hidden";
    if (shouldLockBody) document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const handleKey = (event) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key !== "Tab") return;
      const elements = dialogRef.current?.querySelectorAll("a[href], button:not(:disabled)");
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
      if (shouldLockBody) document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [open]);

  return (
    <>
      <button type="button" aria-label="View cast" title="View cast" aria-haspopup="dialog" aria-expanded={open} onClick={() => { setError(false); setOpen(true); }} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/[.08] text-white transition-colors hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
      </button>
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.18 }} onClick={(event) => { if (event.target === event.currentTarget) setOpen(false); }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md sm:p-8">
              <motion.section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="cast-heading" initial={{ y: reduceMotion ? 0 : 12 }} animate={{ y: 0 }} exit={{ y: reduceMotion ? 0 : 12 }} transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }} className="flex max-h-[min(85dvh,900px)] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#111217] text-white shadow-[0_24px_100px_rgba(0,0,0,.6)]">
                <div className="flex shrink-0 items-center justify-between gap-4 border-b border-white/[.08] px-5 py-5 sm:px-8 sm:py-6">
                  <div><p className="mb-1 text-[10px] font-medium uppercase tracking-[.2em] text-white/40">Behind the characters</p><h2 id="cast-heading" className="font-outfit text-2xl font-semibold tracking-tight sm:text-3xl">Cast <span className="ml-2 align-middle font-sans text-sm font-normal text-white/35">{cast ? cast.length : ""}</span></h2></div>
                  <button ref={closeRef} type="button" aria-label="Close cast" onClick={() => setOpen(false)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5"><path strokeLinecap="round" d="m6 6 12 12M6 18 18 6" /></svg></button>
                </div>
                <div className="min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-8">
                  {error ? <div role="status" className="py-10 text-center text-sm text-white/60"><p>Couldn’t load the cast.</p><button type="button" onClick={() => setRetryVersion((value) => value + 1)} className="mt-4 min-h-11 rounded-full border border-white/15 px-5 text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">Try again</button></div> : cast === null ? (
                    <div role="status" aria-label="Loading cast"><span className="sr-only">Loading cast…</span><div aria-hidden="true" className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-5">{Array.from({ length: 10 }, (_, index) => <div key={index}><PosterSkeleton className="rounded-xl" /><div className="mt-3 h-3 w-3/4 rounded-full bg-white/[.06]" /><div className="mt-2 h-2 w-1/2 rounded-full bg-white/[.04]" /></div>)}</div></div>
                  ) : cast.length ? (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-5">
                      {cast.map((person, index) => <Link key={person.id} to={`/person/${person.id}`} state={{ fromMediaType: mediaType, personName: person.name }} aria-label={`View ${person.name}`} onClick={() => setOpen(false)} className="group min-w-0 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"><PersonPortrait person={person} priority={index < 10} className="rounded-xl transition-[filter] duration-200 group-hover:brightness-110 motion-reduce:transition-none" /><h3 className="mt-3 font-outfit text-sm font-medium leading-snug text-white transition-colors group-hover:text-white/75 sm:text-base">{person.name}</h3>{person.character && <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/45">{person.character}</p>}</Link>)}
                    </div>
                  ) : <p className="py-10 text-center text-sm text-white/50">No cast information available yet.</p>}
                </div>
              </motion.section>
            </motion.div>
          )}
        </AnimatePresence>, document.body
      )}
    </>
  );
}
