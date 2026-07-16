import PropTypes from "prop-types";
import "./Toast.css";

export default function Toast({ message, tone, onClose }) {
  if (!message) {
    return null;
  }

  return (
    <div className={`toast toast--${tone}`} role={tone === "error" ? "alert" : "status"}>
      <span aria-hidden="true">{tone === "error" ? "!" : "✓"}</span>
      <p>{message}</p>
      <button type="button" onClick={onClose} aria-label="Dismiss message">
        ×
      </button>
    </div>
  );
}

Toast.propTypes = {
  message: PropTypes.string,
  tone: PropTypes.oneOf(["success", "error"]),
  onClose: PropTypes.func.isRequired
};

Toast.defaultProps = {
  message: "",
  tone: "success"
};
