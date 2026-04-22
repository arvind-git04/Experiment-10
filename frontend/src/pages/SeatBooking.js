import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';

export default function SeatBooking() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [paymentMode, setPaymentMode] = useState('card');
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    api.get(`/api/shows/${showId}`)
      .then(res => setShow(res.data))
      .catch(() => { toast.error('Show not found'); navigate('/shows'); })
      .finally(() => setLoading(false));
  }, [showId]);

  const toggleSeat = (seat) => {
    if (seat.isBooked) return;
    setSelected(prev =>
      prev.includes(seat.seatNumber)
        ? prev.filter(s => s !== seat.seatNumber)
        : [...prev, seat.seatNumber]
    );
  };

  const getTotal = () => {
    if (!show) return 0;
    return selected.reduce((sum, sn) => {
      const seat = show.seats.find(s => s.seatNumber === sn);
      return sum + (show.pricing[seat?.category] || show.pricing.standard);
    }, 0);
  };

  const handleBook = async () => {
    if (!selected.length) return toast.error('Please select at least one seat');
    setBooking(true);
    try {
      const { data } = await api.post('/api/bookings', { showId, seats: selected, paymentMode });
      toast.success(`Booking confirmed! Ref: ${data.bookingRef}`);
      navigate('/bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /> Loading seat map…</div>;
  if (!show) return null;

  // Group seats by row
  const rows = show.seats.reduce((acc, seat) => {
    const row = seat.seatNumber[0];
    if (!acc[row]) acc[row] = [];
    acc[row].push(seat);
    return acc;
  }, {});

  const formatDT = (dt) => new Date(dt).toLocaleString('en-IN', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>← Back</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
        {/* Seat map */}
        <div className="card">
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontWeight: 700, fontSize: '1.2rem' }}>{show.movie?.title}</h2>
            <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginTop: 4 }}>
              {show.screen} &nbsp;•&nbsp; {formatDT(show.showTime)}
            </div>
          </div>

          <div className="seat-map">
            <div className="seat-screen">SCREEN</div>
            {Object.entries(rows).map(([row, seats]) => (
              <div className="seat-row" key={row}>
                <span className="seat-row-label">{row}</span>
                {seats.map(seat => (
                  <button
                    key={seat.seatNumber}
                    className={`seat ${seat.category} ${seat.isBooked ? 'booked' : ''} ${selected.includes(seat.seatNumber) ? 'selected' : ''}`}
                    onClick={() => toggleSeat(seat)}
                    title={`${seat.seatNumber} (${seat.category}) - ₹${show.pricing[seat.category]}`}
                  >
                    {seat.seatNumber.slice(1)}
                  </button>
                ))}
              </div>
            ))}
          </div>

          <div className="seat-legend">
            {[
              { cls: 'standard', label: `Standard ₹${show.pricing.standard}`, color: '#4a9eff' },
              { cls: 'premium',  label: `Premium ₹${show.pricing.premium}`,   color: 'var(--warning)' },
              { cls: 'vip',      label: `VIP ₹${show.pricing.vip}`,           color: '#a855f7' },
              { cls: 'booked',   label: 'Booked',  color: 'var(--border)' },
            ].map(l => (
              <div className="legend-item" key={l.cls}>
                <div className="legend-box" style={{ borderColor: l.color, background: l.cls === 'booked' ? 'var(--surface2)' : 'transparent' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Booking summary */}
        <div className="card" style={{ position: 'sticky', top: 20 }}>
          <h3 className="card-title" style={{ marginBottom: 20 }}>🎟️ Booking Summary</h3>

          <div style={{ fontSize: '0.85rem', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span className="text-muted">Movie</span>
              <span style={{ fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{show.movie?.title}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span className="text-muted">Screen</span>
              <span>{show.screen}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span className="text-muted">Date & Time</span>
              <span style={{ textAlign: 'right', maxWidth: '60%', fontSize: '0.78rem' }}>{formatDT(show.showTime)}</span>
            </div>
          </div>

          <hr className="divider" />

          <div style={{ marginBottom: 16 }}>
            <div className="form-label">Selected Seats</div>
            {selected.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No seats selected</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {selected.map(s => (
                  <span key={s} style={{
                    background: 'var(--primary)', color: '#fff',
                    padding: '3px 10px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600
                  }}>{s}</span>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Payment Mode</label>
            <select className="form-control" value={paymentMode} onChange={e => setPaymentMode(e.target.value)}>
              <option value="card">💳 Card</option>
              <option value="upi">📱 UPI</option>
              <option value="cash">💵 Cash</option>
              <option value="wallet">👛 Wallet</option>
            </select>
          </div>

          <hr className="divider" />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' }}>
            <span style={{ fontWeight: 600 }}>Total Amount</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)' }}>
              ₹{getTotal()}
            </span>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '13px' }}
            onClick={handleBook}
            disabled={booking || selected.length === 0}
          >
            {booking ? 'Booking…' : `🎟️ Confirm Booking (${selected.length} seats)`}
          </button>
        </div>
      </div>
    </div>
  );
}
