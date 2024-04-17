import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";

export default function Search() {
  const { query } = useParams();
  const [queryResults, setQueryResults] = useState([]);

  useEffect(() => {
    const apiKey = process.env.REACT_APP_API_KEY;
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setQueryResults(data.results);
      });
  }, [query]);

  return (
    <>
      <header className=" flex h-14 items-center ">
        <h1 className="text-white text-5xl">Search</h1>
        <SearchBar />
      </header>
      <div className="flex flex-wrap">
        {queryResults.map((movie) => (
          <div
            key={movie.id}
            className="w-1/5 hover:opacity-70 transition-opacity duration-300"
          >
            <Link to={`/movie/${movie.id}`}>
              {movie.poster_path ? (
                <img
                  className="w-fit"
                  src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                  alt={movie.title}
                />
              ) : (
                <div className=" flex h-[30vw] justify-center items-center border-gray-500 border">
                  <p className="text-white text-3xl">No Poster</p>
                </div>
              )}
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}
