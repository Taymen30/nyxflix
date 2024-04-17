import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Favourites() {
  const [favouritesId, setFavouritesId] = useState([]);
  const [favouriteMovies, setFavouriteMovies] = useState([]);

  useEffect(() => {
    setFavouritesId(JSON.parse(localStorage.getItem("favourites")) || []);
  }, []);

  useEffect(() => {
    const apiKey = process.env.REACT_APP_API_KEY;

    Promise.all(
      favouritesId.map((id) => {
        const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`;
        return fetch(url).then((response) => response.json());
      })
    ).then((data) => {
      const movies = data.map((movie) => movie);
      setFavouriteMovies(movies);
    });
  }, [favouritesId]);

  return (
    <div>
      <div className="flex flex-wrap">
        {favouriteMovies.map((movie) => (
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
