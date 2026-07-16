import PropTypes from "prop-types";
import birdLogo from "../assets/red-bird.svg";
import "./Header.css";

const NAV_ITEMS = [
  ["home", "Home"],
  ["places", "Place directory"],
  ["reports", "Accessibility reports"]
];

export default function Header({ activeView, user, onNavigate, onOpenAuth }) {
  return (
    <header className="site-header">
      <div className="site-header__inner shell">
        <a
          className="brand"
          href="#home"
          onClick={(event) => {
            event.preventDefault();
            onNavigate("home");
          }}
          aria-label="AccessLens home"
        >
          <img src={birdLogo} alt="" className="brand__bird" />
          <span>
            <strong>AccessLens</strong>
            <small>See access clearly</small>
          </span>
        </a>

        <nav className="site-nav" aria-label="Primary navigation">
          {NAV_ITEMS.map(([view, label]) => (
            <a
              key={view}
              href={`#${view}`}
              className={activeView === view ? "site-nav__link is-active" : "site-nav__link"}
              onClick={(event) => {
                event.preventDefault();
                onNavigate(view);
              }}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="header-account">
          {user ? (
            <button className="account-chip" type="button" onClick={() => onNavigate("account")}>
              <span className="account-chip__avatar" aria-hidden="true">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <span className="account-chip__name">{user.name.split(" ")[0]}</span>
            </button>
          ) : (
            <button className="button button--compact" type="button" onClick={onOpenAuth}>
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

Header.propTypes = {
  activeView: PropTypes.string.isRequired,
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired
  }),
  onNavigate: PropTypes.func.isRequired,
  onOpenAuth: PropTypes.func.isRequired
};
