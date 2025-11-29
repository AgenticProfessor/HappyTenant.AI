'use client';

/**
 * StewardOrb - 3D Animated Avatar for Steward AI
 * An interactive glowing orb that responds to state changes and user interaction
 */

import { useRef, useMemo, useEffect } from 'react';
import { useFrame, extend, type ThreeEvent } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Steward states
export type StewardOrbState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'proactive';

// Color configurations per state
const STATE_COLORS = {
  idle: {
    primary: new THREE.Color('#8B5CF6'),    // Violet-500
    secondary: new THREE.Color('#3B82F6'),   // Blue-500
    glow: new THREE.Color('#C4B5FD'),        // Violet-300
  },
  listening: {
    primary: new THREE.Color('#3B82F6'),     // Blue-500
    secondary: new THREE.Color('#06B6D4'),   // Cyan-500
    glow: new THREE.Color('#93C5FD'),        // Blue-300
  },
  thinking: {
    primary: new THREE.Color('#7C3AED'),     // Violet-600
    secondary: new THREE.Color('#4C1D95'),   // Violet-900
    glow: new THREE.Color('#A78BFA'),        // Violet-400
  },
  speaking: {
    primary: new THREE.Color('#A855F7'),     // Fuchsia-500
    secondary: new THREE.Color('#8B5CF6'),   // Violet-500
    glow: new THREE.Color('#E9D5FF'),        // Purple-200
  },
  proactive: {
    primary: new THREE.Color('#F59E0B'),     // Amber-500
    secondary: new THREE.Color('#D97706'),   // Amber-600
    glow: new THREE.Color('#FDE68A'),        // Amber-200
  },
};

// Custom shader material for the orb
const OrbMaterial = shaderMaterial(
  {
    uTime: 0,
    uPrimaryColor: new THREE.Color('#8B5CF6'),
    uSecondaryColor: new THREE.Color('#3B82F6'),
    uGlowColor: new THREE.Color('#C4B5FD'),
    uNoiseScale: 1.5,
    uNoiseSpeed: 0.3,
    uPulseSpeed: 1.0,
    uPulseIntensity: 0.15,
    uAudioLevel: 0,
    uTouchPoint: new THREE.Vector3(0, 0, 0),
    uTouchIntensity: 0,
  },
  // Vertex shader
  `
    uniform float uTime;
    uniform float uNoiseScale;
    uniform float uNoiseSpeed;
    uniform float uPulseSpeed;
    uniform float uPulseIntensity;
    uniform float uAudioLevel;
    uniform vec3 uTouchPoint;
    uniform float uTouchIntensity;

    varying vec3 vNormal;
    varying vec3 vPosition;
    varying float vDisplacement;
    varying float vFresnelFactor;

    // Simplex noise function
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);

      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);

      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;

      i = mod289(i);
      vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0));

      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;

      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);

      vec4 x = x_ * ns.x + ns.yyyy;
      vec4 y = y_ * ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);

      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);

      vec4 s0 = floor(b0) * 2.0 + 1.0;
      vec4 s1 = floor(b1) * 2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));

      vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);

      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;

      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;

      // Calculate noise displacement
      float noiseTime = uTime * uNoiseSpeed;
      vec3 noisePos = position * uNoiseScale + vec3(noiseTime);
      float noise = snoise(noisePos) * 0.5 + 0.5;

      // Pulse effect
      float pulse = sin(uTime * uPulseSpeed) * uPulseIntensity;

      // Audio reactivity
      float audioDisplacement = uAudioLevel * 0.3;

      // Touch ripple effect
      float touchDist = distance(position, uTouchPoint);
      float touchRipple = sin(touchDist * 10.0 - uTime * 3.0) * uTouchIntensity * exp(-touchDist * 2.0);

      // Combine displacements
      float displacement = noise * 0.1 + pulse + audioDisplacement + touchRipple;
      vDisplacement = displacement;

      vec3 newPosition = position + normal * displacement;

      // Calculate fresnel for rim lighting
      vec3 viewDir = normalize(cameraPosition - (modelMatrix * vec4(newPosition, 1.0)).xyz);
      vFresnelFactor = pow(1.0 - dot(vNormal, viewDir), 3.0);

      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform vec3 uPrimaryColor;
    uniform vec3 uSecondaryColor;
    uniform vec3 uGlowColor;
    uniform float uTime;
    uniform float uAudioLevel;

    varying vec3 vNormal;
    varying vec3 vPosition;
    varying float vDisplacement;
    varying float vFresnelFactor;

    void main() {
      // Mix colors based on position and displacement
      float mixFactor = vDisplacement * 2.0 + sin(vPosition.y * 3.0 + uTime * 0.5) * 0.3;
      mixFactor = clamp(mixFactor, 0.0, 1.0);

      vec3 baseColor = mix(uPrimaryColor, uSecondaryColor, mixFactor);

      // Add glow at edges (fresnel effect)
      vec3 finalColor = mix(baseColor, uGlowColor, vFresnelFactor * 0.7);

      // Add audio-reactive brightness
      finalColor += uAudioLevel * 0.2;

      // Add subtle inner glow
      float innerGlow = 1.0 - length(vPosition) * 0.5;
      finalColor += uGlowColor * innerGlow * 0.2;

      gl_FragColor = vec4(finalColor, 0.95);
    }
  `
);

