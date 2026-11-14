import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Compass,
  Disc3,
  LayoutDashboard,
  LineChart,
  Menu,
  Music2,
  Radio,
  Sparkles,
  X,
} from 'lucide-react';
import { useVibeShift } from '../context/VibeShiftContext';
import { getMoodMeta } from '../config/constants';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Sparkles, end: true },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/discover', label: 'Mood & Vibe', icon: Compass },
  { to: '/recommendations', label: 'Recommendations', icon: Music2 },
  { to: '/journey', label: 'Mood Journey', icon: LineChart },
];

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const {
    apiMode,
    toggleApiMode,
    currentMood,
    moodConfirmed,
    sessionId,
  } = useVibeShift();

  const moodMeta = currentMood ? getMoodMeta(currentMood) : null;

  return (
    <header className="nav-header">
      <div className="container nav-inner">
        <Link
          to="/"
          className="nav-brand"
          aria-label="VibeShift Home"
          onClick={() => setMobileOpen(false)}
        >
          <span className="nav-brand-orb" aria-hidden="true">
            <Disc3 size={18} color="#DFF3A3" />
          </span>
          <span>VibeShift</span>
          <span className="nav-brand-tag">STUDIO</span>
        </Link>

        <nav className="nav-links" aria-label="Primary Navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                <Icon size={15} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="nav-actions">
          {moodMeta && (
            <Link
              to="/discover"
              className="mood-pill"
              style={{
                background: moodMeta.pillColor,
                color: '#171717',
                borderColor: '#171717',
              }}
              title={
                moodConfirmed
                  ? `Confirmed mood: ${moodMeta.label}`
                  : `Selected mood: ${moodMeta.label}`
              }
            >
              <span
                className="status-dot"
                style={{ background: '#171717' }}
              />
              <span>
                {moodMeta.label}
                {moodConfirmed ? ' ✓' : ''}
              </span>
            </Link>
          )}

          {sessionId && (
            <span
              className="badge badge-neutral"
              title="Active backend or demo session ID"
            >
              Session #{sessionId}
            </span>
          )}

          <button
            type="button"
            className="api-mode-pill"
            onClick={() =>
              toggleApiMode(apiMode === 'live' ? 'mock' : 'live')
            }
            aria-label={`Current mode: ${
              apiMode === 'live' ? 'Live FastAPI' : 'Demo Mode'
            }. Click to switch.`}
            title="Switch between Standalone Demo Catalogue and Live FastAPI Server"
          >
            <span
              className={`status-dot ${apiMode === 'live' ? 'live' : 'mock'}`}
            />
            <Radio size={13} />
            <span>{apiMode === 'live' ? 'Live API' : 'Demo Mode'}</span>
          </button>

          <button
            type="button"
            className="nav-mobile-toggle"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="container">
          <nav className="nav-mobile-drawer" aria-label="Mobile Navigation">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'active' : ''}`
                  }
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
