import { useParams } from "react-router-dom";

export default function Person() {
  const { id } = useParams();

  return (
    <>
      <h1>Person{id} </h1>
    </>
  );
}
