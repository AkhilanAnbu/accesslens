import birdLogo from "../assets/red-bird.svg";
import "./ReportsPlaceholder.css";

export default function ReportsPlaceholder() {
  return (
    <main className="reports-placeholder shell">
      <section aria-labelledby="reports-placeholder-title">
        <img src={birdLogo} alt="" />
        <p>Team feature placeholder</p>
        <h1 id="reports-placeholder-title">Accessibility Reports</h1>
        <div className="reports-placeholder__blank" aria-hidden="true" />
        <p className="reports-placeholder__note">
          This page is intentionally reserved for Santhosh to implement the Accessibility Reports
          full-stack feature.
        </p>
      </section>
    </main>
  );
}
