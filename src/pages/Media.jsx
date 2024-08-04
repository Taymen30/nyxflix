import React, { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import Player from "../components/Player";
import BookmarkButton from "../components/BookmarkButton";
import Credits from "../components/Credits";
import Header from "../components/Header";

const API_KEY = process.env.REACT_APP_API_KEY;

export default function MediaDetails({
  currentMediaType,
  setCurrentMediaType,
}) {
  const { id, type } = useParams();
  const [mediaDetails, setMediaDetails] = useState(null);
  const [castInfo, setCastInfo] = useState(null);
  const [tvShowData, setTvShowData] = useState({ seasons: [], episodes: [] });
  const [currentEpisode, setCurrentEpisode] = useState(() => {
    if (type === "tvshow") {
      const savedProgress = JSON.parse(
        localStorage.getItem(`tvshow_${id}_progress`)
      );
      return savedProgress || { season: 1, episode: 1 };
    }
    return { season: 1, episode: 1 };
  });
  const [isGamerMode, setIsGamerMode] = useState(
    localStorage.getItem("gamer") === "true" || false
  );
  const episodeCarouselRef = useRef(null);

  const contentType = type === "tvshow" ? "tv" : "movie";

  useEffect(() => {
    async function fetchMediaDetails() {
      try {
        const url = `https://api.themoviedb.org/3/${contentType}/${id}?api_key=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        setMediaDetails(data);
        if (contentType === "tv") {
          setTvShowData((prev) => ({ ...prev, seasons: data.seasons }));
          fetchEpisodes(currentEpisode.season);
        }
      } catch (error) {
        console.error("Error fetching media details:", error);
      }
    }

    fetchMediaDetails();
  }, [id, type, contentType, currentEpisode.season]);

  const fetchEpisodes = async (seasonNumber) => {
    try {
      const url = `https://api.themoviedb.org/3/tv/${id}/season/${seasonNumber}?api_key=${API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      setTvShowData((prev) => ({ ...prev, episodes: data.episodes }));
    } catch (error) {
      console.error("Error fetching season details:", error);
    }
  };

  useEffect(() => {
    if (contentType === "tv") {
      localStorage.setItem(
        `tvshow_${id}_progress`,
        JSON.stringify(currentEpisode)
      );
    }
  }, [currentEpisode, id, contentType]);

  const handleSeasonChange = (newSeason) => {
    setCurrentEpisode((prev) => ({ season: Number(newSeason), episode: 1 }));
    fetchEpisodes(newSeason);
  };

  const scrollEpisodeCarousel = (direction) => {
    if (episodeCarouselRef.current) {
      const scrollAmount = episodeCarouselRef.current.offsetWidth;
      episodeCarouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!mediaDetails) {
    return (
      <div className="w-full h-full">
        <p className="text-3xl absolute top-1/2 left-1/2">Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <header className="absolute w-full z-10 flex flex-col">
        <section className="block w-2/3 lg:w-full lg:flex items-baseline">
          <Header
            title={false}
            currentMediaType={currentMediaType}
            setCurrentMediaType={setCurrentMediaType}
          />
          <h1 className="text-2xl md:text-5xl">
            {type === "movie" ? mediaDetails.title : mediaDetails.original_name}
          </h1>
          <p className="md-text-2xl ml-2 lg:ml-5">
            {type === "movie"
              ? `(${mediaDetails.release_date.split("-")[0]})`
              : `(${mediaDetails.first_air_date.split("-")[0]} - ${
                  mediaDetails.last_air_date.split("-")[0]
                })`}
          </p>
        </section>
        <ul className="flex gap-1 ml-2 md:mt-3 md:ml-8">
          {mediaDetails.genres.map((genre, i) => (
            <Link
              className="px-0 md:px-2 py-0.5 hover:opacity-70 transition-opacity duration-300"
              key={i}
              to={`/genre/${genre.id}`}
            >
              {genre.name}
            </Link>
          ))}
        </ul>
      </header>

      {mediaDetails.backdrop_path && (
        <img
          src={`https://image.tmdb.org/t/p/original/${mediaDetails.backdrop_path}`}
          alt=""
          className="w-full h-screen object-cover"
        />
      )}
      <div className="absolute inset-0 bg-black opacity-20"></div>

      <div id="player-container" className="w-full flex justify-center"></div>

      <div className="absolute bottom-[5%] p-4 w-full flex gap-5 md:gap-20 items-center justify-center">
        <section className="flex flex-col gap-1">
          <Player
            imdb_id={mediaDetails.imdb_id}
            id={mediaDetails.id}
            type={type}
            season={currentEpisode.season}
            episode={currentEpisode.episode}
          />
          <BookmarkButton id={mediaDetails.id} />
          {isGamerMode && contentType === "tv" && (
            <select
              onChange={(e) => handleSeasonChange(e.target.value)}
              value={currentEpisode.season}
              className="text-xs text-center w-20 md:w-32 h-7 md:h-9 rounded-2xl text-black"
            >
              {tvShowData.seasons.map((season) => (
                <option key={season.season_number} value={season.season_number}>
                  {season.name}
                </option>
              ))}
            </select>
          )}
          <Credits
            mediaCast={castInfo}
            setMediaCast={setCastInfo}
            mediaType={contentType}
            id={id}
          />
        </section>

        {!isGamerMode && (
          <p className="text-xs md:text-lg w-2/3">{mediaDetails.overview}</p>
        )}

        {isGamerMode && (
          <div className="bg-black bg-opacity-30 rounded relative w-2/3">
            <p className="text-center text-xl p-1">
              Season: {currentEpisode.season}
            </p>
            <div
              ref={episodeCarouselRef}
              className="overflow-x-auto m-2 whitespace-nowrap "
            >
              {tvShowData.episodes.map((episode) => (
                <div
                  onClick={() => {
                    setCurrentEpisode((prev) => ({
                      ...prev,
                      episode: episode.episode_number,
                    }));
                  }}
                  key={episode.episode_number}
                  className={`inline-block w-48 md:w-64 p-2 rounded-lg mr-4 hover:cursor-pointer transition-all duration-300 hover:brightness-125 ${
                    currentEpisode.episode === episode.episode_number
                      ? "bg-yellow-300 text-black"
                      : "bg-black bg-opacity-30"
                  }`}
                >
                  <div className="relative">
                    {episode.still_path && (
                      <img
                        src={`https://image.tmdb.org/t/p/w500/${episode.still_path}`}
                        alt={episode.name}
                        className="w-full h-auto mb-2 rounded"
                      />
                    )}
                    <div className="absolute top-2 right-2 w-5 h-5 border border-white bg-black bg-opacity-70 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {episode.episode_number}
                      </span>
                    </div>
                  </div>
                  <section className="m-1">
                    <p className="text-sm font-bold">{episode.name}</p>
                    <div className="flex justify-between mt-1">
                      <p className="text-xs">
                        {new Date(episode.air_date).toLocaleDateString("en-AU")}
                      </p>
                      {episode.runtime && (
                        <p className="text-xs">{episode.runtime} min</p>
                      )}
                    </div>
                  </section>
                </div>
              ))}
            </div>
            <button
              onClick={() => scrollEpisodeCarousel("left")}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2"
            >
              &#8249;
            </button>
            <button
              onClick={() => scrollEpisodeCarousel("right")}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2"
            >
              &#8250;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
