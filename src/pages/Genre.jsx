import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import MediaGrid from "../components/MediaGrid";
import Header from "../components/Header";

export default function Genre({ currentMediaType, setCurrentMediaType }) {
  const { genre } = useParams();
  const [genreResults, setGenreResults] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const genreMap = {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Science Fiction",
    10770: "TV Movie",
    53: "Thriller",
    10752: "War",
    37: "Western",
  };
  useEffect(() => {
    setGenreResults([]);
    setPage(1);
  }, [currentMediaType]);

  useEffect(() => {
    const apiKey = process.env.REACT_APP_API_KEY;
    const url = `https://api.themoviedb.org/3/discover/${currentMediaType}?api_key=${apiKey}&with_genres=${genre}&page=${page}`;

    setLoading(true);

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const filteredResults = data.results.filter(
          (movie) => movie.poster_path
        );
        setGenreResults((prevResults) => [...prevResults, ...filteredResults]);
        setLoading(false);
      });
  }, [genre, page, currentMediaType]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = 200;
      const scrollY = window.scrollY || window.pageYOffset;
      if (
        window.innerHeight + scrollY >=
          document.documentElement.scrollHeight - scrollThreshold &&
        !loading
      ) {
        setPage((prevPage) => prevPage + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading]);

  return (
    <>
      <Header
        title={genreMap[genre]}
        currentMediaType={currentMediaType}
        setCurrentMediaType={setCurrentMediaType}
      />

      <MediaGrid array={genreResults} />
    </>
  );
}
