import {Link} from "react-router-dom";

const NotFoundPage = () => {
  return (
    <>
      <h1>Ooops, this page just took a leash fall!</h1>
      <h2>
        Click <Link to="/">here</Link> to help it climb back up!
      </h2>
    </>
  );
};

export default NotFoundPage;
