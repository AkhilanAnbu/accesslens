import PropTypes from "prop-types";
import birdLogo from "../assets/red-bird.svg";
import "./EmptyState.css";

export default function EmptyState({ title, text, actionLabel, onAction }) {
  return (
    <div className="empty-state">
      <img src={birdLogo} alt="" />
      <h3>{title}</h3>
      <p>{text}</p>
      {actionLabel && onAction ? (
        <button className="button button--secondary" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

EmptyState.propTypes = {
  title: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func
};
