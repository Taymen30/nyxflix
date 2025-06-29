import React, { useState, useEffect, useRef } from "react";
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
    const url = `https://api.themoviedb.org/3/search/${currentMediaType}?api_key=${api_key}&query=${query}&page=${currentPage}`;

    setLoading(true);

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const filteredResults = data.results.filter(
          (movie) => movie.poster_path
        );
        setResults((prevResults) => [...prevResults, ...filteredResults]);
        setLoading(false);
      });
  }, [query, currentPage, currentMediaType]);

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
      <MediaGrid array={results} />
    </>
  );
}
