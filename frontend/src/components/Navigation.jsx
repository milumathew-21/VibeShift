import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Sparkles,
  LayoutDashboard,
  SmilePlus,
  Disc3,
  LineChart,
  Menu,
  X,
  Radio,
  FlaskConical,
} from 'lucide-react';
import { useVibeShift } from '../context/VibeShiftContext';
import { getMoodMeta } from '../config/constants';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Sparkles, end: true },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/discover', label: 'Discover Mood', icon: SmilePlus },
  { to: '/recommendations', label: 'Recommendations', icon: Disc3 },
  { to: '/journey', label: 'Mood Journey', icon: LineChart },
];

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const {
    apiMode,
    switchApiMode,
    backendStatus,
    currentMood,
    moodConfirmed,
    sessionId,
  } = useVibeShift();

  const confirmedMoodMeta = moodConfirmed ? getMoodMeta(currentMood) : null;

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="nav-header" role="banner">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div className="nav-container">
        <Link
          to="/"
          className="brand-link"
          onClick={closeMobileMenu}
          aria-label="VibeShift Home"
        >
          <span className="brand-orb-mark" aria-hidden="true">
            <Sparkles size={18} color="#1F3149" />
          </span>
          <span className="brand-name">VibeShift</span>
          <span className="brand-tag">Adaptive Audio</span>
        </Link>

        <nav className="nav-links-desktop" aria-label="Primary Navigation">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `nav-item-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={16} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          {confirmedMoodMeta && (
            <Link
              to="/discover"
              className="eyebrow-pill"
              style={{
                background: confirmedMoodMeta.badgeBg,
                borderColor: confirmedMoodMeta.borderAccent,
                textDecoration: 'none',
                padding: '0.32rem 0.78rem',
              }}
              title="Current confirmed mood — click to update"
            >
              <span
                className="status-dot"
                style={{ background: confirmedMoodMeta.accentColor }}
              />
              <span>Mood: {confirmedMoodMeta.label}</span>
              {sessionId ? (
                <span style={{ opacity: 0.72 }}>· #{sessionId}</span>
              ) : null}
            </Link>
          )}

          <div
            className="mode-toggle-group"
            role="group"
            aria-label="API Connection Mode"
          >
            <button
              type="button"
              onClick={() => switchApiMode('live')}
              className={`mode-pill-btn ${
                apiMode === 'live' ? 'active-live' : ''
              }`}
              aria-pressed={apiMode === 'live'}
              title={
                backendStatus === 'online'
                  ? 'Connected to live FastAPI backend at 127.0.0.1:8000'
                  : 'Live API mode selected (FastAPI backend currently unreachable)'
              }
            >
              <span
                className={`status-dot ${
                  backendStatus === 'online' ? 'online' : 'offline'
                }`}
              />
              <Radio size={13} aria-hidden="true" />
              <span>Live API</span>
            </button>

            <button
              type="button"
              onClick={() => switchApiMode('mock')}
              className={`mode-pill-btn ${
                apiMode === 'mock' ? 'active-mock' : ''
              }`}
              aria-pressed={apiMode === 'mock'}
              title="Standalone Demo Mode — deterministic offline showcase"
            >
              <span className="status-dot mock" />
              <FlaskConical size={13} aria-hidden="true" />
              <span>Demo Mode</span>
            </button>
          </div>

          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav
          id="mobile-navigation-drawer"
          className="mobile-nav-drawer"
          aria-label="Mobile Navigation"
        >
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
            const isActive =
              to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                onClick={closeMobileMenu}
                className={`nav-item-link ${isActive ? 'active' : ''}`}
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}

