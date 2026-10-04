import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import Header from "../components/Header";
import MediaGrid from "../components/MediaGrid";
import MediaTypeToggle from "../components/MediaTypeToggle";
import PersonPortrait from "../components/PersonPortrait";
import PosterSkeleton from "../components/PosterSkeleton";
import { useMedia } from "../context/MediaContext";

const apiKey = process.env.REACT_APP_API_KEY;
const profileLayout = "grid grid-cols-[112px_minmax(0,1fr)] gap-x-6 gap-y-7 px-[clamp(24px,4vw,72px)] py-8 sm:grid-cols-[180px_minmax(0,1fr)] sm:py-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-x-12 lg:py-12";

function formatDate(value) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
}

function Biography({ text }) {
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const textRef = useRef(null);
  useEffect(() => {
    const element = textRef.current;
    if (!element) return;
    const measure = () => setCanExpand(element.scrollHeight > parseFloat(getComputedStyle(element).lineHeight) * 6 + 1);
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();
    return () => observer.disconnect();
  }, [text]);

  return (
    <section className="col-span-2 min-w-0 max-w-3xl sm:col-span-1">
      <h2 className="mb-3 font-outfit text-xl font-medium text-white">Biography</h2>
      <p id="person-biography" ref={textRef} className={`whitespace-pre-line text-sm leading-[1.8] text-white/65 sm:text-[15px] ${expanded ? "" : "line-clamp-6"}`}>{text || "No biography available yet."}</p>
      {canExpand && <button type="button" aria-expanded={expanded} aria-controls="person-biography" onClick={() => setExpanded((value) => !value)} className="mt-2 min-h-11 text-sm font-medium text-white/85 underline decoration-white/25 underline-offset-4 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">{expanded ? "Read less" : "Read full biography"}</button>}
    </section>
  );
}

function PersonSkeleton() {
  return (
    <div role="status" aria-label="Loading person profile"><span className="sr-only">Loading profile and filmography…</span><div aria-hidden="true">
      <div className={profileLayout}>
        <PosterSkeleton className="self-start rounded-2xl sm:row-span-2" />
        <div className="space-y-5 py-2"><div className="h-2 w-20 rounded-full bg-white/[.05]" /><div className="h-3 w-3/4 max-w-52 rounded-full bg-white/[.08]" /><div className="h-2 w-16 rounded-full bg-white/[.05]" /><div className="h-3 w-4/5 max-w-64 rounded-full bg-white/[.08]" /></div>
        <div className="col-span-2 space-y-3 sm:col-span-1"><div className="mb-5 h-5 w-28 rounded bg-white/[.08]" />{[0, 1, 2, 3].map((line) => <div key={line} className="h-3 w-full max-w-3xl rounded-full bg-white/[.05]" />)}<div className="h-3 w-2/3 rounded-full bg-white/[.05]" /></div>
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-white/[.08] px-[clamp(24px,4vw,72px)] py-7"><div className="h-6 w-32 rounded bg-white/[.08]" /><div className="h-12 w-40 rounded-full bg-white/[.05]" /></div>
      <div className="grid grid-cols-3 md:grid-cols-5">{Array.from({ length: 15 }, (_, index) => <PosterSkeleton key={index} />)}</div>
    </div></div>
  );
}

export default function Person() {
  const { currentMediaType, setCurrentMediaType } = useMedia();
  const { id } = useParams();
  const location = useLocation();
  const [record, setRecord] = useState(null);
  const [failedId, setFailedId] = useState(null);
  const [retryVersion, setRetryVersion] = useState(0);
  const [filmographyType, setFilmographyType] = useState(location.state?.fromMediaType || currentMediaType);
  const personDetails = record?.id === id ? record.details : null;
  const error = failedId === id;

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    window.scrollTo(0, 0);
    setFailedId(null);
    async function fetchProfile() {
      try {
        const responses = await Promise.all([
          fetch(`https://api.themoviedb.org/3/person/${id}?api_key=${apiKey}`, { signal: controller.signal }),
          fetch(`https://api.themoviedb.org/3/person/${id}/combined_credits?api_key=${apiKey}`, { signal: controller.signal }),
        ]);
        if (responses.some((response) => !response.ok)) throw new Error("Unable to load profile");
        const [details, credits] = await Promise.all(responses.map((response) => response.json()));
        if (!active) return;
        const titles = new Map();
        (credits.cast || []).forEach((title) => {
          if (title.poster_path && ["movie", "tv"].includes(title.media_type)) titles.set(`${title.media_type}-${title.id}`, title);
        });
        setRecord({ id, details, credits: [...titles.values()].sort((a, b) => (b.popularity || 0) - (a.popularity || 0)) });
      } catch (failure) {
        if (active && failure.name !== "AbortError") setFailedId(id);
      }
    }
    fetchProfile();
    return () => { active = false; controller.abort(); };
  }, [id, retryVersion]);

  const filmography = useMemo(() => {
    const credits = record?.id === id ? record.credits : [];
    return { movie: credits.filter((title) => title.media_type === "movie"), tv: credits.filter((title) => title.media_type === "tv") };
  }, [record, id]);

  const facts = personDetails ? [
    ["Known for", personDetails.known_for_department],
    ["Born", formatDate(personDetails.birthday)],
    ["Died", formatDate(personDetails.deathday)],
    ["From", personDetails.place_of_birth],
  ].filter(([, value]) => value) : [];

  return (
    <div className="min-h-dvh bg-[#08090c]">
      <Header title={personDetails?.name || location.state?.personName || "Cast & crew"} currentMediaType={currentMediaType} setCurrentMediaType={setCurrentMediaType} />
      {error ? (
        <div role="status" className="px-6 py-20 text-center text-white/60"><p>Couldn’t load this profile.</p><button type="button" onClick={() => setRetryVersion((value) => value + 1)} className="mt-5 min-h-11 rounded-full border border-white/15 px-5 text-sm text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">Try again</button></div>
      ) : !personDetails ? <PersonSkeleton /> : (
        <main>
          <div className={profileLayout}>
            <PersonPortrait key={id} person={personDetails} priority className="self-start rounded-2xl border border-white/[.08] shadow-[0_16px_50px_rgba(0,0,0,.3)] sm:row-span-2" />
            <dl className="grid content-start gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              {facts.map(([label, value]) => <div key={label} className={label === "From" ? "sm:col-span-2 lg:col-span-3" : ""}><dt className="mb-1.5 text-[10px] font-medium uppercase tracking-[.16em] text-white/35 sm:text-xs">{label}</dt><dd className="text-sm leading-relaxed text-white/85 sm:text-base">{value}</dd></div>)}
            </dl>
            <Biography key={id} text={personDetails.biography} />
          </div>
          <section aria-labelledby="filmography-heading" className="border-t border-white/[.08]">
            <div className="flex flex-wrap items-center justify-between gap-5 px-[clamp(24px,4vw,72px)] py-7">
              <div><h2 id="filmography-heading" className="font-outfit text-2xl font-semibold tracking-tight text-white">Filmography</h2><p className="mt-1 text-xs text-white/40">{filmography.movie.length} movies · {filmography.tv.length} TV shows</p></div>
              <MediaTypeToggle currentMediaType={filmographyType} setCurrentMediaType={setFilmographyType} />
            </div>
            {filmography[filmographyType]?.length ? <MediaGrid array={filmography[filmographyType]} mediaType={filmographyType} /> : <p className="px-6 py-14 text-center text-sm text-white/45">No {filmographyType === "movie" ? "movie" : "TV"} credits available yet.</p>}
          </section>
        </main>
      )}
    </div>
  );
}
