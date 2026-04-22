import React, { useEffect, useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

const EMPTY = {
  title: '', description: '', genre: '', language: 'English',
  duration: '', rating: 'UA', poster: '', director: '',
  cast: '', releaseDate: '',
};

const GENRES = ['Action','Comedy','Drama','Horror','Romance','Sci-Fi','Thriller','Animation','Biography','Fantasy'];

export default function ManageMovies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchMovies = () => {
    setLoading(true);
    api.get('/api/movies')
      .then(res => setMovies(res.data))
      .catch(() => toast.error('Failed to load movies'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMovies(); }, []);

  const openAdd = () => { setForm(EMPTY); setEditId(null); setShowModal(true); };

  const openEdit = (movie) => {
    setForm({
      title: movie.title, description: movie.description || '',
      genre: movie.genre, language: movie.language || 'English',
      duration: movie.duration, rating: movie.rating,
      poster: movie.poster || '', director: movie.director || '',
      cast: (movie.cast || []).join(', '),
      releaseDate: movie.releaseDate ? movie.releaseDate.slice(0, 10) : '',
    });
    setEditId(movie._id);
    setShowModal(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        duration: Number(form.duration),
        cast: form.cast.split(',').map(c => c.trim()).filter(Boolean),
      };
      if (editId) {
        await api.put(`/api/movies/${editId}`, payload);
        toast.success('Movie updated');
      } else {
        await api.post('/api/movies', payload);
        toast.success('Movie added');
      }
      setShowModal(false);
      fetchMovies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this movie?')) return;
    try {
      await api.delete(`/api/movies/${id}`);
      toast.success('Movie removed');
      fetchMovies();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">🎬 Manage Movies</h1>
          <p className="page-subtitle">Add, edit, or remove movies from the system</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Movie</button>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /> Loading…</div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Movie</th><th>Genre</th><th>Language</th>
                  <th>Duration</th><th>Rating</th><th>Director</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {movies.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No movies yet</td></tr>
                ) : movies.map(m => (
                  <tr key={m._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{m.title}</div>
                      {m.description && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.description}</div>}
                    </td>
                    <td>{m.genre}</td>
                    <td>{m.language}</td>
                    <td>{m.duration} min</td>
                    <td><span style={{ background: 'rgba(245,197,24,0.15)', color: 'var(--warning)', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 700 }}>{m.rating}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{m.director || '—'}</td>
                    <td>
                      <div className="actions-group">
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(m)}>✏️ Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m._id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editId ? 'Edit Movie' : 'Add New Movie'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input name="title" className="form-control" value={form.title} onChange={handleChange} required placeholder="Movie title" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Genre *</label>
                  <select name="genre" className="form-control" value={form.genre} onChange={handleChange} required>
                    <option value="">Select genre</option>
                    {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Language</label>
                  <input name="language" className="form-control" value={form.language} onChange={handleChange} placeholder="English" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Duration (min) *</label>
                  <input name="duration" type="number" className="form-control" value={form.duration} onChange={handleChange} required min={1} placeholder="120" />
                </div>
                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <select name="rating" className="form-control" value={form.rating} onChange={handleChange}>
                    {['U','UA','A','S'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Director</label>
                  <input name="director" className="form-control" value={form.director} onChange={handleChange} placeholder="Director name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Release Date</label>
                  <input name="releaseDate" type="date" className="form-control" value={form.releaseDate} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Cast (comma-separated)</label>
                <input name="cast" className="form-control" value={form.cast} onChange={handleChange} placeholder="Actor 1, Actor 2, ..." />
              </div>
              <div className="form-group">
                <label className="form-label">Poster URL</label>
                <input name="poster" className="form-control" value={form.poster} onChange={handleChange} placeholder="https://..." />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea name="description" className="form-control" rows={3} value={form.description} onChange={handleChange} placeholder="Brief synopsis…" />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editId ? '💾 Update Movie' : '+ Add Movie'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
