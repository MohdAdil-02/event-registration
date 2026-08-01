import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';

export default function EventRegistrations() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await client.get(`/events/${id}/registrations`);
      setData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page container">
      <Link to="/organizer" className="muted" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
        ← back to manage events
      </Link>

      <div className="section-heading">
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.6rem)' }}>
          {data ? `Attendees — ${data.event}` : 'Attendees'}
        </h1>
        {data && <span className="muted">{data.count} registered</span>}
      </div>

      {loading && <div className="state-block muted">Loading attendee list…</div>}
      {!loading && error && (
        <div className="state-block">
          <h3>Couldn't load registrations</h3>
          <p className="muted">{error}</p>
        </div>
      )}

      {!loading && data && data.registrations.length === 0 && (
        <div className="state-block">
          <h3>No one has registered yet</h3>
        </div>
      )}

      {!loading && data && data.registrations.length > 0 && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Attendee</th>
                <th>Email</th>
                <th>Account</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {data.registrations.map((r) => (
                <tr key={r._id}>
                  <td>{r.attendeeName}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{r.attendeeEmail}</td>
                  <td>{r.user?.name || '—'}</td>
                  <td>
                    <span className={`stub-tag status-${r.status === 'confirmed' ? 'upcoming' : 'cancelled'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="muted">{r.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
