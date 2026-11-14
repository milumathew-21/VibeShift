import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  Camera,
  CheckCircle2,
  Compass,
  Edit3,
  Hand,
  Music2,
  Sparkles,
} from 'lucide-react';
import { MOODS, getMoodMeta } from '../config/constants';
import { useVibeShift } from '../context/VibeShiftContext';
import ProgressIndicator from '../components/ProgressIndicator';
import MoodCard from '../components/MoodCard';
import CameraPanel from '../components/CameraPanel';
import MoodModeSelector from '../components/MoodModeSelector';
import TargetMoodSelector from '../components/TargetMoodSelector';
import PreferenceForm from '../components/PreferenceForm';

export default function MoodSelection() {
  const navigate = useNavigate();
  const {
    apiMode,
    currentMood,
    moodSource,
    moodConfidence,
    moodNote,
    moodConfirmed,
    mode,
    targetMood,
    preferences,
    isLoadingRecommendations,
    recommendationError,
    selectMood,
    confirmCurrentMood,
    changeMode,
    selectTargetMood,
    updatePreferences,
    resetPreferences,
    startOrUpdateListeningFlow,
  } = useVibeShift();

  const [inputTab, setInputTab] = useState('manual');
  const [localError, setLocalError] = useState(null);

  const step1Ref = useRef(null);
  const step2Ref = useRef(null);
  const step3Ref = useRef(null);
  const step4Ref = useRef(null);

  const selectedMoodMeta = currentMood ? getMoodMeta(currentMood) : null;
  const targetMoodMeta = targetMood ? getMoodMeta(targetMood) : null;

  let activeStep = 1;
  if (currentMood && !moodConfirmed) activeStep = 2;
  else if (currentMood && moodConfirmed) {
    if (mode === 'change' && !targetMood) activeStep = 3;
    else activeStep = 4;
  }

  const maxUnlockedStep = currentMood ? (moodConfirmed ? 4 : 2) : 1;

  const handleStepSelect = (stepId) => {
    const map = {
      1: step1Ref,
      2: step2Ref,
      3: step3Ref,
      4: step4Ref,
    };
    const targetRef = map[stepId];
    if (targetRef?.current && typeof targetRef.current.scrollIntoView === 'function') {
      targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleManualMoodClick = (moodId) => {
    setLocalError(null);
    selectMood(moodId, {
      source: 'manual',
      confidence: 1.0,
      note: 'Selected manually by you.',
      confirmed: false,
    });
  };

  const handleEmotionDetected = (emotionRes) => {
    setLocalError(null);
    if (emotionRes.emotion) {
      selectMood(emotionRes.emotion, {
        source: 'camera',
        confidence: emotionRes.confidence,
        note: emotionRes.note,
        confirmed: false,
      });
    }
  };

  const handleConfirmMood = () => {
    setLocalError(null);
    confirmCurrentMood();
  };

  const handleChangeMoodChoice = () => {
    setLocalError(null);
    setInputTab('manual');
    handleStepSelect(1);
  };

  const canLaunchRecommendations =
    Boolean(currentMood) &&
    (mode === 'match' || (mode === 'change' && Boolean(targetMood)));

  const handleGenerateRecommendations = async () => {
    setLocalError(null);
    if (!currentMood) {
      setLocalError('Please choose how you are feeling first.');
      return;
    }
    if (mode === 'change' && !targetMood) {
      setLocalError(
        'Please choose a target mood so we know which direction to shift your soundtrack.'
      );
      return;
    }

    try {
      await startOrUpdateListeningFlow();
      navigate('/recommendations');
    } catch (err) {
      setLocalError(
        err?.message ||
          'Unable to generate recommendations right now. Please try again.'
      );
    }
  };

  return (
    <div
      className="section impact-discover-page"
      data-testid="mood-selection-page"
    >
      <div className="container">
        {/* =================================================================
            PAGE HEADER & STEPPER
            ================================================================= */}
        <div className="impact-discover-header">
          <div className="impact-discover-header-top">
            <div>
              <span className="eyebrow">
                <Compass size={14} />
                STEP-BY-STEP SOUNDTRACK STUDIO
              </span>
              <h1 className="impact-page-title">
                How are you feeling right now?
              </h1>
              <p className="impact-page-lead">
                Every emotion is welcome here. Pick a mood tile directly or use optional camera expression estimation — you stay in complete control.
              </p>
            </div>

            <ProgressIndicator
              currentStep={activeStep}
              maxUnlockedStep={maxUnlockedStep}
              onStepSelect={handleStepSelect}
            />
          </div>
        </div>

        {/* =================================================================
            STEP 1: MANUAL MOOD SELECTION + OPTIONAL CAMERA CHECK-IN
            ================================================================= */}
        <section
          ref={step1Ref}
          aria-labelledby="step-1-heading"
          className="impact-studio-step-section"
        >
          <div className="impact-studio-step-head">
            <div className="impact-studio-step-title-wrap">
              <span className="impact-step-index-pill">STEP 01</span>
              <h2 id="step-1-heading" className="impact-step-heading">
                Select Your Current Mood
              </h2>
            </div>

            {/* Manual vs Optional Camera Mode Tabs */}
            <div
              role="tablist"
              aria-label="Mood Input Method"
              className="impact-tab-switch"
            >
              <button
                type="button"
                role="tab"
                aria-selected={inputTab === 'manual'}
                onClick={() => setInputTab('manual')}
                className={`impact-tab-btn ${inputTab === 'manual' ? 'active' : ''}`}
                data-testid="tab-manual-mood"
              >
                <Hand size={15} />
                <span>Choose Mood Manually</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={inputTab === 'camera'}
                onClick={() => setInputTab('camera')}
                className={`impact-tab-btn ${inputTab === 'camera' ? 'active' : ''}`}
                data-testid="tab-camera-mood"
              >
                <Camera size={15} />
                <span>Optional Camera Check-In</span>
              </button>
            </div>
          </div>

          {inputTab === 'camera' && (
            <div style={{ marginBottom: '2rem' }}>
              <CameraPanel
                apiMode={apiMode}
                onEmotionDetected={handleEmotionDetected}
                onSwitchToManual={() => setInputTab('manual')}
              />
            </div>
          )}

          {/* 6 Editorial Mood Tiles */}
          <div className="grid-3">
            {MOODS.map((mood) => (
              <MoodCard
                key={mood.id}
                mood={mood}
                selected={currentMood === mood.id}
                onSelect={handleManualMoodClick}
              />
            ))}
          </div>
        </section>

        {/* =================================================================
            STEP 2: MOOD CONFIRMATION STEP
            ================================================================= */}
        {selectedMoodMeta && (
          <motion.section
            ref={step2Ref}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            aria-labelledby="step-2-heading"
            className="impact-confirmation-banner"
            style={{
              background: selectedMoodMeta.gradient,
            }}
            data-testid="mood-confirmation-section"
          >
            <div className="impact-confirmation-inner">
              <div>
                <div className="impact-confirmation-badges">
                  <span className="impact-step-index-pill">STEP 02 • CONFIRMATION</span>
                  <span className="badge badge-neutral">
                    Source: {moodSource === 'camera' ? 'Camera Estimate' : 'Manual Selection'}
                  </span>
                  {moodSource === 'camera' && moodConfidence > 0 && (
                    <span className="badge badge-neutral">
                      Confidence: {Math.round(moodConfidence * 100)}%
                    </span>
                  )}
                </div>

                <h2 id="step-2-heading" className="impact-confirmation-title">
                  You’re feeling {selectedMoodMeta.label.toLowerCase()}?
                </h2>

                <p className="impact-confirmation-desc">
                  {moodNote || selectedMoodMeta.description}
                </p>
              </div>

              <div className="impact-confirmation-actions">
                <button
                  type="button"
                  onClick={handleConfirmMood}
                  className="btn btn-primary btn-lg"
                  data-testid="confirm-mood-btn"
                >
                  <CheckCircle2 size={18} />
                  <span>
                    {moodConfirmed
                      ? `Confirmed: ${selectedMoodMeta.label}`
                      : `Confirm ${selectedMoodMeta.label}`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleChangeMoodChoice}
                  className="btn btn-secondary"
                  data-testid="change-mood-choice-btn"
                >
                  <Edit3 size={16} />
                  <span>Pick Another Mood</span>
                </button>
              </div>
            </div>
          </motion.section>
        )}

        {/* =================================================================
            STEP 3: MATCH MY MOOD VS CHANGE MY MOOD
            ================================================================= */}
        <section
          ref={step3Ref}
          aria-labelledby="step-3-heading"
          className="impact-studio-step-section"
        >
          <div className="impact-studio-step-head">
            <div className="impact-studio-step-title-wrap">
              <span className="impact-step-index-pill">STEP 03</span>
              <div>
                <h2 id="step-3-heading" className="impact-step-heading">
                  Choose Your Vibe Direction
                </h2>
                <p className="impact-step-sub">
                  Would you like music that stays with how you feel right now, or music that shifts you toward a new mood?
                </p>
              </div>
            </div>
          </div>

          <MoodModeSelector mode={mode} onChangeMode={changeMode} />

          {mode === 'change' && (
            <TargetMoodSelector
              currentMood={currentMood}
              targetMood={targetMood}
              onSelectTargetMood={selectTargetMood}
            />
          )}
        </section>

        {/* =================================================================
            STEP 4: MUSIC PREFERENCES (LANGUAGE, GENRE, ACTIVITY CONTEXT)
            ================================================================= */}
        <section
          ref={step4Ref}
          aria-labelledby="step-4-heading"
          className="impact-studio-step-section"
        >
          <div className="impact-studio-step-head">
            <div className="impact-studio-step-title-wrap">
              <span className="impact-step-index-pill">STEP 04</span>
              <h2 id="step-4-heading" className="impact-step-heading">
                Personalize Your Music Preferences
              </h2>
            </div>
          </div>

          <PreferenceForm
            preferences={preferences}
            onUpdatePreferences={updatePreferences}
            onResetPreferences={resetPreferences}
          />
        </section>

        {/* =================================================================
            ERROR ALERT & STICKY / EDITORIAL LAUNCH BAR
            ================================================================= */}
        {(localError || recommendationError) && (
          <div
            role="alert"
            className="impact-alert impact-alert--error"
            style={{ marginBottom: '1.5rem' }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{localError || recommendationError}</span>
          </div>
        )}

        <div className="impact-launch-bar">
          <div className="impact-launch-summary">
            <span className="impact-launch-kicker">
              <Sparkles size={13} />
              READY TO CURATE YOUR SOUNDTRACK
            </span>
            <div className="impact-launch-headline">
              {selectedMoodMeta ? (
                <>
                  Mood: <strong>{selectedMoodMeta.label}</strong> • Mode:{' '}
                  <strong>
                    {mode === 'change'
                      ? `Change → ${
                          targetMoodMeta ? targetMoodMeta.label : 'Pick Target'
                        }`
                      : 'Match My Mood'}
                  </strong>{' '}
                  • Language:{' '}
                  <strong>{preferences.language || 'All Supported'}</strong>
                </>
              ) : (
                'Select your current mood in Step 01 above to unlock your personalized playlist.'
              )}
            </div>
          </div>

          <button
            type="button"
            disabled={!canLaunchRecommendations || isLoadingRecommendations}
            onClick={handleGenerateRecommendations}
            className="btn impact-btn-lime btn-lg"
            data-testid="launch-recommendations-btn"
          >
            <Music2 size={18} />
            <span>
              {isLoadingRecommendations
                ? 'Curating Your Soundtrack...'
                : 'Get Music Recommendations'}
            </span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
