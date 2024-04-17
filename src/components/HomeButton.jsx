import React from "react";
import { Link } from "react-router-dom";

export default function HomeButton() {
  const isHomePage = window.location.pathname === "/";

  return (
    <>
      {!isHomePage ? (
        <Link to={"/"}>
          <img
            className="w-[40px] h-[40px]"
            src="/house-home.512x512.png"
            alt=""
          />
        </Link>
      ) : (
        <div className="h-[40px]"></div>
      )}
    </>
  );
}
