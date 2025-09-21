
import { Link } from "react-router-dom";
import GuestHeader from "../components/GuestHeader";
import "./NotFound.css";

export default function NotFound() {
  return (
    <>
      <GuestHeader />

      <main className="notfound">
        <div className="notfound__inner notfound__inner--withHeader">
          <div className="notfound__code">404</div>
          <h1 className="notfound__title">Oops!</h1>
          <h2 className="notfound__subtitle">
            Looks like you took a wrong turn.
          </h2>
          <p className="notfound__text">
            The page you’re looking for doesn’t exist or has been moved. Let’s
            get you back on track!
          </p>
          <Link to="/" className="notfound__button">
            Return to Homepage
          </Link>
        </div>
      </main>
    </>
  );
}