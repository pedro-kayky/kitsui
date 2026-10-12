import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import './NavBar.css';
import kitsuiLogo from '../imgs/logo.png';

 import { supabase } from '../supaBase/supaBaseClient'

function NavBar() {
  const [darkMode, setDarkMode] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [darkMode]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigateSettings = () => {
    setShowDropdown(false);
    navigate('/settings');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setShowDropdown(false);
    window.location.reload();
  };

  const displayName = user?.user_metadata?.full_name || user?.email || 'Guest User';

  return (
    <>
      <header className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src={kitsuiLogo} alt="Kitsui Logo" className="navbar-logo-img" />
          <span className="navbar-logo-text">Kitsui</span>
        </Link>

        <nav className="navbar-menu desktop-only">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            Translator
          </NavLink>
          <NavLink to="/decks" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            Decks
          </NavLink>
          <NavLink to="/review" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            Review
          </NavLink>
          <NavLink to="/progress" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            Progress
          </NavLink>
        </nav>

        <div className="navbar-actions">
          <button
            className="icon-btn"
            onClick={() => setDarkMode(!darkMode)}
            type="button"
            aria-label="Alternar tema"
          >
            {darkMode ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4"/>
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          <div className="avatar-dropdown-container" ref={dropdownRef}>
            <button 
              className="avatar-btn" 
              onClick={() => setShowDropdown(!showDropdown)}
              type="button"
              aria-label="Menu do utilizador"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </button>

            {showDropdown && (
              <div className="avatar-dropdown-menu">
                <div className="dropdown-user-header">
                  <span className="user-name">{displayName}</span>
                  <span className="user-status">{user ? 'Google Account' : 'Free Plan'}</span>
                </div>

                <hr className="dropdown-divider" />

                <button onClick={handleNavigateSettings} className="dropdown-item">
                  ⚙️ Account & Settings
                </button>
                
                {user ? (
                  <>
                    <hr className="dropdown-divider" />
                    <button onClick={handleSignOut} className="dropdown-item logout">
                      🚪 Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <hr className="dropdown-divider" />
                    <button 
                      onClick={() => {
                        setShowDropdown(false);
                        navigate('/settings');
                      }} 
                      className="dropdown-item"
                    >
                      🔑 Sign In
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Menu Inferior Mobile */}
      <nav className="mobile-bottom-bar">
        <NavLink to="/" className={({ isActive }) => (isActive ? 'bottom-item active' : 'bottom-item')}>
          <span>Translator</span>
        </NavLink>
        <NavLink to="/decks" className={({ isActive }) => (isActive ? 'bottom-item active' : 'bottom-item')}>
          <span>Decks</span>
        </NavLink>
        <NavLink to="/review" className={({ isActive }) => (isActive ? 'bottom-item active' : 'bottom-item')}>
          <span>Review</span>
        </NavLink>
        <NavLink to="/progress" className={({ isActive }) => (isActive ? 'bottom-item active' : 'bottom-item')}>
          <span>Progress</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => (isActive ? 'bottom-item active' : 'bottom-item')}>
          <span>Profile</span>
        </NavLink>
      </nav>
    </>
  );
}

export default NavBar;