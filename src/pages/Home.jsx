import React, { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import MediaGrid from "../components/MediaGrid";
import MediaTypeToggle from "../components/MediaTypeToggle";

const apiKey = process.env.REACT_APP_API_KEY;

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [movieListParam, setMovieListParam] = useState("now_playing");
  const [tvShow, setTvShow] = useState([]);
  const [tvListParam, setTvListParam] = useState("popular");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [currentMediaType, setCurrentMediaType] = useState("Movies");

  useEffect(() => {
    setMovies([]);
    setTvShow([]);
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [movieListParam, tvListParam, currentMediaType]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      let url;
      if (currentMediaType === "Movies") {
        url = `https://api.themoviedb.org/3/movie/${movieListParam}?api_key=${apiKey}&language=en-US&page=${currentPage}`;
      } else {
        url = `https://api.themoviedb.org/3/tv/${tvListParam}?api_key=${apiKey}&language=en-US&page=${currentPage}`;
      }

      try {
        const response = await fetch(url);
        const data = await response.json();
        const filteredResults = data.results.filter((item) => item.poster_path);
        if (currentMediaType === "Movies") {
          setMovies((prevMovies) => [...prevMovies, ...filteredResults]);
        } else {
          setTvShow((prevSeries) => [...prevSeries, ...filteredResults]);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [movieListParam, tvListParam, currentPage, currentMediaType]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = 200;
      const scrollY = window.scrollY || window.pageYOffset;
      if (
        window.innerHeight + scrollY >=
          document.documentElement.scrollHeight - scrollThreshold &&
        !loading
      ) {
        setCurrentPage((prevPage) => prevPage + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading]);

  return (
    <div className="m-1">
      <header className="flex items-center h-14 w-full bg-black ">
        <h1 className="text-6xl ml-1 text-white">MovieMaster</h1>
        <MediaTypeToggle
          currentMediaType={currentMediaType}
          setCurrentMediaType={setCurrentMediaType}
        />
        <SearchBar setMovieListParam={setMovieListParam} />
      </header>
      <MediaGrid array={currentMediaType === "Movies" ? movies : tvShow} />
    </div>
  );
}
