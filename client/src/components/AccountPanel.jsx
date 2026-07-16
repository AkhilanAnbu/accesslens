import PropTypes from "prop-types";
import birdLogo from "../assets/red-bird.svg";
import { formatDate } from "../utils/formatters.js";
import "./AccountPanel.css";

export default function AccountPanel({ user, onSignIn, onSignOut, onNavigate }) {
  if (!user) {
    return (
      <main className="account-page shell">
        <section className="account-empty">
          <img src={birdLogo} alt="" />
          <p className="eyebrow">Your AccessLens account</p>
          <h1>Sign in to create and manage place listings.</h1>
          <p>
            Passport authentication connects every place you create to your account, so only you can
            edit or delete it.
          </p>
          <button className="button" type="button" onClick={onSignIn}>
            Sign in or register
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="account-page shell">
      <section className="account-card">
        <div className="account-card__hero">
          <span className="account-avatar">{user.name.charAt(0).toUpperCase()}</span>
          <div>
            <p className="eyebrow">Place directory contributor</p>
            <h1>{user.name}</h1>
            <p>{user.email}</p>
          </div>
          <img src={birdLogo} alt="" />
        </div>

        <div className="account-card__content">
          <section>
            <p className="detail-kicker">Account details</p>
            <h2>Your profile</h2>
            <dl>
              <div>
                <dt>Name</dt>
                <dd>{user.name}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{user.email}</dd>
              </div>
              <div>
                <dt>Member since</dt>
                <dd>{formatDate(user.createdAt)}</dd>
              </div>
            </dl>
          </section>

          <section>
            <p className="detail-kicker">Quick action</p>
            <h2>Manage your listings</h2>
            <div className="account-actions">
              <button type="button" onClick={() => onNavigate("places")}>
                <span aria-hidden="true">⌖</span>
                <div>
                  <strong>My place listings</strong>
                  <small>Open the directory and turn on “Only places I created.”</small>
                </div>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </section>
        </div>

        <footer className="account-card__footer">
          <p>Signing out ends this browser session. Your place listings stay saved in MongoDB.</p>
          <button className="button button--danger-ghost" type="button" onClick={onSignOut}>
            Sign out
          </button>
        </footer>
      </section>
    </main>
  );
}

AccountPanel.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    createdAt: PropTypes.string
  }),
  onSignIn: PropTypes.func.isRequired,
  onSignOut: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired
};
