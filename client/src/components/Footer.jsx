import PropTypes from "prop-types";
import birdLogo from "../assets/red-bird.svg";
import "./Footer.css";

export default function Footer({ onNavigate }) {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner shell">
        <div className="footer-brand">
          <img src={birdLogo} alt="" />
          <div>
            <strong>AccessLens</strong>
            <p>Search and manage accessibility information for public places.</p>
          </div>
        </div>
        <nav aria-label="Footer navigation">
          <button type="button" onClick={() => onNavigate("home")}>
            Home
          </button>
          <button type="button" onClick={() => onNavigate("places")}>
            Places
          </button>
          <button type="button" onClick={() => onNavigate("reports")}>
            Reports
          </button>
        </nav>
        <p className="site-footer__credit">
          AccessLens group project · Akhilan Anbu and Santhosh Malarvannan · 2026
        </p>
      </div>
    </footer>
  );
}

Footer.propTypes = {
  onNavigate: PropTypes.func.isRequired
};
