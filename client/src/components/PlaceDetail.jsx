import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { api } from "../api/api.js";
import { formatAddress, formatDate, ownershipMatches } from "../utils/formatters.js";
import EmptyState from "./EmptyState.jsx";
import "./PlaceDetail.css";

export default function PlaceDetail({ placeId, user, onEdit, onDelete, onNotify }) {
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadPlace() {
      setLoading(true);

      try {
        const payload = await api.getPlace(placeId);

        if (!cancelled) {
          setPlace(payload.place);
        }
      } catch (error) {
        if (!cancelled) {
          onNotify(error.message, "error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPlace();

    return () => {
      cancelled = true;
    };
  }, [placeId, onNotify]);

  if (loading) {
    return <div className="detail-loading">Loading place details…</div>;
  }

  if (!place) {
    return <EmptyState title="Place not found" text="This listing may have been removed." />;
  }

  const isOwner = ownershipMatches(place.createdBy, user);

  const savedWebsite = place.contact?.website?.trim() || "";
  const isPlaceholderWebsite = savedWebsite.includes("example.org/accesslens-place-");
  const officialWebsite = isPlaceholderWebsite ? "" : savedWebsite;

  const mapsQuery = encodeURIComponent(`${place.name}, ${formatAddress(place.address)}`);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  return (
    <div className="place-detail">
      <section className="place-detail__hero">
        <div>
          <div className="detail-tags">
            <span className="category-chip">{place.category}</span>

            <span
              className={
                place.verificationStatus === "Verified"
                  ? "verification verification--verified"
                  : "verification"
              }
            >
              {place.verificationStatus === "Verified" ? "✓" : "○"} {place.verificationStatus}
            </span>
          </div>

          <h2>{place.name}</h2>

          <p>
            <span aria-hidden="true">⌖</span> {formatAddress(place.address)}
          </p>
        </div>
      </section>

      {isOwner ? (
        <div className="place-detail__actions">
          <button className="button button--secondary" type="button" onClick={() => onEdit(place)}>
            Edit listing
          </button>

          <button
            className="button button--danger-ghost"
            type="button"
            onClick={() => onDelete(place)}
          >
            Delete listing
          </button>
        </div>
      ) : null}

      <div className="place-detail__grid">
        <section className="detail-panel">
          <p className="detail-kicker">Confirmed features</p>
          <h3>Accessibility at this place</h3>

          {place.accessibilityFeatures.length ? (
            <ul className="detail-feature-grid">
              {place.accessibilityFeatures.map((feature) => (
                <li key={feature}>
                  <span aria-hidden="true">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          ) : (
            <p className="detail-muted">No features have been confirmed yet.</p>
          )}
        </section>

        <aside className="detail-panel detail-panel--contact">
          <p className="detail-kicker">Listing information</p>
          <h3>Place details</h3>

          <dl>
            <div>
              <dt>Last updated</dt>
              <dd>{formatDate(place.updatedAt)}</dd>
            </div>

            <div>
              <dt>Listing creator</dt>
              <dd>{place.creator?.name || "Community member"}</dd>
            </div>

            {place.contact?.phone ? (
              <div>
                <dt>Phone</dt>
                <dd>{place.contact.phone}</dd>
              </div>
            ) : null}
          </dl>

          <div className="detail-links">
            {officialWebsite ? (
              <a href={officialWebsite} target="_blank" rel="noreferrer">
                Visit official website ↗
              </a>
            ) : null}

            <a href={mapsUrl} target="_blank" rel="noreferrer">
              Open in Google Maps ↗
            </a>
          </div>
        </aside>
      </div>

      {place.description ? (
        <section className="detail-description">
          <p className="detail-kicker">Description</p>
          <h3>What to know</h3>
          <p>{place.description}</p>
        </section>
      ) : null}
    </div>
  );
}

PlaceDetail.propTypes = {
  placeId: PropTypes.string.isRequired,
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired
  }),
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onNotify: PropTypes.func.isRequired
};
