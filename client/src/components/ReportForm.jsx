import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { api } from "../api/api.js";
import { REPORT_BARRIER_TYPES, REPORT_SEVERITIES } from "../utils/constants.js";
import { useDebounce } from "../hooks/useDebounce.js";
import "./ReportForm.css";

const EMPTY_REPORT = {
  placeId: "",
  barrierType: REPORT_BARRIER_TYPES[0],
  severity: "Medium",
  description: "",
  suggestedFix: ""
};

export default function ReportForm({ report, onSave, onCancel, busy }) {
  const [form, setForm] = useState(() => ({
    ...EMPTY_REPORT,
    placeId: report?.placeId || "",
    barrierType: report?.barrierType || EMPTY_REPORT.barrierType,
    severity: report?.severity || EMPTY_REPORT.severity,
    description: report?.description || "",
    suggestedFix: report?.suggestedFix || ""
  }));
  const [selectedPlaceName, setSelectedPlaceName] = useState(report?.place?.name || "");
  const [placeQuery, setPlaceQuery] = useState("");
  const [placeResults, setPlaceResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const debouncedPlaceQuery = useDebounce(placeQuery);

  useEffect(() => {
    if (debouncedPlaceQuery.trim().length < 2) {
      setPlaceResults([]);
      return;
    }

    let cancelled = false;
    setSearching(true);
    api
      .getPlaces({ search: debouncedPlaceQuery, limit: 6 })
      .then((payload) => {
        if (!cancelled) {
          setPlaceResults(payload.items);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPlaceResults([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setSearching(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedPlaceQuery]);

  function setField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function choosePlace(place) {
    setForm((current) => ({ ...current, placeId: place.id }));
    setSelectedPlaceName(place.name);
    setPlaceQuery("");
    setPlaceResults([]);
  }

  function clearPlace() {
    setForm((current) => ({ ...current, placeId: "" }));
    setSelectedPlaceName("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.placeId) {
      setError("Search for and select the related place.");
      return;
    }
    if (form.description.trim().length < 10) {
      setError("Add a description with at least ten characters.");
      return;
    }

    try {
      await onSave(form);
    } catch (saveError) {
      setError(saveError.message);
    }
  }

  return (
    <form className="report-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <div className="form-section__heading">
          <span>1</span>
          <div>
            <h3>Related place</h3>
            <p>Find the public place this accessibility barrier applies to.</p>
          </div>
        </div>

        {form.placeId ? (
          <div className="selected-place">
            <div>
              <p className="selected-place__label">Selected place</p>
              <p className="selected-place__name">{selectedPlaceName || "Selected place"}</p>
            </div>
            <button className="button button--ghost" type="button" onClick={clearPlace}>
              Change place
            </button>
          </div>
        ) : (
          <div className="place-picker">
            <label className="report-field">
              Search places
              <input
                value={placeQuery}
                onChange={(event) => setPlaceQuery(event.target.value)}
                placeholder="Type a place name or city"
              />
            </label>
            {searching ? <p className="place-picker__status">Searching places…</p> : null}
            {!searching && debouncedPlaceQuery.trim().length >= 2 && placeResults.length === 0 ? (
              <p className="place-picker__status">No matching places found.</p>
            ) : null}
            {placeResults.length ? (
              <ul className="place-picker__results">
                {placeResults.map((place) => (
                  <li key={place.id}>
                    <button type="button" onClick={() => choosePlace(place)}>
                      <strong>{place.name}</strong>
                      <span>
                        {place.category} · {place.address?.city}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        )}
      </div>

      <div className="form-section">
        <div className="form-section__heading">
          <span>2</span>
          <div>
            <h3>Barrier details</h3>
            <p>Describe the barrier so other visitors know what to expect.</p>
          </div>
        </div>
        <div className="form-grid form-grid--two">
          <label>
            Barrier type
            <select
              value={form.barrierType}
              onChange={(event) => setField("barrierType", event.target.value)}
            >
              {REPORT_BARRIER_TYPES.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>
          <label>
            Severity
            <select
              value={form.severity}
              onChange={(event) => setField("severity", event.target.value)}
            >
              {REPORT_SEVERITIES.map((level) => (
                <option key={level}>{level}</option>
              ))}
            </select>
          </label>
          <label className="form-grid__wide">
            Description
            <textarea
              value={form.description}
              onChange={(event) => setField("description", event.target.value)}
              rows="4"
              maxLength="1500"
              placeholder="Describe the barrier, where it is, and how it affects access."
            />
          </label>
          <label className="form-grid__wide">
            Suggested fix (optional)
            <textarea
              value={form.suggestedFix}
              onChange={(event) => setField("suggestedFix", event.target.value)}
              rows="3"
              maxLength="1000"
              placeholder="Suggest how the barrier could be resolved."
            />
          </label>
        </div>
      </div>

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="form-actions">
        <button className="button button--ghost" type="button" onClick={onCancel}>
          Cancel
        </button>
        <button className="button" type="submit" disabled={busy}>
          {busy ? "Saving…" : report ? "Save changes" : "Submit report"}
        </button>
      </div>
    </form>
  );
}

ReportForm.propTypes = {
  report: PropTypes.shape({
    id: PropTypes.string,
    placeId: PropTypes.string,
    barrierType: PropTypes.string,
    severity: PropTypes.string,
    description: PropTypes.string,
    suggestedFix: PropTypes.string,
    place: PropTypes.shape({
      name: PropTypes.string
    })
  }),
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  busy: PropTypes.bool.isRequired
};
