import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';

const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Animation'];

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const navigate = useNavigate();

  const fetchMovies = () => {
    setLoading(true);
    api.get('/api/movies', { params: { search, genre } })
      .then(res => setMovies(res.data))
      .catch(() => toast.error('Failed to load movies'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMovies(); }, [search, genre]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">🎬 Now Showing</h1>
          <p className="page-subtitle">Browse and book your favourite movies</p>
        </div>
      </div>

      <div className="search-bar">
        <input
          className="form-control"
          placeholder="🔍  Search movies…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="form-control" style={{ maxWidth: 180 }} value={genre} onChange={e => setGenre(e.target.value)}>
          <option value="">All Genres</option>
          {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /> Loading movies…</div>
      ) : movies.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎥</div>
          <h3>No movies found</h3>
          <p>Try a different search or genre</p>
        </div>
      ) : (
        <div className="movies-grid">
          {movies.map(movie => (
            <div className="movie-card" key={movie._id} onClick={() => navigate(`/shows?movieId=${movie._id}`)}>
              <div className="movie-poster">
                {movie.poster
                  ? <img src={movie.poster} alt={movie.title} onError={e => { e.target.style.display='none'; }} />
                  : <span>🎬</span>
                }
              </div>
              <div className="movie-info">
                <div className="movie-title">{movie.title}</div>
                <div className="movie-meta">
                  <span>{movie.genre}</span>
                  <span>•</span>
                  <span>{movie.duration} min</span>
                  <span>•</span>
                  <span style={{
                    background: 'rgba(245,197,24,0.15)', color: 'var(--warning)',
                    padding: '1px 6px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 700
                  }}>{movie.rating}</span>
                </div>
                {movie.language && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>{movie.language}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
