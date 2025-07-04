import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useLayoutEffect,
  useReducer,
} from "react";
import { Link, useParams } from "react-router-dom";
import Player from "../components/Player";
import BookmarkButton from "../components/BookmarkButton";
import Credits from "../components/Credits";
import Header from "../components/Header";
import CenteredSpinner from "../components/CenteredSpinner";
import EpisodeImage from "../components/EpisodeImage";
import TypingText from "../components/TypingText";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { motion, AnimatePresence } from "framer-motion";
import { useMedia } from "../context/MediaContext";

const API_KEY = process.env.REACT_APP_API_KEY;

const tvDataReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_START":
      return {
        ...state,
        fetchingSeasons: new Set(state.fetchingSeasons).add(
          action.seasonNumber
        ),
      };
    case "FETCH_SUCCESS": {
      const newFetching = new Set(state.fetchingSeasons);
      newFetching.delete(action.seasonNumber);
      return {
        ...state,
        episodesBySeason: {
          ...state.episodesBySeason,
          [action.seasonNumber]: action.episodes,
        },
        fetchingSeasons: newFetching,
      };
    }
    case "FETCH_ERROR": {
      const newFetching = new Set(state.fetchingSeasons);
      newFetching.delete(action.seasonNumber);
      return { ...state, fetchingSeasons: newFetching };
    }
    default:
      return state;
  }
};

