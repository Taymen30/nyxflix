import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import Player from "../components/Player";
import BookmarkButton from "../components/BookmarkButton";
import Credits from "../components/Credits";
import Header from "../components/Header";
import CenteredSpinner from "../components/CenteredSpinner";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { motion, AnimatePresence } from "framer-motion";

const API_KEY = process.env.REACT_APP_API_KEY;

export default function MediaDetails({
  currentMediaType,
  setCurrentMediaType,
}) {
  const { id, type } = useParams();
  const [mediaDetails, setMediaDetails] = useState(null);
  const [castInfo, setCastInfo] = useState(null);
  const [tvShowData, setTvShowData] = useState({ seasons: [], episodes: [] });
  const [currentEpisode, setCurrentEpisode] = useLocalStorage(
    `tvshow_${id}_progress`,
    { season: 1, episode: 1 }
  );
  const [displaySeason, setDisplaySeason] = useState(currentEpisode.season);
  const [selectedEpisode, setSelectedEpisode] = useState({
    season: null,
    episode: null,
  });
  const [isGamerMode] = useLocalStorage("gamer", false);
  const episodeCarouselRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Anime-related state
  const [isAnime, setIsAnime] = useState(false);

  useEffect(() => {
    if (currentEpisode.season) {
      setDisplaySeason(currentEpisode.season);
    }
  }, [currentEpisode.season]);

  const contentType = type === "tvshow" ? "tv" : "movie";

  // Fetch media details from TMDB
  useEffect(() => {
    async function fetchMediaDetails() {
      try {
        const url = `https://api.themoviedb.org/3/${contentType}/${id}?api_key=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        setMediaDetails(data);
        document.title = data.title || data.original_name;

        // Check if media is anime
        checkIfAnime(data);

        if (contentType === "tv") {
          setTvShowData((prev) => ({ ...prev, seasons: data.seasons }));
          fetchEpisodes(displaySeason);
        }
      } catch (error) {
        console.error("Error fetching media details:", error);
      }
    }

    fetchMediaDetails();
  }, [id, type, contentType, displaySeason]);

  // Check if the media is anime based on origin country and genres
  const checkIfAnime = useCallback((data) => {
    if (!data) return;

    // Check if origin country is Japan
    const isJapaneseOrigin =
      (data.origin_country && data.origin_country.includes("JP")) ||
      (data.production_countries &&
        data.production_countries.some((c) => c.iso_3166_1 === "JP")) ||
      data.original_language === "ja";

    // Check if it has animation genre (id 16 is Animation in TMDB)
    const isAnimation =
      data.genres &&
      data.genres.some((g) => g.id === 16 || g.name === "Animation");

    // Set as anime if both conditions are met
    const animeDetected = isJapaneseOrigin && isAnimation;
    setIsAnime(animeDetected);
  }, []);

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

  const handleSeasonChange = (newSeason) => {
    setDisplaySeason(Number(newSeason));
    setSelectedEpisode({ season: null, episode: null });
    fetchEpisodes(newSeason);
  };

  const handleEpisodeClick = (episodeNumber) => {
    setSelectedEpisode({ season: displaySeason, episode: episodeNumber });
  };

  const handlePlayButtonClick = () => {
    if (selectedEpisode.season !== null && selectedEpisode.episode !== null) {
      const updatedEpisode = {
        season: selectedEpisode.season,
        episode: selectedEpisode.episode,
      };
      setCurrentEpisode(updatedEpisode);
    }
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

  // Generate the correct player URL based on media type and mode
  const getPlayerUrls = useCallback(() => {
    // For debugging
    console.log("Media Details:", {
      isAnime,
      isGamerMode,
      type,
      id,
    });

    if (!isGamerMode) {
      return {
        primary: null, // Will be set to YouTube trailer URL in Player component
        secondary: null,
      };
    }

    // Determine season and episode numbers, defaulting to 1 if not set
    const episodeNum = selectedEpisode.episode || currentEpisode.episode || 1;
    const seasonNum = selectedEpisode.season || currentEpisode.season || 1;

    // For anime content - Treat like TV shows using TMDB ID
    if (isAnime) {
      const animeId = `tmdb${id}`; // Prefix TMDB ID
      // Using vidsrc.cc v2 embed for anime
      return {
        primary: `https://vidsrc.cc/v2/embed/anime/${animeId}/${episodeNum}/dub?autoPlay=true&autoSkipIntro=true`,
        secondary: `https://vidsrc.cc/v2/embed/anime/${animeId}/${episodeNum}/sub?autoPlay=true&autoSkipIntro=true`,
      };
    }

    // For regular movies
    if (type === "movie") {
      const imdbId = mediaDetails?.imdb_id;
      const formattedImdbId = imdbId
        ? imdbId.startsWith("tt")
          ? imdbId
          : `tt${imdbId}`
        : null;

      return {
        primary: `https://vidsrc.cc/v2/embed/movie/${
          formattedImdbId || id
        }?autoPlay=true`,
        secondary: `https://vidsrc.to/embed/movie/${formattedImdbId || id}`,
      };
    }

    // For TV shows
    const imdbId = mediaDetails?.imdb_id;
    const formattedImdbId = imdbId
      ? imdbId.startsWith("tt")
        ? imdbId
        : `tt${imdbId}`
      : null;

    return {
      primary: `https://vidsrc.cc/v2/embed/tv/${
        formattedImdbId || id
      }/${seasonNum}/${episodeNum}?autoPlay=true`,
      secondary: `https://vidsrc.to/embed/tv/${
        formattedImdbId || id
      }/${seasonNum}/${episodeNum}`,
    };
  }, [
    isGamerMode,
    isAnime,
    type,
    id,
    mediaDetails,
    selectedEpisode,
    currentEpisode,
  ]);

  const renderContent = () => {
    if (!mediaDetails) return null;

    const playerUrls = getPlayerUrls();

    return (
      <>
        <header className="absolute w-full z-10 flex flex-col">
          <section className="block w-2/3 lg:w-full lg:flex items-baseline">
            <Header
              title={false}
              currentMediaType={currentMediaType}
              setCurrentMediaType={setCurrentMediaType}
            />
            <h1 className="text-2xl md:text-5xl">
              {type === "movie"
                ? mediaDetails.title
                : mediaDetails.original_name}
            </h1>
            <p className="md-text-2xl ml-2 lg:ml-5">
              {type === "movie"
                ? `(${mediaDetails.release_date?.split("-")[0] || "N/A"})`
                : `(${mediaDetails.first_air_date?.split("-")[0] || "N/A"} - ${
                    mediaDetails.last_air_date?.split("-")[0] || "Present"
                  })`}
            </p>
          </section>
          <ul className="flex gap-1 ml-2 md:mt-3 md:ml-8">
            {mediaDetails.genres &&
              mediaDetails.genres.map((genre, i) => (
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
            onLoad={() => {
              setIsImageLoaded(true);
              setTimeout(() => setIsLoading(false), 500);
            }}
          />
        )}

        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: isImageLoaded ? 0.2 : 1 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 bg-black"
        />

        <div id="player-container" className="w-full flex justify-center"></div>

        <div className="absolute bottom-0 p-4 w-full flex gap-5 md:gap-20 items-center justify-center">
          <section className="flex flex-col gap-1">
            <Player
              imdb_id={mediaDetails.imdb_id}
              id={id}
              type={type}
              season={selectedEpisode.season || currentEpisode.season}
              episode={selectedEpisode.episode || currentEpisode.episode}
              onPlayClick={handlePlayButtonClick}
              isAnime={isAnime}
              playerUrls={playerUrls}
            />
            <BookmarkButton id={mediaDetails.id} />
            <Credits
              mediaCast={castInfo}
              setMediaCast={setCastInfo}
              mediaType={contentType}
              id={id}
            />
          </section>

          {type !== "tvshow" && (
            <p className="text-xs md:text-[16px] w-2/3">
              {mediaDetails.overview}
            </p>
          )}

          {isGamerMode && type === "tvshow" && (
            <div className="relative w-2/3">
              <div className="w-full flex justify-center mt-2">
                <select
                  onChange={(e) => handleSeasonChange(e.target.value)}
                  value={displaySeason}
                  className="text-xs text-center w-20 md:w-32 h-7 md:h-9 rounded text-black"
                >
                  {tvShowData.seasons.map((season) => (
                    <option
                      key={season.season_number}
                      value={season.season_number}
                    >
                      {season.name}
                    </option>
                  ))}
                </select>
              </div>
              <div
                ref={episodeCarouselRef}
                className="overflow-x-auto m-2 whitespace-nowrap "
              >
                {tvShowData.episodes.map((episode) => (
                  <div
                    onClick={() => handleEpisodeClick(episode.episode_number)}
                    key={episode.episode_number}
                    className={`inline-block w-28 md:w-52 p-2 rounded-lg mr-4 hover:cursor-pointer transition-all duration-300 hover:brightness-125 ${
                      selectedEpisode.season === displaySeason &&
                      selectedEpisode.episode === episode.episode_number
                        ? "bg-black"
                        : currentEpisode.episode === episode.episode_number &&
                          currentEpisode.season === displaySeason
                        ? "bg-yellow-300 text-black"
                        : "bg-black bg-opacity-30"
                    }`}
                  >
                    <div className="relative">
                      {episode.still_path && (
                        <img
                          src={`https://image.tmdb.org/t/p/w500/${episode.still_path}`}
                          alt={episode.name}
                          className="w-full h-14 md:h-28 mb-2 rounded"
                        />
                      )}
                      <div className="absolute top-2 right-2 w-5 h-5 border border-white bg-black bg-opacity-70 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {episode.episode_number}
                        </span>
                      </div>
                    </div>
                    <section className="m-1">
                      <p className="text-[10px] md:text-sm font-bold overflow-hidden">
                        {episode.name}
                      </p>
                      <div className="flex justify-between mt-1">
                        <p className="text-xs">
                          {episode.air_date
                            ? new Date(episode.air_date).toLocaleDateString(
                                "en-AU"
                              )
                            : "TBA"}
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
      </>
    );
  };

  return (
    <div className="h-screen">
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: isImageLoaded ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed bg-black inset-0 z-50"
          >
            <CenteredSpinner />
          </motion.div>
        )}
      </AnimatePresence>

      {renderContent()}
    </div>
  );
}
