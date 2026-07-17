import { useCallback, useEffect, useState } from "react";
import { api } from "./api/api.js";
import AccountPanel from "./components/AccountPanel.jsx";
import AuthModal from "./components/AuthModal.jsx";
import Footer from "./components/Footer.jsx";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import PlaceDirectory from "./components/PlaceDirectory.jsx";
import ReportDirectory from "./components/ReportDirectory.jsx";
import Toast from "./components/Toast.jsx";
import "./App.css";

const VALID_VIEWS = new Set(["home", "places", "reports", "account"]);

function viewFromHash() {
  const value = window.location.hash.replace("#", "");
  return VALID_VIEWS.has(value) ? value : "home";
}

export default function App() {
  const [activeView, setActiveView] = useState(viewFromHash);
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [directorySearch, setDirectorySearch] = useState("");
  const [toast, setToast] = useState({ message: "", tone: "success" });

  const notify = useCallback((message, tone = "success") => {
    setToast({ message, tone });
  }, []);

  useEffect(() => {
    api
      .getCurrentUser()
      .then((payload) => setUser(payload.user))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    function handleHashChange() {
      setActiveView(viewFromHash());
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    if (!toast.message) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setToast({ message: "", tone: "success" }), 4500);
    return () => window.clearTimeout(timeout);
  }, [toast.message]);

  function navigate(view) {
    const next = VALID_VIEWS.has(view) ? view : "home";
    if (window.location.hash === `#${next}`) {
      setActiveView(next);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.location.hash = next;
    }
  }

  function searchPlaces(query) {
    setDirectorySearch(query);
    navigate("places");
  }

  async function signOut() {
    try {
      await api.logout();
      setUser(null);
      notify("You have been signed out.", "success");
      navigate("home");
    } catch (error) {
      notify(error.message, "error");
    }
  }

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <Header
        activeView={activeView}
        user={user}
        onNavigate={navigate}
        onOpenAuth={() => setAuthOpen(true)}
      />

      <div id="main-content">
        {activeView === "home" ? (
          <main>
            <Hero onSearch={searchPlaces} onBrowsePlaces={() => navigate("places")} />
          </main>
        ) : null}

        {activeView === "places" ? (
          <PlaceDirectory
            initialSearch={directorySearch}
            user={user}
            onRequireAuth={() => setAuthOpen(true)}
            onNotify={notify}
          />
        ) : null}

        {activeView === "reports" ? (
  <ReportDirectory
    user={user}
    onRequireAuth={() => setAuthOpen(true)}
    onNotify={notify}
  />
) : null}

        {activeView === "account" ? (
          <AccountPanel
            user={user}
            onSignIn={() => setAuthOpen(true)}
            onSignOut={signOut}
            onNavigate={navigate}
          />
        ) : null}
      </div>

      <Footer onNavigate={navigate} />
      {authOpen ? (
        <AuthModal
          onClose={() => setAuthOpen(false)}
          onAuthenticated={(authenticatedUser) => {
            setUser(authenticatedUser);
            notify(`Welcome, ${authenticatedUser.name.split(" ")[0]}!`, "success");
          }}
        />
      ) : null}
      <Toast
        message={toast.message}
        tone={toast.tone}
        onClose={() => setToast({ message: "", tone: "success" })}
      />
    </>
  );
}
