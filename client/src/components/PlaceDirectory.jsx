import { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { api } from "../api/api.js";
import {
  ACCESSIBILITY_FEATURES,
  PLACE_CATEGORIES,
  VERIFICATION_STATUSES
} from "../utils/constants.js";
import { ownershipMatches } from "../utils/formatters.js";
import { useDebounce } from "../hooks/useDebounce.js";
import EmptyState from "./EmptyState.jsx";
import Modal from "./Modal.jsx";
import Pagination from "./Pagination.jsx";
import PlaceCard from "./PlaceCard.jsx";
import PlaceDetail from "./PlaceDetail.jsx";
import PlaceForm from "./PlaceForm.jsx";
import "./PlaceDirectory.css";

const EMPTY_PAGINATION = { page: 1, pages: 1, total: 0, limit: 12 };

export default function PlaceDirectory({ initialSearch, user, onRequireAuth, onNotify }) {
  const [filters, setFilters] = useState({
    search: initialSearch || "",
    category: "",
    location: "",
    feature: "",
    verificationStatus: "",
    mine: false
  });
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);
  const [places, setPlaces] = useState([]);
  const [sort, setSort] = useState("updated");
  const [loading, setLoading] = useState(true);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [editingPlace, setEditingPlace] = useState(undefined);
  const [saving, setSaving] = useState(false);
  const debouncedSearch = useDebounce(filters.search);
  const debouncedLocation = useDebounce(filters.location);

  useEffect(() => {
    if (initialSearch) {
      setFilters((current) => ({ ...current, search: initialSearch }));
    }
  }, [initialSearch]);

  const loadPlaces = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const payload = await api.getPlaces({
          search: debouncedSearch,
          category: filters.category,
          location: debouncedLocation,
          feature: filters.feature,
          verificationStatus: filters.verificationStatus,
          mine: filters.mine,
          sort,
          page,
          limit: 12
        });
        setPlaces(payload.items);
        setPagination(payload.pagination);
      } catch (error) {
        onNotify(error.message, "error");
      } finally {
        setLoading(false);
      }
    },
    [
      debouncedLocation,
      debouncedSearch,
      filters.category,
      filters.feature,
      filters.mine,
      filters.verificationStatus,
      onNotify,
      sort
    ]
  );

  useEffect(() => {
    loadPlaces(1);
  }, [loadPlaces]);

  function setFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function clearFilters() {
    setFilters({
      search: "",
      category: "",
      location: "",
      feature: "",
      verificationStatus: "",
      mine: false
    });
  }

  function startCreate() {
    if (!user) {
      onRequireAuth();
      return;
    }
    setEditingPlace(null);
  }

  async function savePlace(data) {
    setSaving(true);
    try {
      if (editingPlace?.id) {
        await api.updatePlace(editingPlace.id, data);
        onNotify("Place listing updated.", "success");
      } else {
        await api.createPlace(data);
        onNotify("Place listing created.", "success");
      }
      setEditingPlace(undefined);
      await loadPlaces(1);
    } catch (error) {
      onNotify(error.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function deletePlace(place) {
    const confirmed = window.confirm(`Delete ${place.name}? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }

    try {
      await api.deletePlace(place.id);
      setSelectedPlaceId(null);
      onNotify("Place listing deleted.", "success");
      await loadPlaces(1);
    } catch (error) {
      onNotify(error.message, "error");
    }
  }

  const filterCount = [
    filters.category,
    filters.location,
    filters.feature,
    filters.verificationStatus,
    filters.mine
  ].filter(Boolean).length;

  return (
    <main className="directory-page page-shell">
      <section className="page-hero page-hero--places shell">
        <div>
          <p className="eyebrow">Akhilan’s full-stack feature</p>
          <h1>Place Directory</h1>
          <p>
            Browse, search, filter, create, update, and delete public place listings stored in
            MongoDB.
          </p>
        </div>
        <button className="button button--light" type="button" onClick={startCreate}>
          + Add a public place
        </button>
      </section>

      <div className="directory-layout shell">
        <aside className="filters-panel" aria-label="Place filters">
          <div className="filters-panel__heading">
            <div>
              <span aria-hidden="true">◇</span>
              <strong>Filters</strong>
            </div>
            {filterCount ? (
              <button type="button" onClick={clearFilters}>
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
                onChange={(event) => setFilter("search", event.target.value)}
                placeholder="Name or address"
              />
            </div>
          </label>
          <label className="filter-field">
            Location
            <input
              value={filters.location}
              onChange={(event) => setFilter("location", event.target.value)}
              placeholder="City or state"
            />
          </label>
          <label className="filter-field">
            Category
            <select
              value={filters.category}
              onChange={(event) => setFilter("category", event.target.value)}
            >
              <option value="">All categories</option>
              {PLACE_CATEGORIES.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
          <label className="filter-field">
            Accessibility feature
            <select
              value={filters.feature}
              onChange={(event) => setFilter("feature", event.target.value)}
            >
              <option value="">Any confirmed feature</option>
              {ACCESSIBILITY_FEATURES.map((feature) => (
                <option key={feature}>{feature}</option>
              ))}
            </select>
          </label>
          <label className="filter-field">
            Verification
            <select
              value={filters.verificationStatus}
              onChange={(event) => setFilter("verificationStatus", event.target.value)}
            >
              <option value="">Any status</option>
              {VERIFICATION_STATUSES.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
          {user ? (
            <label className="mine-toggle">
              <input
                type="checkbox"
                checked={filters.mine}
                onChange={(event) => setFilter("mine", event.target.checked)}
              />
              <span aria-hidden="true" />
              Only places I created
            </label>
          ) : null}

          <div className="filters-tip">
            <strong>Tip</strong>
            <p>Use one or more filters to quickly narrow the place directory.</p>
          </div>
        </aside>

        <section className="directory-results" aria-live="polite">
          <header className="results-heading">
            <div>
              <p className="results-heading__count">
                {loading ? "Searching…" : `${pagination.total.toLocaleString()} places found`}
              </p>
              <h2>
                {filters.search ? `Results for “${filters.search}”` : "Explore public places"}
              </h2>
            </div>
            <select
              aria-label="Sort places"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="updated">Recently updated</option>
              <option value="nameAsc">Name: A to Z</option>
              <option value="nameDesc">Name: Z to A</option>
            </select>
          </header>

          {loading ? (
            <div className="card-grid" aria-label="Loading places">
              {Array.from({ length: 6 }, (_, index) => (
                <div className="skeleton-card" key={index} />
              ))}
            </div>
          ) : places.length ? (
            <>
              <div className="card-grid">
                {places.map((place) => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    onView={setSelectedPlaceId}
                    isOwner={ownershipMatches(place.createdBy, user)}
                  />
                ))}
              </div>
              <Pagination
                page={pagination.page}
                pages={pagination.pages}
                total={pagination.total}
                onChange={loadPlaces}
              />
            </>
          ) : (
            <EmptyState
              title="No places match these filters"
              text="Try clearing one filter, searching a nearby city, or adding a missing public place."
              actionLabel="Clear filters"
              onAction={clearFilters}
            />
          )}
        </section>
      </div>

      {selectedPlaceId ? (
        <Modal title="Place details" onClose={() => setSelectedPlaceId(null)} size="large">
          <PlaceDetail
            placeId={selectedPlaceId}
            user={user}
            onEdit={(place) => {
              setSelectedPlaceId(null);
              setEditingPlace(place);
            }}
            onDelete={deletePlace}
            onNotify={onNotify}
          />
        </Modal>
      ) : null}

      {editingPlace !== undefined ? (
        <Modal
          title={editingPlace ? "Edit place listing" : "Add a public place"}
          onClose={() => setEditingPlace(undefined)}
          size="large"
        >
          <PlaceForm
            place={editingPlace || undefined}
            onSave={savePlace}
            onCancel={() => setEditingPlace(undefined)}
            busy={saving}
          />
        </Modal>
      ) : null}
    </main>
  );
}

PlaceDirectory.propTypes = {
  initialSearch: PropTypes.string,
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired
  }),
  onRequireAuth: PropTypes.func.isRequired,
  onNotify: PropTypes.func.isRequired
};

PlaceDirectory.defaultProps = {
  initialSearch: ""
};
