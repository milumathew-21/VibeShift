import React, { useState, useRef, useEffect } from 'react';
import {
  AlertCircle,
  Camera,
  CameraOff,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Upload,
} from 'lucide-react';
import { estimateEmotionFromImage } from '../services/emotionService';
import { MOCK_EMOTION_SCENARIOS } from '../mocks/mockData';
import { getMoodMeta } from '../config/constants';

export default function CameraPanel({
  apiMode = 'mock',
  onEmotionDetected,
  onSwitchToManual,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedMockScenario, setSelectedMockScenario] =
    useState('happy_success');
  const [result, setResult] = useState(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    setResult(null);

    if (
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== 'function'
    ) {
      setCameraError(
        'Webcam access is not supported in this browser environment. You can upload a photo or choose your mood manually below.'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setCameraError(
        err?.name === 'NotAllowedError'
          ? 'Camera permission was declined. That is completely fine — you can select your mood manually or upload an image.'
          : 'Could not open webcam stream. You can upload an image or use manual mood selection.'
      );
    }
  };

  const handleAnalyzeBlob = async (blob) => {
    setAnalyzing(true);
    setCameraError(null);
    try {
      const response = await estimateEmotionFromImage(blob, {
        apiMode,
        scenarioId: selectedMockScenario,
      });
      setResult(response);
      if (onEmotionDetected) {
        onEmotionDetected(response);
      }
    } catch (err) {
      setCameraError(
        err?.message ||
          'Emotion estimation service could not process the image. Please select your mood manually.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const captureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) {
      handleAnalyzeBlob(new Blob(['simulated-frame'], { type: 'image/jpeg' }));
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          handleAnalyzeBlob(blob);
        } else {
          handleAnalyzeBlob(
            new Blob(['fallback-frame'], { type: 'image/jpeg' })
          );
        }
      },
      'image/jpeg',
      0.88
    );
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleAnalyzeBlob(file);
  };

  const detectedMoodMeta = result?.emotion ? getMoodMeta(result.emotion) : null;

  return (
    <div
      className="impact-camera-card"
      data-testid="camera-panel"
    >
      <div className="impact-camera-head">
        <div>
          <span className="badge badge-accent" style={{ marginBottom: '0.55rem' }}>
            <ShieldCheck size={13} />
            Optional & Privacy-First
          </span>
          <h3 className="impact-camera-title">
            Camera Expression Check-In
          </h3>
          <p className="impact-camera-sub">
            Your photo is only used for a single expression estimate and is never stored. Facial expression is an estimate — you always confirm or change your mood before music plays.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onSwitchToManual}
        >
          Use Manual Mood Tiles
        </button>
      </div>

      {/* Demo Mode Simulation Selector (Explicitly Labelled) */}
      {apiMode === 'mock' && (
        <div
          className="impact-camera-sim-box"
          aria-label="Demo Mode Emotion API Simulator"
        >
          <div className="impact-camera-sim-title">
            <Sparkles size={15} />
            <span>
              Demo Mode Simulation Preset (Tests all{' '}
              <code>POST /api/emotion</code> response states)
            </span>
          </div>

          <div className="impact-camera-sim-controls">
            <select
              value={selectedMockScenario}
              onChange={(e) => setSelectedMockScenario(e.target.value)}
              aria-label="Select simulated emotion response"
              className="impact-select"
            >
              {MOCK_EMOTION_SCENARIOS.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={analyzing}
              onClick={() =>
                handleAnalyzeBlob(
                  new Blob(['simulated-demo-image'], { type: 'image/jpeg' })
                )
              }
              data-testid="run-simulated-emotion-btn"
            >
              {analyzing ? 'Estimating...' : 'Run Simulated Check-In'}
            </button>
          </div>
        </div>
      )}

      {/* Webcam Preview Box */}
      <div className="camera-frame">
        {cameraActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)',
            }}
          />
        ) : (
          <div className="impact-camera-idle">
            <Camera size={38} style={{ margin: '0 auto 0.75rem', opacity: 0.85 }} />
            <p className="impact-camera-idle-title">
              Webcam is currently off
            </p>
            <p className="impact-camera-idle-sub">
              Start your camera to capture a snapshot, or upload a photo file below.
            </p>
          </div>
        )}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      {/* Camera Action Buttons */}
      <div className="impact-camera-actions">
        {!cameraActive ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={startCamera}
          >
            <Camera size={17} />
            <span>Enable Camera</span>
          </button>
        ) : (
          <>
            <button
              type="button"
              className="btn btn-primary"
              disabled={analyzing}
              onClick={captureSnapshot}
            >
              <RefreshCw size={16} />
              <span>{analyzing ? 'Analyzing Frame...' : 'Capture & Estimate Mood'}</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={stopCamera}
            >
              <CameraOff size={16} />
              <span>Turn Off Camera</span>
            </button>
          </>
        )}

        <label
          className="btn btn-secondary"
          style={{ cursor: 'pointer' }}
        >
          <Upload size={16} />
          <span>Upload Photo</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {/* Camera / Permission Error */}
      {cameraError && (
        <div
          role="alert"
          className="impact-alert impact-alert--warning"
        >
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Camera Notice</strong>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.9rem' }}>
              {cameraError}
            </p>
          </div>
        </div>
      )}

      {/* Estimation Result Banner */}
      {result && (
        <div
          className={`impact-emotion-result ${
            detectedMoodMeta ? 'detected' : 'manual-needed'
          }`}
          data-testid="emotion-result-banner"
        >
          <div className="impact-emotion-result-row">
            <div>
              <div className="impact-emotion-status-line">
                {detectedMoodMeta ? (
                  <CheckCircle2 size={18} color="#171717" />
                ) : (
                  <AlertCircle size={18} color="#8B3252" />
                )}
                <strong>
                  {detectedMoodMeta
                    ? `Estimated Mood: ${detectedMoodMeta.label}`
                    : 'Manual Mood Selection Needed'}
                </strong>
                {result.status === 'success' && result.confidence > 0 && (
                  <span className="badge badge-neutral">
                    Confidence: {Math.round(result.confidence * 100)}%
                  </span>
                )}
              </div>
              <p className="impact-emotion-note">{result.note}</p>
            </div>

            {!detectedMoodMeta && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={onSwitchToManual}
              >
                Choose Mood Manually
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
