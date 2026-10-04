import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import MediaGrid from "../components/MediaGrid";
import Header from "../components/Header";
import { useMedia } from "../context/MediaContext";

export default function Search() {
  const { currentMediaType, setCurrentMediaType } = useMedia();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query");

  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const api_key = process.env.REACT_APP_API_KEY;

  useEffect(() => {
    setResults([]);
    setCurrentPage(1);
  }, [query, currentMediaType]);

  useEffect(() => {
    const url = `https://api.themoviedb.org/3/search/${currentMediaType}?api_key=${api_key}&query=${encodeURIComponent(query || "")}&page=${currentPage}`;

    const controller = new AbortController();
    let active = true;
    setLoading(true);
    fetch(url, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to search titles");
        return response.json();
      })
      .then((data) => {
        if (active) setResults((previous) => [...previous, ...(data.results || []).filter((item) => item.poster_path)]);
      })
      .catch((error) => {
        if (active && error.name !== "AbortError") console.error("Unable to search titles", error);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [query, currentPage, currentMediaType, api_key]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = 200;
      const scrollY = window.scrollY || window.pageYOffset;

      if (
        window.innerHeight + scrollY >=
          document.documentElement.scrollHeight - scrollThreshold &&
        !loading
      ) {
        setCurrentPage((prevPage) => prevPage + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading]);

  return (
    <>
      <Header
        title={query}
        currentMediaType={currentMediaType}
        setCurrentMediaType={setCurrentMediaType}
      />
      <MediaGrid array={results} loading={loading} />
    </>
  );
}
