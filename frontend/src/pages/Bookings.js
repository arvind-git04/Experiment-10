import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Bookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = () => {
    setLoading(true);
    axios.get('/api/bookings')
      .then(res => setBookings(res.data))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await axios.put(`/api/bookings/${id}/cancel`);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    }
  };

  const formatDT = (dt) => new Date(dt).toLocaleString('en-IN', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">🎟️ {user?.role === 'admin' ? 'All Bookings' : 'My Bookings'}</h1>
          <p className="page-subtitle">
            {user?.role === 'admin' ? 'View and manage all customer bookings' : 'View and manage your ticket bookings'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /> Loading bookings…</div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎟️</div>
          <h3>No bookings found</h3>
          <p>Book a movie ticket to see it here</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Ref #</th>
                  {user?.role === 'admin' && <th>Customer</th>}
                  <th>Movie</th>
                  <th>Show</th>
                  <th>Seats</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Booked On</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b._id}>
                    <td><span className="booking-ref">{b.bookingRef}</span></td>
                    {user?.role === 'admin' && (
                      <td>
                        <div style={{ fontWeight: 600 }}>{b.user?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.user?.email}</div>
                      </td>
                    )}
                    <td style={{ fontWeight: 600 }}>{b.movie?.title}</td>
                    <td>
                      <div>{b.show?.screen}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {b.show?.showTime ? formatDT(b.show.showTime) : '-'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {b.seats?.map(s => (
                          <span key={s} style={{
                            background: 'var(--surface2)', border: '1px solid var(--border)',
                            padding: '2px 7px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 600
                          }}>{s}</span>
                        ))}
                      </div>
                    </td>
                    <td className="text-success fw-bold">₹{b.totalAmount}</td>
                    <td style={{ textTransform: 'capitalize', fontSize: '0.82rem' }}>{b.paymentMode}</td>
                    <td>
                      <span className={`badge badge-${b.status}`}>{b.status}</span>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {new Date(b.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td>
                      {b.status === 'confirmed' && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleCancel(b._id)}>
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
