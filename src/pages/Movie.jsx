import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import Player from "../components/Player";
import BookmarkButton from "../components/BookmarkButton";

export default function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const apiKey = process.env.REACT_APP_API_KEY;
        const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        setMovie(data);
        console.log(data);
      } catch (error) {
        console.error("Error fetching movie details:", error);
      }
    };

    fetchMovieDetails();
  }, [id]);

  if (!movie) {
    return <div>Loading...</div>;
  }

  return (
    <div className=" h-screen">
      <SearchBar />
      <header className="absolute z-10 flex flex-col">
        <section className="flex items-baseline">
          <h1 className="text-white text-5xl">{movie.title}</h1>
          <p className="text-white text-2xl ml-5">
            {movie.release_date.split("-")[0]}
          </p>
        </section>
        <ul className="flex mt-3 ml-8">
          {movie.genres.map((genre, i) => (
            <Link
              className=" px-2 py-0.5 text-white hover:opacity-70 transition-opacity duration-300"
              key={i}
              to={`/genre/${genre.id}`}
            >
              {genre.name}
            </Link>
          ))}
        </ul>
      </header>

      {movie.backdrop_path ? (
        <img
          src={`https://image.tmdb.org/t/p/original/${movie.backdrop_path}`}
          alt=""
          className="w-full h-full object-cover"
        />
      ) : (
        <></>
      )}
      <overlay className="absolute inset-0 bg-black opacity-20"></overlay>

      <div id="player-container"></div>

      <div className="absolute bottom-[10%]  p-4 w-full flex gap-20 items-center justify-center">
        <section className="flex flex-col gap-1">
          <Player imdb_id={movie.imdb_id} id={movie.id} />
          <BookmarkButton id={movie.id} />
        </section>

        <p className="text-white text-lg w-2/3">{movie.overview}</p>
      </div>
    </div>
  );
}
