import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { Sparkles, ShieldCheck } from 'lucide-react';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import MoodSelection from './pages/MoodSelection';
import Recommendations from './pages/Recommendations';
import MoodJourney from './pages/MoodJourney';

export default function App() {
  return (
    <div className="app-shell">
      <Navigation />

      <main id="main-content" className="app-main" role="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/discover" element={<MoodSelection />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/journey" element={<MoodJourney />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="site-footer" role="contentinfo">
        <div className="footer-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className="brand-orb-mark" style={{ width: 32, height: 32 }}>
              <Sparkles size={15} color="#1F3149" />
            </span>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                }}
              >
                VibeShift
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Your mood. Your music. Your moment.
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
            }}
          >
            <ShieldCheck size={15} color="#175E57" />
            <span>
              In-memory expression privacy · User-confirmed moods · Spotify
              Embed playback
            </span>
          </div>

          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.84rem' }}>
            <Link
              to="/dashboard"
              style={{ color: 'var(--text-navy)', textDecoration: 'none' }}
            >
              Dashboard
            </Link>
            <Link
              to="/discover"
              style={{ color: 'var(--text-navy)', textDecoration: 'none' }}
            >
              Discover Mood
            </Link>
            <Link
              to="/recommendations"
              style={{ color: 'var(--text-navy)', textDecoration: 'none' }}
            >
              Recommendations
            </Link>
            <Link
              to="/journey"
              style={{ color: 'var(--text-navy)', textDecoration: 'none' }}
            >
              Mood Journey
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

