import PropTypes from "prop-types";
import {
  PLACE_CATEGORIES,
  REPORT_BARRIER_TYPES,
  REPORT_SEVERITIES,
  REPORT_STATUSES
} from "../utils/constants.js";
import "./ReportFilters.css";

export default function ReportFilters({ filters, onChange, onClear, filterCount, user }) {
  return (
    <aside className="filters-panel" aria-label="Report filters">
      <div className="filters-panel__heading">
        <div>
          <span aria-hidden="true">◇</span>
          <strong>Filters</strong>
        </div>
        {filterCount ? (
          <button type="button" onClick={onClear}>
            Clear {filterCount}
          </button>
        ) : null}
      </div>

      <label className="filter-field">
        Search
        <div className="filter-input">
          <span aria-hidden="true">⌕</span>
          <input
            value={filters.search}
            onChange={(event) => onChange("search", event.target.value)}
            placeholder="Description or place"
          />
        </div>
      </label>

      <label className="filter-field">
        Barrier type
        <select
          value={filters.barrierType}
          onChange={(event) => onChange("barrierType", event.target.value)}
        >
          <option value="">All barrier types</option>
          {REPORT_BARRIER_TYPES.map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>
      </label>

      <label className="filter-field">
        Severity
        <select
          value={filters.severity}
          onChange={(event) => onChange("severity", event.target.value)}
        >
          <option value="">Any severity</option>
          {REPORT_SEVERITIES.map((level) => (
            <option key={level}>{level}</option>
          ))}
        </select>
      </label>

      <label className="filter-field">
        Status
        <select value={filters.status} onChange={(event) => onChange("status", event.target.value)}>
          <option value="">Any status</option>
          {REPORT_STATUSES.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
      </label>

      <label className="filter-field">
        Place category
        <select
          value={filters.category}
          onChange={(event) => onChange("category", event.target.value)}
        >
          <option value="">All categories</option>
          {PLACE_CATEGORIES.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>
      </label>

      {user ? (
        <label className="mine-toggle">
          <input
            type="checkbox"
            checked={filters.mine}
            onChange={(event) => onChange("mine", event.target.checked)}
          />
          <span aria-hidden="true" />
          Only reports I created
        </label>
      ) : null}

      <div className="filters-tip">
        <strong>Tip</strong>
        <p>Combine severity and status to focus on the barriers that still need attention.</p>
      </div>
    </aside>
  );
}

ReportFilters.propTypes = {
  filters: PropTypes.shape({
    search: PropTypes.string.isRequired,
    barrierType: PropTypes.string.isRequired,
    severity: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    mine: PropTypes.bool.isRequired
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  filterCount: PropTypes.number.isRequired,
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired
  })
};
