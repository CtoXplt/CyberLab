import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell, Globe, Lock, ScanSearch, Upload,
  Check, Target, ArrowRight, ShieldAlert,
} from 'lucide-react';
import { getHome } from '../services/api';
import WebThreads from '../components/ui/WebThreads';
import SpotlightCard from '../components/ui/SpotlightCard';
import GlowButton from '../components/ui/GlowButton';
import {
  FadeIn, StaggerContainer, StaggerItem,
  ScrollReveal, ScrollSlide,
} from '../components/ui/motion';
import SponsorSection from '../components/SponsorSection';

const FEATURES = [
  {
    icon: Bell,
    title: 'Hands-on Learning',
    desc: 'Belajar melalui praktik langsung dengan skenario dunia nyata.',
  },
  {
    icon: Globe,
    title: 'Real-world Scenario',
    desc: 'Mensimulasikan kerentanan yang sering ditemukan pada aplikasi production.',
  },
  {
    icon: Lock,
    title: 'Safe Environment',
    desc: 'Lingkungan terisolasi yang aman untuk melakukan pengujian.',
  },
];

const FOCUS = [
  {
    icon: ScanSearch,
    title: 'Metadata Analysis',
    desc: 'Mempelajari bagaimana data tersembunyi (seperti EXIF pada gambar) dapat membocorkan informasi sensitif.',
    accent: 'primary',
  },
  {
    icon: Upload,
    title: 'File Upload Vulnerability',
    desc: 'Memahami bahaya dari validasi file upload yang tidak memadai, memungkinkan eksekusi kode berbahaya.',
    accent: 'accent',
  },
];

const OBJECTIVES = [
  'Memahami konsep metadata dan informasi tersembunyi dapat diekstrak dari file.',
  'Mengetahui risiko keamanan terkait pemaparan informasi sensitif melalui metadata.',
  'Mempelajari kerentanan file upload dan dampaknya terhadap keamanan sistem.',
  'Memahami mekanisme Remote Code Execution (RCE) melalui eksploitasi fitur upload file.',
  'Melatih kemampuan analisis forensik digital dasar dan pemecahan masalah (CTF).',
];

