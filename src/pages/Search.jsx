import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import MovieList from "../components/MovieList";

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query");
  const [queryResults, setQueryResults] = useState([]);

  useEffect(() => {
    const apiKey = process.env.REACT_APP_API_KEY;
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setQueryResults(data.results);
      });
  }, [query]);

  return (
    <>
      <header className=" flex h-14 items-center ">
        <h1 className="text-white text-5xl">Search</h1>
        <SearchBar />
      </header>
      <MovieList array={queryResults} />
    </>
  );
}
