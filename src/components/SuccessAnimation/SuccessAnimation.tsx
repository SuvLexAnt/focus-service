import { useState } from 'react';
import styles from './animations.module.css';

type AnimationType = 'confetti' | 'ripple' | 'sparkle' | 'pulse' | 'checkBounce';

const animations: AnimationType[] = ['confetti', 'ripple', 'sparkle', 'pulse', 'checkBounce'];

export function SuccessAnimation() {
  const [animation] = useState<AnimationType>(() => {
    const randomIndex = Math.floor(Math.random() * animations.length);
    return animations[randomIndex];
  });

  if (animation === 'confetti') {
    return <ConfettiAnimation />;
  }

  if (animation === 'ripple') {
    return <RippleAnimation />;
  }

  if (animation === 'sparkle') {
    return <SparkleAnimation />;
  }

  if (animation === 'pulse') {
    return <PulseAnimation />;
  }

  return <CheckBounceAnimation />;
}

function ConfettiAnimation() {
  const confettiCount = 25;
  const confettis = Array.from({ length: confettiCount }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.2,
    duration: 1 + Math.random() * 0.5,
    rotation: Math.random() * 360,
    color: ['#7C9885', '#D4A574', '#E8A87C', '#C5A3A3'][Math.floor(Math.random() * 4)],
  }));

  return (
    <div className={styles.confettiContainer}>
      {confettis.map((conf) => (
        <div
          key={conf.id}
          className={styles.confetti}
          style={{
            left: `${conf.left}%`,
            backgroundColor: conf.color,
            animationDelay: `${conf.delay}s`,
            animationDuration: `${conf.duration}s`,
            transform: `rotate(${conf.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}

function RippleAnimation() {
  return (
    <div className={styles.rippleContainer}>
      <div className={styles.ripple} style={{ animationDelay: '0s' }} />
      <div className={styles.ripple} style={{ animationDelay: '0.2s' }} />
      <div className={styles.ripple} style={{ animationDelay: '0.4s' }} />
    </div>
  );
}

function SparkleAnimation() {
  const sparkleCount = 10;
  const sparkles = Array.from({ length: sparkleCount }, (_, i) => ({
    id: i,
    angle: (360 / sparkleCount) * i,
    delay: i * 0.08,
  }));

  return (
    <div className={styles.sparkleContainer}>
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className={styles.sparkle}
          style={{
            transform: `rotate(${sparkle.angle}deg) translateY(-30px)`,
            animationDelay: `${sparkle.delay}s`,
          }}
        >
          ✨
        </div>
      ))}
    </div>
  );
}

function PulseAnimation() {
  return (
    <div className={styles.pulseContainer}>
      <div className={styles.pulse} style={{ animationDelay: '0s' }} />
      <div className={styles.pulse} style={{ animationDelay: '0.3s' }} />
    </div>
  );
}

function CheckBounceAnimation() {
  return (
    <div className={styles.checkBounceContainer}>
      <div className={styles.checkBounce}>✓</div>
      <div className={styles.trail} />
    </div>
  );
}
