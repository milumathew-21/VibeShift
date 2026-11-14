import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Float,
  MeshDistortMaterial,
  Sphere,
  Torus,
  Sparkles,
} from '@react-three/drei';
import { Sparkles as SparklesIcon, Music2 } from 'lucide-react';
import { MOODS, getMoodMeta } from '../config/constants';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useWebGLSupport } from '../hooks/useWebGLSupport';

/**
 * Error boundary to safely catch any WebGL context losses without breaking the page
 */
class WebGLErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

/**
 * Inner 3D Scene rendered inside React Three Fiber <Canvas>
 */
function IridescentOrbScene({ palette, lowPower, reducedMotion }) {
  const coreRef = useRef(null);
  const outerShellRef = useRef(null);
  const ringOneRef = useRef(null);
  const ringTwoRef = useRef(null);
  const satelliteGroupRef = useRef(null);

  const [primaryColor, secondaryColor, tertiaryColor] = palette;

  useFrame((state, delta) => {
    if (reducedMotion) return;

    const pointerX = state.pointer?.x || 0;
    const pointerY = state.pointer?.y || 0;

    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.28;
      coreRef.current.rotation.x +=
        (pointerY * 0.35 - coreRef.current.rotation.x) * 0.06;
      coreRef.current.rotation.z +=
        (pointerX * 0.35 - coreRef.current.rotation.z) * 0.06;
    }

    if (outerShellRef.current) {
      outerShellRef.current.rotation.y -= delta * 0.16;
      outerShellRef.current.rotation.x += delta * 0.12;
    }

    if (ringOneRef.current) {
      ringOneRef.current.rotation.z += delta * 0.22;
      ringOneRef.current.rotation.x =
        Math.PI * 0.36 + Math.sin(state.clock.elapsedTime * 0.5) * 0.08;
    }

    if (ringTwoRef.current) {
      ringTwoRef.current.rotation.y -= delta * 0.18;
      ringTwoRef.current.rotation.z =
        -Math.PI * 0.22 + Math.cos(state.clock.elapsedTime * 0.4) * 0.08;
    }

    if (satelliteGroupRef.current) {
      satelliteGroupRef.current.rotation.y += delta * 0.32;
    }
  });

  const segments = lowPower ? 32 : 64;

  return (
    <group>
      <ambientLight intensity={1.15} color="#FFFFFF" />
      <directionalLight
        position={[4, 5, 4]}
        intensity={1.6}
        color={primaryColor}
      />
      <directionalLight
        position={[-4, -3, 3]}
        intensity={1.3}
        color={tertiaryColor}
      />
      <pointLight position={[0, 3, 2]} intensity={1.1} color={secondaryColor} />

      <Float
        speed={reducedMotion ? 0 : 1.8}
        rotationIntensity={reducedMotion ? 0 : 0.35}
        floatIntensity={reducedMotion ? 0 : 0.65}
      >
        {/* Main Iridescent Fluid Core */}
        <Sphere ref={coreRef} args={[1.28, segments, segments]}>
          <MeshDistortMaterial
            color={primaryColor}
            emissive={secondaryColor}
            emissiveIntensity={0.28}
            roughness={0.14}
            metalness={0.18}
            clearcoat={1}
            clearcoatRoughness={0.1}
            distort={reducedMotion ? 0.12 : 0.36}
            speed={reducedMotion ? 0 : 2.1}
          />
        </Sphere>

        {/* Translucent Aura Shell */}
        <Sphere ref={outerShellRef} args={[1.52, 32, 32]}>
          <meshPhysicalMaterial
            color={tertiaryColor}
            transparent
            opacity={0.22}
            roughness={0.08}
            transmission={0.65}
            thickness={0.8}
          />
        </Sphere>

        {/* Harmonic Orbital Ring 1 */}
        <Torus
          ref={ringOneRef}
          args={[1.95, 0.022, 16, lowPower ? 64 : 110]}
          rotation={[Math.PI * 0.36, 0.2, 0]}
        >
          <meshStandardMaterial
            color="#1F3149"
            emissive={primaryColor}
            emissiveIntensity={0.45}
            transparent
            opacity={0.42}
          />
        </Torus>

        {/* Harmonic Orbital Ring 2 */}
        <Torus
          ref={ringTwoRef}
          args={[2.25, 0.016, 16, lowPower ? 64 : 110]}
          rotation={[Math.PI * 0.6, -0.35, 0.2]}
        >
          <meshStandardMaterial
            color={tertiaryColor}
            emissive={tertiaryColor}
            emissiveIntensity={0.6}
            transparent
            opacity={0.55}
          />
        </Torus>

        {/* Floating Music-Inspired Satellites */}
        <group ref={satelliteGroupRef}>
          <mesh position={[1.85, 0.55, 0.4]}>
            <octahedronGeometry args={[0.14, 0]} />
            <meshStandardMaterial
              color="#FFFFFF"
              emissive={primaryColor}
              emissiveIntensity={0.6}
              roughness={0.2}
            />
          </mesh>
          <mesh position={[-1.75, -0.65, 0.55]}>
            <icosahedronGeometry args={[0.12, 0]} />
            <meshStandardMaterial
              color={tertiaryColor}
              emissive={tertiaryColor}
              emissiveIntensity={0.5}
              roughness={0.2}
            />
          </mesh>
          <mesh position={[0.35, -1.85, -0.5]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial
              color={secondaryColor}
              emissive={secondaryColor}
              emissiveIntensity={0.6}
            />
          </mesh>
        </group>
      </Float>

      {!reducedMotion && (
        <Sparkles
          count={lowPower ? 24 : 48}
          scale={4.8}
          size={2.2}
          speed={0.35}
          opacity={0.65}
          color="#1F3149"
        />
      )}
    </group>
  );
}

