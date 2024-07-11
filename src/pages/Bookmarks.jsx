import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";

export default function Bookmarks({ currentMediaType, setCurrentMediaType }) {
  const [bookmarkedMoviesId, setBookmarkedMoviesId] = useState([]);
  const [bookmarkedTvShowsId, setBookmarkedTvShowsId] = useState([]);
  const [bookmarkedMovies, setBookmarkedMovies] = useState([]);
  const [bookmarkedTvShows, setBookmarkedTvShows] = useState([]);

  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedHighlighted, setSelectedHighlighted] = useState(null);
  const [loadingRandom, setLoadingRandom] = useState(false);
  const apiKey = process.env.REACT_APP_API_KEY;

  useEffect(() => {
    setBookmarkedMoviesId(
      JSON.parse(localStorage.getItem("bookmarked-movie")) || []
    );
    setBookmarkedTvShowsId(
      JSON.parse(localStorage.getItem("bookmarked-tv")) || []
    );
  }, []);

  useEffect(() => {
    if (currentMediaType === "movie" && bookmarkedMoviesId.length > 0) {
      Promise.all(
        bookmarkedMoviesId.map((id) => {
          const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`;
          return fetch(url).then((res) => res.json());
        })
      ).then((moviesData) => {
        setBookmarkedMovies(moviesData);
      });
    }

    if (currentMediaType === "tv" && bookmarkedTvShowsId.length > 0) {
      Promise.all(
        bookmarkedTvShowsId.map((id) => {
          const url = `https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}`;
          return fetch(url).then((res) => res.json());
        })
      ).then((tvShowsData) => {
        setBookmarkedTvShows(tvShowsData);
      });
    }
  }, [bookmarkedMoviesId, bookmarkedTvShowsId, currentMediaType]);

  function handleRandomClick() {
    setSelectedHighlighted(null);
    setLoadingRandom(true);
    const items =
      currentMediaType === "movie" ? bookmarkedMovies : bookmarkedTvShows;
    const totalItems = items.length;
    const randomIndex = Math.floor(Math.random() * totalItems);

    let index = 0;
    let cycles = Math.floor(Math.random() * 6) + 5;

    function calculateDelay(currentIndex) {
      const proximityToTarget =
        (cycles + 1) * totalItems - (totalItems - randomIndex) - currentIndex;
      let newDelay = 30 + 500 / proximityToTarget;

      return newDelay;
    }

    function highlightNextItem() {
      const currentDelay = calculateDelay(index);
      setTimeout(() => {
        setHighlightedIndex(index);
        index += 1;
        if (index >= totalItems) {
          index = 0;
          cycles -= 1;
        }
        if (cycles === 0 && index === randomIndex) {
          setSelectedHighlighted(index - 1);
          setLoadingRandom(false);
        } else {
          highlightNextItem();
        }
      }, currentDelay);
    }

    highlightNextItem();
  }

  return (
    <div>
      <Header
        title={"Bookmarks"}
        currentMediaType={currentMediaType}
        setCurrentMediaType={setCurrentMediaType}
      />

      <div className="flex flex-wrap relative">
        {(currentMediaType === "movie"
          ? bookmarkedMovies
          : bookmarkedTvShows
        ).map((item, index) => (
          <div
            key={item.id}
            className={`w-1/3 md:w-1/5 transform transition-transform transition-filter duration-300 ${
              highlightedIndex === index
                ? "scale-110 brightness-110 z-20"
                : selectedHighlighted !== null && index !== selectedHighlighted
                ? "brightness-50"
                : ""
            }`}
          >
            <Link
              to={`/${currentMediaType === "movie" ? "movie" : "tvshow"}/${
                item.id
              }`}
            >
              {item.poster_path ? (
                <img
                  className="w-fit"
                  src={`https://image.tmdb.org/t/p/w500/${item.poster_path}`}
                  alt={currentMediaType === "movie" ? item.title : item.name}
                />
              ) : (
                <div className="flex h-[30vw] justify-center items-center">
                  <p className="text-3xl">No Poster</p>
                </div>
              )}
            </Link>
          </div>
        ))}
        {(currentMediaType === "movie" ? bookmarkedMovies : bookmarkedTvShows)
          .length > 1 && (
          <div className="w-1/3 md:w-1/5 h-[30vw] items-center justify-center flex">
            <button
              disabled={loadingRandom}
              onClick={handleRandomClick}
              className="rounded-full w-2/3 bg-white"
            >
              <div className="flex h-full flex-col justify-center items-center">
                <img
                  className="w-2/3 rounded-full bg-white border-white border-2 hover:opacity-70 transition-opacity duration-300"
                  src="/random.512x477.png"
                  alt=""
                />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
