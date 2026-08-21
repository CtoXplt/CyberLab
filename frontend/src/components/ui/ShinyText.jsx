import { motion, useReducedMotion } from 'framer-motion';

export default function ShinyText({ children, className = '', as: Tag = 'span' }) {
  const reduce = useReducedMotion();
  const MotionTag = motion[Tag] || motion.span;

  return (
    <MotionTag
      className={`shiny-text ${className}`}
      animate={reduce ? {} : { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
    >
      {children}
    </MotionTag>
  );
}
