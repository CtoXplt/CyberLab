import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function GlowButton({
  children,
  variant = 'primary',
  className = '',
  to,
  href,
  type = 'button',
  disabled,
  onClick,
  ...props
}) {
  const reduce = useReducedMotion();
  const classes = `glow-btn glow-btn--${variant} ${className}`;

  const motionProps = {
    whileHover: reduce || disabled ? {} : { scale: 1.02, y: -1 },
    whileTap: reduce || disabled ? {} : { scale: 0.98 },
    transition: { duration: 0.2 },
  };

  if (to) {
    return (
      <motion.div {...motionProps} style={{ display: 'inline-block' }}>
        <Link to={to} className={classes} onClick={onClick} {...props}>
          {children}
        </Link>
      </motion.div>
    );
  }

  if (href) {
    return (
      <motion.a href={href} className={classes} onClick={onClick} {...motionProps} {...props}>
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...motionProps}
      {...props}
    >
      {children}
    </motion.button>
  );
}
