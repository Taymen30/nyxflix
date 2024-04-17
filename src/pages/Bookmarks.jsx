import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SearchBar from "../components/SearchBar";

export default function Bookmarks() {
  const [bookmarksId, setBookmarksId] = useState([]);
  const [bookmarkedMovies, setBookmarkedMovies] = useState([]);

  useEffect(() => {
    setBookmarksId(JSON.parse(localStorage.getItem("favourites")) || []);
  }, []);

  useEffect(() => {
    const apiKey = process.env.REACT_APP_API_KEY;

    Promise.all(
      bookmarksId.map((id) => {
        const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`;
        return fetch(url).then((response) => response.json());
      })
    ).then((data) => {
      const movies = data.map((movie) => movie);
      setBookmarkedMovies(movies);
    });
  }, [bookmarksId]);

  return (
    <div>
      <div className="mx-1 h-14">
        <h1 className="text-white text-5xl">Bookmarks</h1>
        <SearchBar />
      </div>
      <div className="flex flex-wrap">
        <div className="flex flex-col bg-white w-1/5 h-[30vw] justify-center items-center">
            <img className="w-2/3" src="/random.512x477.png" alt=""/>
            <p className="text-3xl">Bookmarked</p>
        </div>
        {bookmarkedMovies.map((movie) => (
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
                <div>No poster available</div>
              )}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
