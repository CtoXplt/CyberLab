import { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export default function SpotlightCard({ children, className = '', accent = 'primary', style }) {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const reduce = useReducedMotion();

  const handleMove = (e) => {
    if (!ref.current || reduce) return;
    const rect = ref.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.div
      ref={ref}
      className={`spotlight-card spotlight-card--${accent} ${className}`}
      style={style}
      onMouseMove={handleMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      whileHover={reduce ? {} : { y: -4 }}
      transition={{ duration: 0.25 }}
    >
      <div
        className="spotlight-card__glow"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, var(--spotlight-color), transparent 40%)`,
        }}
      />
      <div className="spotlight-card__content">{children}</div>
    </motion.div>
  );
}
