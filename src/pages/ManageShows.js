import React, { useEffect, useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

const EMPTY_SHOW = {
  movie: '', screen: '', showTime: '',
  totalSeats: 80,
  pricingStandard: 150, pricingPremium: 250, pricingVip: 400,
};

export default function ManageShows() {
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_SHOW);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get('/api/shows', { params: {} }).then(r => r.data),
      api.get('/api/movies').then(r => r.data),
    ]).then(([showsData, moviesData]) => {
      // Fetch all shows (including past) for admin view
      setMovies(moviesData);
      return api.get('/api/shows').then(r => setShows(r.data));
    }).catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));

    // Separate fetch to get all shows for admin
    api.get('/api/shows').then(r => setShows(r.data)).catch(() => {});
    api.get('/api/movies').then(r => setMovies(r.data)).catch(() => {});
    setLoading(false);
  };

  useEffect(() => {
    api.get('/api/movies').then(r => setMovies(r.data)).catch(() => {});
    api.get('/api/shows').then(r => { setShows(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const openAdd = () => { setForm(EMPTY_SHOW); setEditId(null); setShowModal(true); };

  const openEdit = (show) => {
    const dt = new Date(show.showTime);
    const pad = n => String(n).padStart(2,'0');
    const localISO = `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
    setForm({
      movie: show.movie?._id || show.movie,
      screen: show.screen,
      showTime: localISO,
      totalSeats: show.totalSeats,
      pricingStandard: show.pricing?.standard || 150,
      pricingPremium: show.pricing?.premium || 250,
      pricingVip: show.pricing?.vip || 400,
    });
    setEditId(show._id);
    setShowModal(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        movie: form.movie,
        screen: form.screen,
        showTime: new Date(form.showTime).toISOString(),
        totalSeats: Number(form.totalSeats),
        pricing: {
          standard: Number(form.pricingStandard),
          premium: Number(form.pricingPremium),
          vip: Number(form.pricingVip),
        },
      };
      if (editId) {
        await api.put(`/api/shows/${editId}`, payload);
        toast.success('Show updated');
      } else {
        await api.post('/api/shows', payload);
        toast.success('Show created');
      }
      setShowModal(false);
      api.get('/api/shows').then(r => setShows(r.data));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel this show?')) return;
    try {
      await api.delete(`/api/shows/${id}`);
      toast.success('Show cancelled');
      setShows(prev => prev.filter(s => s._id !== id));
    } catch {
      toast.error('Delete failed');
    }
  };

  const formatDT = (dt) => new Date(dt).toLocaleString('en-IN', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">📅 Manage Shows</h1>
          <p className="page-subtitle">Schedule and manage movie screenings</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Show</button>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /> Loading…</div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Movie</th><th>Screen</th><th>Date & Time</th>
                  <th>Total Seats</th><th>Available</th>
                  <th>Std/Prem/VIP</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shows.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No shows yet</td></tr>
                ) : shows.map(s => (
                  <tr key={s._id}>
                    <td style={{ fontWeight: 600 }}>{s.movie?.title}</td>
                    <td>{s.screen}</td>
                    <td>{formatDT(s.showTime)}</td>
                    <td>{s.totalSeats}</td>
                    <td>
                      <span style={{
                        fontWeight: 600,
                        color: s.availableSeats > 10 ? 'var(--success)' : s.availableSeats > 0 ? 'var(--warning)' : 'var(--danger)'
                      }}>
                        {s.availableSeats}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      ₹{s.pricing?.standard} / ₹{s.pricing?.premium} / ₹{s.pricing?.vip}
                    </td>
                    <td>
                      <div className="actions-group">
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(s)}>✏️ Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s._id)}>🗑️</button>
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
              <h3 className="modal-title">{editId ? 'Edit Show' : 'Add New Show'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Movie *</label>
                <select name="movie" className="form-control" value={form.movie} onChange={handleChange} required>
                  <option value="">Select movie</option>
                  {movies.map(m => <option key={m._id} value={m._id}>{m.title}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Screen *</label>
                  <input name="screen" className="form-control" value={form.screen} onChange={handleChange} required placeholder="Screen 1" />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Seats *</label>
                  <input name="totalSeats" type="number" className="form-control" value={form.totalSeats} onChange={handleChange} required min={10} max={300} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Show Date & Time *</label>
                <input name="showTime" type="datetime-local" className="form-control" value={form.showTime} onChange={handleChange} required />
              </div>
              <div style={{ marginBottom: 6, fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-muted)' }}>Pricing (₹)</div>
              <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                {[
                  { name: 'pricingStandard', label: 'Standard' },
                  { name: 'pricingPremium',  label: 'Premium' },
                  { name: 'pricingVip',      label: 'VIP' },
                ].map(p => (
                  <div className="form-group" key={p.name}>
                    <label className="form-label">{p.label}</label>
                    <input name={p.name} type="number" className="form-control" value={form[p.name]} onChange={handleChange} min={1} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editId ? '💾 Update Show' : '+ Add Show'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
