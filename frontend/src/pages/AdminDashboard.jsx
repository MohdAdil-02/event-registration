import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user: currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, usersRes] = await Promise.all([
        client.get('/admin/stats'),
        client.get('/admin/users'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (id, role) => {
    setUpdatingId(id);
    try {
      await client.put(`/admin/users/${id}/role`, { role });
      fetchAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user account? This cannot be undone.')) return;
    try {
      await client.delete(`/admin/users/${id}`);
      fetchAll();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page container">
      <div className="section-heading">
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)' }}>Admin panel</h1>
      </div>

      {loading && <div className="state-block muted">Loading dashboard…</div>}
      {!loading && error && (
        <div className="state-block">
          <h3>Something went wrong</h3>
          <p className="muted">{error}</p>
        </div>
      )}

      {!loading && stats && (
        <div className="stat-grid" style={{ marginBottom: '2.5rem' }}>
          <div className="stat-card">
            <div className="stat-number">{stats.totalUsers}</div>
            <div className="stat-label">Attendees</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.totalOrganizers}</div>
            <div className="stat-label">Organizers</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.totalEvents}</div>
            <div className="stat-label">Events</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.upcomingEvents}</div>
            <div className="stat-label">Upcoming</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.totalRegistrations}</div>
            <div className="stat-label">Active registrations</div>
          </div>
        </div>
      )}

      {!loading && users.length > 0 && (
        <>
          <div className="section-heading">
            <h2>Users</h2>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{u.email}</td>
                    <td>
                      <select
                        value={u.role}
                        disabled={updatingId === u._id || u._id === currentUser?.id}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        style={{
                          padding: '0.4rem 0.6rem',
                          borderRadius: '6px',
                          border: '1.5px solid var(--paper-line)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.8rem',
                        }}
                      >
                        <option value="user">user</option>
                        <option value="organizer">organizer</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(u._id)}
                        disabled={u._id === currentUser?.id}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
