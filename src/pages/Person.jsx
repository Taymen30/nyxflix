import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SearchBar from "../components/SearchBar";

export default function Person() {
  const apiKey = process.env.REACT_APP_API_KEY;
  const { id } = useParams();
  const [personDetails, setPersonDetails] = useState(null);

  useEffect(() => {
    async function fetchPersonDetails() {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/person/${id}?api_key=${apiKey}`
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const personData = await response.json();

        // Fetch movie credits
        const movieCreditsResponse = await fetch(
          `https://api.themoviedb.org/3/person/${id}/movie_credits?api_key=${apiKey}`
        );

        if (!movieCreditsResponse.ok) {
          throw new Error("Network response was not ok");
        }

        const movieCreditsData = await movieCreditsResponse.json();

        const combinedData = {
          ...personData,
          movieCredits: movieCreditsData,
        };

        console.log(combinedData);
        setPersonDetails(combinedData);
      } catch (error) {
        console.error("Error fetching person details:", error);
      }
    }

    if (id) {
      fetchPersonDetails();
    }
  }, [id, apiKey]);

  return (
    <div>
      {personDetails && (
        <>
          <header>
            <h1 className="text-2xl md:text-5xl">{personDetails.name}</h1>
            <SearchBar />
          </header>

          <div className="flex flex-row mt-10">
            <section className="flex w-1/2  justify-center">
              {personDetails.profile_path && (
                <img
                  src={`https://image.tmdb.org/t/p/original/${personDetails.profile_path}`}
                  alt={`${personDetails.name}`}
                  className="rounded h-[37vw] w-1/2"
                />
              )}
            </section>

            <section className="w-1/2">
              <p className="">
                {personDetails.birthday &&
                  `Born: ${new Date(personDetails.birthday).toLocaleDateString(
                    "en-AU",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )}`}
                {personDetails.deathday &&
                  ` - Died: ${new Date(
                    personDetails.deathday
                  ).toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}`}
              </p>
              <p></p>
              <p className="h-1/3 text-xs">{personDetails.biography}</p>
            </section>
          </div>
          <div className="flex overflow-x-auto py-4">
            {personDetails.movieCredits &&
              personDetails.movieCredits.cast.map((movie) => (
                <div key={movie.id} className="flex-shrink-0 w-[100px] mx-2">
                  {movie.poster_path && (
                    <img
                      src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-auto rounded-md"
                    />
                  )}
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
