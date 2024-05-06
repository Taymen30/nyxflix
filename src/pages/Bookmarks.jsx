import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import MediaTypeToggle from "../components/MediaTypeToggle";

export default function Bookmarks() {
  const [bookmarkedMoviesId, setBookmarkedMoviesId] = useState([]);
  const [bookmarkedTvShowsId, setBookmarkedTvShowsId] = useState([]);
  const [bookmarkedMovies, setBookmarkedMovies] = useState([]);
  const [bookmarkedTvShows, setBookmarkedTvShows] = useState([]);
  const [mediaType, setMediaType] = useState(
    localStorage.getItem("media-type") || "movie"
  );
  const apiKey = process.env.REACT_APP_API_KEY;

  const randomBookmark =
    mediaType === "movie"
      ? bookmarkedMoviesId[
          Math.floor(Math.random() * bookmarkedMoviesId.length)
        ]
      : bookmarkedTvShowsId[
          Math.floor(Math.random() * bookmarkedTvShowsId.length)
        ];

  useEffect(() => {
    setBookmarkedMoviesId(
      JSON.parse(localStorage.getItem("bookmarked-movie")) || []
    );
    setBookmarkedTvShowsId(
      JSON.parse(localStorage.getItem("bookmarked-tv")) || []
    );
  }, []);

  useEffect(() => {
    if (mediaType === "movie" && bookmarkedMoviesId.length > 0) {
      Promise.all(
        bookmarkedMoviesId.map((id) => {
          const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`;
          return fetch(url).then((res) => res.json());
        })
      ).then((moviesData) => {
        setBookmarkedMovies(moviesData);
      });
    }

    if (mediaType === "tv" && bookmarkedTvShowsId.length > 0) {
      Promise.all(
        bookmarkedTvShowsId.map((id) => {
          const url = `https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}`;
          return fetch(url).then((res) => res.json());
        })
      ).then((tvShowsData) => {
        setBookmarkedTvShows(tvShowsData);
      });
    }
  }, [bookmarkedMoviesId, bookmarkedTvShowsId, mediaType]);

  return (
    <div>
      <div className="mx-1 h-14">
        <section className="flex align-bottom">
          <h1 className="text-white text-5xl">Bookmarks</h1>
          <MediaTypeToggle
            currentMediaType={mediaType}
            setCurrentMediaType={setMediaType}
          />
        </section>
        <SearchBar />
      </div>
      <div className="flex flex-wrap">
        {(mediaType === "movie" ? bookmarkedMovies : bookmarkedTvShows).map(
          (item) => (
            <div
              key={item.id}
              className="w-1/5 hover:opacity-70 transition-opacity duration-300"
            >
              <Link
                to={`/${mediaType === "movie" ? "movie" : "tvshow"}/${item.id}`}
              >
                {item.poster_path ? (
                  <img
                    className="w-fit"
                    src={`https://image.tmdb.org/t/p/w500/${item.poster_path}`}
                    alt={mediaType === "movie" ? item.title : item.name}
                  />
                ) : (
                  <div className=" flex h-[30vw] justify-center items-center">
                    <p className="text-white text-3xl">No Poster</p>
                  </div>
                )}
              </Link>
            </div>
          )
        )}
        {(mediaType === "movie" ? bookmarkedMovies : bookmarkedTvShows).length >
        1 ? (
          <div className="w-1/5 h-[30vw] items-center justify-center flex">
            <div className="rounded-full w-2/3 bg-white">
              <Link
                to={`/${
                  mediaType === "movie" ? "movie" : "tvshow"
                }/${randomBookmark}`}
              >
                <div className="flex h-full flex-col justify-center items-center ">
                  <img
                    className="w-2/3 rounded-full bg-white border-white border-2 hover:opacity-70 transition-opacity duration-300 "
                    src="/random.512x477.png"
                    alt=""
                  />
                </div>
              </Link>
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
