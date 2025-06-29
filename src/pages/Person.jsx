import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../components/Header";
import { useMedia } from "../context/MediaContext";

const apiKey = process.env.REACT_APP_API_KEY;

export default function Person() {
  const { currentMediaType, setCurrentMediaType } = useMedia();
  const { id } = useParams();
  const [personDetails, setPersonDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const scrollableDiv = useRef(null);
  const [isScrolling, setIsScrolling] = useState(null);
  const [readMore, setReadMore] = useState(false);

  useEffect(() => {
    let scrollIntervalId;
    const scrollInterval = 20;
    const scrollStep = 0.5;

    const scrollableWidth = scrollableDiv.current
      ? scrollableDiv.current.scrollWidth - scrollableDiv.current.clientWidth
      : 0;

    let isScrollingRight = true;

    const startScrolling = () => {
      scrollIntervalId = setInterval(() => {
        if (scrollableDiv.current) {
          const currentScrollLeft = scrollableDiv.current.scrollLeft;
          if (isScrollingRight) {
            // Scroll to the right
            if (currentScrollLeft >= scrollableWidth) {
              isScrollingRight = false;
            } else {
              scrollableDiv.current.scrollLeft += scrollStep;
            }
          } else {
            // Scroll to the left
            if (currentScrollLeft <= 0) {
              isScrollingRight = true;
            } else {
              scrollableDiv.current.scrollLeft -= scrollStep;
            }
          }
        }
      }, scrollInterval);
    };

    const stopScrolling = () => {
      clearInterval(scrollIntervalId);
    };

    if (isScrolling) {
      startScrolling();
    }

    return () => {
      stopScrolling();
    };
  }, [isScrolling]);

  useEffect(() => {
    async function fetchPersonDetails() {
      try {
        setLoading(true);

        // Fetch person details
        const personResponse = await fetch(
          `https://api.themoviedb.org/3/person/${id}?api_key=${apiKey}`
        );

        if (!personResponse.ok) {
          throw new Error("Network response for person details was not ok");
        }

        const personData = await personResponse.json();

        // Fetch movie credits
        const movieCreditsResponse = await fetch(
          `https://api.themoviedb.org/3/person/${id}/movie_credits?api_key=${apiKey}`
        );

        if (!movieCreditsResponse.ok) {
          throw new Error("Network response for movie credits was not ok");
        }

        const movieCreditsData = await movieCreditsResponse.json();

        const filteredMovies = movieCreditsData.cast.filter(
          (movie) => movie.poster_path
        );

        const combinedData = {
          ...personData,
          movieCredits: filteredMovies,
        };

        setPersonDetails(combinedData);
        setIsScrolling(true);
      } catch (error) {
        console.error("Error fetching person details:", error);
      } finally {
        setLoading(false);
      }
    }

    if (id && apiKey) {
      fetchPersonDetails();
    }
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {personDetails && (
        <>
          <Header
            title={personDetails.name}
            currentMediaType={currentMediaType}
            setCurrentMediaType={setCurrentMediaType}
          />

          <div className="flex flex-row mt-10">
            <section className="flex w-1/2 justify-center">
              {personDetails.profile_path && (
                <img
                  src={`https://image.tmdb.org/t/p/original/${personDetails.profile_path}`}
                  alt={`${personDetails.name}`}
                  className="rounded h-[37vw] w-1/2"
                />
              )}
            </section>

            <section className="w-1/2 flex flex-col gap-2">
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
              <p>{personDetails.place_of_birth}</p>
              <section>
                <p
                  className={`text-xs w-3/4 ${readMore ? "" : "line-clamp-5"}`}
                >
                  {personDetails.biography}
                </p>
                <p
                  className="text-xs hover:cursor-pointer text-orange-50"
                  onClick={handleReadMore}
                >
                  {readMore ? "read less" : "read more"}
                </p>
              </section>
            </section>
          </div>
          <div
            className="flex overflow-x-auto py-4"
            ref={scrollableDiv}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {personDetails.movieCredits &&
              personDetails.movieCredits.map((movie) => (
                <Link
                  to={`/movie/${movie.id}`}
                  key={movie.id}
                  className="flex-shrink-0 w-[100px] hover:scale-105 transition-transform duration-300 mx-2"
                >
                  {movie.poster_path && (
                    <img
                      src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-auto rounded-md"
                    />
                  )}
                </Link>
              ))}
          </div>
        </>
      )}
    </div>
  );

  function handleReadMore() {
    setReadMore(!readMore);
  }

  function handleMouseEnter() {
    setIsScrolling(false);
  }

  function handleMouseLeave() {
    setIsScrolling(true);
  }
}
