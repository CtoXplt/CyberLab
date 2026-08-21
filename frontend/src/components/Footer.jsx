import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle } from 'lucide-react';
import { FadeIn } from './ui/motion';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="grid-3">
          <FadeIn>
            <div>
              <h3 className="footer__brand">
                <Shield className="footer__brand-icon" size={20} />
                Cyber Security Lab
              </h3>
              <p className="footer__desc">
                Platform edukasi interaktif untuk mempelajari kerentanan keamanan web modern melalui hands-on CTF challenges.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div>
              <h4 className="footer__heading">Tautan</h4>
              <ul className="footer__links">
                <li><Link to="/">Beranda</Link></li>
                <li><Link to="/ctf">CTF Challenge</Link></li>
                <li><Link to="/admin/login">Admin Login</Link></li>
              </ul>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div>
              <h4 className="footer__heading">Peringatan</h4>
              <div className="footer__warning">
                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                Environment Edukasi - Tidak Mengandung Data Nyata. Gunakan hanya untuk tujuan pembelajaran.
              </div>
            </div>
          </FadeIn>
        </div>

        <div className="footer__copy">
          &copy; {new Date().getFullYear()} Cyber Security Lab - Hak Cipta Dilindungi
        </div>
      </div>
    </footer>
  );
}
