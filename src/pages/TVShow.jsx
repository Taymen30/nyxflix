import { useParams } from "react-router";

export default function TVShow() {
  const { id } = useParams();

  return (
    <>
      <h1 className="text-white">hello{id}</h1>
    </>
  );
}
