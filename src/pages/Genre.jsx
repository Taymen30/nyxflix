import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import MediaGrid from "../components/MediaGrid";
import { useMedia } from "../context/MediaContext";

const apiKey = process.env.REACT_APP_API_KEY;

export default function Genre() {
  const { currentMediaType, setCurrentMediaType } = useMedia();
  const { genre } = useParams();
  const [genreResults, setGenreResults] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const genreMap = {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Science Fiction",
    10770: "TV Movie",
    53: "Thriller",
    10752: "War",
    37: "Western",
  };
  useEffect(() => {
    setGenreResults([]);
    setPage(1);
  }, [genre, currentMediaType]);

  useEffect(() => {
    const url = `https://api.themoviedb.org/3/discover/${currentMediaType}?api_key=${apiKey}&with_genres=${genre}&page=${page}`;

    const controller = new AbortController();
    let active = true;
    setLoading(true);
    fetch(url, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load genre");
        return response.json();
      })
      .then((data) => {
        if (active) setGenreResults((previous) => [...previous, ...(data.results || []).filter((item) => item.poster_path)]);
      })
      .catch((error) => {
        if (active && error.name !== "AbortError") console.error("Unable to load genre", error);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [genre, page, currentMediaType]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = 200;
      const scrollY = window.scrollY || window.pageYOffset;
      if (
        window.innerHeight + scrollY >=
          document.documentElement.scrollHeight - scrollThreshold &&
        !loading
      ) {
        setPage((prevPage) => prevPage + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading]);

  return (
    <>
      <Header
        title={genreMap[genre]}
        currentMediaType={currentMediaType}
        setCurrentMediaType={setCurrentMediaType}
      />

      <MediaGrid array={genreResults} loading={loading} />
    </>
  );
}
