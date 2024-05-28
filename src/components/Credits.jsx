import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Credits({ mediaCast, setMediaCast, mediaType, id }) {
  const apiKey = process.env.REACT_APP_API_KEY;
  const [displayCredits, setDisplayCredits] = useState(false);

  useEffect(() => {
    async function fetchCastDetails() {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/${mediaType}/${id}/credits?api_key=${apiKey}`
        );
        const data = await response.json();
        console.log(data);
        let cast = data.cast.filter((person) => person.profile_path);

        if (cast.length > 15) {
          const remainder = cast.length % 5;
          const truncatedLength = cast.length - remainder;
          cast = cast.slice(0, truncatedLength);
        }
        setMediaCast(cast);
      } catch (error) {
        console.error("Error fetching cast details:", error);
      }
    }

    if (displayCredits && !mediaCast) {
      fetchCastDetails();
    }
  }, [displayCredits, mediaType, id]);

  return (
    <>
      {displayCredits && mediaType === "movie" && (
        <div
          onClick={() => {
            setDisplayCredits(!displayCredits);
          }}
          className="fixed inset-0 flex justify-center items-center z-20 bg-black bg-opacity-50"
        >
          <div className="w-3/4 h-3/4 p-10 rounded flex flex-wrap overflow-auto bg-black bg-opacity-80 z-30">
            {mediaCast &&
              mediaCast.map((person) => (
                <Link
                  to={`/person/${person.id}`}
                  key={person.id}
                  className="w-1/5 h-[27vw] hover:scale-105 p-1 text-center transition-all duration-300"
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w500/${person.profile_path}`}
                    alt=""
                    className="rounded"
                  />
                  <p className="">{person.name}</p>
                  <p className="">"{person.character}"</p>
                </Link>
              ))}
          </div>
        </div>
      )}
      {mediaType === "movie" && (
        <>
          <button
            className="bg-white text-black text-xs w-20 md:w-32 h-7 md:h-9 rounded-2xl flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity duration-300"
            onClick={() => {
              setDisplayCredits(!displayCredits);
            }}
          >
            Credits
          </button>
        </>
      )}
    </>
  );
}
