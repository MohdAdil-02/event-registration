import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { formatDateParts } from '../utils/date';

export default function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await client.get('/registrations/my');
      setRegistrations(data.registrations);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this registration?')) return;
    setCancellingId(id);
    try {
      await client.delete(`/registrations/${id}`);
      fetchRegistrations();
    } catch (err) {
      setError(err.message);
    } finally {
      setCancellingId(null);
    }
  };

  const confirmed = registrations.filter((r) => r.status === 'confirmed');

  return (
    <div className="page container">
      <div className="section-heading">
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)' }}>Your tickets</h1>
        <span className="muted">{confirmed.length} active</span>
      </div>

      {loading && <div className="state-block muted">Pulling your stubs…</div>}
      {!loading && error && (
        <div className="state-block">
          <h3>Couldn't load your tickets</h3>
          <p className="muted">{error}</p>
        </div>
      )}

      {!loading && !error && confirmed.length === 0 && (
        <div className="state-block">
          <h3>No tickets yet</h3>
          <p className="muted">Once you register for an event, it'll show up here.</p>
          <Link to="/" className="btn btn-stamp" style={{ marginTop: '1rem' }}>
            Browse events
          </Link>
        </div>
      )}

      <div className="event-grid">
        {confirmed.map((reg) => {
          if (!reg.event) return null;
          const { month, day, year } = formatDateParts(reg.event.date);
          return (
            <div className="ticket-card" key={reg._id} style={{ cursor: 'default' }}>
              <div className="ticket-main">
                <span className="eyebrow">Confirmed</span>
                <h3 className="ticket-title">{reg.event.title}</h3>
                <div className="ticket-meta">
                  <span>📍 {reg.event.location}</span>
                </div>
                <p className="ticket-desc">Booked for {reg.attendeeName} ({reg.attendeeEmail})</p>
                <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem' }}>
                  <Link to={`/events/${reg.event._id}`} className="btn btn-ghost btn-sm">
                    View event
                  </Link>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleCancel(reg._id)}
                    disabled={cancellingId === reg._id}
                  >
                    {cancellingId === reg._id ? 'Cancelling…' : 'Cancel'}
                  </button>
                </div>
              </div>
              <div className="ticket-stub">
                <span className="stub-month">{month}</span>
                <span className="stub-day">{day}</span>
                <span className="stub-year">{year}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
