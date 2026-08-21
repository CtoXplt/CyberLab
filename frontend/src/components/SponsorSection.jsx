import { motion, useReducedMotion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem } from './ui/motion';

const SPONSORS = [
  {
    id: 'unsiq',
    name: 'Universitas Sains Al-Qur\'an (UNSIQ)',
    shortName: 'UNSIQ',
    logo: '/sponsors/unsiq.png',
    href: 'https://mhs.unsiq.ac.id',
    lightBg: true,
  },
  {
    id: 'fastikom',
    name: 'Fakultas Sains dan Teknologi Informasi Komunikasi — UNSIQ',
    shortName: 'FASTIKOM UNSIQ',
    logo: '/sponsors/fastikom.png',
    href: 'https://fastikom.unsiq.ac.id',
    lightBg: false,
  },
  {
    id: 'ski',
    name: 'Sentra Kekayaan Intelektual & Inovasi Teknologi UNSIQ',
    shortName: 'SKI & Inovasi Teknologi',
    logo: '/sponsors/ski.png',
    href: 'https://unsiq.ac.id',
    lightBg: true,
  },
  {
    id: 'tabung-creative',
    name: 'Tabung Creative — Simple and Insightful',
    shortName: 'Tabung Creative',
    logo: '/sponsors/ihsan-tv.png',
    href: 'https://www.facebook.com/TabungCreative',
    lightBg: false,
  },
];

function SponsorCard({ sponsor, index }) {
  const reduce = useReducedMotion();

  const content = (
    <motion.div
      className={`sponsor-card${sponsor.lightBg ? ' sponsor-card--light' : ''}`}
      whileHover={reduce ? {} : { y: -6, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
    >
      <div className="sponsor-card__glow" aria-hidden="true" />
      <div className={`sponsor-card__logo-wrap${sponsor.lightBg ? ' sponsor-card__logo-wrap--light' : ''}`}>
        <motion.img
          src={sponsor.logo}
          alt={sponsor.name}
          className="sponsor-card__logo"
          loading="lazy"
          initial={reduce ? false : { opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
          whileHover={reduce ? {} : { scale: 1.06 }}
        />
      </div>
      <p className="sponsor-card__name">{sponsor.shortName}</p>
      {sponsor.href && (
        <span className="sponsor-card__link-hint">
          <ExternalLink size={12} />
          Kunjungi
        </span>
      )}
    </motion.div>
  );

  if (sponsor.href) {
    return (
      <a
        href={sponsor.href}
        target="_blank"
        rel="noopener noreferrer"
        className="sponsor-card__anchor"
        aria-label={`Kunjungi ${sponsor.name}`}
      >
        {content}
      </a>
    );
  }

  return <div className="sponsor-card__anchor">{content}</div>;
}

export default function SponsorSection() {
  const reduce = useReducedMotion();

  return (
    <section className="section sponsor-section">
      <div className="container">
        <FadeIn>
          <div className="section-label section-label--center">Partner</div>
          <h3 className="text-center mb-2">Didukung Oleh</h3>
          <p className="text-center text-secondary sponsor-section__desc">
            Kolaborasi institusi pendidikan dan media dalam pengembangan literasi keamanan siber.
          </p>
        </FadeIn>

        <StaggerContainer className="sponsor-grid sponsor-grid--animated">
          {SPONSORS.map((sponsor, index) => (
            <StaggerItem key={sponsor.id}>
              <SponsorCard sponsor={sponsor} index={index} />
            </StaggerItem>
          ))}
        </StaggerContainer>

        {!reduce && (
          <motion.div
            className="sponsor-section__line"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            aria-hidden="true"
          />
        )}
      </div>
    </section>
  );
}
