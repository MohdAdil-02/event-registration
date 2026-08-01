import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container state-block" style={{ marginTop: '4rem' }}>
      <span className="eyebrow">Gate closed</span>
      <h2 style={{ marginTop: '0.6rem' }}>This page isn't on the board</h2>
      <p className="muted">The link may be old, or the page never existed.</p>
      <Link to="/" className="btn btn-stamp" style={{ marginTop: '1rem' }}>
        Back to events
      </Link>
    </div>
  );
}
