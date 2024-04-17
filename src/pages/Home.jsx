import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SearchBar from "../components/SearchBar";

export default function Home() {
  const [discover, setDiscover] = useState([]);
  const [startingPage, setStartingPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchType, setSearchType] = useState('now_playing')

  useEffect(() => {
    const fetchMovies = async () => {
      const apiKey = process.env.REACT_APP_API_KEY;
      const totalPagesToFetch = 3;
      const allMovies = [];

      for (
        let page = startingPage;
        page < startingPage + totalPagesToFetch;
        page++
      ) {
        const url = `https://api.themoviedb.org/3/movie/${searchType}?api_key=${apiKey}&language=en-US&page=${page}`;
        const response = await fetch(url);
        const data = await response.json();
        allMovies.push(...data.results);
        setTotalPages(data.total_pages);
      }

      setDiscover(allMovies);
    };
    fetchMovies();
  }, [startingPage, searchType]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [discover]);

  function handleNextResults() {
    setStartingPage((prevPage) => prevPage + 3);
  }
  function handlePreviousResults() {
    setStartingPage((prevPage) => prevPage - 3);
  }

  return (
      <div className="m-1">
          <header className="flex items-center h-14 w-full bg-black ">
              <h1 className="text-6xl ml-1 text-white">MovieMaster</h1>
              <SearchBar setSearchType={setSearchType}/>
          </header>
          <div className="flex flex-wrap ">
              {discover.map((movie, i) => (
                  <div key={movie.id} className="w-1/5 hover:opacity-70 transition-opacity duration-300">
                      <Link to={`/movie/${movie.id}`}>
                          {movie.poster_path ? (
                              <img
                                  className="w-full"
                                  src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                                  alt={movie.title}
                              />
                          ) : (
                              <div>No poster</div>
                          )}
                      </Link>
                  </div>
              ))}
          </div>
          <div className="flex w-full items-center justify-center fixed bottom-0">
          <div className=" w-1/3 flex justify-between">
              <button
                  className="text-8xl text-white"

                  onClick={handlePreviousResults}
                  disabled={startingPage <= 1}
              >
                  &lt;
              </button>
              <button
                  onClick={handleNextResults}
                  className="text-8xl text-white"
                  disabled={startingPage + 2 >= totalPages}
              >
                  &gt;
              </button>
          </div>
          </div>
      </div>
  );
}
