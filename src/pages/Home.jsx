import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import MovieList from "../components/MovieList";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchType, setSearchType] = useState("now_playing");

  useEffect(() => {
    const fetchMovies = async () => {
      const apiKey = process.env.REACT_APP_API_KEY;
      const totalPagesToFetch = 3;
      setMovies([]);

      for (
        let page = currentPage;
        page < currentPage + totalPagesToFetch;
        page++
      ) {
        const url = `https://api.themoviedb.org/3/movie/${searchType}?api_key=${apiKey}&language=en-US&page=${page}`;
        const response = await fetch(url);
        const data = await response.json();
        setMovies((prevMovies) => [...prevMovies, ...data.results]);
      }
    };
    fetchMovies();
  }, [currentPage, searchType]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [movies]);

  function handleNextResults() {
    setCurrentPage((prevPage) => prevPage + 3);
  }
  function handlePreviousResults() {
    setCurrentPage((prevPage) => prevPage - 3);
  }

  return (
    <div className="m-1">
      <header className="flex items-center h-14 w-full bg-black ">
        <h1 className="text-6xl ml-1 text-white">MovieMaster</h1>
        <SearchBar setSearchType={setSearchType} />
      </header>

      <MovieList array={movies} />

      <div className="flex w-full items-center justify-center fixed bottom-0">
        <div className=" w-1/3 flex justify-between">
          <button
            className="text-8xl text-white hover:opacity-50 transition-opacity duration-300 disabled:opacity-0"
            onClick={handlePreviousResults}
            disabled={currentPage <= 1}
          >
            &lt;
          </button>
          <button
            onClick={handleNextResults}
            className="text-8xl text-white hover:opacity-50 transition-opacity duration-300"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}