// Extend Three.js with our custom material
extend({ OrbMaterial });

// Declare the JSX type
declare module '@react-three/fiber' {
  interface ThreeElements {
    orbMaterial: THREE.ShaderMaterial & {
      uTime: number;
      uPrimaryColor: THREE.Color;
      uSecondaryColor: THREE.Color;
      uGlowColor: THREE.Color;
      uNoiseScale: number;
      uNoiseSpeed: number;
      uPulseSpeed: number;
      uPulseIntensity: number;
      uAudioLevel: number;
      uTouchPoint: THREE.Vector3;
      uTouchIntensity: number;
    };
  }
}

interface StewardOrbProps {
  state?: StewardOrbState;
  audioLevel?: number;
  size?: number;
  onPointerDown?: (event: ThreeEvent<PointerEvent>) => void;
}

export function StewardOrb({
  state = 'idle',
  audioLevel = 0,
  size = 1,
  onPointerDown,
}: StewardOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const touchPoint = useRef(new THREE.Vector3(0, 0, 0));
  const touchIntensity = useRef(0);
  const targetColors = useRef(STATE_COLORS.idle);

  // Create geometry
  const geometry = useMemo(() => {
    return new THREE.IcosahedronGeometry(size, 64);
  }, [size]);

  // Create material instance
  const material = useMemo(() => {
    return new OrbMaterial();
  }, []);

  // Update target colors when state changes
  useEffect(() => {
    targetColors.current = STATE_COLORS[state];
  }, [state]);

  // Animation loop
  useFrame((_, delta) => {
    if (!materialRef.current) return;

    const mat = materialRef.current as any;

    // Update time
    mat.uTime += delta;

    // Smoothly interpolate colors
    mat.uPrimaryColor.lerp(targetColors.current.primary, delta * 2);
    mat.uSecondaryColor.lerp(targetColors.current.secondary, delta * 2);
    mat.uGlowColor.lerp(targetColors.current.glow, delta * 2);

    // Update audio level
    mat.uAudioLevel = THREE.MathUtils.lerp(mat.uAudioLevel, audioLevel, delta * 10);

    // Update touch effect (decay over time)
    touchIntensity.current = THREE.MathUtils.lerp(touchIntensity.current, 0, delta * 3);
    mat.uTouchIntensity = touchIntensity.current;
    mat.uTouchPoint.copy(touchPoint.current);

    // State-specific animation parameters
    switch (state) {
      case 'listening':
        mat.uNoiseSpeed = 0.6;
        mat.uPulseSpeed = 2.0;
        mat.uPulseIntensity = 0.2;
        break;
      case 'thinking':
        mat.uNoiseSpeed = 1.0;
        mat.uPulseSpeed = 3.0;
        mat.uPulseIntensity = 0.1;
        break;
      case 'speaking':
        mat.uNoiseSpeed = 0.4;
        mat.uPulseSpeed = 1.5;
        mat.uPulseIntensity = 0.25;
        break;
      case 'proactive':
        mat.uNoiseSpeed = 0.5;
        mat.uPulseSpeed = 2.0;
        mat.uPulseIntensity = 0.3;
        break;
      default: // idle
        mat.uNoiseSpeed = 0.3;
        mat.uPulseSpeed = 1.0;
        mat.uPulseIntensity = 0.15;
    }

    // Gentle rotation
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1;
      meshRef.current.rotation.x = Math.sin(mat.uTime * 0.2) * 0.05;
    }
  });

  // Handle pointer interaction
  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();

    // Set touch point to intersection point
    if (event.point) {
      // Transform to local coordinates
      if (meshRef.current) {
        const localPoint = meshRef.current.worldToLocal(event.point.clone());
        touchPoint.current.copy(localPoint.normalize());
      }
      touchIntensity.current = 1.0;
    }

    onPointerDown?.(event);
  };

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      onPointerDown={handlePointerDown}
    >
      <primitive
        object={material}
        ref={materialRef}
        attach="material"
      />
    </mesh>
  );
}
