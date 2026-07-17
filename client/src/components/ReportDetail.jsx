import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { api } from "../api/api.js";
import { formatAddress, formatDate, ownershipMatches } from "../utils/formatters.js";
import EmptyState from "./EmptyState.jsx";
import ReportStatusControl from "./ReportStatusControl.jsx";
import "./ReportCard.css";
import "./ReportDetail.css";

export default function ReportDetail({
  reportId,
  user,
  onEdit,
  onDelete,
  onNotify,
  onStatusChanged
}) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadReport() {
      setLoading(true);
      try {
        const payload = await api.getReport(reportId);
        if (!cancelled) {
          setReport(payload.report);
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

    loadReport();

    return () => {
      cancelled = true;
    };
  }, [reportId, onNotify]);

  if (loading) {
    return <div className="detail-loading">Loading report details…</div>;
  }

  if (!report) {
    return <EmptyState title="Report not found" text="This report may have been removed." />;
  }

  const place = report.place || {};
  const isOwner = ownershipMatches(report.createdBy, user);
  const isPlaceOwner = ownershipMatches(place.createdBy, user);

  function handleStatusUpdated(updatedReport) {
    setReport((current) => ({ ...current, status: updatedReport.status }));
    onStatusChanged();
  }

  return (
    <div className="report-detail">
      <section className="report-detail__hero">
        <div className="report-detail__tags">
          <span className={`severity-badge severity-badge--${report.severity.toLowerCase()}`}>
            {report.severity} severity
          </span>
          <span
            className={`status-badge status-badge--${report.status.toLowerCase().replace(/\s+/g, "-")}`}
          >
            {report.status}
          </span>
        </div>
        <h2>{report.barrierType}</h2>
        <p>
          <span aria-hidden="true">⌖</span> {place.name || "Unknown place"}
          {place.address ? ` · ${formatAddress(place.address)}` : ""}
        </p>
      </section>

      {isOwner ? (
        <div className="report-detail__actions">
          <button className="button button--secondary" type="button" onClick={() => onEdit(report)}>
            Edit report
          </button>
          <button
            className="button button--danger-ghost"
            type="button"
            onClick={() => onDelete(report)}
          >
            Delete report
          </button>
        </div>
      ) : null}

      <div className="report-detail__grid">
        <section className="detail-panel">
          <p className="detail-kicker">Barrier description</p>
          <h3>What visitors should know</h3>
          <p className="report-detail__text">{report.description}</p>
        </section>

        <aside className="detail-panel">
          <p className="detail-kicker">Report information</p>
          <h3>Details</h3>
          <dl className="report-detail__meta">
            <div>
              <dt>Place category</dt>
              <dd>{place.category || "Not listed"}</dd>
            </div>
            <div>
              <dt>Reported by</dt>
              <dd>{report.creator?.name || "Community member"}</dd>
            </div>
            <div>
              <dt>First reported</dt>
              <dd>{formatDate(report.createdAt)}</dd>
            </div>
            <div>
              <dt>Last updated</dt>
              <dd>{formatDate(report.updatedAt)}</dd>
            </div>
          </dl>
        </aside>
      </div>

      {report.suggestedFix ? (
        <section className="detail-panel">
          <p className="detail-kicker">Suggested fix</p>
          <h3>How it could be resolved</h3>
          <p className="report-detail__text">{report.suggestedFix}</p>
        </section>
      ) : null}

      {isPlaceOwner ? (
        <ReportStatusControl report={report} onUpdated={handleStatusUpdated} onNotify={onNotify} />
      ) : null}
    </div>
  );
}

ReportDetail.propTypes = {
  reportId: PropTypes.string.isRequired,
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired
  }),
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onNotify: PropTypes.func.isRequired,
  onStatusChanged: PropTypes.func.isRequired
};
