import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SearchBar from "../components/SearchBar";

export default function Home() {
    const [discover, setDiscover] = useState([]);
    const [startingPage, setStartingPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchMovies = async () => {
            const apiKey = "41bd7e5ac0565f89061afe73f89c4cc5";
            const totalPagesToFetch = 3;
            const allMovies = [];

            for (let page = startingPage; page < startingPage + totalPagesToFetch; page++) {
                const url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&page=${page}`;
                const response = await fetch(url);
                const data = await response.json();
                allMovies.push(...data.results);
                setTotalPages(data.total_pages);
            }

            setDiscover(allMovies);
        };
        fetchMovies();
    }, [startingPage]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [discover]);

    function handleNextResults() {
        setStartingPage((prevPage) => prevPage + 3);
    }
    function handlePreviousResults() {
        setStartingPage((prevPage) => prevPage - 3);
    }

    return (
        <div className="m-1">
            <header className="flex justify-between items-center">
                <h1 className="text-5xl text-white ">MovieMaster</h1>
                <h2>5bb691bd</h2>
                <SearchBar />
            </header>
            <div className="flex flex-wrap">
                {discover.map((movie, i) => (
                    <div key={movie.id} className="w-1/5">
                        <Link to={`/movie/${movie.id}`}>
                            {movie.poster_path ? (
                                <img
                                    className="w-full"
                                    src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                                    alt={movie.title}
                                />
                            ) : (
                                <div>No poster</div>
                            )}
                        </Link>
                    </div>
                ))}
            </div>
            <button
                className="text-8xl text-white fixed bottom-0 left-1/3"
                onClick={handlePreviousResults}
                disabled={startingPage <= 1}
            >
                &lt;
            </button>
            <button
                onClick={handleNextResults}
                className="text-8xl text-white fixed bottom-0 right-1/3"
                disabled={startingPage + 2 >= totalPages}
            >
                >
            </button>
        </div>
    );
}