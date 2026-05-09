import { useState, useEffect } from "react";
import "./App.css";

/* Helper: returns initials from an author name */
function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
}

/* Skeleton placeholder while loading */
function SkeletonGrid() {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <div className="skeleton-card" key={i}>
          <div className="skeleton-line long" />
          <div className="skeleton-line full" />
          <div className="skeleton-line full" />
          <div className="skeleton-line medium" />
          <div className="skeleton-footer">
            <div className="skeleton-line avatar" />
            <div className="skeleton-line short" />
          </div>
        </div>
      ))}
    </div>
  );
}

function App() {
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPost() {
      try {
        setStatus("loading");

        const response = await fetch(
          "https://api.freeapi.app/api/v1/public/quotes",
          { signal: controller.signal },
        );

        const data = await response.json();
        setPosts(data.data.data);
        setStatus("success");
      } catch (err) {
        if (err.name === "AbortError") {
          // Silently ignore — happens in React StrictMode double-invoke
          return;
        }
        setError(err.message);
        setStatus("error");
      }
    }

    loadPost();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="app-header">
        <h1 className="app-title">Quotes &amp; Wisdom</h1>
        <p className="app-subtitle">A curated collection of inspiring thoughts</p>

        <div className="status-bar">
          <span className={`status-dot ${status}`} />
          <span className="status-text">{status}</span>
        </div>
      </header>

      {/* ── Error ── */}
      {error && <p className="error-banner">⚠ {error}</p>}

      {/* ── Loading Skeleton ── */}
      {status === "loading" && <SkeletonGrid />}

      {/* ── Quotes Grid ── */}
      {status === "success" && (
        <main className="quotes-grid">
          {posts.map((post) => (
            <article className="quote-card" key={post.id}>
              <p className="quote-content">{post.content}</p>

              <footer className="quote-footer">
                <div className="quote-author">
                  <div className="author-avatar">{getInitials(post.author)}</div>
                  <span className="author-name">{post.author}</span>
                </div>
                <time className="quote-date">
                  {new Date(post.dateAdded).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </time>
              </footer>
            </article>
          ))}
        </main>
      )}
    </div>
  );
}

export default App;
