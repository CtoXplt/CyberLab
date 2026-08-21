import { motion, useReducedMotion } from 'framer-motion';

export default function AuroraBackground({ className = '' }) {
  const reduce = useReducedMotion();

  return (
    <div className={`aurora-bg ${className}`} aria-hidden="true">
      <div className="aurora-grid" />
      {!reduce && (
        <>
          <motion.div
            className="aurora-blob aurora-blob-1"
            animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0], scale: [1, 1.1, 0.95, 1] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="aurora-blob aurora-blob-2"
            animate={{ x: [0, -40, 30, 0], y: [0, 30, -30, 0], scale: [1, 0.9, 1.05, 1] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="aurora-blob aurora-blob-3"
            animate={{ x: [0, 20, -30, 0], y: [0, 20, 40, 0] }}
            transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}
      <div className="scanlines" />
    </div>
  );
}
