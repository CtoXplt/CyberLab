import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1];

export function FadeIn({ children, delay = 0, className = '', direction = 'up' }) {
  const reduce = useReducedMotion();
  const offset = direction === 'up' ? 32 : direction === 'down' ? -32 : 0;
  const x = direction === 'left' ? 32 : direction === 'right' ? -32 : 0;

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: offset, x, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, x: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.65, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export function ScrollReveal({ children, className = '', delay = 0, scale = 0.96 }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 48, scale, rotateX: 8 }}
      whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.75, delay, ease: EASE }}
      style={{ transformPerspective: 800 }}
    >
      {children}
    </motion.div>
  );
}

export function ScrollSlide({ children, className = '', direction = 'left', delay = 0 }) {
  const reduce = useReducedMotion();
  const x = direction === 'left' ? -60 : direction === 'right' ? 60 : 0;

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, x }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({ children, className = '', stagger = 0.1 }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : 'hidden'}
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: 0.05 } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = '' }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={
        reduce
          ? {}
          : {
              hidden: { opacity: 0, y: 28, filter: 'blur(4px)' },
              visible: {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                transition: { duration: 0.55, ease: EASE },
              },
            }
      }
    >
      {children}
    </motion.div>
  );
}

export function GlowText({ children, className = '' }) {
  return <span className={`glow-text ${className}`}>{children}</span>;
}

export function PageTransition({ children }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  if (reduce) return null;

  return (
    <motion.div
      className="scroll-progress"
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
}

export function ParallaxFloat({ children, className = '', offset = 40 }) {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, offset]);

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div className={className} style={{ y }}>
      {children}
    </motion.div>
  );
}
