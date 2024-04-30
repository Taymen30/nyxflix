import React, { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import MovieList from "../components/MovieList";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchType, setSearchType] = useState("now_playing");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMovies([]);
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [searchType]);

  useEffect(() => {
    const apiKey = process.env.REACT_APP_API_KEY;
    const url = `https://api.themoviedb.org/3/movie/${searchType}?api_key=${apiKey}&language=en-US&page=${currentPage}`;

    setLoading(true);

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setMovies((prevMovies) => [...prevMovies, ...data.results]);
        setLoading(false);
      });
    console.log(movies);
  }, [searchType, currentPage]);

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
    <div className="m-1">
      <header className="flex items-center h-14 w-full bg-black ">
        <h1 className="text-6xl ml-1 text-white">MovieMaster</h1>
        <SearchBar setSearchType={setSearchType} />
      </header>

      <MovieList array={movies} />
    </div>
  );
}
