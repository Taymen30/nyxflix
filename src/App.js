import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import MediaDetails from "./pages/Media";
import Search from "./pages/Search";
import Genre from "./pages/Genre";
import Bookmarks from "./pages/Bookmarks";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route exact path="/:type/:id" element={<MediaDetails />} />
        <Route exact path="/search" element={<Search />} />
        <Route exact path="/genre/:genre" element={<Genre />} />
        <Route exact path="/bookmarks" element={<Bookmarks />} />
      </Routes>
    </Router>
  );
}
