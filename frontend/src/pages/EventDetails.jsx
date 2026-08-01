import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import SeatGauge from '../components/SeatGauge';
import { formatFullDate, formatDateParts } from '../utils/date';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ attendeeName: '', attendeeEmail: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (user) {
      setForm((f) => ({ ...f, attendeeName: user.name, attendeeEmail: user.email }));
    }
  }, [user]);

  const fetchEvent = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await client.get(`/events/${id}`);
      setEvent(data.event);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await client.post('/registrations', { eventId: id, ...form });
      setSuccess('You are booked. Find it under "My tickets".');
      fetchEvent();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this event and all its registrations? This cannot be undone.')) return;
    try {
      await client.delete(`/events/${id}`);
      navigate('/organizer');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="container state-block muted">Reading the ticket stub…</div>;
  if (error || !event)
    return (
      <div className="container state-block">
        <h3>This event isn't on the board</h3>
        <p className="muted">{error || 'It may have been removed.'}</p>
        <Link to="/" className="btn btn-ghost" style={{ marginTop: '1rem' }}>
          Back to events
        </Link>
      </div>
    );

  const seatsAvailable = event.capacity - event.seatsBooked;
  const isOwner = user && event.organizer?._id === user.id;
  const canManage = isOwner || user?.role === 'admin';
  const soldOut = seatsAvailable <= 0;
  const closed = event.status === 'cancelled' || event.status === 'completed';
  const { month, day, year } = formatDateParts(event.date);

  return (
    <div className="page container">
      <Link to="/" className="muted" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
        ← back to board
      </Link>

      <div className="ticket-card" style={{ marginTop: '1rem', cursor: 'default' }}>
        <div className="ticket-main">
          <span className="eyebrow">{event.category || 'General'}</span>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)' }}>{event.title}</h1>
          <p className="muted" style={{ marginTop: '0.6rem' }}>{formatFullDate(event.date)}</p>
          <p style={{ marginTop: '1rem', color: 'var(--ink-soft)' }}>{event.description}</p>
          <div className="ticket-meta">
            <span>📍 {event.location}</span>
            <span>Hosted by {event.organizer?.name || 'Organizer'}</span>
          </div>
          <SeatGauge capacity={event.capacity} seatsBooked={event.seatsBooked} />

          {canManage && (
            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.4rem' }}>
              <Link to={`/organizer/events/${event._id}/edit`} className="btn btn-ghost btn-sm">
                Edit event
              </Link>
              <Link to={`/organizer/events/${event._id}/registrations`} className="btn btn-ghost btn-sm">
                View registrations
              </Link>
              <button className="btn btn-outline-danger btn-sm" onClick={handleDelete}>
                Delete
              </button>
            </div>
          )}
        </div>
        <div className="ticket-stub">
          <span className="stub-month">{month}</span>
          <span className="stub-day">{day}</span>
          <span className="stub-year">{year}</span>
          <span className={`stub-tag status-${event.status}`}>{event.status}</span>
        </div>
      </div>

      <div className="section-heading">
        <h2>Claim your seat</h2>
      </div>

      {!user && (
        <div className="state-block">
          <h3>Log in to register</h3>
          <p className="muted">You'll need an account to claim a seat for this event.</p>
          <Link to="/login" className="btn btn-stamp" style={{ marginTop: '1rem' }}>
            Log in
          </Link>
        </div>
      )}

      {user && closed && (
        <div className="state-block">
          <h3>Registration closed</h3>
          <p className="muted">This event is {event.status} and no longer accepting registrations.</p>
        </div>
      )}

      {user && !closed && (
        <form className="form-card" onSubmit={handleRegister} style={{ maxWidth: '520px' }}>
          {formError && <div className="form-error">{formError}</div>}
          {success && <div className="form-success">{success}</div>}

          <div className="field">
            <label htmlFor="attendeeName">Attendee name</label>
            <input
              id="attendeeName"
              type="text"
              value={form.attendeeName}
              onChange={(e) => setForm({ ...form, attendeeName: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="attendeeEmail">Attendee email</label>
            <input
              id="attendeeEmail"
              type="email"
              value={form.attendeeEmail}
              onChange={(e) => setForm({ ...form, attendeeEmail: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="notes">Notes (optional)</label>
            <textarea
              id="notes"
              placeholder="Dietary needs, accessibility requests, etc."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-stamp btn-block" disabled={submitting || soldOut}>
            {soldOut ? 'Sold out' : submitting ? 'Booking…' : 'Confirm registration'}
          </button>
        </form>
      )}
    </div>
  );
}
