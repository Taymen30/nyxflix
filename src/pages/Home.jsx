import React, { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import MediaGrid from "../components/MediaGrid";
import MediaTypeToggle from "../components/MediaTypeToggle";

const apiKey = process.env.REACT_APP_API_KEY;

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [movieListParam, setMovieListParam] = useState("now_playing");
  const [tvShows, setTvShows] = useState([]);
  const [tvListParam, setTvListParam] = useState("popular");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [currentMediaType, setCurrentMediaType] = useState(
    localStorage.getItem("media-type") || "movie"
  );

  useEffect(() => {
    setMovies([]);
    setTvShows([]);
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [movieListParam, tvListParam, currentMediaType]);

  useEffect(() => {
    setLoading(true);
    const url =
      currentMediaType === "movie"
        ? `https://api.themoviedb.org/3/movie/${movieListParam}?api_key=${apiKey}&language=en-US&page=${currentPage}`
        : `https://api.themoviedb.org/3/tv/${tvListParam}?api_key=${apiKey}&language=en-US&page=${currentPage}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const filteredResults = data.results.filter((item) => item.poster_path);
        if (currentMediaType === "movie") {
          setMovies((prevMovies) => [...prevMovies, ...filteredResults]);
        } else {
          setTvShows((prevShow) => [...prevShow, ...filteredResults]);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, [movieListParam, tvListParam, currentPage, currentMediaType]);

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
      <header className="flex items-center h-14 w-full bg-black ">
        <h1 className="text-6xl ml-1 text-white">MovieMaster</h1>
        <MediaTypeToggle
          currentMediaType={currentMediaType}
          setCurrentMediaType={setCurrentMediaType}
        />
        <SearchBar
          setMovieListParam={setMovieListParam}
          setTvListParam={setTvListParam}
          currentMediaType={currentMediaType}
        />
      </header>
      <MediaGrid array={currentMediaType === "movie" ? movies : tvShows} />
    </>
  );
}