/**
 * Graceful Accessible Fallback when WebGL is unavailable or disabled
 */
function OrbFallbackVisual({ moodMeta }) {
  return (
    <div
      className="orb-fallback-scene"
      role="img"
      aria-label={`VibeShift mood orb tuned to ${moodMeta.label}`}
      style={{
        background: moodMeta.gradient,
      }}
    >
      <div
        style={{
          textAlign: 'center',
          padding: '1.25rem',
          color: '#1F3149',
        }}
      >
        <Music2 size={36} style={{ marginBottom: '0.4rem' }} />
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.25rem',
            fontWeight: 700,
          }}
        >
          {moodMeta.label} Aura
        </div>
        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
          {moodMeta.tagline}
        </div>
      </div>
    </div>
  );
}

export default function AnimatedMoodOrb({
  activeMood = 'calm',
  onMoodPreviewChange,
  interactivePreview = true,
}) {
  const prefersReducedMotion = useReducedMotion();
  const { supported: webglSupported, checked, lowPower } = useWebGLSupport();
  const [previewMood, setPreviewMood] = useState(activeMood || 'calm');

  const effectiveMoodId = activeMood || previewMood || 'calm';
  const moodMeta = useMemo(
    () => getMoodMeta(effectiveMoodId) || MOODS[1],
    [effectiveMoodId]
  );

  const handleChipClick = (id) => {
    setPreviewMood(id);
    if (onMoodPreviewChange) {
      onMoodPreviewChange(id);
    }
  };

  const fallbackNode = <OrbFallbackVisual moodMeta={moodMeta} />;

  return (
    <div
      className="orb-stage-wrapper"
      data-testid="animated-mood-orb"
      aria-label="Interactive 3D Mood Resonance Orb"
    >
      <div className="orb-floating-badge orb-badge-top-left">
        <SparklesIcon size={15} color="#175E57" />
        <span>Resonance: {moodMeta.label}</span>
      </div>

      <div className="orb-canvas-container">
        {checked && webglSupported ? (
          <WebGLErrorBoundary fallback={fallbackNode}>
            <Canvas
              camera={{ position: [0, 0, 4.9], fov: 45 }}
              dpr={lowPower ? [1, 1.25] : [1, 2]}
              gl={{ antialias: true, alpha: true }}
            >
              <IridescentOrbScene
                palette={moodMeta.orbPalette}
                lowPower={lowPower}
                reducedMotion={prefersReducedMotion}
              />
            </Canvas>
          </WebGLErrorBoundary>
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {fallbackNode}
          </div>
        )}
      </div>

      {interactivePreview && (
        <div
          className="orb-mood-switcher"
          role="group"
          aria-label="Preview mood color harmonies on 3D orb"
        >
          {MOODS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => handleChipClick(m.id)}
              className={`orb-mood-chip ${
                effectiveMoodId === m.id ? 'active' : ''
              }`}
              aria-pressed={effectiveMoodId === m.id}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}

      <div className="orb-floating-badge orb-badge-bottom-right">
        <div className="waveform-strip" aria-hidden="true">
          <span
            className="waveform-bar"
            style={{ height: '12px', animationDelay: '0s' }}
          />
          <span
            className="waveform-bar"
            style={{ height: '22px', animationDelay: '0.2s' }}
          />
          <span
            className="waveform-bar"
            style={{ height: '16px', animationDelay: '0.4s' }}
          />
          <span
            className="waveform-bar"
            style={{ height: '24px', animationDelay: '0.1s' }}
          />
          <span
            className="waveform-bar"
            style={{ height: '14px', animationDelay: '0.3s' }}
          />
        </div>
        <span>3D Harmonic Field</span>
      </div>
    </div>
  );
}

