import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isOrganizer, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="brand">
          <span className="brand-mark">▮</span>Event Hub
        </NavLink>

        <nav className="nav-links">
          <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Events
          </NavLink>

          {user && (
            <NavLink
              to="/my-registrations"
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              My tickets
            </NavLink>
          )}

          {isOrganizer && (
            <NavLink
              to="/organizer"
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              Manage events
            </NavLink>
          )}

          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              Admin
            </NavLink>
          )}

          {user ? (
            <>
              <span className="nav-role">{user.role}</span>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav-link">
                Log in
              </NavLink>
              <NavLink to="/register" className="btn btn-stamp btn-sm">
                Sign up
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
