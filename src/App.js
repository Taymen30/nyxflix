import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Movie from "./pages/Movie";
import Search from "./pages/Search";
import Genre from "./pages/Genre";
import Bookmarks from "./pages/Bookmarks";

export default function App() {
  return (
      <Router>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/movie/:id" element={<Movie />} />
          <Route exact path="/search" element={<Search />} />
          <Route exact path="/genre/:genre" element={<Genre />} />
          <Route exact path="/bookmarks" element={<Bookmarks />} />
        </Routes>
      </Router>
  );
}
