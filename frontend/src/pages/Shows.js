import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';

export default function Shows() {
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [movieFilter, setMovieFilter] = useState(searchParams.get('movieId') || '');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/movies').then(r => setMovies(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api.get('/api/shows', { params: movieFilter ? { movieId: movieFilter } : {} })
      .then(res => setShows(res.data))
      .catch(() => toast.error('Failed to load shows'))
      .finally(() => setLoading(false));
  }, [movieFilter]);

  const formatDate = (dt) => new Date(dt).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
  const formatTime = (dt) => new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  // Group shows by movie
  const grouped = shows.reduce((acc, show) => {
    const key = show.movie?._id;
    if (!acc[key]) acc[key] = { movie: show.movie, shows: [] };
    acc[key].shows.push(show);
    return acc;
  }, {});

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">📅 Shows</h1>
          <p className="page-subtitle">Select a show and book your seats</p>
        </div>
      </div>

      <div className="search-bar">
        <select className="form-control" style={{ maxWidth: 260 }} value={movieFilter} onChange={e => setMovieFilter(e.target.value)}>
          <option value="">All Movies</option>
          {movies.map(m => <option key={m._id} value={m._id}>{m.title}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /> Loading shows…</div>
      ) : shows.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3>No upcoming shows</h3>
          <p>Check back soon for new show timings</p>
        </div>
      ) : (
        Object.values(grouped).map(({ movie, shows: movieShows }) => (
          <div className="card" key={movie?._id} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{
                width: 60, height: 80, borderRadius: 8,
                background: 'var(--surface2)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '1.8rem', flexShrink: 0
              }}>
                {movie?.poster ? <img src={movie.poster} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} /> : '🎬'}
              </div>
              <div>
                <h3 style={{ fontWeight: 700, marginBottom: 4 }}>{movie?.title}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: 10 }}>
                  <span>{movie?.genre}</span>
                  <span>•</span>
                  <span>{movie?.duration} min</span>
                  <span>•</span>
                  <span style={{ color: 'var(--warning)' }}>{movie?.rating}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {movieShows.map(show => (
                <div
                  key={show._id}
                  onClick={() => navigate(`/book/${show._id}`)}
                  style={{
                    border: '1px solid var(--border)', borderRadius: 10,
                    padding: '12px 16px', cursor: 'pointer',
                    transition: 'all 0.2s', minWidth: 160,
                    background: 'var(--surface2)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)' }}>
                    {formatTime(show.showTime)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {formatDate(show.showTime)}
                  </div>
                  <div style={{ fontSize: '0.75rem', marginTop: 6 }}>{show.screen}</div>
                  <div style={{
                    marginTop: 8, fontSize: '0.72rem', fontWeight: 600,
                    color: show.availableSeats > 10 ? 'var(--success)' : show.availableSeats > 0 ? 'var(--warning)' : 'var(--danger)'
                  }}>
                    {show.availableSeats > 0 ? `${show.availableSeats} seats left` : 'HOUSEFUL'}
                  </div>
                  <div style={{ marginTop: 4, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    From ₹{show.pricing?.standard}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
