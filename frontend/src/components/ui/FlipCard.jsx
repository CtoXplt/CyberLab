import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Download, RotateCcw } from 'lucide-react';
import './FlipCard.css';

export default function FlipCard({
  imageUrl,
  name,
  label,
  downloadUrl,
}) {
  const [flipped, setFlipped] = useState(false);
  const reduce = useReducedMotion();

  const toggleFlip = () => setFlipped((prev) => !prev);

  return (
    <div className="flip-card-wrap">
      <div
        className={`flip-card${flipped ? ' is-flipped' : ''}`}
        onClick={toggleFlip}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleFlip();
          }
        }}
        role="button"
        tabIndex={0}
        aria-pressed={flipped}
        aria-label={flipped ? `Kartu ${name} — klik untuk tampilkan depan` : `Kartu ${name} — klik untuk balik`}
      >
        <motion.div
          className="flip-card__inner"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: reduce ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front — card image */}
          <div className="flip-card__face flip-card__front">
            <div className="flip-card__frame">
              <img
                src={imageUrl}
                alt={`Kartu ${name}`}
                className="flip-card__img"
                loading="lazy"
                draggable={false}
              />
              <div className="flip-card__shine" aria-hidden="true" />
              <div className="flip-card__corner flip-card__corner--tl" aria-hidden="true">{label}</div>
              <div className="flip-card__corner flip-card__corner--br" aria-hidden="true">{label}</div>
            </div>
          </div>

          {/* Back — download & info */}
          <div className="flip-card__face flip-card__back">
            <div className="flip-card__back-pattern" aria-hidden="true" />
            <div className="flip-card__back-content">
              <span className="flip-card__back-rank">{label}</span>
              <p className="flip-card__back-name">{name}</p>
              <p className="flip-card__back-hint">
                Unduh file PNG untuk analisis metadata dengan exiftool.
              </p>
              <a
                href={downloadUrl}
                download
                className="flip-card__download glow-btn glow-btn--primary"
                onClick={(e) => e.stopPropagation()}
              >
                <Download size={16} aria-hidden="true" />
                Unduh Kartu
              </a>
            </div>
          </div>
        </motion.div>

        <button
          type="button"
          className="flip-card__flip-btn"
          onClick={(e) => {
            e.stopPropagation();
            toggleFlip();
          }}
          aria-label={flipped ? `Tutup kartu ${name}` : `Balik kartu ${name}`}
        >
          <RotateCcw size={14} aria-hidden="true" />
          {flipped ? 'Depan' : 'Balik'}
        </button>
      </div>

      <p className="flip-card__title">Kartu {name}</p>
    </div>
  );
}
