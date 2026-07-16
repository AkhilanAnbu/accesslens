import PropTypes from "prop-types";
import "./Pagination.css";

export default function Pagination({ page, pages, total, onChange }) {
  if (pages <= 1) {
    return total > 0 ? (
      <p className="pagination__summary">{total.toLocaleString()} results</p>
    ) : null;
  }

  return (
    <nav className="pagination" aria-label="Pagination">
      <button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        ← Previous
      </button>
      <span>
        Page <strong>{page}</strong> of {pages} · {total.toLocaleString()} results
      </span>
      <button type="button" disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Next →
      </button>
    </nav>
  );
}

Pagination.propTypes = {
  page: PropTypes.number.isRequired,
  pages: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired
};
