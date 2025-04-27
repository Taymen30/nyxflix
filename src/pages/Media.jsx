import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import Player from "../components/Player";
import BookmarkButton from "../components/BookmarkButton";
import Credits from "../components/Credits";
import Header from "../components/Header";
import { useLocalStorage } from "../hooks/useLocalStorage";

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

  // Anime-related state
  const [isAnime, setIsAnime] = useState(false);
  const [anilistId, setAnilistId] = useState(null);
  const [anilistData, setAnilistData] = useState(null);
  const [isLoadingAnilist, setIsLoadingAnilist] = useState(false);

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
  const checkIfAnime = useCallback(
    (data) => {
      if (!data) return;

      // For debugging
      console.log("Checking if anime:", data);

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

      console.log("Anime detection:", { isJapaneseOrigin, isAnimation });

      // Set as anime if both conditions are met
      const animeDetected = isJapaneseOrigin && isAnimation;
      setIsAnime(animeDetected);

      // If it's anime and we're in gamer mode, fetch the Anilist ID
      if (animeDetected && isGamerMode) {
        // Use a fallback ID immediately so we don't have to wait for the API
        setAnilistId(`tmdb${id}`);

        // Get anime title to search
        const animeTitle =
          data.name || data.title || data.original_title || data.original_name;
        if (animeTitle) {
          // Use a local function to avoid dependency issues
          setIsLoadingAnilist(true);

          const searchAnilist = async (title) => {
            try {
              const query = `
              query ($search: String) {
                Media (search: $search, type: ANIME) {
                  id
                  title {
                    romaji
                    english
                    native
                  }
                  episodes
                }
              }
            `;

              const variables = {
                search: title,
              };

              const response = await fetch("https://graphql.anilist.co", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                body: JSON.stringify({
                  query: query,
                  variables: variables,
                }),
              });

              const result = await response.json();

              console.log("Anilist result:", result);

              if (result.data && result.data.Media) {
                setAnilistData(result.data.Media);
                setAnilistId(`ani${result.data.Media.id}`);
              }
            } catch (error) {
              console.error("Error fetching Anilist data:", error);
            } finally {
              setIsLoadingAnilist(false);
            }
          };

          searchAnilist(animeTitle);
        }
      }
    },
    [isGamerMode, id]
  );

  // Search for anime on Anilist API
  const fetchAnilistData = useCallback(
    async (title) => {
      if (!title || isLoadingAnilist) return;

      setIsLoadingAnilist(true);

      try {
        const query = `
        query ($search: String) {
          Media (search: $search, type: ANIME) {
            id
            title {
              romaji
              english
              native
            }
            episodes
            coverImage {
              large
            }
          }
        }
      `;

        const variables = {
          search: title,
        };

        const response = await fetch("https://graphql.anilist.co", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            query: query,
            variables: variables,
          }),
        });

        const result = await response.json();

        if (result.data && result.data.Media) {
          setAnilistData(result.data.Media);
          setAnilistId(`ani${result.data.Media.id}`);
        } else {
          // If no match found on Anilist, use TMDB ID as fallback
          setAnilistId(`tmdb${id}`);
        }
      } catch (error) {
        console.error("Error fetching Anilist data:", error);
        setAnilistId(`tmdb${id}`); // Fallback to TMDB ID
      } finally {
        setIsLoadingAnilist(false);
      }
    },
    [id, isLoadingAnilist]
  );

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
      anilistId,
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

    // For anime content - prioritize this check
    if (isAnime) {
      // Use tmdb prefix if no Anilist ID was found
      const animeId = anilistId || `tmdb${id}`;
      return {
        primary: `https://vidsrc.cc/v2/embed/anime/${animeId}/1/sub?autoPlay=true&autoSkipIntro=true`,
        secondary: `https://vidsrc.cc/v2/embed/anime/${animeId}/1/dub?autoPlay=true&autoSkipIntro=true`,
      };
    }

    // For regular movies
    if (type === "movie") {
      return {
        primary: `https://vidsrc.cc/v3/embed/movie/${
          mediaDetails?.imdb_id || id
        }`,
        secondary: `https://vidsrc.net/embed/movie?imdb=${
          mediaDetails?.imdb_id || id
        }`,
      };
    }

    // For TV shows
    const episodeNum = selectedEpisode.episode || currentEpisode.episode || 1;
    const seasonNum = selectedEpisode.season || currentEpisode.season || 1;

    return {
      primary: `https://vidsrc.cc/v3/embed/tv/${id}/${seasonNum}/${episodeNum}`,
      secondary: `https://vidsrc.net/embed/tv?tmdb=${id}&season=${seasonNum}&episode=${episodeNum}`,
    };
  }, [
    isGamerMode,
    isAnime,
    anilistId,
    type,
    id,
    mediaDetails,
    selectedEpisode,
    currentEpisode,
  ]);

  if (!mediaDetails) {
    return (
      <div className="w-full h-full">
        <p className="text-3xl absolute top-1/2 left-1/2">Loading...</p>
      </div>
    );
  }

  const playerUrls = getPlayerUrls();

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
        />
      )}
      <div className="absolute inset-0 bg-black opacity-20"></div>

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
    </div>
  );
}
