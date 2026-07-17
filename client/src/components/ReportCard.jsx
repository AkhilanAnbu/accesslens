import PropTypes from "prop-types";
import "./ReportCard.css";

function slug(value) {
  return value.toLowerCase().replace(/\s+/g, "-");
}

export default function ReportCard({ report, onView, isOwner }) {
  const place = report.place || {};

  return (
    <article className="report-card">
      <div className={`report-card__accent report-card__accent--${slug(report.severity)}`} />
      <header className="report-card__header">
        <span className={`severity-badge severity-badge--${slug(report.severity)}`}>
          {report.severity}
        </span>
        <span className={`status-badge status-badge--${slug(report.status)}`}>{report.status}</span>
      </header>

      <div className="report-card__body">
        <h3>{report.barrierType}</h3>
        <p className="report-card__place">
          <span aria-hidden="true">⌖</span> {place.name || "Unknown place"}
          {place.category ? ` · ${place.category}` : ""}
        </p>
        <p className="report-card__description">{report.description}</p>
        {isOwner ? <p className="report-card__owner">You submitted this report</p> : null}
      </div>

      <footer className="report-card__footer">
        <button className="card-link" type="button" onClick={() => onView(report.id)}>
          View report <span aria-hidden="true">→</span>
        </button>
      </footer>
    </article>
  );
}

ReportCard.propTypes = {
  report: PropTypes.shape({
    id: PropTypes.string.isRequired,
    barrierType: PropTypes.string.isRequired,
    severity: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    place: PropTypes.shape({
      name: PropTypes.string,
      category: PropTypes.string
    })
  }).isRequired,
  onView: PropTypes.func.isRequired,
  isOwner: PropTypes.bool.isRequired
};
