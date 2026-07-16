import { useState } from "react";
import PropTypes from "prop-types";
import { api } from "../api/api.js";
import { REPORT_STATUSES } from "../utils/constants.js";
import "./ReportStatusControl.css";

export default function ReportStatusControl({ report, onUpdated, onNotify }) {
  const [status, setStatus] = useState(report.status);
  const [saving, setSaving] = useState(false);

  async function saveStatus() {
    if (status === report.status) {
      return;
    }
    setSaving(true);
    try {
      const payload = await api.updateReportStatus(report.id, status);
      onNotify("Report status updated.", "success");
      onUpdated(payload.report);
    } catch (error) {
      onNotify(error.message, "error");
      setStatus(report.status);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="status-control">
      <p className="detail-kicker">Place owner controls</p>
      <h3>Update report status</h3>
      <p className="status-control__hint">
        You created the related place, so you can move this report through its resolution stages.
      </p>
      <div className="status-control__row">
        <label htmlFor="report-status-select" className="sr-only">
          Report status
        </label>
        <select
          id="report-status-select"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          {REPORT_STATUSES.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <button
          className="button button--secondary"
          type="button"
          onClick={saveStatus}
          disabled={saving || status === report.status}
        >
          {saving ? "Saving…" : "Update status"}
        </button>
      </div>
    </div>
  );
}

ReportStatusControl.propTypes = {
  report: PropTypes.shape({
    id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired
  }).isRequired,
  onUpdated: PropTypes.func.isRequired,
  onNotify: PropTypes.func.isRequired
};
