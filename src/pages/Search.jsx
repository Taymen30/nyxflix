import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Search() {
  const { query } = useParams();
  const [queryResults, setQueryResults] = useState([]);

  useEffect(() => {
    const apiKey = "41bd7e5ac0565f89061afe73f89c4cc5";
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setQueryResults(data.results);
      });
  }, [query]);

  return (
    <>
      <h1>Search Results</h1>
      <div className="flex flex-wrap">
        {queryResults.map((movie) => (
          <div key={movie.id} className="w-1/5">
            <Link to={`/movie/${movie.id}`}>
              {movie.poster_path ? (
                <img
                  className="w-fit"
                  src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                  alt={movie.title}
                />
              ) : (
                <div>No poster available</div>
              )}
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}
