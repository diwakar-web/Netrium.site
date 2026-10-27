import { useState, useRef, useEffect, useCallback } from 'react';
import './HoloCard.css';

const PRESETS = ['bursts', 'stars', 'shards', 'cosmos', 'rainbow', 'swirl', 'glitter', 'gold'];
const CARD_RATIO = 63 / 88;

const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

export default function HoloCard({
  image,
  backImage,
  alt = '',
  preset = 'bursts',
  intensity = 0.85,
  scale = 1,
  edgeSparkle = 0.8,
  frame = 4,
  glare = 0.6,
  foilColor = '#00bf63',
  width = 240,
  ratio: customRatio,
  radius = 16,
  tiltMax = 14,
  hoverScale = 1.04,
  idle = false, // Default to false for performance; only animate on hover
  shadow = true,
  className = '',
  children,
  style
}) {
  const rootRef = useRef(null);
  const rotorRef = useRef(null);
  const shadowRef = useRef(null);
  const glareRef = useRef(null);
  const foilRef = useRef(null);

  const [ratio, setRatio] = useState(customRatio || CARD_RATIO);
  const [flipped, setFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const flippable = Boolean(backImage);

  // Animation state tracking (only active on hover or spring-back)
  const animRef = useRef({
    targetTiltX: 0,
    targetTiltY: 0,
    currentTiltX: 0,
    currentTiltY: 0,
    targetLift: 1,
    currentLift: 1,
    pointerX: 50,
    pointerY: 50,
    rafId: null,
    isAnimating: false
  });

  useEffect(() => {
    if (customRatio) setRatio(customRatio);
  }, [customRatio]);

  // Spring physics loop - ONLY runs when active / moving
  const updatePhysics = useCallback(() => {
    const s = animRef.current;
    
    // Smooth damping spring
    const ease = 0.14;
    s.currentTiltX += (s.targetTiltX - s.currentTiltX) * ease;
    s.currentTiltY += (s.targetTiltY - s.currentTiltY) * ease;
    s.currentLift += (s.targetLift - s.currentLift) * ease;

    // Apply transform via hardware-accelerated direct element style
    if (rotorRef.current) {
      rotorRef.current.style.transform = `perspective(1000px) scale(${s.currentLift.toFixed(3)}) rotateX(${s.currentTiltX.toFixed(2)}deg) rotateY(${s.currentTiltY.toFixed(2)}deg)`;
    }

    if (shadowRef.current) {
      const shadowX = (-s.currentTiltY * 0.8).toFixed(1);
      const shadowY = (s.currentTiltX * 0.8 + 12).toFixed(1);
      shadowRef.current.style.transform = `translate3d(${shadowX}px, ${shadowY}px, 0) scale(${(0.95 + (s.currentLift - 1) * 1.2).toFixed(2)})`;
    }

    // Dynamic light / glare angle
    if (glareRef.current) {
      glareRef.current.style.background = `radial-gradient(circle at ${s.pointerX.toFixed(1)}% ${s.pointerY.toFixed(1)}%, rgba(255, 255, 255, ${glare * 0.45}) 0%, rgba(255, 255, 255, 0) 65%)`;
    }

    if (foilRef.current) {
      foilRef.current.style.setProperty('--foil-angle', `${(s.currentTiltY * 3 + 120).toFixed(1)}deg`);
      foilRef.current.style.setProperty('--foil-px', `${s.pointerX.toFixed(1)}%`);
      foilRef.current.style.setProperty('--foil-py', `${s.pointerY.toFixed(1)}%`);
    }

    // Check if motion has settled
    const delta = Math.abs(s.targetTiltX - s.currentTiltX) + 
                  Math.abs(s.targetTiltY - s.currentTiltY) + 
                  Math.abs(s.targetLift - s.currentLift);

    if (delta > 0.04 || s.targetLift > 1) {
      s.rafId = requestAnimationFrame(updatePhysics);
    } else {
      // Snap to rest and stop animation loop
      s.currentTiltX = s.targetTiltX;
      s.currentTiltY = s.targetTiltY;
      s.currentLift = s.targetLift;
      s.isAnimating = false;
      s.rafId = null;
    }
  }, [glare]);

  const startAnimation = useCallback(() => {
    const s = animRef.current;
    if (!s.isAnimating) {
      s.isAnimating = true;
      s.rafId = requestAnimationFrame(updatePhysics);
    }
  }, [updatePhysics]);

  const handlePointerMove = (e) => {
    if (!rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    const x = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    const y = clamp((e.clientY - rect.top) / rect.height, 0, 1);

    const s = animRef.current;
    s.pointerX = x * 100;
    s.pointerY = y * 100;
    s.targetTiltX = (0.5 - y) * 2 * tiltMax;
    s.targetTiltY = (x - 0.5) * 2 * tiltMax;
    s.targetLift = hoverScale;

    startAnimation();
  };

  const handlePointerEnter = () => {
    setIsHovered(true);
    animRef.current.targetLift = hoverScale;
    startAnimation();
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    const s = animRef.current;
    s.targetTiltX = 0;
    s.targetTiltY = 0;
    s.targetLift = 1;
    s.pointerX = 50;
    s.pointerY = 50;
    startAnimation();
  };

  const toggleFlip = () => {
    if (flippable) setFlipped(v => !v);
  };

  useEffect(() => {
    return () => {
      if (animRef.current.rafId) {
        cancelAnimationFrame(animRef.current.rafId);
      }
    };
  }, []);

  const activePreset = PRESETS.includes(preset) ? preset : 'bursts';

  return (
    <div
      ref={rootRef}
      className={`holo-card ${className}`}
      role={flippable ? 'button' : 'img'}
      tabIndex={flippable ? 0 : undefined}
      aria-label={alt || undefined}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={toggleFlip}
      style={{
        '--hc-w': `${width}px`,
        '--hc-ratio': ratio,
        '--hc-radius': `${radius}px`,
        '--foil-color': foilColor,
        ...style
      }}
    >
      {/* 3D Dynamic Ambient Shadow */}
      {shadow && (
        <span 
          ref={shadowRef} 
          className="holo-card__shadow" 
          aria-hidden="true" 
          style={{ '--shadow-color': `${foilColor}25` }}
        />
      )}

      {/* 3D Rotor Face Container */}
      <div 
        ref={rotorRef} 
        className={`holo-card__rotor ${flipped ? 'flipped' : ''}`}
      >
        <div className="holo-card__face holo-card__face--front">
          {/* Base Dark Schematic Background */}
          {image ? (
            <img src={image} alt="" draggable={false} className="holo-card__art" />
          ) : (
            <div className="holo-card__schematic-bg">
              <div className="schematic-grid" />
              <div className="schematic-rings" />
              <div className="schematic-crosshairs" />
            </div>
          )}

          {/* Holographic Iridescent Foil Sheen */}
          <div 
            ref={foilRef} 
            className={`holo-card__foil preset-${activePreset}`}
            style={{ opacity: isHovered ? intensity : intensity * 0.45 }}
          />

          {/* Glare Reflection Spotlight */}
          <div 
            ref={glareRef} 
            className="holo-card__glare" 
            style={{ opacity: isHovered ? 1 : 0 }}
          />

          {/* Edge Sparkle Border */}
          <div className="holo-card__edge-border" style={{ borderColor: `${foilColor}40` }} />

          {/* Card Content & Emblem */}
          {children && (
            <div className="holo-card__content">
              {children}
            </div>
          )}
        </div>

        {/* Flippable Back Side (if backImage provided) */}
        {flippable && (
          <div className="holo-card__face holo-card__face--back">
            <img src={backImage} alt="" draggable={false} />
          </div>
        )}
      </div>
    </div>
  );
}
