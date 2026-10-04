import { useState, useEffect, useCallback, useRef } from "react";
import { useMedia } from "../context/MediaContext";

const apiKey = process.env.REACT_APP_API_KEY;

export const useMediaFetch = () => {
  const {
    movies, setMovies, tvShows, setTvShows,
    currentTvPage, setCurrentTvPage, currentMoviePage, setCurrentMoviePage,
    lastFetchedMoviePage, setLastFetchedMoviePage,
    lastFetchedTvPage, setLastFetchedTvPage, currentMediaType,
  } = useMedia();
  const [fetching, setFetching] = useState(false);
  const [failedRequest, setFailedRequest] = useState(null);
  const [retryVersion, setRetryVersion] = useState(0);
  const hasMore = useRef({ movie: true, tv: true });
  const isMovie = currentMediaType === "movie";
  const page = isMovie ? currentMoviePage : currentTvPage;
  const lastFetchedPage = isMovie ? lastFetchedMoviePage : lastFetchedTvPage;
  const requestKey = `${currentMediaType}-${page}`;
  const error = failedRequest === requestKey;
  const loading = !error && (fetching || page !== lastFetchedPage);

  useEffect(() => {
    if (page === lastFetchedPage) {
      setFetching(false);
      return;
    }
    const controller = new AbortController();
    let active = true;
    setFetching(true);
    setFailedRequest(null);

    async function fetchPage() {
      const endpoint = isMovie ? "movie/now_playing" : "tv/popular";
      try {
        const response = await fetch(`https://api.themoviedb.org/3/${endpoint}?api_key=${apiKey}&language=en-US&page=${page}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Unable to load titles");
        const data = await response.json();
        if (!Array.isArray(data.results)) throw new Error("Invalid collection response");
        if (!active) return;
        const filtered = data.results.filter((item) => item.poster_path && item.vote_count > 100 && ["ko", "ja", "en", "es"].includes(item.original_language));
        hasMore.current[currentMediaType] = page < data.total_pages;
        if (isMovie) {
          setMovies((previous) => [...previous, ...filtered]);
          setLastFetchedMoviePage(page);
        } else {
          setTvShows((previous) => [...previous, ...filtered]);
          setLastFetchedTvPage(page);
        }
      } catch (failure) {
        if (active && failure.name !== "AbortError") setFailedRequest(requestKey);
      } finally {
        if (active) setFetching(false);
      }
    }
    fetchPage();
    return () => { active = false; controller.abort(); };
  }, [currentMediaType, isMovie, page, lastFetchedPage, requestKey, retryVersion, setMovies, setTvShows, setLastFetchedMoviePage, setLastFetchedTvPage]);

  const loadMore = useCallback(() => {
    if (loading || error || !hasMore.current[currentMediaType]) return;
    const setPage = isMovie ? setCurrentMoviePage : setCurrentTvPage;
    // Multiple observer notifications can arrive before the next render.
    setPage((previous) => previous === lastFetchedPage ? previous + 1 : previous);
  }, [loading, error, currentMediaType, isMovie, lastFetchedPage, setCurrentMoviePage, setCurrentTvPage]);

  const retry = useCallback(() => {
    setFailedRequest(null);
    setRetryVersion((previous) => previous + 1);
  }, []);

  return { media: isMovie ? movies : tvShows, loading, loadMore, error, retry };
};
