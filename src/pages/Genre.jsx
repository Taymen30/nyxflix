import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";

export default function Genre() {
  const { genre } = useParams();
  const [genreResults, setGenreResults] = useState([]);
  const [page, setPage] = useState(1);

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
    const apiKey = process.env.REACT_APP_API_KEY;
    const url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genre},12&page=${page}\n`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setGenreResults(data.results);
      });
  }, [genre, page]);

  function nextPage() {
    setPage((page) => page + 1);
  }
  function previousPage() {
    setPage((page) => page - 1);
  }

  return (
    <>
      <header className="relative top-0 z-50 h-14">
        <h1 className="text-white text-5xl">{genreMap[genre]}</h1>
        <SearchBar />
      </header>

      <div className="flex flex-wrap">
        {genreResults.map((movie, i) => (
          <div
            key={movie.id}
            className="w-1/5 hover:opacity-70 transition-opacity duration-300"
          >
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
      <nav className="z-50 flex">
        <p
          className="text-9xl text-white hover:cursor-pointer"
          onClick={previousPage}
        >
          {"<"}
        </p>
        <p
          className="text-9xl text-white hover:cursor-pointer"
          onClick={nextPage}
        >
          {">"}
        </p>
      </nav>
    </>
  );
}
