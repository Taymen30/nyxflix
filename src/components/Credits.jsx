import { useEffect, useState } from "react";

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
    fetchCastDetails();
  }, [displayCredits]);

  useEffect(() => {
    if (!displayCredits || mediaCast.length > 0) {
      return;
    }

    async function fetchProfileImages() {
      try {
        const castWithImages = await Promise.all(
          mediaCast.map(async (person) => {
            console.log(person);
            const profileImageUrl = `https://image.tmdb.org/t/p/w500/${person.profile_path}`;
            return {
              ...person,
              profile_path: profileImageUrl,
            };
          })
        );
        setMediaCast(castWithImages.filter((person) => person !== null));
      } catch (error) {
        console.error("Error fetching profile images:", error);
      }
    }

    fetchProfileImages();
  }, [displayCredits, mediaCast]);

  return (
    <>
      {displayCredits && (
        <div
          onClick={() => {
            setDisplayCredits(!displayCredits);
          }}
          className="fixed inset-0 flex justify-center items-center z-20"
        >
          <div className="w-3/4 h-3/4 flex flex-wrap overflow-auto bg-gray-500 z-30">
            {mediaCast &&
              mediaCast.map((person) => (
                <div className="w-1/5 h-[30vw]" key={person.id}>
                  <img
                    src={`https://image.tmdb.org/t/p/w500/${person.profile_path}`}
                    alt=""
                  />
                  <p className="">{person.name}</p>
                </div>
              ))}
          </div>
        </div>
      )}

      <>
        <button
          className="bg-white text-xs w-20 md:w-32 h-7 md:h-9 rounded-2xl flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity duration-300"
          onClick={() => {
            setDisplayCredits(!displayCredits);
          }}
        >
          Credits
        </button>
      </>
    </>
  );
}
