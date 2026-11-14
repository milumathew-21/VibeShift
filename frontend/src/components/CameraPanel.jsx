import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  CameraOff,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Upload,
  FlaskConical,
} from 'lucide-react';
import {
  CAMERA_CAPTURE_WIDTH,
  CAMERA_CAPTURE_HEIGHT,
  CAMERA_JPEG_QUALITY,
  MAX_UPLOAD_BYTES,
  ETHICAL_DISCLAIMERS,
  getMoodMeta,
} from '../config/constants';
import { MOCK_EMOTION_SCENARIOS } from '../mocks/mockData';
import { estimateEmotionFromImage } from '../services/emotionService';

export default function CameraPanel({
  apiMode = 'live',
  onEstimateReceived,
  onAcceptSuggestedMood,
  onSwitchToManual,
}) {
  const [cameraState, setCameraState] = useState('idle');
  // 'idle' | 'requesting' | 'streaming' | 'captured' | 'denied' | 'unavailable'
  const [cameraErrorMsg, setCameraErrorMsg] = useState(null);
  const [snapshotUrl, setSnapshotUrl] = useState(null);
  const [snapshotBlob, setSnapshotBlob] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [estimateResult, setEstimateResult] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [mockScenarioId, setMockScenarioId] = useState('happy_success');

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Stop all active webcam tracks safely
  const stopCameraTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Ensure webcam stops when user leaves the camera component
  useEffect(() => {
    return () => {
      stopCameraTracks();
      if (snapshotUrl) {
        URL.revokeObjectURL(snapshotUrl);
      }
    };
  }, [stopCameraTracks, snapshotUrl]);

  const startCamera = async () => {
    setCameraErrorMsg(null);
    setUploadError(null);
    setEstimateResult(null);

    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setCameraState('unavailable');
      setCameraErrorMsg(
        'Camera access is not supported in this browser environment. You can upload a photo snapshot or choose your mood manually below.'
      );
      return;
    }

    setCameraState('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: CAMERA_CAPTURE_WIDTH },
          height: { ideal: CAMERA_CAPTURE_HEIGHT },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = stream;
      setCameraState('streaming');

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      const isDenied =
        err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError';
      setCameraState(isDenied ? 'denied' : 'unavailable');
      setCameraErrorMsg(
        isDenied
          ? 'Camera permission was declined. Your privacy comes first—you can select your mood manually at any time or allow camera access in browser settings.'
          : 'No usable webcam could be opened on this device. You can upload a snapshot file or choose your mood manually below.'
      );
    }
  };

  const runEmotionAnalysis = async (blobToAnalyze) => {
    if (!blobToAnalyze) return;
    setAnalyzing(true);
    setUploadError(null);

    try {
      const result = await estimateEmotionFromImage(blobToAnalyze, {
        apiMode,
        mockScenarioId,
      });
      setEstimateResult(result);
      if (onEstimateReceived) {
        onEstimateReceived(result);
      }
    } catch (err) {
      setUploadError(
        err?.message ||
          'Could not reach POST /api/emotion. Please choose your mood manually.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const captureFrame = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = CAMERA_CAPTURE_WIDTH;
    canvas.height = CAMERA_CAPTURE_HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(
      videoRef.current,
      0,
      0,
      CAMERA_CAPTURE_WIDTH,
      CAMERA_CAPTURE_HEIGHT
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setUploadError('Could not capture snapshot frame. Please try again.');
          return;
        }
        if (blob.size > MAX_UPLOAD_BYTES) {
          setUploadError(
            'Snapshot exceeds the 5 MB client upload limit. Please try again.'
          );
          return;
        }

        if (snapshotUrl) URL.revokeObjectURL(snapshotUrl);
        const previewUrl = URL.createObjectURL(blob);
        setSnapshotBlob(blob);
        setSnapshotUrl(previewUrl);
        stopCameraTracks();
        setCameraState('captured');
        runEmotionAnalysis(blob);
      },
      'image/jpeg',
      CAMERA_JPEG_QUALITY
    );
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setEstimateResult(null);

    if (file.size > MAX_UPLOAD_BYTES) {
      setUploadError(
        'Selected image exceeds the 5 MB client-side maximum upload limit.'
      );
      return;
    }

    stopCameraTracks();
    if (snapshotUrl) URL.revokeObjectURL(snapshotUrl);
    const previewUrl = URL.createObjectURL(file);
    setSnapshotBlob(file);
    setSnapshotUrl(previewUrl);
    setCameraState('captured');
    runEmotionAnalysis(file);
  };

  const handleRetake = () => {
    if (snapshotUrl) URL.revokeObjectURL(snapshotUrl);
    setSnapshotUrl(null);
    setSnapshotBlob(null);
    setEstimateResult(null);
    setUploadError(null);
    startCamera();
  };

  const handleDisableCamera = () => {
    stopCameraTracks();
    setCameraState('idle');
  };

  const suggestedMoodMeta = estimateResult?.emotion
    ? getMoodMeta(estimateResult.emotion)
    : null;

  return (
    <div className="camera-panel" data-testid="camera-panel">
      {/* Privacy Banner */}
      <div
        className="alert-banner info"
        style={{ marginBottom: '1.35rem', alignItems: 'center' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShieldCheck size={22} color="#175E57" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.88rem', color: 'var(--text-navy)' }}>
            <strong>Privacy-First Optional Camera Check:</strong>{' '}
            {ETHICAL_DISCLAIMERS.cameraPrivacy}
          </div>
        </div>
      </div>

      {/* Standalone Demo Mode Scenario Picker */}
      {apiMode === 'mock' && (
        <div
          className="alert-banner warning"
          style={{
            marginBottom: '1.35rem',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <FlaskConical size={18} color="#783652" />
            <strong style={{ fontSize: '0.9rem' }}>
              Standalone Demo Mode — Simulated `/api/emotion` Responses
            </strong>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Because Demo Mode is active, VibeShift will never fake a live AI
            prediction. Choose which documented backend status you want to preview
            when capturing or testing a frame:
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              width: '100%',
              marginTop: '0.25rem',
            }}
          >
            <label
              htmlFor="mock-emotion-scenario-select"
              style={{ fontSize: '0.82rem', fontWeight: 600, alignSelf: 'center' }}
            >
              Simulated Status:
            </label>
            <select
              id="mock-emotion-scenario-select"
              value={mockScenarioId}
              onChange={(e) => setMockScenarioId(e.target.value)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '10px',
                border: '1px solid rgba(31, 49, 73, 0.2)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                background: '#FFFFFF',
                color: '#1F3149',
              }}
            >
              {MOCK_EMOTION_SCENARIOS.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                const dummyBlob = new Blob(['demo-jpeg'], {
                  type: 'image/jpeg',
                });
                runEmotionAnalysis(dummyBlob);
              }}
            >
              <Sparkles size={14} />
              <span>Run Simulated Response</span>
            </button>
          </div>
        </div>
      )}

      {/* Viewport */}
      <div className="camera-viewport">
        {cameraState === 'streaming' && (
          <video
            ref={videoRef}
            className="camera-video mirrored"
            playsInline
            muted
            aria-label="Live webcam preview"
          />
        )}

        {cameraState === 'captured' && snapshotUrl && (
          <img
            src={snapshotUrl}
            alt="Captured facial snapshot for expression estimation"
            className="camera-snapshot-img"
          />
        )}

        {(cameraState === 'idle' ||
          cameraState === 'requesting' ||
          cameraState === 'denied' ||
          cameraState === 'unavailable') && (
          <div
            style={{
              padding: '2rem',
              textAlign: 'center',
              maxWidth: '420px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.85rem',
            }}
          >
            {cameraState === 'denied' || cameraState === 'unavailable' ? (
              <CameraOff size={42} color="#783652" />
            ) : (
              <Camera size={42} color="#1F3149" />
            )}

            <h3 style={{ fontSize: '1.25rem' }}>
              {cameraState === 'requesting'
                ? 'Requesting Camera Permission…'
                : cameraState === 'denied'
                ? 'Camera Permission Declined'
                : cameraState === 'unavailable'
                ? 'Camera Currently Unavailable'
                : 'Optional Facial Expression Check'}
            </h3>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {cameraErrorMsg ||
                'Enable your camera to take a quick 640×480 snapshot, or upload a photo. You always review and confirm your mood before continuing.'}
            </p>
          </div>
        )}
      </div>

      {/* Camera Action Controls */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0.75rem',
          marginTop: '1.35rem',
        }}
      >
        {(cameraState === 'idle' ||
          cameraState === 'denied' ||
          cameraState === 'unavailable') && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={startCamera}
          >
            <Camera size={18} />
            <span>Enable Camera</span>
          </button>
        )}

        {cameraState === 'streaming' && (
          <>
            <button
              type="button"
              className="btn btn-primary"
              onClick={captureFrame}
              disabled={analyzing}
            >
              <Camera size={18} />
              <span>Capture Snapshot</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleDisableCamera}
            >
              <CameraOff size={17} />
              <span>Turn Off Camera</span>
            </button>
          </>
        )}

        {cameraState === 'captured' && (
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleRetake}
              disabled={analyzing}
            >
              <RefreshCw size={17} />
              <span>Retake Snapshot</span>
            </button>
            {snapshotBlob && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => runEmotionAnalysis(snapshotBlob)}
                disabled={analyzing}
              >
                <Sparkles size={17} />
                <span>Re-run Analysis</span>
              </button>
            )}
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/bmp"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
          aria-label="Upload a facial snapshot image"
        />
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => fileInputRef.current?.click()}
          disabled={analyzing}
        >
          <Upload size={17} />
          <span>Upload Snapshot Image</span>
        </button>

        {onSwitchToManual && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              stopCameraTracks();
              onSwitchToManual();
            }}
          >
            Choose Mood Manually Instead
          </button>
        )}
      </div>

      {/* Loading Indicator */}
      {analyzing && (
        <div
          role="status"
          aria-live="polite"
          style={{
            marginTop: '1.35rem',
            textAlign: 'center',
            padding: '1.1rem',
            borderRadius: '16px',
            background: 'rgba(205, 247, 243, 0.45)',
            fontWeight: 600,
          }}
        >
          Analyzing facial expression in-memory via <code>POST /api/emotion</code>…
        </div>
      )}

      {/* Upload / Network Error */}
      {uploadError && (
        <div
          role="alert"
          className="alert-banner error"
          style={{ marginTop: '1.35rem' }}
        >
          <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
            <AlertCircle size={20} color="#783652" style={{ flexShrink: 0 }} />
            <div>
              <strong>Could Not Estimate Expression</strong>
              <p style={{ fontSize: '0.88rem', marginTop: '0.2rem' }}>
                {uploadError}
              </p>
              <p
                style={{
                  fontSize: '0.83rem',
                  marginTop: '0.35rem',
                  color: 'var(--text-secondary)',
                }}
              >
                Please select your mood manually below—your choice is always the
                source of truth.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Prediction Result Panel */}
      {estimateResult && !analyzing && (
        <div
          role="region"
          aria-label="Facial expression estimation result"
          style={{
            marginTop: '1.5rem',
            padding: '1.4rem',
            borderRadius: '20px',
            background: suggestedMoodMeta
              ? suggestedMoodMeta.gradient
              : 'rgba(255, 255, 255, 0.94)',
            border: '1.5px solid rgba(31, 49, 73, 0.16)',
            boxShadow: 'var(--shadow-ambient)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              marginBottom: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              {suggestedMoodMeta ? (
                <CheckCircle2 size={22} color="#175E57" />
              ) : (
                <AlertCircle size={22} color="#783652" />
              )}
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                }}
              >
                {suggestedMoodMeta
                  ? `Suggested Mood: ${suggestedMoodMeta.label}`
                  : estimateResult.statusTitle}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
              <span className="eyebrow-pill" style={{ background: '#FFFFFF' }}>
                Status: {estimateResult.status}
              </span>
              {estimateResult.status === 'success' ||
              estimateResult.status === 'low_confidence' ? (
                <span className="eyebrow-pill" style={{ background: '#FFFFFF' }}>
                  Confidence: {Math.round(estimateResult.confidence * 100)}%
                </span>
              ) : null}
            </div>
          </div>

          <p
            style={{
              fontSize: '0.92rem',
              color: 'var(--text-navy)',
              marginBottom: '0.6rem',
            }}
          >
            {estimateResult.note}
          </p>

          <p
            style={{
              fontSize: '0.84rem',
              color: 'var(--text-secondary)',
              fontStyle: 'italic',
              marginBottom: '1rem',
            }}
          >
            “{ETHICAL_DISCLAIMERS.cameraEstimate}”
          </p>

          {suggestedMoodMeta ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() =>
                  onAcceptSuggestedMood &&
                  onAcceptSuggestedMood(
                    suggestedMoodMeta.id,
                    estimateResult.confidence
                  )
                }
              >
                <CheckCircle2 size={16} />
                <span>Use Suggested Mood ({suggestedMoodMeta.label})</span>
              </button>
              {onSwitchToManual && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={onSwitchToManual}
                >
                  Choose a Different Mood Manually
                </button>
              )}
            </div>
          ) : (
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.85)',
                fontSize: '0.88rem',
                fontWeight: 600,
              }}
            >
              No automatic mood was assigned (VibeShift never silently defaults to
              neutral). Please pick the mood card below that matches how you feel.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

