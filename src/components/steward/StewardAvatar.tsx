'use client';

/**
 * StewardAvatar - Complete 3D Avatar Component
 * Wraps the StewardOrb with Canvas, lighting, and controls
 */

import { Suspense, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Float, Sparkles } from '@react-three/drei';
import { StewardOrb, type StewardOrbState } from './StewardOrb';
import { cn } from '@/lib/utils';

export type StewardAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface StewardAvatarProps {
  state?: StewardOrbState;
  audioLevel?: number;
  size?: StewardAvatarSize;
  interactive?: boolean;
  showLabel?: boolean;
  showSparkles?: boolean;
  className?: string;
  onTouch?: () => void;
}

const SIZE_CONFIG: Record<StewardAvatarSize, { width: string; height: string; orbSize: number }> = {
  xs: { width: 'w-12', height: 'h-12', orbSize: 0.8 },
  sm: { width: 'w-16', height: 'h-16', orbSize: 1 },
  md: { width: 'w-24', height: 'h-24', orbSize: 1.2 },
  lg: { width: 'w-32', height: 'h-32', orbSize: 1.4 },
  xl: { width: 'w-48', height: 'h-48', orbSize: 1.6 },
  full: { width: 'w-full', height: 'h-full', orbSize: 2 },
};

const STATE_LABELS: Record<StewardOrbState, string> = {
  idle: 'Ready',
  listening: 'Listening...',
  thinking: 'Thinking...',
  speaking: 'Speaking...',
};

// Loading fallback
function LoadingOrb() {
  return (
    <mesh>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="#8B5CF6" opacity={0.5} transparent />
    </mesh>
  );
}

export function StewardAvatar({
  state = 'idle',
  audioLevel = 0,
  size = 'md',
  interactive = true,
  showLabel = false,
  showSparkles = true,
  className,
  onTouch,
}: StewardAvatarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const config = SIZE_CONFIG[size];

  const handlePointerDown = useCallback(() => {
    onTouch?.();
  }, [onTouch]);

  return (
    <div
      className={cn(
        'relative',
        config.width,
        config.height,
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        style={{
          background: 'transparent',
          borderRadius: '50%',
        }}
        gl={{ alpha: true, antialias: true }}
      >
        <Suspense fallback={<LoadingOrb />}>
          {/* Ambient lighting */}
          <ambientLight intensity={0.4} />

          {/* Key light */}
          <directionalLight
            position={[5, 5, 5]}
            intensity={0.8}
            color="#ffffff"
          />

          {/* Fill light with purple tint */}
          <directionalLight
            position={[-5, 0, -5]}
            intensity={0.3}
            color="#8B5CF6"
          />

          {/* Rim light */}
          <pointLight
            position={[0, 3, -3]}
            intensity={0.5}
            color="#3B82F6"
          />

          {/* Environment for reflections */}
          <Environment preset="night" />

          {/* The orb with floating animation */}
          <Float
            speed={state === 'idle' ? 2 : state === 'thinking' ? 4 : 3}
            rotationIntensity={state === 'thinking' ? 0.5 : 0.2}
            floatIntensity={state === 'idle' ? 0.5 : 0.3}
          >
            <StewardOrb
              state={state}
              audioLevel={audioLevel}
              size={config.orbSize}
              onPointerDown={handlePointerDown}
            />

            {/* Sparkles around the orb */}
            {showSparkles && (
              <Sparkles
                count={state === 'thinking' ? 100 : 50}
                scale={config.orbSize * 3}
                size={state === 'speaking' ? 3 : 2}
                speed={state === 'thinking' ? 1 : 0.3}
                color={state === 'listening' ? '#3B82F6' : '#8B5CF6'}
              />
            )}
          </Float>

          {/* Interactive controls */}
          {interactive && size !== 'xs' && size !== 'sm' && (
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={Math.PI / 1.5}
              rotateSpeed={0.5}
            />
          )}
        </Suspense>
      </Canvas>

      {/* State label */}
      {showLabel && (
        <div
          className={cn(
            'absolute -bottom-6 left-1/2 -translate-x-1/2',
            'text-xs font-medium text-muted-foreground',
            'transition-opacity duration-300',
            isHovered ? 'opacity-100' : 'opacity-70'
          )}
        >
          {STATE_LABELS[state]}
        </div>
      )}

      {/* Glow effect behind the canvas */}
      <div
        className={cn(
          'absolute inset-0 -z-10 rounded-full blur-xl opacity-30 transition-all duration-500',
          state === 'idle' && 'bg-violet-500',
          state === 'listening' && 'bg-blue-500',
          state === 'thinking' && 'bg-violet-600 animate-pulse',
          state === 'speaking' && 'bg-fuchsia-500'
        )}
      />
    </div>
  );
}

// Export types
export type { StewardOrbState };
