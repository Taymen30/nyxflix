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
      {displayCredits && (
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
      <button
        className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white hover:bg-black hover:text-white transition-all duration-300 text-black"
        onClick={() => {
          setDisplayCredits(!displayCredits);
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6 sm:w-7 sm:h-7"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
          />
        </svg>
      </button>
    </>
  );
}
