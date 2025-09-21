
import { Link } from "react-router-dom";
import "./NotFound.css";

export default function NotFound() {
  return (
    <main className="notfound">
      <div className="notfound__inner">
        <div className="notfound__code">404</div>

        <h1 className="notfound__title">Oops!</h1>

        <p className="notfound__lead">Looks like you took a wrong turn.</p>

        <p className="notfound__text">
          The page you’re looking for doesn’t exist or has been moved. Let’s get
          you back on track!
        </p>

        <Link to="/" className="notfound__btn">
          Return to Homepage
        </Link>
      </div>
    </main>
  );
}