import React from 'react';
import {
  BookOpen,
  Check,
  Coffee,
  Compass,
  Disc3,
  Dumbbell,
  Globe,
  Lock,
  Moon,
  Music,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { LANGUAGES, GENRES, CONTEXTS } from '../config/constants';

const CONTEXT_ICONS = {
  Sparkles,
  Coffee,
  BookOpen,
  Dumbbell,
  Compass,
  Music,
  Moon,
};

export default function PreferenceForm({
  preferences,
  onUpdatePreferences,
  onResetPreferences,
}) {
  const { language = '', genre = '', context = '' } = preferences || {};

  return (
    <div
      id="preferences-section"
      className="impact-preference-card"
      data-testid="preference-form"
    >
      <div className="impact-pref-header">
        <div>
          <span className="eyebrow">
            <Disc3 size={14} />
            CURATION PARAMETERS
          </span>
          <h3 className="impact-pref-main-title">
            Personalize Your Sonic Palette
          </h3>
          <p className="impact-pref-main-sub">
            All filters are optional. Leave a category set to “All / Any” for broader discovery across the 140-song catalogue.
          </p>
        </div>

        {(language || genre || context) && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onResetPreferences}
          >
            <RotateCcw size={14} />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* =================================================================
          1. LANGUAGE PREFERENCE (SUPPORTED + UPCOMING DISABLED)
          ================================================================= */}
      <div className="impact-pref-group">
        <div className="impact-pref-group-head">
          <div className="impact-pref-group-title">
            <span className="impact-pref-step-num">01</span>
            <Globe size={16} />
            <span>Language Catalogue</span>
          </div>
          <span className="badge badge-neutral">
            English • Malayalam • Hindi • Tamil
          </span>
        </div>

        <div
          className="impact-lang-grid"
          role="group"
          aria-label="Language Preference"
        >
          {LANGUAGES.map((lang) => {
            const isSelected = language === lang.value;
            const isDisabled = !lang.supported;

            return (
              <button
                key={lang.label}
                type="button"
                disabled={isDisabled}
                onClick={() =>
                  !isDisabled && onUpdatePreferences({ language: lang.value })
                }
                className={`impact-lang-card ${isSelected ? 'selected' : ''} ${
                  isDisabled ? 'disabled' : ''
                }`}
                aria-pressed={!isDisabled ? isSelected : undefined}
                title={
                  isDisabled
                    ? `${lang.label} — Coming soon (not in current dataset)`
                    : `Select ${lang.label}`
                }
                data-testid={`lang-option-${lang.value || 'all'}`}
              >
                <div className="impact-lang-top">
                  <span className="impact-lang-code">{lang.code || 'LANG'}</span>
                  {isDisabled ? (
                    <Lock size={13} />
                  ) : isSelected ? (
                    <span className="impact-mini-check">
                      <Check size={11} strokeWidth={3} />
                    </span>
                  ) : null}
                </div>
                <div className="impact-lang-name">{lang.label}</div>
                <div className="impact-lang-badge">{lang.badge}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* =================================================================
          2. GENRE PREFERENCE
          ================================================================= */}
      <div className="impact-pref-group">
        <div className="impact-pref-group-head">
          <div className="impact-pref-group-title">
            <span className="impact-pref-step-num">02</span>
            <Music size={16} />
            <span>Musical Genre</span>
          </div>
          <span className="badge badge-neutral">5 Core Styles</span>
        </div>

        <div
          className="impact-genre-grid"
          role="group"
          aria-label="Genre Preference"
        >
          {GENRES.map((g) => {
            const isSelected = genre === g.value;
            return (
              <button
                key={g.label}
                type="button"
                onClick={() => onUpdatePreferences({ genre: g.value })}
                className={`impact-genre-card ${isSelected ? 'selected' : ''}`}
                aria-pressed={isSelected}
                data-testid={`genre-option-${g.value || 'all'}`}
              >
                <div className="impact-genre-top">
                  <span
                    className="impact-genre-dot"
                    style={{
                      background: isSelected ? '#DFF3A3' : g.accent || '#DFF3A3',
                    }}
                  />
                  <span className="impact-genre-name">{g.label}</span>
                  {isSelected && <Check size={14} strokeWidth={2.75} />}
                </div>
                <span className="impact-genre-sub">{g.subtitle}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =================================================================
          3. LISTENING CONTEXT / ACTIVITY
          ================================================================= */}
      <div className="impact-pref-group" style={{ marginBottom: 0 }}>
        <div className="impact-pref-group-head">
          <div className="impact-pref-group-title">
            <span className="impact-pref-step-num">03</span>
            <Compass size={16} />
            <span>Listening Context & Activity</span>
          </div>
          <span className="badge badge-neutral">Optional Setting</span>
        </div>

        <div
          className="impact-context-grid"
          role="group"
          aria-label="Activity Context Preference"
        >
          {CONTEXTS.map((ctx) => {
            const isSelected = context === ctx.value;
            const Icon = CONTEXT_ICONS[ctx.icon] || Sparkles;
            return (
              <button
                key={ctx.label}
                type="button"
                onClick={() => onUpdatePreferences({ context: ctx.value })}
                className={`impact-context-chip ${isSelected ? 'selected' : ''}`}
                aria-pressed={isSelected}
                data-testid={`context-option-${ctx.value || 'all'}`}
              >
                <Icon size={15} />
                <span>{ctx.label}</span>
                {ctx.tag && (
                  <span className="impact-context-tag">{ctx.tag}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
