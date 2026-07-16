import { useState } from "react";
import PropTypes from "prop-types";
import birdLogo from "../assets/red-bird.svg";
import "./Hero.css";

const FEATURES = [
  {
    icon: "⌕",
    title: "Search places",
    text: "Find public places by name, location, category, or accessibility feature."
  },
  {
    icon: "+",
    title: "Add a listing",
    text: "Signed-in users can add useful accessibility details for a public place."
  },
  {
    icon: "✎",
    title: "Manage your places",
    text: "Listing creators can safely update or delete only the places they created."
  }
];

export default function Hero({ onSearch, onBrowsePlaces }) {
  const [query, setQuery] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    onSearch(query.trim());
  }

  return (
    <section className="simple-home shell" aria-labelledby="hero-title">
      <div className="simple-home__intro">
        <div className="simple-home__copy">
          <p className="simple-home__label">Public accessibility directory</p>
          <h1 id="hero-title">Find accessibility information before you visit.</h1>
          <p className="simple-home__text">
            AccessLens helps users search public places and view practical details such as ramps,
            elevators, accessible restrooms, parking, and wide entrances.
          </p>

          <form className="simple-search" onSubmit={handleSubmit} role="search">
            <label htmlFor="home-place-search">Search the place directory</label>
            <div>
              <input
                id="home-place-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by place, city, or address"
              />
              <button type="submit">Search</button>
            </div>
          </form>

          <button className="simple-home__browse" type="button" onClick={onBrowsePlaces}>
            Browse all places →
          </button>
        </div>

        <div className="simple-home__bird-box" aria-hidden="true">
          <img src={birdLogo} alt="" />
          <p>See access clearly.</p>
        </div>
      </div>

      <div className="simple-home__features" aria-label="Place directory features">
        {FEATURES.map((feature) => (
          <article key={feature.title}>
            <span aria-hidden="true">{feature.icon}</span>
            <h2>{feature.title}</h2>
            <p>{feature.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

Hero.propTypes = {
  onSearch: PropTypes.func.isRequired,
  onBrowsePlaces: PropTypes.func.isRequired
};
