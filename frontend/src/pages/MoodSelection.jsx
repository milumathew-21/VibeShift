import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Camera,
  Hand,
  CheckCircle2,
  Edit3,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  FlaskConical,
} from 'lucide-react';
import { useVibeShift } from '../context/VibeShiftContext';
import { MOODS, getMoodMeta } from '../config/constants';
import ProgressIndicator from '../components/ProgressIndicator';
import MoodCard from '../components/MoodCard';
import CameraPanel from '../components/CameraPanel';
import MoodModeSelector from '../components/MoodModeSelector';
import TargetMoodSelector from '../components/TargetMoodSelector';
import PreferenceForm from '../components/PreferenceForm';

export default function MoodSelection() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    apiMode,
    switchApiMode,
    selectedMoodDraft,
    currentMood,
    moodConfirmed,
    moodSource,
    moodConfidence,
    selectMoodDraft,
    confirmMood,
    reopenMoodConfirmation,
    mode,
    setMoodMode,
    targetMood,
    setTargetMood,
    preferences,
    updatePreferences,
    startSessionAndFetchRecommendations,
    recommendationsLoading,
    setCameraEstimate,
  } = useVibeShift();

  // Input tab: 'manual' | 'camera'
  const [inputTab, setInputTab] = useState('manual');
  const [activeStep, setActiveStep] = useState(() => {
    const paramStep = Number(searchParams.get('step'));
    if (paramStep >= 1 && paramStep <= 4) return paramStep;
    return 1;
  });
  const [validationError, setValidationError] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);

  useEffect(() => {
    const paramStep = Number(searchParams.get('step'));
    if (paramStep >= 1 && paramStep <= 4) {
      setActiveStep(paramStep);
    }
  }, [searchParams]);

  const effectiveMoodId = selectedMoodDraft || currentMood;
  const effectiveMoodMeta = getMoodMeta(effectiveMoodId);
  const targetMoodMeta = getMoodMeta(targetMood);

  // Handle Manual Mood Card click
  const handleManualMoodSelect = (moodId) => {
    setValidationError(null);
    selectMoodDraft(moodId, 'manual', 1.0);
  };

  // Handle accepting a camera suggested mood
  const handleAcceptCameraSuggestion = (moodId, confidence) => {
    setValidationError(null);
    selectMoodDraft(moodId, 'camera_suggested', confidence || 1.0);
    setActiveStep(2);
  };

  // Confirm Mood button handler (Section 13)
  const handleConfirmMoodAction = () => {
    if (!effectiveMoodId) {
      setValidationError('Please select a mood that feels right first.');
      return;
    }
    confirmMood(effectiveMoodId, moodSource, moodConfidence);
    setValidationError(null);
    setActiveStep(3);
  };

  // Change Mood button handler on Confirmation Banner (Section 13)
  const handleEditMoodChoice = () => {
    reopenMoodConfirmation();
    setActiveStep(1);
  };

  // Launch Session & Fetch Recommendations (Sections 16 & 17)
  const handleLaunchSoundtrack = async () => {
    setValidationError(null);
    setSubmissionError(null);

    if (!effectiveMoodId) {
      setValidationError('Please select and confirm your current mood first.');
      setActiveStep(1);
      return;
    }

    if (!moodConfirmed) {
      confirmMood(effectiveMoodId, moodSource, moodConfidence);
    }

    if (mode === 'change' && !targetMood) {
      setValidationError(
        'Please select a target mood when Change My Mood is active.'
      );
      setActiveStep(3);
      return;
    }

    try {
      await startSessionAndFetchRecommendations({
        currentMood: effectiveMoodId,
        mode,
        targetMood: mode === 'change' ? targetMood : null,
        preferences,
        source: moodSource,
        confidence: moodConfidence,
      });
      navigate('/recommendations');
    } catch (err) {
      setSubmissionError(
        err?.message ||
          'Could not connect to the backend to start your session.'
      );
    }
  };

  return (
    <div data-testid="mood-selection-page">
      <ProgressIndicator
        currentStep={activeStep}
        maxUnlockedStep={4}
        onStepSelect={(step) => {
          if (step === 5) {
            handleLaunchSoundtrack();
          } else {
            setActiveStep(step);
          }
        }}
      />

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ marginBottom: '1.75rem' }}
      >
        <span className="eyebrow-pill" style={{ marginBottom: '0.6rem' }}>
          <Sparkles size={14} />
          <span>Mood Discovery & Personalization</span>
        </span>
        <h1 className="section-heading">How are you feeling right now?</h1>
        <p className="section-subtitle">
          “Choose what feels right. You can always change it.”
        </p>
      </motion.div>

      {validationError && (
        <div
          role="alert"
          className="alert-banner error"
          style={{ marginBottom: '1.5rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <AlertCircle size={18} color="#783652" />
            <span>{validationError}</span>
          </div>
        </div>
      )}

      {/* ====================================================================
          STEP 1: MANUAL MOOD SELECTION & OPTIONAL WEBCAM INTERFACE
         ==================================================================== */}
      <section
        style={{ marginBottom: '2.25rem' }}
        aria-labelledby="step-1-mood-heading"
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <h2 id="step-1-mood-heading" style={{ fontSize: '1.55rem' }}>
              1. Discover Your Mood
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Pick directly from our six comforting mood spaces, or use an
              optional camera snapshot.
            </p>
          </div>

          {/* Input Mode Switcher: Manual vs Camera */}
          <div
            className="mode-toggle-group"
            role="tablist"
            aria-label="Mood Input Method"
          >
            <button
              type="button"
              role="tab"
              aria-selected={inputTab === 'manual'}
              data-testid="tab-manual-mood"
              onClick={() => setInputTab('manual')}
              className={`mode-pill-btn ${
                inputTab === 'manual' ? 'active-live' : ''
              }`}
            >
              <Hand size={14} />
              <span>Manual Selection</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={inputTab === 'camera'}
              data-testid="tab-camera-mood"
              onClick={() => setInputTab('camera')}
              className={`mode-pill-btn ${
                inputTab === 'camera' ? 'active-live' : ''
              }`}
            >
              <Camera size={14} />
              <span>Optional Camera Estimate</span>
            </button>
          </div>
        </div>

        {/* Optional Camera Panel */}
        {inputTab === 'camera' && (
          <div style={{ marginBottom: '1.5rem' }}>
            <CameraPanel
              apiMode={apiMode}
              onEstimateReceived={(res) => setCameraEstimate(res)}
              onAcceptSuggestedMood={handleAcceptCameraSuggestion}
              onSwitchToManual={() => setInputTab('manual')}
            />
          </div>
        )}

        {/* Six Mood Cards (Always accessible so null/unmapped camera predictions immediately have manual choice) */}
        <div className="mood-grid">
          {MOODS.map((mood) => (
            <MoodCard
              key={mood.id}
              mood={mood}
              selected={effectiveMoodId === mood.id}
              onSelect={handleManualMoodSelect}
            />
          ))}
        </div>
      </section>

      {/* ====================================================================
          STEP 2: MOOD CONFIRMATION SCREEN (Section 13)
         ==================================================================== */}
      {effectiveMoodMeta && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
          data-testid="mood-confirmation-section"
          aria-labelledby="mood-confirm-heading"
          style={{
            marginBottom: '2.25rem',
            background: effectiveMoodMeta.gradient,
            border: moodConfirmed
              ? '2px solid #1F3149'
              : '1.5px solid rgba(31, 49, 73, 0.2)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.25rem',
            }}
          >
            <div>
              <span
                className="eyebrow-pill"
                style={{ background: '#FFFFFF', marginBottom: '0.55rem' }}
              >
                <CheckCircle2 size={14} color="#175E57" />
                <span>
                  Step 2 ·{' '}
                  {moodConfirmed
                    ? 'Mood Confirmed'
                    : 'Review & Confirm Your Mood'}
                </span>
              </span>

              <h2
                id="mood-confirm-heading"
                style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}
              >
                You’re feeling {effectiveMoodMeta.label.toLowerCase()}?
              </h2>

              <p
                style={{
                  fontSize: '0.94rem',
                  color: 'var(--text-navy)',
                  opacity: 0.88,
                }}
              >
                {moodSource === 'camera_suggested'
                  ? 'Suggested from your camera snapshot. Confirm if this feels accurate, or change it anytime.'
                  : `${effectiveMoodMeta.tagline} — confirm to lock in this mood for your soundtrack.`}
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirmMoodAction}
                data-testid="confirm-mood-btn"
              >
                <CheckCircle2 size={18} />
                <span>
                  {moodConfirmed
                    ? `Confirmed: ${effectiveMoodMeta.label}`
                    : 'Confirm Mood'}
                </span>
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleEditMoodChoice}
                data-testid="change-mood-choice-btn"
              >
                <Edit3 size={17} />
                <span>Change Mood</span>
              </button>
            </div>
          </div>
        </motion.section>
      )}

      {/* ====================================================================
          STEP 3: MATCH MY MOOD / CHANGE MY MOOD & TARGET MOOD (Section 14)
         ==================================================================== */}
      <section
        style={{ marginBottom: '2.25rem' }}
        aria-labelledby="step-3-direction-heading"
      >
        <div style={{ marginBottom: '1.15rem' }}>
          <h2 id="step-3-direction-heading" style={{ fontSize: '1.55rem' }}>
            3. Choose Your Vibe Direction
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Would you like music that matches your current mood, or music that
            helps you transition toward a target feeling?
          </p>
        </div>

        <MoodModeSelector
          mode={mode}
          onSelectMode={setMoodMode}
          currentMood={effectiveMoodId}
        />

        {mode === 'change' && (
          <TargetMoodSelector
            currentMood={effectiveMoodId}
            targetMood={targetMood}
            onSelectTargetMood={(id) => {
              setValidationError(null);
              setTargetMood(id);
            }}
          />
        )}
      </section>

      {/* ====================================================================
          STEP 4: MUSIC PREFERENCES (Section 15)
         ==================================================================== */}
      <section
        style={{ marginBottom: '2.25rem' }}
        aria-labelledby="step-4-preferences-heading"
      >
        <div style={{ marginBottom: '1.15rem' }}>
          <h2 id="step-4-preferences-heading" style={{ fontSize: '1.55rem' }}>
            4. Personalize Your Music Preferences
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Select your preferred language, genre, and current listening
            context.
          </p>
        </div>

        <PreferenceForm
          preferences={preferences}
          onChange={updatePreferences}
        />
      </section>

      {/* Submission / Network Error Banner (with honest option to switch to Demo Mode) */}
      {submissionError && (
        <div
          role="alert"
          className="alert-banner error"
          style={{
            marginBottom: '1.5rem',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <AlertCircle size={20} color="#783652" />
            <strong>Could Not Start Live Backend Session</strong>
          </div>
          <p style={{ fontSize: '0.9rem' }}>{submissionError}</p>
          {apiMode === 'live' && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.65rem',
                marginTop: '0.35rem',
              }}
            >
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  switchApiMode('mock');
                  setSubmissionError(null);
                }}
              >
                <FlaskConical size={15} />
                <span>Switch to Standalone Demo Mode</span>
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleLaunchSoundtrack}
              >
                Retry Live Backend
              </button>
            </div>
          )}
        </div>
      )}

      {/* Final Launch Summary Bar */}
      <section
        className="glass-card"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.25rem',
          background:
            'linear-gradient(135deg, rgba(205, 247, 243, 0.65) 0%, rgba(255, 255, 255, 0.94) 55%, rgba(244, 203, 217, 0.5) 100%)',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-secondary)',
            }}
          >
            Ready to Curate Your Soundtrack
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.3rem',
              fontWeight: 600,
              marginTop: '0.2rem',
            }}
          >
            {effectiveMoodMeta
              ? `Mood: ${effectiveMoodMeta.label}`
              : 'Select a mood above'}{' '}
            ·{' '}
            {mode === 'change'
              ? `Change → ${targetMoodMeta ? targetMoodMeta.label : 'Pick Target'}`
              : 'Match Mode'}{' '}
            · {preferences.language || 'All Languages'} ·{' '}
            {preferences.genre || 'Any Genre'} ·{' '}
            {preferences.context || 'Any Context'}
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>

          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={handleLaunchSoundtrack}
            disabled={
              recommendationsLoading ||
              !effectiveMoodId ||
              (mode === 'change' && !targetMood)
            }
            data-testid="launch-recommendations-btn"
          >
            <Sparkles size={18} />
            <span>
              {recommendationsLoading
                ? 'Curating Your Soundtrack…'
                : 'Get My Recommendations'}
            </span>
            <ArrowRight size={18} />
          </button>
        </div>
      </section>
    </div>
  );
}

