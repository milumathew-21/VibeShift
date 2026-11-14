import React from 'react';
import {
  Globe2,
  Music,
  Sparkles,
  Guitar,
  Piano,
  Disc,
  Coffee,
  BookOpen,
  Activity,
  Navigation,
  PartyPopper,
  Moon,
  Clock,
  Check,
} from 'lucide-react';
import { LANGUAGES, GENRES, CONTEXTS } from '../config/constants';

const GENRE_ICONS = {
  Music,
  Sparkles,
  Guitar,
  Piano,
  Disc,
};

const CONTEXT_ICONS = {
  Coffee,
  BookOpen,
  Activity,
  Navigation,
  PartyPopper,
  Moon,
};

export default function PreferenceForm({ preferences, onChange }) {
  const { language, genre, context } = preferences;

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}
      data-testid="preference-form"
    >
      {/* 1. Language Selection */}
      <section className="glass-card" aria-labelledby="pref-lang-heading">
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            marginBottom: '1.15rem',
          }}
        >
          <div>
            <span className="eyebrow-pill" style={{ marginBottom: '0.4rem' }}>
              <Globe2 size={13} />
              <span>Step 1 · Language Palette</span>
            </span>
            <h3 id="pref-lang-heading" style={{ fontSize: '1.35rem' }}>
              Preferred Music Language
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Malayalam, Hindi, English, and Tamil are active in the current
              VibeShift catalogue.
            </p>
          </div>

          <button
            type="button"
            className={`btn btn-sm ${
              language === null ? 'btn-primary' : 'btn-secondary'
            }`}
            onClick={() => onChange({ language: null })}
            aria-pressed={language === null}
          >
            All Supported Languages
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '0.9rem',
          }}
        >
          {LANGUAGES.map((lang) => {
            const isSelected = language === lang.value;
            const isDisabled = !lang.supported;

            return (
              <button
                key={lang.value}
                type="button"
                disabled={isDisabled}
                data-testid={`lang-option-${lang.value}`}
                onClick={() =>
                  lang.supported && onChange({ language: lang.value })
                }
                aria-pressed={isSelected}
                style={{
                  textAlign: 'left',
                  padding: '1.1rem 1.2rem',
                  borderRadius: '18px',
                  border: isSelected
                    ? '2px solid #1F3149'
                    : '1.5px solid rgba(31, 49, 73, 0.1)',
                  background: isSelected
                    ? 'linear-gradient(135deg, #CDF7F3 0%, #C8F4E8 55%, #BFD6F5 100%)'
                    : isDisabled
                    ? 'rgba(247, 250, 252, 0.6)'
                    : '#FFFFFF',
                  opacity: isDisabled ? 0.62 : 1,
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.15rem',
                      fontWeight: 600,
                      color: '#1F3149',
                    }}
                  >
                    {lang.label}
                  </span>
                  <span
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {lang.nativeName}
                  </span>
                </div>

                <span
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {lang.region}
                </span>

                {isDisabled ? (
                  <span
                    style={{
                      marginTop: '0.25rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: '#783652',
                    }}
                  >
                    <Clock size={12} />
                    <span>{lang.comingSoonNote}</span>
                  </span>
                ) : isSelected ? (
                  <span
                    style={{
                      marginTop: '0.25rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#175E57',
                    }}
                  >
                    <Check size={14} />
                    <span>Active filter</span>
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Genre Selection */}
      <section className="glass-card" aria-labelledby="pref-genre-heading">
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            marginBottom: '1.15rem',
          }}
        >
          <div>
            <span className="eyebrow-pill" style={{ marginBottom: '0.4rem' }}>
              <Music size={13} />
              <span>Step 2 · Sonic Texture</span>
            </span>
            <h3 id="pref-genre-heading" style={{ fontSize: '1.35rem' }}>
              Preferred Genre
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Shape the musical instrumentation and arrangement style.
            </p>
          </div>

          <button
            type="button"
            className={`btn btn-sm ${
              genre === null ? 'btn-primary' : 'btn-secondary'
            }`}
            onClick={() => onChange({ genre: null })}
            aria-pressed={genre === null}
          >
            Any Genre
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(195px, 1fr))',
            gap: '0.9rem',
          }}
        >
          {GENRES.map((g) => {
            const isSelected = genre === g.value;
            const Icon = GENRE_ICONS[g.icon] || Music;

            return (
              <button
                key={g.value}
                type="button"
                data-testid={`genre-option-${g.value}`}
                onClick={() => onChange({ genre: g.value })}
                aria-pressed={isSelected}
                style={{
                  textAlign: 'left',
                  padding: '1.15rem',
                  borderRadius: '18px',
                  border: isSelected
                    ? '2px solid #1F3149'
                    : '1.5px solid rgba(31, 49, 73, 0.1)',
                  background: isSelected
                    ? 'linear-gradient(135deg, #C8F4E8 0%, #CDF7F3 55%, #F4CBD9 100%)'
                    : '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Icon size={20} color="#1F3149" />
                  {isSelected && <Check size={16} color="#1F3149" />}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.12rem',
                    fontWeight: 600,
                    color: '#1F3149',
                  }}
                >
                  {g.label}
                </div>
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.45,
                  }}
                >
                  {g.description}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Listening Context Selection */}
      <section className="glass-card" aria-labelledby="pref-context-heading">
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            marginBottom: '1.15rem',
          }}
        >
          <div>
            <span className="eyebrow-pill" style={{ marginBottom: '0.4rem' }}>
              <Coffee size={13} />
              <span>Step 3 · Activity & Moment</span>
            </span>
            <h3 id="pref-context-heading" style={{ fontSize: '1.35rem' }}>
              Listening Context
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Tell VibeShift what your surroundings or activity look like right
              now.
            </p>
          </div>

          <button
            type="button"
            className={`btn btn-sm ${
              context === null ? 'btn-primary' : 'btn-secondary'
            }`}
            onClick={() => onChange({ context: null })}
            aria-pressed={context === null}
          >
            Any Context
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))',
            gap: '0.9rem',
          }}
        >
          {CONTEXTS.map((ctx) => {
            const isSelected = context === ctx.value;
            const Icon = CONTEXT_ICONS[ctx.icon] || Coffee;

            return (
              <button
                key={ctx.value}
                type="button"
                data-testid={`context-option-${ctx.value}`}
                onClick={() => onChange({ context: ctx.value })}
                aria-pressed={isSelected}
                style={{
                  textAlign: 'left',
                  padding: '1.1rem',
                  borderRadius: '18px',
                  border: isSelected
                    ? '2px solid #1F3149'
                    : '1.5px solid rgba(31, 49, 73, 0.1)',
                  background: isSelected
                    ? 'linear-gradient(135deg, #BFD6F5 0%, #CDF7F3 55%, #C8F4E8 100%)'
                    : '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Icon size={20} color="#1F3149" />
                  {isSelected && <Check size={16} color="#1F3149" />}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: '#1F3149',
                  }}
                >
                  {ctx.label}
                </div>
                <div
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.45,
                  }}
                >
                  {ctx.description}
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

