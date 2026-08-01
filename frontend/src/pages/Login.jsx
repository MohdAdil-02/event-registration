import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate(location.state?.from || '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="booth-wrap">
      <div className="booth">
        <div className="booth-window">
          <span className="eyebrow">Ticket booth</span>
          <h2>Welcome back</h2>
        </div>

        <form className="form-card" onSubmit={handleSubmit}>
          {error && <div className="form-error">{error}</div>}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-stamp btn-block" disabled={submitting}>
            {submitting ? 'Checking…' : 'Log in'}
          </button>

          <p className="muted" style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.85rem' }}>
            New here? <Link to="/register" style={{ color: 'var(--stamp)' }}>Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
