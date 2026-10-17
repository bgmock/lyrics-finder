
import { useEffect, useState } from "react";
import "./App.css";

const STORAGE_KEY = "lyricsfinder-favorites";

function App() {
  const [search, setSearch] = useState("");
  const [artist, setArtist] = useState("");
  const [song, setSong] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });

  const [editingId, setEditingId] = useState(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  async function searchLyrics(event) {
    event.preventDefault();

    const query = search.trim();

    if (!query) {
      setError("Lütfen sanatçı ve şarkı adını yaz.");
      return;
    }

    // Örnek: Coldplay - Yellow
    const parts = query.split(/\s+-\s+/);

    if (parts.length !== 2 || !parts[0].trim() || !parts[1].trim()) {
      setError("Örnek arama: Coldplay - Yellow");
      return;
    }

    const artistName = parts[0].trim();
    const songName = parts[1].trim();

    setArtist(artistName);
    setSong(songName);
    setLyrics("");
    setError("");
    setLoading(true);

    try {
      const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(
        artistName
      )}/${encodeURIComponent(songName)}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Şarkı sözleri bulunamadı.");
      }

      const data = await response.json();

      if (!data.lyrics) {
        throw new Error("Bu şarkının sözleri bulunamadı.");
      }

      setLyrics(data.lyrics);
    } catch (err) {
      setError(err.message || "Arama sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  function addFavorite() {
    if (!artist || !song) return;

    const exists = favorites.some(
      (item) =>
        item.artist.toLowerCase() === artist.toLowerCase() &&
        item.song.toLowerCase() === song.toLowerCase()
    );

    if (exists) return;

    const newFavorite = {
      id: crypto.randomUUID(),
      artist,
      song,
      note: "",
    };

    setFavorites((previous) => [...previous, newFavorite]);
  }

  function deleteFavorite(id) {
    setFavorites((previous) =>
      previous.filter((item) => item.id !== id)
    );
  }

  function startEditing(item) {
    setEditingId(item.id);
    setNote(item.note);
  }

  function saveNote(id) {
    setFavorites((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, note } : item
      )
    );

    setEditingId(null);
    setNote("");
  }

  function loadFavorite(item) {
    setSearch(`${item.artist} - ${item.song}`);
    setArtist(item.artist);
    setSong(item.song);
    setLyrics("");
    setError("Şarkı sözlerini görmek için Search butonuna bas.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function musicLink(platform) {
    const query = encodeURIComponent(`${artist} ${song}`);

    if (platform === "spotify") {
      return `https://open.spotify.com/search/${query}`;
    }

    if (platform === "apple") {
      return `https://music.apple.com/us/search?term=${query}`;
    }

    return `https://www.youtube.com/results?search_query=${query}`;
  }

  const isFavorite = favorites.some(
    (item) =>
      item.artist.toLowerCase() === artist.toLowerCase() &&
      item.song.toLowerCase() === song.toLowerCase()
  );

  return (
    <div className="page">
      <header className="navbar">
        <a className="brand" href="#home">
          <span className="brand-icon">♫</span>
          <div>
            <h1>
              Lyrics <span>Finder</span>
            </h1>
            <small>MUSIC BRINGS US CLOSER</small>
          </div>
        </a>

        <nav>
          <a href="#home">Home</a>
          <a href="#lyrics">Lyrics</a>
          <a href="#favorites">Favorites</a>
        </nav>

        <div className="header-message">
          ♥ <span>Good Music<br />Brighter Days</span>
        </div>
      </header>

      <main id="home">
        <section className="hero">
          <h2>
            Find the Lyrics to
            <br />
            <em>Your Favorite Songs</em>
          </h2>

          <p>Search by artist and song title...</p>

          <form className="search-bar" onSubmit={searchLyrics}>
            <span className="search-icon">⌕</span>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Coldplay - Yellow"
              aria-label="Artist and song"
            />

            {search && (
              <button
                className="clear-button"
                type="button"
                onClick={() => setSearch("")}
              >
                ×
              </button>
            )}

            <button className="search-button" type="submit">
              Search
            </button>
          </form>

          <p className="search-hint">
            Example: Adele - Hello
          </p>
        </section>

        <section className="music-dashboard" id="lyrics">
          <aside className="song-panel glass">
            <div className="album-cover">
              <span>♫</span>
            </div>

            <div className="song-title-row">
              <h3>{song || "Your Song"}</h3>

              <button
                className={`heart-button ${isFavorite ? "active" : ""}`}
                onClick={addFavorite}
                disabled={!song || isFavorite}
                title="Add to favorites"
              >
                {isFavorite ? "♥" : "♡"}
              </button>
            </div>

            <p className="artist-name">
              {artist || "Search for an artist"}
            </p>

            <div className="song-details">
              <p>♫ Song: {song || "Not selected"}</p>
              <p>♬ Artist: {artist || "Not selected"}</p>
            </div>
          </aside>

          <section className="lyrics-panel glass">
            <div className="panel-heading">
              <h3>♫ Lyrics</h3>
              <span className="wave">▂▅▃▇▂▆▃▅▂</span>
            </div>

            <div className="lyrics-content" aria-live="polite">
              {loading ? (
                <p className="placeholder">Searching for lyrics...</p>
              ) : error ? (
                <p className="error-message">{error}</p>
              ) : lyrics ? (
                <p className="lyrics-text">{lyrics}</p>
              ) : (
                <div className="welcome-message">
                  <span>♪</span>
                  <h3>Let the music speak...</h3>
                  <p>
                    Search for your favorite song to discover its lyrics.
                  </p>
                </div>
              )}
            </div>
          </section>

          <aside className="right-panel glass">
            <h3>♫ Listen Now</h3>

            {song ? (
              <div className="music-links">
                <a
                  href={musicLink("spotify")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>🟢</span> Play on Spotify ↗
                </a>

                <a
                  href={musicLink("apple")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>🎵</span> Play on Apple Music ↗
                </a>

                <a
                  href={musicLink("youtube")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>▶️</span> Play on YouTube ↗
                </a>
              </div>
            ) : (
              <p className="muted">Search for a song first.</p>
            )}

            <div className="favorites-section" id="favorites">
              <h3>♥ My Favorites</h3>

              {favorites.length === 0 ? (
                <p className="muted">
                  Your favorite songs will appear here.
                </p>
              ) : (
                <div className="favorites-list">
                  {favorites.map((item) => (
                    <div className="favorite-item" key={item.id}>
                      <button
                        className="favorite-name"
                        onClick={() => loadFavorite(item)}
                      >
                        <strong>{item.song}</strong>
                        <small>{item.artist}</small>
                      </button>

                      {editingId === item.id ? (
                        <div className="note-editor">
                          <input
                            value={note}
                            placeholder="Your note"
                            onChange={(e) => setNote(e.target.value)}
                          />
                          <button onClick={() => saveNote(item.id)}>
                            Save
                          </button>
                          <button onClick={() => setEditingId(null)}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          {item.note && (
                            <p className="favorite-note">{item.note}</p>
                          )}

                          <div className="favorite-actions">
                            <button onClick={() => startEditing(item)}>
                              Edit note
                            </button>

                            <button onClick={() => deleteFavorite(item.id)}>
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </section>
      </main>

      <footer>
        Made with ♥ and music — LyricsFinder
      </footer>
    </div>
  );
}

export default App;
