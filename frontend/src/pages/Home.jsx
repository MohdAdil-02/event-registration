import { useEffect, useState } from 'react';
import client from '../api/client';
import TicketCard from '../components/TicketCard';
import { formatDateParts } from '../utils/date';
import { Link } from 'react-router-dom';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => fetchEvents(), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category]);

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      const { data } = await client.get('/events', { params });
      setEvents(data.events);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const featured = events.find((e) => e.status === 'upcoming') || events[0];
  const rest = events.filter((e) => e._id !== featured?._id);
  const categories = [...new Set(events.map((e) => e.category).filter(Boolean))];

  return (
    <div className="page">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Now boarding</span>
            <h1>Find the room you're supposed to be in.</h1>
            <p>
              Browse upcoming events, claim a seat before it's gone, and keep every ticket you've
              booked in one place.
            </p>
            <div className="hero-actions">
              <a href="#listings" className="btn btn-stamp">
                Browse events
              </a>
              <Link to="/register" className="btn btn-ghost">
                Create account
              </Link>
            </div>
          </div>

          {featured && (
            <TicketCard event={featured} />
          )}
        </div>
      </section>

      <div className="container">
        <div className="section-heading" id="listings">
          <h2>All events</h2>
          <span className="muted">{events.length} on the board</span>
        </div>

        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
          <input
            type="text"
            placeholder="Search by title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: '1 1 240px',
              padding: '0.7rem 0.9rem',
              borderRadius: '6px',
              border: '1.5px solid rgba(243,238,224,0.3)',
              background: 'rgba(243,238,224,0.06)',
              color: 'var(--paper)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
            }}
          />
          {categories.length > 0 && (
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                padding: '0.7rem 0.9rem',
                borderRadius: '6px',
                border: '1.5px solid rgba(243,238,224,0.3)',
                background: 'rgba(243,238,224,0.06)',
                color: 'var(--paper)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
              }}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>

        {loading && <div className="state-block muted">Fetching the board…</div>}

        {!loading && error && (
          <div className="state-block">
            <h3>Couldn't reach the box office</h3>
            <p className="muted">{error}</p>
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="state-block">
            <h3>Nothing on the board yet</h3>
            <p className="muted">Check back soon, or ask an organizer to list an event.</p>
          </div>
        )}

        {!loading && !error && rest.length > 0 && (
          <div className="event-grid">
            {rest.map((event) => (
              <TicketCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
