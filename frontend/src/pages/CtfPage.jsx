import React, { useState } from 'react';
import { submitFlag, getCardDownloadUrl } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flag, CheckCircle, AlertCircle, KeyRound, ArrowRight,
} from 'lucide-react';
import SpotlightCard from '../components/ui/SpotlightCard';
import GlowButton from '../components/ui/GlowButton';
import FlipCard from '../components/ui/FlipCard';
import { FadeIn, StaggerContainer, StaggerItem } from '../components/ui/motion';

const CARDS = [
  { id: 'j', label: 'J', name: 'Jack', filename: 'card_j.png' },
  { id: 'q', label: 'Q', name: 'Queen', filename: 'card_q.png' },
  { id: 'k', label: 'K', name: 'King', filename: 'card_k.png' },
  { id: 'a', label: 'A', name: 'Ace', filename: 'card_a.png' },
];

export default function CtfPage() {
  const [flag, setFlag] = useState('');
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!flag) return;

    setStatus('loading');
    try {
      const res = await submitFlag('metadata_1', flag);
      setStatus('success');
      setResult(res);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Terjadi kesalahan saat memvalidasi flag.');
    }
  };

  return (
    <div className="page-bg">
      <div className="container" style={{ padding: 'var(--spacing-8) var(--spacing-4)' }}>
        <FadeIn>
          <SpotlightCard className="mb-8">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Flag size={24} color="var(--primary)" />
                <h2>Tantangan CTF: Metadata Analysis</h2>
              </div>
              <span className="badge badge-amber">Menengah</span>
            </div>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Tujuan Pembelajaran:</p>
            <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>
              Mengekstrak informasi sensitif yang tersembunyi pada metadata (EXIF) gambar.
            </p>
            <div className="instruction-box">
              <h4 style={{ marginBottom: '0.75rem' }}>Instruksi:</h4>
              <ol>
                <li>Klik kartu untuk membalik, lalu unduh file dari sisi belakang.</li>
                <li>Analisis metadata kartu <strong>(J, Q, K, A)</strong> dengan <code>exiftool</code> atau <code>strings</code>.</li>
                <li>Temukan string Base64, decode menjadi teks (contoh: <code>echo &lt;payload&gt; | base64 -d</code>).</li>
                <li>Bentuk flag: <code>CTF&#123;hasil_decode&#125;</code> lalu submit di bawah.</li>
                <li>Setelah flag benar, dapatkan username + daftar 20 password - hanya satu yang valid untuk login.</li>
              </ol>
            </div>
          </SpotlightCard>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="section-label">Assets</div>
          <h3 className="mb-2">Aset Tantangan</h3>
          <p className="text-secondary mb-6" style={{ fontSize: '0.9rem' }}>
            Klik kartu untuk membalik dan mengunduh file PNG.
          </p>
        </FadeIn>

        <StaggerContainer className="ctf-cards-grid mb-8">
          {CARDS.map((card) => (
            <StaggerItem key={card.id}>
              <FlipCard
                imageUrl={getCardDownloadUrl(card.filename)}
                downloadUrl={getCardDownloadUrl(card.filename)}
                name={card.name}
                label={card.label}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>

        <FadeIn delay={0.15}>
          <div className="section-label">Submit</div>
          <h3 className="mb-6">Submit Flag</h3>
        </FadeIn>

        <FadeIn delay={0.2}>
          <SpotlightCard style={{ maxWidth: 600 }}>
            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="alert alert-success"
                  style={{ flexDirection: 'column', marginBottom: 0 }}
                >
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <CheckCircle size={20} />
                    Flag Benar!
                  </h4>
                  <p>Selamat! Decode Base64 berhasil. Gunakan kredensial di bawah untuk login - coba password satu per satu.</p>
                  <div style={{
                    background: 'var(--surface-alt)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-sm)',
                    marginTop: '1rem',
                    width: '100%',
                    border: '1px solid var(--border)',
                  }}>
                    <p style={{ fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <KeyRound size={16} color="var(--primary)" />
                      Kredensial Login
                    </p>
                    <p style={{ marginBottom: '0.75rem' }}>
                      Username:{' '}
                      <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>
                        {result.credentials?.username}
                      </strong>
                    </p>
                    <p style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                      Daftar Password (20 kandidat - hanya 1 yang benar):
                    </p>
                    <ul className="password-candidates">
                      {(result.credentials?.passwords || []).map((pwd) => (
                        <li key={pwd}>
                          <code>{pwd}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <GlowButton to="/admin/login" variant="primary" className="mt-4">
                    Ke Halaman Login Admin
                    <ArrowRight size={16} />
                  </GlowButton>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleSubmit}
                >
                  <div className="form-group">
                    <label className="form-label">Masukkan Flag</label>
                    <input
                      type="text"
                      className="form-input mono"
                      placeholder="CTF{...}"
                      value={flag}
                      onChange={e => setFlag(e.target.value)}
                      disabled={status === 'loading'}
                      required
                    />
                  </div>

                  <AnimatePresence>
                    {status === 'error' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="alert alert-error"
                      >
                        <AlertCircle size={20} />
                        {errorMsg}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <GlowButton
                    type="submit"
                    variant="primary"
                    disabled={status === 'loading' || !flag}
                  >
                    {status === 'loading' ? <div className="spinner" /> : 'Validasi Flag'}
                  </GlowButton>
                  <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Maksimal 5 percobaan per menit.
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </SpotlightCard>
        </FadeIn>
      </div>
    </div>
  );
}
