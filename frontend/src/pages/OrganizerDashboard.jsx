import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatDateParts } from '../utils/date';

const emptyForm = {
  title: '',
  description: '',
  category: '',
  date: '',
  location: '',
  capacity: 50,
};

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await client.get('/events', { params: { limit: 100 } });
      const mine =
        user?.role === 'admin'
          ? data.events
          : data.events.filter((e) => e.organizer?._id === user?.id);
      setEvents(mine);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await client.post('/events', { ...form, capacity: Number(form.capacity) });
      setForm(emptyForm);
      setShowForm(false);
      fetchEvents();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event and all its registrations?')) return;
    try {
      await client.delete(`/events/${id}`);
      fetchEvents();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page container">
      <div className="section-heading">
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)' }}>Manage events</h1>
        <button className="btn btn-stamp btn-sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Close' : 'New event'}
        </button>
      </div>

      {showForm && (
        <form className="form-card" onSubmit={handleCreate} style={{ maxWidth: '640px', marginBottom: '2rem' }}>
          {formError && <div className="form-error">{formError}</div>}

          <div className="field">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="field">
              <label htmlFor="category">Category</label>
              <input
                id="category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Technology, Music…"
              />
            </div>
            <div className="field">
              <label htmlFor="capacity">Capacity</label>
              <input
                id="capacity"
                type="number"
                min="1"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                required
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="field">
              <label htmlFor="date">Date &amp; time</label>
              <input
                id="date"
                type="datetime-local"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="location">Location</label>
              <input
                id="location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-stamp btn-block" disabled={submitting}>
            {submitting ? 'Publishing…' : 'Publish event'}
          </button>
        </form>
      )}

      {loading && <div className="state-block muted">Loading your events…</div>}
      {!loading && error && (
        <div className="state-block">
          <h3>Couldn't load events</h3>
          <p className="muted">{error}</p>
        </div>
      )}
      {!loading && !error && events.length === 0 && (
        <div className="state-block">
          <h3>You haven't listed anything yet</h3>
          <p className="muted">Publish your first event to see it here.</p>
        </div>
      )}

      {!loading && events.length > 0 && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Date</th>
                <th>Seats</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => {
                const { month, day, year } = formatDateParts(event.date);
                return (
                  <tr key={event._id}>
                    <td>{event.title}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>
                      {month} {day}, {year}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>
                      {event.seatsBooked}/{event.capacity}
                    </td>
                    <td>
                      <span className={`stub-tag status-${event.status}`}>{event.status}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link to={`/organizer/events/${event._id}/registrations`} className="btn btn-ghost btn-sm">
                          Registrations
                        </Link>
                        <Link to={`/organizer/events/${event._id}/edit`} className="btn btn-ghost btn-sm">
                          Edit
                        </Link>
                        <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(event._id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
