import { Link } from "react-router-dom";

export default function MovieList({ array }) {
  return (
    <div className="flex flex-wrap">
      {array.map((movie, i) => (
        <div
          key={movie.id}
          className="w-1/5 hover:opacity-70 transition-opacity duration-300"
        >
          <Link to={`/movie/${movie.id}`}>
            {movie.poster_path ? (
              <img
                className="w-full"
                src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                alt={movie.title}
              />
            ) : (
              <div className=" flex flex-col h-[30vw] justify-center items-center border-gray-500 border">
                <p className="text-white text-2xl text-center">{movie.title}</p>
                <br />
                <p className="text-white text-1xl">No Poster</p>
              </div>
            )}
          </Link>
        </div>
      ))}
    </div>
  );
}
