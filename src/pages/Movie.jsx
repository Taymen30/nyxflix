import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import Player from "../components/Player";
import BookmarksButton from "../components/BookmarksButton";

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
    <section className=" h-screen">
      <SearchBar />
      <header className="absolute z-10 flex flex-col items-center">
        <h1 className="text-white text-5xl">{movie.title}</h1>

        <div className="flex mt-3 ml-32">
          {movie.genres.map((genre, i) => (
            <Link key={i} to={`/genre/${genre.id}`}>
              <p className=" px-2 py-0.5 text-white hover:opacity-70 transition-opacity duration-300">{genre.name}</p>
            </Link>
          ))}
        </div>
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

      <info className="absolute bottom-[10%]  p-4 w-full flex gap-20 items-center justify-center">
        <div>
          <div className="w-[50px] h-[50px] justify-center items-center">
            <Player imdb_id={movie.imdb_id} id={movie.id}/>
          </div>
          <BookmarksButton id={movie.id} />
        </div>
        <div className="text-white text-lg w-2/3">{movie.overview}</div>
      </info>
    </section>
  );
}
