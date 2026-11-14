import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Torus } from '@react-three/drei';
import { getMoodMeta } from '../config/constants';
import { useWebGLSupport } from '../hooks/useWebGLSupport';
import { useReducedMotion } from '../hooks/useReducedMotion';

function EditorialSonicSculpture({ moodMeta }) {
  const coreRef = useRef();
  const ringOneRef = useRef();
  const ringTwoRef = useRef();

  const speedMap = {
    upbeat: 2.2,
    serene: 1.0,
    gentle: 0.75,
    dynamic: 2.7,
    grounded: 1.15,
    balanced: 1.4,
  };

  const distortMap = {
    upbeat: 0.36,
    serene: 0.22,
    gentle: 0.18,
    dynamic: 0.44,
    grounded: 0.25,
    balanced: 0.28,
  };

  const speed = speedMap[moodMeta.motionProfile] || 1.4;
  const distort = distortMap[moodMeta.motionProfile] || 0.28;

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.28 * speed;
      coreRef.current.rotation.x = Math.sin(t * 0.5) * 0.22;
    }
    if (ringOneRef.current) {
      ringOneRef.current.rotation.z += delta * 0.2 * speed;
      ringOneRef.current.rotation.x = Math.PI / 2.7 + Math.sin(t * 0.4) * 0.14;
    }
    if (ringTwoRef.current) {
      ringTwoRef.current.rotation.y -= delta * 0.16 * speed;
      ringTwoRef.current.rotation.z = Math.cos(t * 0.35) * 0.2;
    }
  });

  return (
    <group>
      <Float
        speed={speed}
        rotationIntensity={0.5}
        floatIntensity={0.85}
        floatingRange={[-0.12, 0.12]}
      >
        {/* Central Organic Sonic Sphere */}
        <Sphere ref={coreRef} args={[1.28, 64, 64]}>
          <MeshDistortMaterial
            color={moodMeta.orbColor}
            emissive={moodMeta.orbEmissive}
            emissiveIntensity={0.32}
            roughness={0.16}
            metalness={0.18}
            distort={distort}
            speed={speed * 1.15}
            clearcoat={0.95}
            clearcoatRoughness={0.12}
          />
        </Sphere>

        {/* Primary Vinyl / Acoustic Orbit Ring */}
        <Torus
          ref={ringOneRef}
          args={[1.86, 0.032, 24, 120]}
          rotation={[Math.PI / 2.6, 0.2, 0]}
        >
          <meshStandardMaterial
            color="#171717"
            roughness={0.25}
            metalness={0.65}
            transparent
            opacity={0.78}
          />
        </Torus>

        {/* Secondary Accent Resonance Ring */}
        <Torus
          ref={ringTwoRef}
          args={[2.16, 0.02, 16, 120]}
          rotation={[Math.PI / 3.4, -0.45, 0.2]}
        >
          <meshStandardMaterial
            color={moodMeta.orbSecondary || '#3577D4'}
            emissive={moodMeta.orbSecondary || '#3577D4'}
            emissiveIntensity={0.28}
            transparent
            opacity={0.62}
          />
        </Torus>
      </Float>
    </group>
  );
}

export default function AnimatedMoodOrb({
  mood = 'happy',
  height = 380,
  interactiveLabel = true,
}) {
  const webglSupported = useWebGLSupport();
  const prefersReducedMotion = useReducedMotion();
  const moodMeta = useMemo(() => getMoodMeta(mood), [mood]);

  const showFallback = !webglSupported || prefersReducedMotion;

  return (
    <div
      className="editorial-orb-stage"
      style={{
        position: 'relative',
        width: '100%',
        height: typeof height === 'number' ? `${height}px` : height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
      data-testid="animated-mood-orb"
      aria-label={`Interactive 3D mood resonance sculpture representing ${moodMeta.label}`}
    >
      {/* Editorial Studio Grid & Aura Backdrop */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: '8%',
          borderRadius: '50%',
          background: moodMeta.gradient,
          filter: 'blur(38px)',
          opacity: 0.85,
          transition: 'background 0.6s ease',
          pointerEvents: 'none',
        }}
      />

      {showFallback ? (
        <div
          className="orb-fallback"
          style={{
            position: 'relative',
            zIndex: 2,
            width: '230px',
            height: '230px',
            borderRadius: '50%',
            background: moodMeta.gradient,
            border: '2.5px solid #171717',
            boxShadow: '10px 10px 0px #171717',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '1.35rem',
          }}
        >
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#171717',
              background: '#FFFFFF',
              padding: '0.2rem 0.55rem',
              borderRadius: '999px',
              border: '1.5px solid #171717',
            }}
          >
            RESONANCE #{moodMeta.editorialNumber || '01'}
          </span>
          <strong
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.75rem',
              color: '#171717',
              marginTop: '0.45rem',
              letterSpacing: '-0.03em',
            }}
          >
            {moodMeta.label}
          </strong>
          <span
            style={{
              fontSize: '0.8rem',
              color: '#171717',
              opacity: 0.82,
              marginTop: '0.25rem',
              fontWeight: 600,
            }}
          >
            {moodMeta.tagline}
          </span>
        </div>
      ) : (
        <Suspense
          fallback={
            <div
              style={{
                width: '210px',
                height: '210px',
                borderRadius: '50%',
                background: moodMeta.gradient,
                border: '2px solid #171717',
              }}
            />
          }
        >
          <Canvas
            camera={{ position: [0, 0, 4.7], fov: 44 }}
            dpr={[1, 1.75]}
            style={{ position: 'relative', zIndex: 2 }}
          >
            <ambientLight intensity={1.35} />
            <directionalLight
              position={[4, 5, 4]}
              intensity={1.7}
              color="#FFFFFF"
            />
            <pointLight
              position={[-4, -3, 3]}
              intensity={1.25}
              color={moodMeta.orbSecondary || '#3577D4'}
            />
            <EditorialSonicSculpture moodMeta={moodMeta} />
          </Canvas>
        </Suspense>
      )}

      {interactiveLabel && (
        <div
          style={{
            position: 'absolute',
            bottom: '14px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 3,
            background: '#171717',
            color: '#F8F8E9',
            padding: '0.42rem 1rem',
            borderRadius: '999px',
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.03em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 10px 24px rgba(23, 23, 23, 0.18)',
            whiteSpace: 'nowrap',
          }}
        >
          <span
            style={{
              width: '9px',
              height: '9px',
              borderRadius: '50%',
              background: moodMeta.orbColor,
              display: 'inline-block',
            }}
          />
          <span>
            3D Sonic Field: <strong>{moodMeta.label}</strong> — {moodMeta.soundscapeTitle}
          </span>
        </div>
      )}
    </div>
  );
}
