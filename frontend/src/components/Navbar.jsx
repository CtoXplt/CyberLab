import React, { useState, useMemo } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Shield, Menu, X } from 'lucide-react';
import GooeyNav from './ui/GooeyNav';
import SpecularButton from './ui/SpecularButton';

const navLinks = [
  { to: '/', label: 'Beranda', end: true },
  { to: '/ctf', label: 'CTF Challenge' },
];

const NAV_SPECULAR = {
  size: 'sm',
  radius: 100,
  tint: '#000000',
  tintOpacity: 0.55,
  blur: 8,
  textColor: '#00ff41',
  lineColor: '#00ff41',
  baseColor: '#2a2a2a',
  intensity: 0.9,
  shineSize: 11,
  shineFade: 42,
  thickness: 1,
  proximity: 220,
};

function resolveActiveIndex(pathname) {
  const idx = navLinks.findIndex(({ to, end }) =>
    end ? pathname === to : pathname.startsWith(to),
  );
  return idx >= 0 ? idx : 0;
}

function NavLoginButton({ onNavigate, followMouse, className = '' }) {
  const navigate = useNavigate();

  return (
    <SpecularButton
      {...NAV_SPECULAR}
      followMouse={followMouse}
      className={className}
      onClick={() => {
        onNavigate?.();
        navigate('/admin/login');
      }}
    >
      Admin Login
    </SpecularButton>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const reduce = useReducedMotion();
  const location = useLocation();
  const navigate = useNavigate();

  const activeIndex = useMemo(
    () => resolveActiveIndex(location.pathname),
    [location.pathname],
  );

  const gooeyItems = useMemo(
    () => navLinks.map(({ label }) => ({ label })),
    [],
  );

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <NavLink to="/" className="navbar__brand">
          <Shield className="navbar__brand-icon" size={22} strokeWidth={2} />
          Cyber Security Lab
        </NavLink>

        <nav className="navbar__nav" aria-label="Navigasi situs">
          <div className="navbar__gooey-wrap">
            <GooeyNav
              items={gooeyItems}
              activeIndex={activeIndex}
              onSelect={(index) => navigate(navLinks[index].to)}
              reducedMotion={reduce}
              particleCount={15}
              particleDistances={[90, 10]}
              particleR={100}
              animationTime={600}
              timeVariance={300}
            />
          </div>

          <span className="navbar__nav-divider" aria-hidden="true" />

          <NavLoginButton followMouse={!reduce} className="navbar__login-btn" />
        </nav>

        <button
          className="navbar__toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="navbar__mobile open"
            initial={reduce ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="navbar__mobile-pills">
              {navLinks.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `navbar__mobile-pill${isActive ? ' navbar__mobile-pill--active' : ''}`
                  }
                  onClick={() => setIsOpen(false)}
                >
                  {label}
                </NavLink>
              ))}
            </div>
            <NavLoginButton
              followMouse={!reduce}
              onNavigate={() => setIsOpen(false)}
              className="navbar__mobile-login"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
