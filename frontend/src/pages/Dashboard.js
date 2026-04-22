import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner" /> Loading dashboard…</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">📊 Dashboard</h1>
          <p className="page-subtitle">Overview of your cinema operations</p>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { icon: '🎬', label: 'Active Movies',   value: stats?.totalMovies,   color: '#4a9eff' },
          { icon: '📅', label: 'Active Shows',    value: stats?.totalShows,    color: '#46d369' },
          { icon: '🎟️', label: 'Total Bookings',  value: stats?.totalBookings, color: '#f5c518' },
          { icon: '👥', label: 'Registered Users', value: stats?.totalUsers,    color: '#a855f7' },
          { icon: '💰', label: 'Total Revenue',
            value: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`,
            color: '#e50914' },
        ].map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background: `${s.color}20` }}>
              <span style={{ fontSize: '1.5rem' }}>{s.icon}</span>
            </div>
            <div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ color: s.color }}>{s.value ?? 0}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">🕐 Recent Bookings</h2>
        </div>
        {stats?.recentBookings?.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎟️</div>
            <h3>No bookings yet</h3>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Ref #</th>
                  <th>Customer</th>
                  <th>Movie</th>
                  <th>Show</th>
                  <th>Seats</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentBookings?.map((b) => (
                  <tr key={b._id}>
                    <td><span className="booking-ref">{b.bookingRef}</span></td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{b.user?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.user?.email}</div>
                    </td>
                    <td>{b.movie?.title}</td>
                    <td>
                      <div>{b.show?.screen}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {b.show?.showTime ? new Date(b.show.showTime).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                      </div>
                    </td>
                    <td>{b.seats?.join(', ')}</td>
                    <td className="text-success fw-bold">₹{b.totalAmount}</td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {new Date(b.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
