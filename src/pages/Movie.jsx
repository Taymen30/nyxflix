import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SearchBar from "../components/SearchBar";

function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const apiKey = "41bd7e5ac0565f89061afe73f89c4cc5";
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
    <div className="m-1">
      <header className="flex justify-between items-center">
        <h1 className="text-white text-5xl">{movie.title}</h1>
        <SearchBar />
      </header>

      <div className="h-full">
        <p className="text-white">{movie.overview}</p>
        <iframe
          className="bg-black h-full "
          src={`https://vidsrc.to/embed/movie/${movie.
            imdb_id}`}
          referrerPolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin"
          allowFullScreen="true"
          allow="autoplay"
        ></iframe>
      </div>
    </div>
  );
}

export default MovieDetails;
