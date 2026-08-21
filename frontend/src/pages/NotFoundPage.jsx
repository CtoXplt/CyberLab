import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import WebThreads from '../components/ui/WebThreads';
import GlowButton from '../components/ui/GlowButton';
import { FadeIn } from '../components/ui/motion';

export default function NotFoundPage() {
  const { pathname } = useLocation();

  return (
    <div className="page-bg">
      <section className="not-found">
        <div className="not-found__bg" aria-hidden="true">
          <WebThreads
            color1="#00ff41"
            color2="#004422"
            color3="#ffffff"
            speed={0.15}
            threadCount={3}
            frequency={4.5}
            spread={0.14}
            taper={1.0}
            position={0.5}
            fanMode="center"
            glow={0.025}
            falloff={0.65}
            thickness={1}
            brightness={0.45}
            opacity={0.7}
            mirror
            shimmer={false}
            grain
            grainIntensity={0.03}
            mouseInteraction
            mouseStrength={0.3}
          />
          <div className="hero__overlay" />
          <span className="not-found__watermark">404</span>
        </div>

        <div className="container not-found__content">
          <FadeIn>
            <p className="not-found__status">404</p>
            <h1>Halaman tidak ditemukan</h1>
            <p className="not-found__path">
              <code>{pathname}</code> tidak terdaftar di lab ini.
            </p>
            <p className="text-secondary not-found__hint">
              Periksa penulisan URL atau kembali ke halaman utama.
            </p>
            <div className="not-found__actions">
              <GlowButton to="/" variant="primary" className="glow-btn--lg">
                Kembali ke Beranda
              </GlowButton>
            </div>
            <Link to="/ctf" className="not-found__link">
              Lanjut ke CTF Challenge
              <ArrowRight size={14} />
            </Link>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
