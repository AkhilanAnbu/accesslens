import { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { api } from "../api/api.js";
import { ownershipMatches } from "../utils/formatters.js";
import { useDebounce } from "../hooks/useDebounce.js";
import EmptyState from "./EmptyState.jsx";
import Modal from "./Modal.jsx";
import Pagination from "./Pagination.jsx";
import ReportCard from "./ReportCard.jsx";
import ReportDetail from "./ReportDetail.jsx";
import ReportFilters from "./ReportFilters.jsx";
import ReportForm from "./ReportForm.jsx";
import "./ReportDirectory.css";

const EMPTY_FILTERS = {
  search: "",
  barrierType: "",
  severity: "",
  status: "",
  category: "",
  mine: false
};

const EMPTY_PAGINATION = { page: 1, pages: 1, total: 0, limit: 12 };

export default function ReportDirectory({ user, onRequireAuth, onNotify }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);
  const [reports, setReports] = useState([]);
  const [sort, setSort] = useState("recent");
  const [loading, setLoading] = useState(true);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [editingReport, setEditingReport] = useState(undefined);
  const [saving, setSaving] = useState(false);
  const debouncedSearch = useDebounce(filters.search);

  const loadReports = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const payload = await api.getReports({
          search: debouncedSearch,
          barrierType: filters.barrierType,
          severity: filters.severity,
          status: filters.status,
          category: filters.category,
          mine: filters.mine,
          sort,
          page,
          limit: 12
        });
        setReports(payload.items);
        setPagination(payload.pagination);
      } catch (error) {
        onNotify(error.message, "error");
      } finally {
        setLoading(false);
      }
    },
    [
      debouncedSearch,
      filters.barrierType,
      filters.severity,
      filters.status,
      filters.category,
      filters.mine,
      onNotify,
      sort
    ]
  );

  useEffect(() => {
    loadReports(1);
  }, [loadReports]);

  function setFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function clearFilters() {
    setFilters(EMPTY_FILTERS);
  }

  function startCreate() {
    if (!user) {
      onRequireAuth();
      return;
    }
    setEditingReport(null);
  }

  async function saveReport(data) {
    setSaving(true);
    try {
      if (editingReport?.id) {
        await api.updateReport(editingReport.id, data);
        onNotify("Report updated.", "success");
      } else {
        await api.createReport(data);
        onNotify("Report submitted.", "success");
      }
      setEditingReport(undefined);
      await loadReports(1);
    } catch (error) {
      onNotify(error.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function deleteReport(report) {
    const confirmed = window.confirm("Delete this report? This action cannot be undone.");
    if (!confirmed) {
      return;
    }

    try {
      await api.deleteReport(report.id);
      setSelectedReportId(null);
      onNotify("Report deleted.", "success");
      await loadReports(1);
    } catch (error) {
      onNotify(error.message, "error");
    }
  }

  const filterCount = [
    filters.barrierType,
    filters.severity,
    filters.status,
    filters.category,
    filters.mine
  ].filter(Boolean).length;

  return (
    <main className="report-directory page-shell">
      <section className="page-hero shell">
        <div>
          <p className="eyebrow">Santhosh’s full-stack feature</p>
          <h1>Accessibility Reports</h1>
          <p>
            Browse, search, filter, submit, update, and resolve accessibility barrier reports
            connected to public places.
          </p>
        </div>
        <button className="button button--light" type="button" onClick={startCreate}>
          + Submit a report
        </button>
      </section>

      <div className="directory-layout shell">
        <ReportFilters
          filters={filters}
          onChange={setFilter}
          onClear={clearFilters}
          filterCount={filterCount}
          user={user}
        />

        <section className="directory-results" aria-live="polite">
          <header className="results-heading">
            <div>
              <p className="results-heading__count">
                {loading ? "Searching…" : `${pagination.total.toLocaleString()} reports found`}
              </p>
              <h2>{filters.search ? `Results for “${filters.search}”` : "Recent reports"}</h2>
            </div>
            <select
              aria-label="Sort reports"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="recent">Most recent</option>
              <option value="oldest">Oldest first</option>
              <option value="severity">Highest severity</option>
            </select>
          </header>

          {loading ? (
            <div className="card-grid" aria-label="Loading reports">
              {Array.from({ length: 6 }, (_, index) => (
                <div className="skeleton-card skeleton-card--report" key={index} />
              ))}
            </div>
          ) : reports.length ? (
            <>
              <div className="card-grid">
                {reports.map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    onView={setSelectedReportId}
                    isOwner={ownershipMatches(report.createdBy, user)}
                  />
                ))}
              </div>
              <Pagination
                page={pagination.page}
                pages={pagination.pages}
                total={pagination.total}
                onChange={loadReports}
              />
            </>
          ) : (
            <EmptyState
              title="No reports match these filters"
              text="Try clearing a filter, or submit the first report for a place you have visited."
              actionLabel="Clear filters"
              onAction={clearFilters}
            />
          )}
        </section>
      </div>

      {selectedReportId ? (
        <Modal title="Report details" onClose={() => setSelectedReportId(null)} size="large">
          <ReportDetail
            reportId={selectedReportId}
            user={user}
            onEdit={(report) => {
              setSelectedReportId(null);
              setEditingReport(report);
            }}
            onDelete={deleteReport}
            onNotify={onNotify}
            onStatusChanged={() => loadReports(pagination.page)}
          />
        </Modal>
      ) : null}

      {editingReport !== undefined ? (
        <Modal
          title={editingReport ? "Edit report" : "Submit an accessibility report"}
          onClose={() => setEditingReport(undefined)}
          size="large"
        >
          <ReportForm
            report={editingReport || undefined}
            onSave={saveReport}
            onCancel={() => setEditingReport(undefined)}
            busy={saving}
          />
        </Modal>
      ) : null}
    </main>
  );
}

ReportDirectory.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired
  }),
  onRequireAuth: PropTypes.func.isRequired,
  onNotify: PropTypes.func.isRequired
};
