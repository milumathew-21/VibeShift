import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { Disc3 } from 'lucide-react';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import MoodSelection from './pages/MoodSelection';
import Recommendations from './pages/Recommendations';
import MoodJourney from './pages/MoodJourney';

export default function App() {
  return (
    <div className="app-shell">
      <div className="ambient-backdrop" aria-hidden="true">
        <div className="ambient-blob ambient-blob--one" />
        <div className="ambient-blob ambient-blob--two" />
        <div className="ambient-blob ambient-blob--three" />
      </div>

      <Navigation />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/discover" element={<MoodSelection />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/journey" element={<MoodJourney />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="impact-footer">
        <div className="container impact-footer-inner">
          <div className="impact-footer-brand">
            <span className="nav-brand-orb" aria-hidden="true">
              <Disc3 size={16} color="#DFF3A3" />
            </span>
            <div>
              <strong>VibeShift</strong>
              <span className="impact-footer-tagline">
                Feel It. Shift It. Play It. — Adaptive Music for Your Mood.
              </span>
            </div>
          </div>

          <div className="impact-footer-links">
            <Link to="/discover">Mood Studio</Link>
            <Link to="/recommendations">Your Soundtrack</Link>
            <Link to="/journey">Mood Journey</Link>
            <span className="impact-footer-pill">
              English • Malayalam • Hindi • Tamil
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
