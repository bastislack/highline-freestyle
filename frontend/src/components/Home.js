import TrickList from "./TrickList";
import useFetch from "../useFetch";

const Home = () => {
  const { error, isPending, data: tricks } = useFetch('http://localhost:8000/tricks')

  return (
    <div className="home">
      { error && <div>{ error }</div> }
      { isPending && <div>Loading...</div> }
      { tricks && <TrickList tricks={tricks} /> }
    </div>
  );
}
 
export default Home;
