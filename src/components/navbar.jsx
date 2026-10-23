import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import './navbar.css';
import axios from 'axios';
import { User, LogOut, Sparkles, ChevronRight, Shield } from 'lucide-react';

export function Navbar({ user, setUser, token, setToken }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Optimized passive scroll listener
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Robust hash/section navigation across all routes
  const handleNavClick = (e, targetHash) => {
    closeMenu();
    if (!targetHash) return;

    if (targetHash === '#home' || targetHash === '/') {
      if (location.pathname === '/') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        e.preventDefault();
        navigate('/');
      }
      return;
    }

    if (location.pathname === '/') {
      const targetId = targetHash.replace('#', '');
      const el = document.getElementById(targetId);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      e.preventDefault();
      navigate(`/${targetHash}`);
    }
  };

  async function handleLogout() {
    try {
      await axios.post(
        'http://localhost:5500/api/v1/auth/sign-out',
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error('Sign-out request failed:', error);
    } finally {
      setUser(null);
      setToken(null);
      closeMenu();
      navigate('/');
    }
  }

  // Parse clean display name
  const rawName = typeof user === 'string'
    ? user
    : (user?.username || user?.name || user?.email || 'Client');
  const displayName = rawName.includes('@') ? rawName.split('@')[0] : rawName;
  const initial = displayName.charAt(0).toUpperCase() || 'C';

  const isAdmin =
    user === 'admin' ||
    user?.role === 'admin' ||
    user?.role === 'Admin' ||
    user?.isAdmin === true ||
    user?.email?.toLowerCase().includes('admin');

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''} ${isMenuOpen ? 'menu-active' : ''}`}>
        <div className="navbar-container">
          {/* Brand Logo */}
          <Link
            to="/"
            className="nav-brand"
            onClick={(e) => handleNavClick(e, '#home')}
          >
            <span className="brand-light">CINEMATIC</span>
            <span className="brand-dot"></span>
            <span className="brand-bold">EYE</span>
          </Link>

          {/* Central Floating Dock */}
          <div
            className={`nav-menu-wrapper ${isMenuOpen ? 'open' : ''}`}
            onClick={(e) => {
              if (e.target === e.currentTarget) closeMenu();
            }}
          >
            <div className="nav-dock">
              {/* Mobile Profile Card */}
              {user && (
                <div className="mobile-profile-wrapper">
                  <Link to="/profile" className="mobile-profile-card" onClick={closeMenu}>
                    <div className="mobile-avatar">
                      <span>{initial}</span>
                      <span className="mobile-status-dot"></span>
                    </div>
                    <div className="mobile-profile-info">
                      <span className="mobile-profile-label">Signed in as</span>
                      <span className="mobile-profile-name">{displayName}</span>
                    </div>
                    <ChevronRight size={16} className="mobile-profile-arrow" />
                  </Link>
                </div>
              )}

              <ul className="nav-links">
                <li style={{ '--index': 1 }}>
                  <a
                    href="#home"
                    className="nav-link"
                    onClick={(e) => handleNavClick(e, '#home')}
                  >
                    <span className="nav-link-inner">
                      <span className="nav-link-text">Home</span>
                      <span className="nav-link-text hover-text">Home</span>
                    </span>
                  </a>
                </li>
                <li style={{ '--index': 2 }}>
                  <a
                    href="#work"
                    className="nav-link"
                    onClick={(e) => handleNavClick(e, '#work')}
                  >
                    <span className="nav-link-inner">
                      <span className="nav-link-text">Work</span>
                      <span className="nav-link-text hover-text">Work</span>
                    </span>
                  </a>
                </li>
                <li style={{ '--index': 3 }}>
                  <Link
                    to="/about"
                    className="nav-link"
                    onClick={closeMenu}
                  >
                    <span className="nav-link-inner">
                      <span className="nav-link-text">About</span>
                      <span className="nav-link-text hover-text">About</span>
                    </span>
                  </Link>
                </li>
                <li style={{ '--index': 4 }}>
                  <a
                    href="#contact"
                    className="nav-link"
                    onClick={(e) => handleNavClick(e, '#contact')}
                  >
                    <span className="nav-link-inner">
                      <span className="nav-link-text">Contact</span>
                      <span className="nav-link-text hover-text">Contact</span>
                    </span>
                  </a>
                </li>
                
                {isAdmin && (
                  <li style={{ '--index': 5 }}>
                    <Link to="/admin" className="nav-link" onClick={closeMenu}>
                      <span className="nav-link-inner">
                        <span className="nav-link-text" style={{ color: '#d4af37' }}>Admin</span>
                        <span className="nav-link-text hover-text" style={{ color: '#d4af37' }}>Admin</span>
                      </span>
                    </Link>
                  </li>
                )}

                <li style={{ '--index': isAdmin ? 6 : 5 }}>
                  <Link to={user ? '/booking' : '/login'} className="nav-link" onClick={closeMenu}>
                    <span className="nav-link-inner">
                      <span className="nav-link-text" style={{ color: 'var(--accent)' }}>Book Session</span>
                      <span className="nav-link-text hover-text" style={{ color: 'var(--accent)' }}>Book Session</span>
                    </span>
                  </Link>
                </li>

                {user && (
                  <li className="mobile-logout-li" style={{ '--index': 6 }}>
                    <button onClick={handleLogout} className="mobile-logout-btn">
                      <LogOut size={16} />
                      <span>Log Out</span>
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Right Action Cluster */}
          <div className="nav-right-cluster">
            <div className="nav-right">
              {user ? (
                <div className="nav-auth-group">
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="nav-profile-pill"
                      style={{
                        borderColor: 'rgba(212, 175, 55, 0.4)',
                        background: 'rgba(212, 175, 55, 0.08)',
                        gap: '6px',
                        padding: '6px 12px',
                      }}
                      title="Open Studio Admin Panel"
                    >
                      <Shield size={13} color="#d4af37" />
                      <span
                        style={{
                          fontSize: '11px',
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          color: '#d4af37',
                          fontWeight: 600,
                        }}
                      >
                        Admin
                      </span>
                    </Link>
                  )}

                  {/* Designer Luxury Profile Button */}
                  <Link to="/profile" className="nav-profile-pill" title="View Client Profile & Sessions">
                    <div className="nav-profile-avatar">
                      <span className="avatar-initial">{initial}</span>
                      <span className="avatar-status-dot"></span>
                    </div>
                    <div className="nav-profile-details">
                      <span className="nav-profile-label">Client</span>
                      <span className="nav-profile-name">{displayName}</span>
                    </div>
                    <Sparkles size={13} className="nav-profile-sparkle" />
                  </Link>

                  {/* Subtle Sign Out Button */}
                  <button
                    onClick={handleLogout}
                    className="nav-signout-btn"
                    title="Sign out of account"
                    aria-label="Sign out"
                  >
                    <LogOut size={15} />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="nav-login" onClick={closeMenu}>
                  <span>Login</span>
                </Link>
              )}
            </div>

            {/* Hamburger Menu Toggle */}
            <button
              className="nav-toggle-btn"
              onClick={toggleMenu}
              aria-expanded={isMenuOpen}
              aria-label="Toggle navigation menu"
            >
              <div className="hamburger-box">
                <span className="hamburger-line top"></span>
                <span className="hamburger-line mid"></span>
                <span className="hamburger-line bot"></span>
              </div>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}