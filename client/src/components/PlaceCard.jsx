import PropTypes from "prop-types";
import { formatAddress } from "../utils/formatters.js";
import "./PlaceCard.css";

export default function PlaceCard({ place, onView, isOwner }) {
  const visibleFeatures = place.accessibilityFeatures.slice(0, 3);
  const remaining = Math.max(place.accessibilityFeatures.length - visibleFeatures.length, 0);

  return (
    <article className="place-card">
      <div className="place-card__accent" aria-hidden="true" />
      <header className="place-card__header">
        <span className="category-chip">{place.category}</span>
        <span
          className={
            place.verificationStatus === "Verified"
              ? "verification verification--verified"
              : "verification"
          }
        >
          <span aria-hidden="true">{place.verificationStatus === "Verified" ? "✓" : "○"}</span>
          {place.verificationStatus}
        </span>
      </header>

      <div className="place-card__body">
        <h3>{place.name}</h3>
        <p className="place-card__address">
          <span aria-hidden="true">⌖</span> {formatAddress(place.address)}
        </p>
        <p className="place-card__description">{place.description}</p>

        <ul className="feature-list" aria-label="Accessibility features">
          {visibleFeatures.map((feature) => (
            <li key={feature}>
              <span aria-hidden="true">✓</span>
              {feature}
            </li>
          ))}
          {remaining > 0 ? <li className="feature-list__more">+{remaining} more</li> : null}
        </ul>
      </div>

      <footer className="place-card__footer">
        <button className="card-link" type="button" onClick={() => onView(place.id)}>
          {isOwner ? "View and manage" : "View details"} <span aria-hidden="true">→</span>
        </button>
      </footer>
    </article>
  );
}

PlaceCard.propTypes = {
  place: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    verificationStatus: PropTypes.string.isRequired,
    address: PropTypes.shape({
      street: PropTypes.string,
      city: PropTypes.string,
      state: PropTypes.string,
      postalCode: PropTypes.string
    }).isRequired,
    accessibilityFeatures: PropTypes.arrayOf(PropTypes.string).isRequired,
    description: PropTypes.string.isRequired,
    createdBy: PropTypes.string.isRequired
  }).isRequired,
  onView: PropTypes.func.isRequired,
  isOwner: PropTypes.bool.isRequired
};
