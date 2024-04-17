import React, { useState, useEffect } from "react";

export default function FavouriteButton({ id }) {
    const [isFavourite, setIsFavourite] = useState(false);

    useEffect(() => {
        let favourites = JSON.parse(localStorage.getItem("favourites")) || [];
        if (!favourites) {
            localStorage.setItem("favourites", JSON.stringify([]));
            favourites = [];
        }
        setIsFavourite(favourites.includes(id));
    }, [id]);

    const toggleFavorite = () => {
        let favourites = JSON.parse(localStorage.getItem("favourites")) || [];

        if (isFavourite) {
            favourites = favourites.filter((movieId) => movieId !== id);
        } else {
            favourites.push(id);
        }

        localStorage.setItem("favourites", JSON.stringify(favourites));

        setIsFavourite(!isFavourite);
    };

    return (
        <div>
            {isFavourite ? (
                <button className="bg-yellow-400 w-32 rounded-2xl h-9" onClick={toggleFavorite}>Favourite</button>
            ) : (
                <button className="bg-white w-32 rounded-2xl h-9" onClick={toggleFavorite}>Favourite</button>
            )}
        </div>
    );
}