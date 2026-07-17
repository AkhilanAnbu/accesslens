import { useState } from "react";
import PropTypes from "prop-types";
import { api } from "../api/api.js";
import Modal from "./Modal.jsx";
import "./AuthModal.css";

export default function AuthModal({ onClose, onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const payload = mode === "login" ? await api.login(form) : await api.register(form);
      onAuthenticated(payload.user);
      onClose();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      title={mode === "login" ? "Welcome back" : "Create your AccessLens account"}
      onClose={onClose}
      size="small"
    >
      <div className="auth-intro">
        <span aria-hidden="true">●</span>
        <p>Sign in to add public places and manage the listings you create.</p>
      </div>

      <div className="auth-tabs" role="tablist" aria-label="Authentication options">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "login"}
          className={mode === "login" ? "is-active" : ""}
          onClick={() => {
            setMode("login");
            setError("");
          }}
        >
          Sign in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "register"}
          className={mode === "register" ? "is-active" : ""}
          onClick={() => {
            setMode("register");
            setError("");
          }}
        >
          Register
        </button>
      </div>

      <form className="form-stack" onSubmit={handleSubmit}>
        {mode === "register" ? (
          <label>
            Full name
            <input
              name="name"
              value={form.name}
              onChange={updateField}
              autoComplete="name"
              required
              minLength="2"
            />
          </label>
        ) : null}
        <label>
          Email address
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={updateField}
            autoComplete="email"
            required
          />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={updateField}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            minLength="8"
          />
        </label>
        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
        <button className="button button--full" type="submit" disabled={busy}>
          {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>

      <p className="demo-note">
        New to AccessLens? Create an account to add places and accessibility reports.
      </p>
    </Modal>
  );
}

AuthModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onAuthenticated: PropTypes.func.isRequired
};
