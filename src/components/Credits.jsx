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
          className="fixed inset-0 flex z-20 bg-black bg-opacity-50 items-center justify-center"
        >
          <div className="p-2 md:p-10  flex flex-col justify-center w-4/5 h-4/5 md:w-3/4 md:h-3/4  items-center  bg-black bg-opacity-80 rounded-xl z-30">
            <div className=" md:mb-6">
              <h1 className="text-3xl">Cast</h1>
            </div>
            <div className="flex-row flex flex-wrap overflow-auto  bg-black">
              {mediaCast &&
                mediaCast.map((person) => (
                  <Link
                    to={`/person/${person.id}`}
                    key={person.id}
                    className=" w-1/3 h-[33vw] md:w-1/5 flex flex-col mb-16 md:mb-[-30px] lg:mb-[-100px] hover:scale-105 p-2 text-center transition-all duration-300 "
                  >
                    <img
                      src={`https://image.tmdb.org/t/p/w500/${person.profile_path}`}
                      alt=""
                      className="rounded"
                    />
                    <p className="text-xs md:text-sm lg:text-base">
                      {person.name}
                    </p>
                    <p className="text-xs md:text-sm lg:text-base">
                      "{person.character}"
                    </p>
                  </Link>
                ))}
            </div>
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
