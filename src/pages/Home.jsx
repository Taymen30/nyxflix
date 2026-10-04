import Header from "../components/Header";
import MediaGrid from "../components/MediaGrid";
import { getTitle } from "../utils/Helpers";
import { useMedia } from "../context/MediaContext";
import { useMediaFetch } from "../hooks/useMediaFetch";

export default function Home() {
  const { currentMediaType, setCurrentMediaType, movies, setMovies } = useMedia();
  const { media, loading, loadMore, error, retry } = useMediaFetch();

  return (
    <div className="min-h-dvh bg-[#08090c]">
      <Header title={getTitle()} currentMediaType={currentMediaType} setCurrentMediaType={setCurrentMediaType} movies={movies} setMovies={setMovies} />
      <MediaGrid array={media} loading={loading} onLoadMore={loadMore} />
      {error && <div role="status" className="flex flex-wrap items-center justify-center gap-4 px-6 py-10 text-sm text-white/60"><p>Couldn’t load {media.length ? "more titles" : "the collection"}.</p><button type="button" onClick={retry} className="min-h-11 rounded-full border border-white/15 px-5 text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">Try again</button></div>}
    </div>
  );
}