export default function HomePage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getHome().then(res => {
      setData(res);
    }).catch(console.error);
  }, []);

  // Tampilkan halaman deface jika ada custom content / file shell yang diupload
  if (data && data.is_default === false && data.content) {
    const isFullHtml = data.content.includes('<!DOCTYPE') || data.content.includes('<html');

    return (
      <div className="page-bg" style={{ minHeight: '100vh' }}>
        <div className="deface-top-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={18} color="#fff" />
            <span>[CTF LAB ALERT] Halaman utama telah dimodifikasi oleh peserta (Deface/RCE Active).</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link to="/ctf" style={{ color: '#fff', textDecoration: 'underline' }}>Halaman CTF</Link>
            <Link to="/admin/dashboard" style={{ color: '#fff', textDecoration: 'underline' }}>Admin Dashboard</Link>
          </div>
        </div>

        {isFullHtml ? (
          <iframe
            srcDoc={data.content}
            title="Defaced Homepage"
            style={{ width: '100%', height: 'calc(100vh - 40px)', border: 'none' }}
          />
        ) : (
          <div className="deface-wrapper">
            <div dangerouslySetInnerHTML={{ __html: data.content }} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page-bg">
      {/* Hero with WebThreads */}
      <section className="hero">
        <div className="hero__threads">
          <WebThreads
            color1="#00ff41"
            color2="#004422"
            color3="#ffffff"
            speed={0.2}
            threadCount={4}
            frequency={5.0}
            spread={0.18}
            taper={1.0}
            position={0.55}
            fanMode="center"
            glow={0.035}
            falloff={0.61}
            thickness={1.1}
            brightness={0.55}
            opacity={0.85}
            mirror
            shimmer={false}
            grain
            grainIntensity={0.04}
            mouseInteraction
            mouseStrength={0.45}
          />
        </div>
        <div className="hero__overlay" aria-hidden="true" />
        <div className="container hero__inner">
          <FadeIn className="hero__content">
            <div className="hero__badge">
              <span className="hero__badge-dot" />
              EDUCATIONAL SECURITY LAB
            </div>
            <h1 className="hero__title">
              <span className="hero__title-line">Cyber Security</span>
              <span className="hero__title-line glow-text">Lab</span>
            </h1>
            <p className="hero__subtitle">
              Pelajari Kerentanan Web Modern Secara Praktis
            </p>
            <p className="hero__desc">
              Platform edukasi interaktif untuk memahami Metadata Analysis dan File Upload Vulnerability di lingkungan yang aman.
            </p>
            <div className="hero__actions">
              <GlowButton to="/ctf" variant="primary" className="glow-btn--lg">
                Mulai Tantangan CTF
                <ArrowRight size={18} />
              </GlowButton>
              <GlowButton href="#objectives" variant="outline">
                Pelajari Lebih Lanjut
              </GlowButton>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <div className="container">
          <ScrollReveal className="text-center">
            <div className="section-label section-label--center">Tentang Lab</div>
            <h2 className="text-center mb-8">Mengapa Lab Ini?</h2>
          </ScrollReveal>
          <StaggerContainer className="grid-3">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <StaggerItem key={title}>
                <SpotlightCard>
                  <div className="feature-icon">
                    <Icon size={22} strokeWidth={1.75} />
                  </div>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>{title}</h3>
                  <p className="text-secondary">{desc}</p>
                </SpotlightCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Focus */}
      <section className="section" style={{ background: 'var(--surface)' }}>
        <div className="container">
          <ScrollReveal className="text-center">
            <div className="section-label section-label--center">Kurikulum</div>
            <h2 className="text-center mb-8">Fokus Pembelajaran</h2>
          </ScrollReveal>
          <StaggerContainer className="grid-2" stagger={0.12}>
            {FOCUS.map(({ icon: Icon, title, desc, accent }, i) => (
              <StaggerItem key={title}>
                <ScrollSlide direction={i === 0 ? 'left' : 'right'}>
                  <SpotlightCard accent={accent === 'accent' ? 'accent' : 'primary'}>
                    <div className="feature-icon" style={accent === 'accent' ? { background: 'var(--accent-dim)', color: 'var(--accent)', borderColor: 'rgba(255,51,51,0.15)' } : {}}>
                      <Icon size={22} strokeWidth={1.75} />
                    </div>
                    <h3 style={{ marginBottom: '0.75rem' }}>{title}</h3>
                    <p className="text-secondary">{desc}</p>
                  </SpotlightCard>
                </ScrollSlide>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Objectives */}
      <section id="objectives" className="section">
        <div className="container">
          <ScrollReveal className="text-center">
            <div className="section-label section-label--center">Target</div>
            <h2 className="text-center mb-8">Tujuan Pembelajaran</h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1} scale={0.98}>
            <SpotlightCard style={{ maxWidth: 800, margin: '0 auto' }}>
              <ul className="objective-list">
                {OBJECTIVES.map((objective, i) => (
                  <StaggerItem key={i}>
                    <li className="objective-item">
                      <div className="objective-check">
                        <Check size={14} strokeWidth={2.5} />
                      </div>
                      <span>{objective}</span>
                    </li>
                  </StaggerItem>
                ))}
              </ul>
            </SpotlightCard>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section">
        <div className="container text-center">
          <ScrollReveal>
            <Target size={32} color="var(--primary)" style={{ marginBottom: '1rem' }} />
            <h2 className="mb-4">Siap untuk Menguji Kemampuan Anda?</h2>
            <p>
              Masuk ke halaman CTF untuk memulai tantangan. Analisis gambar, temukan flag, dan akses halaman admin.
            </p>
            <div className="cta-badges">
              <span className="badge badge-amber">Tingkat: Menengah</span>
              <span className="badge badge-green">Estimasi: 5–10 Menit</span>
            </div>
            <GlowButton to="/ctf" variant="primary" className="glow-btn--lg">
              Akses Halaman CTF
              <ArrowRight size={18} />
            </GlowButton>
          </ScrollReveal>
        </div>
      </section>

      <SponsorSection />
    </div>
  );
}
