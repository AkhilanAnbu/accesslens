import { useState } from "react";
import PropTypes from "prop-types";
import {
  ACCESSIBILITY_FEATURES,
  PLACE_CATEGORIES,
  VERIFICATION_STATUSES
} from "../utils/constants.js";
import "./PlaceForm.css";

const EMPTY_PLACE = {
  name: "",
  category: "Cafe",
  address: { street: "", city: "Boston", state: "MA", postalCode: "" },
  accessibilityFeatures: [],
  description: "",
  contact: { phone: "", website: "" },
  verificationStatus: "Pending"
};

export default function PlaceForm({ place, onSave, onCancel, busy }) {
  const [form, setForm] = useState(() => ({
    ...EMPTY_PLACE,
    ...place,
    address: { ...EMPTY_PLACE.address, ...place?.address },
    contact: { ...EMPTY_PLACE.contact, ...place?.contact },
    accessibilityFeatures: place?.accessibilityFeatures || []
  }));
  const [error, setError] = useState("");

  function setField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function setNested(group, name, value) {
    setForm((current) => ({
      ...current,
      [group]: { ...current[group], [name]: value }
    }));
  }

  function toggleFeature(feature) {
    setForm((current) => ({
      ...current,
      accessibilityFeatures: current.accessibilityFeatures.includes(feature)
        ? current.accessibilityFeatures.filter((item) => item !== feature)
        : [...current.accessibilityFeatures, feature]
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (form.name.trim().length < 2 || !form.address.city.trim()) {
      setError("Add a place name and city before saving.");
      return;
    }
    try {
      await onSave(form);
    } catch (saveError) {
      setError(saveError.message);
    }
  }

  return (
    <form className="place-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <div className="form-section__heading">
          <span>1</span>
          <div>
            <h3>Place basics</h3>
            <p>Give visitors enough information to identify the correct location.</p>
          </div>
        </div>
        <div className="form-grid form-grid--two">
          <label className="form-grid__wide">
            Place name
            <input
              value={form.name}
              onChange={(event) => setField("name", event.target.value)}
              required
              maxLength="120"
            />
          </label>
          <label>
            Category
            <select
              value={form.category}
              onChange={(event) => setField("category", event.target.value)}
            >
              {PLACE_CATEGORIES.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
          <label>
            Verification
            <select
              value={form.verificationStatus}
              onChange={(event) => setField("verificationStatus", event.target.value)}
            >
              {VERIFICATION_STATUSES.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
          <label className="form-grid__wide">
            Street address
            <input
              value={form.address.street}
              onChange={(event) => setNested("address", "street", event.target.value)}
              maxLength="140"
            />
          </label>
          <label>
            City
            <input
              value={form.address.city}
              onChange={(event) => setNested("address", "city", event.target.value)}
              required
              maxLength="80"
            />
          </label>
          <label>
            State
            <input
              value={form.address.state}
              onChange={(event) => setNested("address", "state", event.target.value)}
              maxLength="80"
            />
          </label>
          <label>
            Postal code
            <input
              value={form.address.postalCode}
              onChange={(event) => setNested("address", "postalCode", event.target.value)}
              maxLength="20"
            />
          </label>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section__heading">
          <span>2</span>
          <div>
            <h3>Accessibility features</h3>
            <p>Select only features you have personally confirmed.</p>
          </div>
        </div>
        <fieldset className="feature-checks">
          <legend className="sr-only">Confirmed accessibility features</legend>
          {ACCESSIBILITY_FEATURES.map((feature) => (
            <label
              key={feature}
              className={form.accessibilityFeatures.includes(feature) ? "is-selected" : ""}
            >
              <input
                type="checkbox"
                checked={form.accessibilityFeatures.includes(feature)}
                onChange={() => toggleFeature(feature)}
              />
              <span aria-hidden="true">✓</span>
              {feature}
            </label>
          ))}
        </fieldset>
      </div>

      <div className="form-section">
        <div className="form-section__heading">
          <span>3</span>
          <div>
            <h3>Helpful details</h3>
            <p>Add context, contact information, and anything useful for planning a visit.</p>
          </div>
        </div>
        <div className="form-grid form-grid--two">
          <label className="form-grid__wide">
            Description
            <textarea
              value={form.description}
              onChange={(event) => setField("description", event.target.value)}
              rows="5"
              maxLength="1500"
              placeholder="Describe the entrance, interior route, restroom access, or other useful details."
            />
          </label>
          <label>
            Phone
            <input
              value={form.contact.phone}
              onChange={(event) => setNested("contact", "phone", event.target.value)}
              maxLength="40"
            />
          </label>
          <label>
            Website
            <input
              type="url"
              value={form.contact.website}
              onChange={(event) => setNested("contact", "website", event.target.value)}
              maxLength="240"
              placeholder="https://"
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
          {busy ? "Saving…" : place ? "Save changes" : "Create place"}
        </button>
      </div>
    </form>
  );
}

PlaceForm.propTypes = {
  place: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    category: PropTypes.string,
    address: PropTypes.object,
    accessibilityFeatures: PropTypes.arrayOf(PropTypes.string),
    description: PropTypes.string,
    contact: PropTypes.object,
    verificationStatus: PropTypes.string
  }),
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  busy: PropTypes.bool.isRequired
};
