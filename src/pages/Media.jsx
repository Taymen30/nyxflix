import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Player from "../components/Player";
import BookmarkButton from "../components/BookmarkButton";
import Credits from "../components/Credits";
import Header from "../components/Header";

const apiKey = process.env.REACT_APP_API_KEY;

export default function MediaDetails({
  currentMediaType,
  setCurrentMediaType,
}) {
  const { id, type } = useParams();
  const [media, setMedia] = useState(null);
  const [mediaCast, setMediaCast] = useState(null);
  const mediaType = type === "tvshow" ? "tv" : "movie";

  useEffect(() => {
    async function fetchMediaDetails() {
      try {
        const url = `https://api.themoviedb.org/3/${mediaType}/${id}?api_key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        setMedia(data);
      } catch (error) {
        console.error("Error fetching media details:", error);
      }
    }

    fetchMediaDetails();
  }, [id, type]);

  if (!media) {
    return (
      <div className="w-full h-full">
        <p className=" text-3xl absolute top-1/2 left-1/2">Loading...</p>;
      </div>
    );
  }

  return (
    <div className=" h-screen">
      <header className="absolute w-full z-10 flex  flex-col">
        <section className="block w-2/3 lg:w-full lg:flex items-baseline">
          <Header
            title={false}
            currentMediaType={currentMediaType}
            setCurrentMediaType={setCurrentMediaType}
          />
          <h1 className=" text-2xl md:text-5xl">
            {type === "movie" ? media.title : media.original_name}
          </h1>
          <p className=" md-text-2xl ml-2 lg:ml-5">
            {type === "movie"
              ? `(${media.release_date.split("-")[0]})`
              : `(${media.first_air_date.split("-")[0]} - ${
                  media.last_air_date.split("-")[0]
                })`}
          </p>
        </section>
        <ul className="flex gap-1 ml-2 md:mt-3 md:ml-8">
          {media.genres.map((genre, i) => (
            <Link
              className="px-0 md:px-2 py-0.5  hover:opacity-70 transition-opacity duration-300"
              key={i}
              to={`/genre/${genre.id}`}
            >
              {genre.name}
            </Link>
          ))}
        </ul>
      </header>

      {media.backdrop_path && (
        <img
          src={`https://image.tmdb.org/t/p/original/${media.backdrop_path}`}
          alt=""
          className="w-full h-fill-available"
        />
      )}
      <div className="absolute inset-0 bg-black opacity-20"></div>

      <div id="player-container" className="w-full flex justify-center"></div>

      <div className="absolute bottom-[5%] p-4 w-full flex gap-5 md:gap-20 items-center justify-center">
        <section className="flex flex-col gap-1">
          <Player imdb_id={media.imdb_id} id={media.id} type={type} />
          <Credits
            mediaCast={mediaCast}
            setMediaCast={setMediaCast}
            mediaType={mediaType}
            id={id}
          />
          <BookmarkButton id={media.id} />
        </section>

        <p className=" text-xs md:text-lg w-2/3">{media.overview}</p>
      </div>
    </div>
  );
}
