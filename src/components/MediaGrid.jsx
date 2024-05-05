import { Link } from "react-router-dom";

export default function MediaGrid({ array }) {
  let savedMediaType = localStorage.getItem("Media_Type");

  return (
    <div className="flex flex-wrap">
      {array.map((video, i) => (
        <div
          key={i}
          className="w-1/5 hover:opacity-70 transition-opacity duration-300"
        >
          <Link
            to={`/${savedMediaType === "Movies" ? "movie" : "tvshow"}/${
              video.id
            }`}
          >
            {video.poster_path ? (
              <img
                className="w-full"
                src={`https://image.tmdb.org/t/p/w500/${video.poster_path}`}
                alt={video.title}
              />
            ) : (
              <div className=" flex flex-col h-[30vw] justify-center items-center border-gray-500 border">
                <p className="text-white text-2xl text-center">{video.title}</p>
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