export default function MediaDetails() {
  const { currentMediaType, setCurrentMediaType } = useMedia();
  const { id, type } = useParams();
  const [mediaDetails, setMediaDetails] = useState(null);
  const [castInfo, setCastInfo] = useState(null);

  const [tvData, dispatch] = useReducer(tvDataReducer, {
    episodesBySeason: {},
    fetchingSeasons: new Set(),
  });
  const { episodesBySeason, fetchingSeasons } = tvData;

  const [visibleEpisodes, setVisibleEpisodes] = useState([]);

  // Enhanced progress tracking with detailed watch data
  const [watchProgress, setWatchProgress] = useLocalStorage(
    `tvshow_${id}_progress`,
    {
      currentEpisode: { season: 1, episode: 1 },
      episodes: {}, // Will store: { "s1e1": { progress: 85, timestamp: 1200, duration: 2400, completed: true } }
    }
  );

  // Backwards compatibility - extract current episode from new structure
  const currentEpisode = watchProgress.currentEpisode || {
    season: 1,
    episode: 1,
  };
  const setCurrentEpisode = (newEpisode) => {
    setWatchProgress((prev) => ({
      ...prev,
      currentEpisode: newEpisode,
    }));
  };

  // State for what season is currently displayed in the dropdown (doesn't save progress)
  const [displaySeason, setDisplaySeason] = useState(currentEpisode.season);

  // This state is only for highlighting the episode that will be played.
  const [selectedEpisode, setSelectedEpisode] = useState({
    season: null,
    episode: null,
  });

  const [isGamerMode] = useLocalStorage("gamer", false);
  const episodeCarouselRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isInitialScrollDone, setIsInitialScrollDone] = useState(false);

  // Refs for scrolling logic
  const episodesContainerRef = useRef(null);
  const seasonObserver = useRef(null);
  const seasonGroupRefs = useRef({});
  const episodeRefs = useRef({});
  const isPrepending = useRef(false);
  const prevScrollWidth = useRef(0);
  const scrollInterval = useRef(null);

  // Track the target season for scrolling
  const targetSeasonRef = useRef(null);
  const justScrolledToTargetRef = useRef(false);
  const isCorrectingSeasonRef = useRef(false);

  // Track when user is manually scrolling to prevent auto-scroll-back
  const isUserScrollingRef = useRef(false);
  const userScrollTimeoutRef = useRef(null);

  // Anime-related state
  const [isAnime, setIsAnime] = useState(false);
  const [animeAudio, setAnimeAudio] = useState("dub"); // 'dub' or 'sub'

  // Helper function to get the next episode - moved before useEffect to avoid initialization error
  const getNextEpisode = useCallback(
    (currentSeason, currentEpisodeNum) => {
      if (!mediaDetails?.seasons) return null;

      // Find current season data
      const seasonData = mediaDetails.seasons.find(
        (s) => s.season_number === currentSeason
      );
      if (!seasonData) return null;

      // Check if there's a next episode in current season
      const episodesInSeason = episodesBySeason[currentSeason];
      if (episodesInSeason && currentEpisodeNum < episodesInSeason.length) {
        return { season: currentSeason, episode: currentEpisodeNum + 1 };
      }

      // Check for next season
      const nextSeason = mediaDetails.seasons.find(
        (s) => s.season_number === currentSeason + 1
      );
      if (nextSeason) {
        return { season: nextSeason.season_number, episode: 1 };
      }

      return null; // No next episode
    },
    [mediaDetails, episodesBySeason]
  );

  // Helper function to get episode progress data
  const getEpisodeProgress = useCallback(
    (seasonNum, episodeNum) => {
      // Backwards compatibility: check if watchProgress has the new structure.
      if (!watchProgress || typeof watchProgress.episodes !== "object") {
        return null;
      }
      const episodeKey = `s${seasonNum}e${episodeNum}`;
      return watchProgress.episodes[episodeKey] || null;
    },
    [watchProgress] // Depend on the whole object to handle structure changes.
  );

  // Progress tracking message listener
  useEffect(() => {
    const handleProgressMessage = (event) => {
      try {
        if (typeof event.data === "string") {
          const progressData = JSON.parse(event.data);
          // console.log("Watch progress received:", progressData);

          // Check if this is progress data from videasy.net
          if (
            progressData.id &&
            progressData.type &&
            progressData.progress !== undefined
          ) {
            const episodeKey =
              progressData.type === "tv"
                ? `s${progressData.season}e${progressData.episode}`
                : "s0e0"; // Movies use season 0, episode 0

            const progressPercent = progressData.progress;
            const isCompleted = progressPercent >= 85; // Consider 85%+ as completed

            // Update episode/movie progress
            setWatchProgress((prev) => ({
              ...prev,
              episodes: {
                ...prev.episodes,
                [episodeKey]: {
                  progress: progressPercent,
                  timestamp: progressData.timestamp || 0,
                  duration: progressData.duration || 0,
                  completed: isCompleted,
                  lastWatched: Date.now(),
                },
              },
            }));

            // Auto-advance to next episode if this one is completed and it's a TV show
            if (
              isCompleted &&
              progressData.type === "tv" &&
              type === "tvshow"
            ) {
              const nextEpisode = getNextEpisode(
                progressData.season,
                progressData.episode
              );
              if (nextEpisode) {
                setCurrentEpisode(nextEpisode);
              }
            }
          }
        }
      } catch (error) {
        // Ignore parsing errors - not all messages are JSON
      }
    };

    window.addEventListener("message", handleProgressMessage);

    return () => {
      window.removeEventListener("message", handleProgressMessage);
      if (userScrollTimeoutRef.current) {
        clearTimeout(userScrollTimeoutRef.current);
      }
    };
  }, [id, type, setWatchProgress, setCurrentEpisode, getNextEpisode]);

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

  const EpisodeSkeleton = () => (
    <div className="w-32 sm:w-40 md:w-48 lg:w-52 p-2 rounded-lg bg-black/50 flex-shrink-0 animate-pulse">
      <div className="w-full h-16 sm:h-20 md:h-24 lg:h-28 mb-2 rounded bg-white/10"></div>
      <div className="h-3 sm:h-4 w-3/4 mb-2 rounded bg-white/10"></div>
      <div className="h-2 sm:h-3 w-1/2 rounded bg-white/10"></div>
    </div>
  );

  const scrollToEpisode = useCallback(
    (seasonNum, episodeNum, behavior = "smooth") => {
      const container = episodesContainerRef.current;
      if (
        !episodeRefs.current[seasonNum] ||
        !episodeRefs.current[seasonNum][episodeNum] ||
        !container
      )
        return;

      const episodeEl = episodeRefs.current[seasonNum][episodeNum];
      const containerRect = container.getBoundingClientRect();
      const episodeRect = episodeEl.getBoundingClientRect();

      const scrollLeft =
        episodeRect.left - containerRect.left + container.scrollLeft - 64; // Position with a 4rem offset from the left

      container.scrollTo({ left: scrollLeft, behavior });
    },
    []
  );

  const scrollToSeason = useCallback((seasonNumber, behavior = "smooth") => {
    const container = episodesContainerRef.current;
    const seasonEl = seasonGroupRefs.current[seasonNumber];
    if (container && seasonEl) {
      const scrollPosition = seasonEl.offsetLeft - container.offsetLeft - 20; // 20px offset
      container.scrollTo({
        left: scrollPosition,
        behavior,
      });
    }
  }, []);

  useEffect(() => {
    if (isDataLoaded && isImageLoaded) {
      setIsLoading(false);
    }
  }, [isDataLoaded, isImageLoaded]);

  // Ensure currentEpisode.season is never 0
  useEffect(() => {
    if (currentEpisode.season === 0) {
      console.log("Correcting season 0 to season 1");
      isCorrectingSeasonRef.current = true;
      setCurrentEpisode((prev) => ({ ...prev, season: 1, episode: 1 }));
      // Clear the flag after the correction
      setTimeout(() => {
        isCorrectingSeasonRef.current = false;
      }, 100);
    }
  }, [currentEpisode.season, setCurrentEpisode]);

  // Sync displaySeason with currentEpisode when currentEpisode changes
  useEffect(() => {
    setDisplaySeason(currentEpisode.season);
  }, [currentEpisode.season]);

  const contentType = type === "tvshow" ? "tv" : "movie";

  // Fetch media details from TMDB
  useEffect(() => {
    async function fetchMediaDetails() {
      setIsLoading(true);
      setIsDataLoaded(false);
      setIsImageLoaded(false);
      setMediaDetails(null);

      try {
        const url = `https://api.themoviedb.org/3/${contentType}/${id}?api_key=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        setMediaDetails(data);
        document.title = data.title || data.original_name;

        checkIfAnime(data);
        setIsDataLoaded(true);

        if (data.backdrop_path) {
          const img = new Image();
          img.src = `https://image.tmdb.org/t/p/original/${data.backdrop_path}`;
          img.onload = () => setIsImageLoaded(true);
          img.onerror = () => setIsImageLoaded(true); // handle error case
        } else {
          setIsImageLoaded(true); // if no image
        }
      } catch (error) {
        console.error("Error fetching media details:", error);
        setIsLoading(false); // Make sure loading stops on error
      }
    }

    fetchMediaDetails();
  }, [id, type, contentType, checkIfAnime]);

  const fetchSeason = useCallback(
    async (seasonNumber) => {
      // The guard for fetchSeason is now at the call sites,
      // and this callback is stable.
      dispatch({ type: "FETCH_START", seasonNumber });
      try {
        const url = `https://api.themoviedb.org/3/tv/${id}/season/${seasonNumber}?api_key=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        dispatch({
          type: "FETCH_SUCCESS",
          seasonNumber,
          episodes: data.episodes,
        });
      } catch (error) {
        console.error(`Error fetching season ${seasonNumber}:`, error);
        dispatch({ type: "FETCH_ERROR", seasonNumber });
      }
    },
    [id, dispatch] // Now truly stable
  );

  // Simplified initialization effect
  useEffect(() => {
    if (!mediaDetails || type !== "tvshow" || isInitialScrollDone) return;

    const initialize = async () => {
      // Correct for season 0 from old local storage values
      const startSeason =
        currentEpisode.season === 0 ? 1 : currentEpisode.season;
      const startEpisode =
        currentEpisode.season === 0 ? 1 : currentEpisode.episode;

      // If the season is not 0, but is different from what's in state, update it.
      if (startSeason !== currentEpisode.season) {
        setCurrentEpisode({ season: startSeason, episode: startEpisode });
      }

      // Fetch the initial season and its direct neighbors to create a scroll buffer
      const seasonsToFetch = [startSeason];
      const seasonData = mediaDetails.seasons;
      const prevSeason = seasonData.find(
        (s) => s.season_number === startSeason - 1
      );
      if (prevSeason) seasonsToFetch.push(prevSeason.season_number);
      const nextSeason = seasonData.find(
        (s) => s.season_number === startSeason + 1
      );
      if (nextSeason) seasonsToFetch.push(nextSeason.season_number);

      const fetchPromises = seasonsToFetch
        .filter((s) => !episodesBySeason[s] && !fetchingSeasons.has(s))
        .map((s) => fetchSeason(s));

      await Promise.all(fetchPromises);
      // The scrolling is now handled by the layout effect after this render.
    };

    initialize();
  }, [
    mediaDetails,
    type,
    isInitialScrollDone,
    currentEpisode.season,
    currentEpisode.episode,
    fetchSeason,
    setCurrentEpisode,
    scrollToEpisode,
  ]);

  // Update visible episodes whenever the fetched data changes.
  useEffect(() => {
    const seasonsToDisplay = Object.keys(episodesBySeason)
      .map(Number)
      .sort((a, b) => a - b);

    const newVisibleEpisodes = seasonsToDisplay.flatMap((seasonNumber) =>
      (episodesBySeason[seasonNumber] || []).map((ep) => ({
        ...ep,
        season_number: seasonNumber,
      }))
    );
    setVisibleEpisodes(newVisibleEpisodes);
  }, [episodesBySeason]);

  // Layout effect for smooth prepending
  useLayoutEffect(() => {
    if (isPrepending.current) {
      const container = episodesContainerRef.current;
      const newScrollWidth = container.scrollWidth;
      const diff = newScrollWidth - prevScrollWidth.current;
      container.scrollLeft += diff;
      isPrepending.current = false;
    }
  }, [visibleEpisodes]);

  // This layout effect handles all scrolling logic that needs to occur
  // AFTER the DOM has been updated with new episode/season elements.
  useLayoutEffect(() => {
    // 1. Handle the initial scroll to the last-watched episode
    if (!isInitialScrollDone && mediaDetails && type === "tvshow") {
      const startSeason =
        currentEpisode.season === 0 ? 1 : currentEpisode.season;
      const startEpisode =
        currentEpisode.season === 0 ? 1 : currentEpisode.episode;

      if (episodeRefs.current[startSeason]?.[startEpisode]) {
        scrollToEpisode(startSeason, startEpisode, "auto");
        setSelectedEpisode({ season: startSeason, episode: startEpisode });
        setIsInitialScrollDone(true); // Prevent this from running again
      }
      return; // Exit after handling initial scroll
    }

    // 2. Handle scrolling to a target season (from dropdown selection)
    if (
      targetSeasonRef.current !== null &&
      seasonGroupRefs.current[targetSeasonRef.current]
    ) {
      const targetSeason = targetSeasonRef.current;
      console.log("Layout effect: Scrolling to target season", targetSeason);
      scrollToSeason(targetSeason, "smooth");
      targetSeasonRef.current = null; // Clear the target after scrolling
      justScrolledToTargetRef.current = true; // Mark that we just scrolled to target

      // Clear the flag after a delay to allow normal scrolling to resume
      setTimeout(() => {
        justScrolledToTargetRef.current = false;
      }, 1000);

      return;
    }

    // 3. Handle scrolling to the current season when it's newly available (fallback)
    // But don't run this if we just scrolled to a target season, are correcting season 0, or user is manually scrolling
    if (
      isInitialScrollDone &&
      type === "tvshow" &&
      !justScrolledToTargetRef.current &&
      !isCorrectingSeasonRef.current &&
      !isUserScrollingRef.current &&
      seasonGroupRefs.current[currentEpisode.season]
    ) {
      console.log(
        "Layout effect: Checking if should scroll to current season",
        currentEpisode.season
      );

      // Get the container and check if the current season is visible
      const container = episodesContainerRef.current;
      if (container) {
        const seasonEl = seasonGroupRefs.current[currentEpisode.season];
        const containerRect = container.getBoundingClientRect();
        const seasonRect = seasonEl.getBoundingClientRect();

        // Check if the season is already reasonably in view
        const isInView =
          seasonRect.left >= containerRect.left - 200 &&
          seasonRect.right <= containerRect.right + 200;

        console.log("Season visibility check:", {
          season: currentEpisode.season,
          isInView,
          seasonLeft: seasonRect.left,
          seasonRight: seasonRect.right,
          containerLeft: containerRect.left,
          containerRight: containerRect.right,
        });

        if (!isInView) {
          console.log("Scrolling to current season", currentEpisode.season);
          scrollToSeason(currentEpisode.season, "smooth");
        }
      }
    }
  }, [
    visibleEpisodes, // This reruns when new seasons are added
    episodesBySeason, // Also rerun when episode data changes
    mediaDetails,
    type,
    isInitialScrollDone,
    currentEpisode.season,
    scrollToEpisode,
    scrollToSeason,
  ]);

  // Infinite scroll and season observer
  useEffect(() => {
    const container = episodesContainerRef.current;
    if (!container || !isInitialScrollDone) return;

    const handleScroll = () => {
      if (isPrepending.current || Object.keys(episodesBySeason).length === 0)
        return;

      // Mark that user is actively scrolling to prevent auto-scroll-back
      isUserScrollingRef.current = true;
      if (userScrollTimeoutRef.current) {
        clearTimeout(userScrollTimeoutRef.current);
      }
      userScrollTimeoutRef.current = setTimeout(() => {
        isUserScrollingRef.current = false;
      }, 2000); // Clear flag after 2 seconds of no scrolling

      const { scrollLeft, scrollWidth, clientWidth } = container;

      // Load next season
      if (scrollLeft + clientWidth >= scrollWidth - 1500) {
        const maxVisibleSeason = Math.max(
          ...Object.keys(episodesBySeason).map(Number)
        );
        const nextSeason = mediaDetails?.seasons.find(
          (s) => s.season_number === maxVisibleSeason + 1
        );
        if (
          nextSeason &&
          !fetchingSeasons.has(nextSeason.season_number) &&
          !episodesBySeason[nextSeason.season_number]
        ) {
          fetchSeason(nextSeason.season_number);
        }
      }

      // Load previous season
      if (scrollLeft < 1500) {
        const minVisibleSeason = Math.min(
          ...Object.keys(episodesBySeason).map(Number)
        );
        if (minVisibleSeason <= 0) return; // Don't try to load seasons before 0

        const prevSeason = mediaDetails?.seasons.find(
          (s) => s.season_number === minVisibleSeason - 1
        );
        if (
          prevSeason &&
          !fetchingSeasons.has(prevSeason.season_number) &&
          !episodesBySeason[prevSeason.season_number]
        ) {
          isPrepending.current = true;
          prevScrollWidth.current = scrollWidth;
          fetchSeason(prevSeason.season_number);
        }
      }
    };

    container.addEventListener("scroll", handleScroll);

    if (seasonObserver.current) seasonObserver.current.disconnect();

    // Simplified observer - last intersecting season wins
    seasonObserver.current = new IntersectionObserver(
      (entries) => {
        let lastVisibleSeason = null;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            lastVisibleSeason = Number(entry.target.dataset.seasonGroup);
          }
        }
        // DON'T update currentEpisode here - only update the dropdown display
        // Progress should only be saved when Play button is clicked
        if (lastVisibleSeason !== null && displaySeason !== lastVisibleSeason) {
          // Just update the dropdown to reflect what's visible, but don't save progress
          setDisplaySeason(lastVisibleSeason);
        }
      },
      { root: container, threshold: 0.1 } // Fire when 10% is visible
    );

    const seasonGroups = container.querySelectorAll("[data-season-group]");
    seasonGroups.forEach((group) => seasonObserver.current.observe(group));

    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (seasonObserver.current) seasonObserver.current.disconnect();
      if (userScrollTimeoutRef.current) {
        clearTimeout(userScrollTimeoutRef.current);
      }
    };
  }, [
    visibleEpisodes,
    fetchSeason,
    mediaDetails,
    episodesBySeason,
    isInitialScrollDone,
    setCurrentEpisode,
    currentEpisode.season,
    fetchingSeasons,
  ]);

  const handleSeasonChange = async (newSeason) => {
    const seasonNumber = Number(newSeason);

    if (displaySeason === seasonNumber) return;

    // Set the target season for scrolling
    targetSeasonRef.current = seasonNumber;

    // Update display season (doesn't save progress)
    setDisplaySeason(seasonNumber);
    setSelectedEpisode({ season: null, episode: null }); // Clear visual selection

    if (episodesBySeason[seasonNumber]) {
      // Season is already loaded, scroll immediately
      scrollToSeason(seasonNumber, "smooth");
      targetSeasonRef.current = null; // Clear target since we scrolled
    } else {
      // Season needs to be fetched. The layout effect will handle scrolling
      // when the new season data is rendered.
      if (!fetchingSeasons.has(seasonNumber)) {
        fetchSeason(seasonNumber);
      }
    }
  };

  const handleEpisodeClick = (episodeNumber, seasonNumber) => {
    const newEpisode = { season: seasonNumber, episode: episodeNumber };
    setSelectedEpisode(newEpisode);
    // DO NOT save progress here - only save when Play button is clicked
  };

  const handlePlayButtonClick = () => {
    if (selectedEpisode.season !== null && selectedEpisode.episode !== null) {
      const updatedEpisode = {
        season: selectedEpisode.season,
        episode: selectedEpisode.episode,
      };
      // Only save progress when Play button is actually clicked
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
    if (!isGamerMode) {
      return {
        primary: null, // Will be set to YouTube trailer URL in Player component
        secondary: null,
      };
    }

    // Determine season and episode numbers, defaulting to 1 if not set
    const episodeNum = selectedEpisode.episode || currentEpisode.episode || 1;
    const seasonNum = selectedEpisode.season || currentEpisode.season || 1;

    // For anime content - Calculate absolute episode number across all seasons
    if (isAnime) {
      const animeId = `tmdb${id}`; // Prefix TMDB ID

      // Calculate absolute episode number by counting episodes from previous seasons
      let absoluteEpisodeNum = episodeNum;
      if (mediaDetails?.seasons && seasonNum > 1) {
        for (let i = 1; i < seasonNum; i++) {
          const season = mediaDetails.seasons.find(
            (s) => s.season_number === i
          );
          if (season && season.episode_count) {
            absoluteEpisodeNum += season.episode_count;
          }
        }
      }

      // Using vidsrc.cc v2 embed for anime
      const primaryUrl = `https://vidsrc.cc/v2/embed/anime/${animeId}/${absoluteEpisodeNum}/${animeAudio}?autoPlay=true&autoSkipIntro=true`;

      // Secondary source is the other audio option
      const secondaryAudio = animeAudio === "dub" ? "sub" : "dub";
      const secondaryUrl = `https://vidsrc.cc/v2/embed/anime/${animeId}/${absoluteEpisodeNum}/${secondaryAudio}?autoPlay=true&autoSkipIntro=true`;

      return {
        primary: primaryUrl,
        secondary: secondaryUrl,
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

      // Get movie progress for resume functionality
      const movieProgress = getEpisodeProgress(0, 0); // Movies use season 0, episode 0
      const resumeTimestamp = movieProgress?.timestamp || 0;

      // Build videasy URL with features
      const videasyParams = new URLSearchParams({
        autoPlay: "true",
      });

      if (resumeTimestamp > 30) {
        // Only resume if more than 30 seconds in
        videasyParams.set("progress", Math.floor(resumeTimestamp).toString());
      }

      return {
        primary: `https://player.videasy.net/movie/${id}?${videasyParams.toString()}`,
        secondary: `https://vidsrc.cc/v2/embed/movie/${
          formattedImdbId || id
        }?autoPlay=true`,
      };
    }

    // For TV shows
    const imdbId = mediaDetails?.imdb_id;
    const formattedImdbId = imdbId
      ? imdbId.startsWith("tt")
        ? imdbId
        : `tt${imdbId}`
      : null;

    // Get episode progress for resume functionality
    const episodeProgress = getEpisodeProgress(seasonNum, episodeNum);
    const resumeTimestamp = episodeProgress?.timestamp || 0;

    // Build videasy URL with TV show features
    const videasyParams = new URLSearchParams({
      autoPlay: "true",
      nextEpisode: "true",
      autoplayNextEpisode: "true",
      episodeSelector: "true",
    });

    if (resumeTimestamp > 30) {
      // Only resume if more than 30 seconds in
      videasyParams.set("progress", Math.floor(resumeTimestamp).toString());
    }

    return {
      primary: `https://player.videasy.net/tv/${id}/${seasonNum}/${episodeNum}?${videasyParams.toString()}`,
      secondary: `https://vidsrc.cc/v2/embed/tv/${
        formattedImdbId || id
      }/${seasonNum}/${episodeNum}?autoPlay=true`,
    };
  }, [
    isGamerMode,
    isAnime,
    type,
    id,
    mediaDetails,
    selectedEpisode,
    currentEpisode,
    getEpisodeProgress,
    animeAudio,
  ]);

  const startScrolling = (direction) => {
    // Mark as user scrolling when using scroll buttons
    isUserScrollingRef.current = true;
    if (userScrollTimeoutRef.current) {
      clearTimeout(userScrollTimeoutRef.current);
    }

    let speed = 10;
    const scroll = () => {
      if (episodesContainerRef.current) {
        episodesContainerRef.current.scrollBy({
          left: direction === "left" ? -speed : speed,
          behavior: "auto",
        });
        speed *= 1.03; // Gently accelerate
        scrollInterval.current = requestAnimationFrame(scroll);
      }
    };
    scroll();
  };

  const stopScrolling = () => {
    if (scrollInterval.current) {
      cancelAnimationFrame(scrollInterval.current);
    }
    // Set timeout to clear user scrolling flag after stopping
    userScrollTimeoutRef.current = setTimeout(() => {
      isUserScrollingRef.current = false;
    }, 2000);
  };

  const renderContent = () => {
    if (!mediaDetails) return null;

    const playerUrls = getPlayerUrls();

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <header className="absolute w-full z-10 flex flex-col m-2">
          <section className="block w-2/3  lg:w-full lg:flex items-baseline">
            <Header
              title={false}
              currentMediaType={currentMediaType}
              setCurrentMediaType={setCurrentMediaType}
            />
            <h1 className="text-2xl px-4 md:px-6 md:text-5xl">
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
          <ul className="flex gap-1 ml-2  md:ml-8">
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

        <div id="player-container" className="w-full flex justify-center"></div>

        <div className="absolute bottom-0 mb-[-1rem] p-4 w-full flex flex-col gap-2">
          {isGamerMode && (
            <div className="w-full flex items-center justify-center gap-4 mb-2">
              <section className="flex flex-row gap-3 items-center">
                <Player
                  imdb_id={mediaDetails.imdb_id}
                  id={id}
                  type={type}
                  season={selectedEpisode.season || currentEpisode.season}
                  episode={selectedEpisode.episode || currentEpisode.episode}
                  onPlayClick={handlePlayButtonClick}
                  isAnime={isAnime}
                  playerUrls={playerUrls}
                  animeAudio={animeAudio}
                  onAnimeAudioChange={setAnimeAudio}
                />
                <BookmarkButton id={mediaDetails.id} />
                <Credits
                  mediaCast={castInfo}
                  setMediaCast={setCastInfo}
                  mediaType={contentType}
                  id={id}
                />
              </section>
              {type === "tvshow" && (
                <select
                  onChange={(e) => handleSeasonChange(e.target.value)}
                  value={displaySeason}
                  className="text-sm text-center w-24 md:w-32 h-8 md:h-10 rounded-full bg-black bg-opacity-50 text-white border border-white border-opacity-20 backdrop-blur-sm focus:outline-none focus:border-opacity-50 transition-all duration-300"
                >
                  {mediaDetails.seasons.map((season) => (
                    <option
                      key={season.season_number}
                      value={season.season_number}
                      className="bg-black"
                    >
                      {season.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {type !== "tvshow" && (
            <p className="text-xs md:text-[16px] w-full max-w-2xl mx-auto bg-black bg-opacity-50 p-4 rounded-lg backdrop-blur-sm">
              {mediaDetails.overview}
            </p>
          )}

          {isGamerMode && type === "tvshow" && (
            <div className="flex items-center justify-center w-full gap-2">
              <button
                onMouseDown={() => startScrolling("left")}
                onMouseUp={stopScrolling}
                onMouseLeave={stopScrolling}
                onTouchStart={() => startScrolling("left")}
                onTouchEnd={stopScrolling}
                className="flex-shrink-0 bg-black/50 p-2 rounded-full hover:bg-black/80 transition-all select-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style={{ transform: "rotate(180deg)" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
              <div
                ref={episodesContainerRef}
                className="w-full overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-white/50 scrollbar-track-transparent p-2 sm:p-4 flex space-x-4 sm:space-x-6 md:space-x-8 bg-black/10 rounded-lg"
              >
                {Object.keys(episodesBySeason)
                  .map(Number)
                  .sort((a, b) => a - b)
                  .map((seasonNumber) => {
                    const season = mediaDetails.seasons.find(
                      (s) => s.season_number === seasonNumber
                    );
                    const episodes = episodesBySeason[seasonNumber];
                    if (!episodes || episodes.length === 0) {
                      // Show skeleton loader for seasons being fetched
                      if (fetchingSeasons.has(seasonNumber)) {
                        return (
                          <div
                            key={`season-skeleton-${seasonNumber}`}
                            className="flex-shrink-0"
                          >
                            <h3 className="text-xl font-bold p-2 my-2 text-transparent">
                              Loading...
                            </h3>
                            <div className="flex space-x-2 sm:space-x-3 md:space-x-4">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <EpisodeSkeleton key={i} />
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }

                    return (
                      <div
                        ref={(el) =>
                          (seasonGroupRefs.current[seasonNumber] = el)
                        }
                        key={`season-group-${seasonNumber}`}
                        data-season-group={seasonNumber}
                        className="flex-shrink-0"
                      >
                        <h3 className="text-xl font-bold p-2 my-2">
                          {season ? season.name : `Season ${seasonNumber}`}
                        </h3>
                        <div className="flex space-x-2 sm:space-x-3 md:space-x-4">
                          {episodes.map((episode) => {
                            const progress = getEpisodeProgress(
                              seasonNumber,
                              episode.episode_number
                            );
                            const isCompleted = progress?.completed || false;
                            const isInProgress =
                              progress && progress.progress > 5 && !isCompleted;
                            const isCurrentEpisode =
                              currentEpisode.episode ===
                                episode.episode_number &&
                              currentEpisode.season === seasonNumber;
                            const isSelected =
                              selectedEpisode.season === seasonNumber &&
                              selectedEpisode.episode ===
                                episode.episode_number;

                            return (
                              <motion.div
                                ref={(el) => {
                                  if (!episodeRefs.current[seasonNumber])
                                    episodeRefs.current[seasonNumber] = {};
                                  episodeRefs.current[seasonNumber][
                                    episode.episode_number
                                  ] = el;
                                }}
                                key={episode.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                onClick={() =>
                                  handleEpisodeClick(
                                    episode.episode_number,
                                    seasonNumber
                                  )
                                }
                                className={`w-32 sm:w-40 md:w-48 lg:w-52 p-2 rounded-lg hover:cursor-pointer transition-all duration-300 hover:brightness-125 backdrop-blur-sm flex-shrink-0 select-none ${
                                  isSelected
                                    ? "bg-purple-600 bg-opacity-95 text-white border-2 border-purple-300 shadow-lg shadow-purple-500/50 scale-105"
                                    : isCompleted
                                    ? "bg-emerald-600 bg-opacity-90 text-white border border-emerald-400 border-opacity-60"
                                    : isInProgress
                                    ? "bg-blue-600 bg-opacity-90 text-white border border-blue-400 border-opacity-50"
                                    : isCurrentEpisode
                                    ? "bg-yellow-400 bg-opacity-90 text-black border border-yellow-300 border-opacity-50"
                                    : "bg-black bg-opacity-50 border border-white border-opacity-20"
                                }`}
                              >
                                <div className="relative">
                                  {episode.still_path && (
                                    <EpisodeImage
                                      src={`https://image.tmdb.org/t/p/w500/${episode.still_path}`}
                                      alt={episode.name}
                                      className="w-full h-16 sm:h-20 md:h-24 lg:h-28 mb-2 rounded object-cover"
                                    />
                                  )}
                                  <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-5 h-5 sm:w-6 sm:h-6 border border-white bg-black bg-opacity-70 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <span className="text-white text-xs font-bold">
                                      {episode.episode_number}
                                    </span>
                                  </div>
                                </div>
                                <section className="m-1">
                                  {/* Progress indicators */}
                                  {isInProgress && (
                                    <div className="mb-2">
                                      <div className="text-xs font-bold text-blue-200 mb-1">
                                        Continue
                                      </div>
                                      <div className="w-full bg-blue-900 rounded-full h-1">
                                        <div
                                          className="bg-blue-400 h-1 rounded-full transition-all duration-300"
                                          style={{
                                            width: `${progress.progress}%`,
                                          }}
                                        ></div>
                                      </div>
                                    </div>
                                  )}
                                  {isCompleted && (
                                    <div className="flex items-center justify-center mb-2 bg-emerald-500/20 rounded-full py-1 px-2">
                                      <svg
                                        className="w-4 h-4 text-emerald-200 mr-1"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                      <span className="text-xs font-bold text-emerald-200">
                                        ✓ Completed
                                      </span>
                                    </div>
                                  )}
                                  <TypingText
                                    text={episode.name}
                                    className="text-xs sm:text-sm font-bold overflow-hidden text-ellipsis whitespace-nowrap"
                                  />
                                  <div className="flex justify-between mt-1 text-xs text-white text-opacity-70">
                                    <p className="text-xs">
                                      {episode.air_date
                                        ? new Date(
                                            episode.air_date
                                          ).toLocaleDateString("en-AU")
                                        : "TBA"}
                                    </p>
                                    {episode.runtime && (
                                      <p className="text-xs">
                                        {episode.runtime} min
                                      </p>
                                    )}
                                  </div>
                                </section>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>
              <button
                onMouseDown={() => startScrolling("right")}
                onMouseUp={stopScrolling}
                onMouseLeave={stopScrolling}
                onTouchStart={() => startScrolling("right")}
                onTouchEnd={stopScrolling}
                className="flex-shrink-0 bg-black/50 p-2 rounded-full hover:bg-black/80 transition-all select-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="h-screen">
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.2,
            }}
            className="fixed bg-black inset-0 z-50 flex items-center justify-center"
          >
            <CenteredSpinner />
          </motion.div>
        )}
      </AnimatePresence>

      {!isLoading && renderContent()}
    </div>
  );
}
